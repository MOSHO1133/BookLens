import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, ActivityIndicator, FlatList, StatusBar,
} from 'react-native';
import { ANTHROPIC_KEY } from '../constants/config';

// ──────────────────────────────────────────────
// Gutenberg text fetcher + chapter parser
// ──────────────────────────────────────────────

const stripGutenbergBoilerplate = (rawText) => {
    // Remove header (everything up to and including the START marker)
    const startRx = /\*{3}\s*START OF (THE|THIS) PROJECT GUTENBERG[^\n]*\n/i;
    const endRx = /\*{3}\s*END OF (THE|THIS) PROJECT GUTENBERG/i;

    let text = rawText;
    const startMatch = startRx.exec(text);
    if (startMatch) text = text.slice(startMatch.index + startMatch[0].length);

    const endMatch = endRx.exec(text);
    if (endMatch) text = text.slice(0, endMatch.index);

    return text.trim();
};

const parseGutenbergChapters = (text) => {
    // Patterns: CHAPTER I, CHAPTER 1, Chapter One, PART I, etc.
    const headingRx = /\n{2,}((?:CHAPTER|PART)\s+(?:[IVXLCDM]+|\d+|ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|ELEVEN|TWELVE|THIRTEEN|FOURTEEN|FIFTEEN|SIXTEEN|SEVENTEEN|EIGHTEEN|NINETEEN|TWENTY)[^\n]*)\n/gi;

    const matches = [];
    let m;
    while ((m = headingRx.exec(text)) !== null) {
        matches.push({ index: m.index, heading: m[1].trim() });
    }

    if (matches.length < 2) {
        // Fallback: just split into chunks of ~3000 chars
        const chunks = [];
        const chunkSize = 3000;
        const words = text.split(' ');
        let current = '';
        let chunkNum = 1;
        for (const word of words) {
            current += word + ' ';
            if (current.length >= chunkSize) {
                chunks.push({ num: chunkNum, title: `Part ${chunkNum}`, content: current.trim(), read: false });
                chunkNum++;
                current = '';
            }
        }
        if (current.trim()) {
            chunks.push({ num: chunkNum, title: `Part ${chunkNum}`, content: current.trim(), read: false });
        }
        return chunks;
    }

    return matches.map((match, i) => {
        const start = match.index;
        const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
        const content = text.slice(start, end).trim();
        // Clean heading line from content body
        const firstNewline = content.indexOf('\n');
        const body = firstNewline > -1 ? content.slice(firstNewline + 1).trim() : content;

        return {
            num: i + 1,
            title: match.heading.replace(/\n/g, ' '),
            content: body,
            read: false,
        };
    });
};

const fetchGutenbergChapters = async (textUrl) => {
    const res = await fetch(textUrl);
    if (!res.ok) throw new Error(`Gutenberg fetch failed: ${res.status}`);
    const rawText = await res.text();
    const clean = stripGutenbergBoilerplate(rawText);
    return parseGutenbergChapters(clean);
};

// ──────────────────────────────────────────────
// AI chapter list generator
// ──────────────────────────────────────────────

const generateAIChapters = async (book) => {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_KEY,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            messages: [{
                role: 'user',
                content: `List the chapters of "${book.title}" by ${book.author}. 
Return ONLY a JSON array: [{"num":1,"title":"Chapter Name","subtitle":"Optional subtitle"}]
No markdown, no preamble.`,
            }],
        }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const text = data.content?.[0]?.text || '[]';
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
};

// ──────────────────────────────────────────────
// AI chapter content generator
// ──────────────────────────────────────────────

const generateAIChapterContent = async (book, chapter) => {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_KEY,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            messages: [{
                role: 'user',
                content: `Write a detailed, engaging summary of ${chapter.title} from "${book.title}" by ${book.author}. 
Cover all key ideas, events, and insights from this chapter. Write in a clear, readable style.`,
            }],
        }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    return data.content?.[0]?.text || 'Content unavailable.';
};

// ──────────────────────────────────────────────
// Fallback chapters
// ──────────────────────────────────────────────

const FALLBACK_CHAPTERS = (book) => [
    { num: 1, title: 'Chapter 1 – Introduction', content: null, read: false },
    { num: 2, title: 'Chapter 2 – Core Concepts', content: null, read: false },
    { num: 3, title: 'Chapter 3 – Key Principles', content: null, read: false },
    { num: 4, title: 'Chapter 4 – Application', content: null, read: false },
    { num: 5, title: 'Chapter 5 – Deep Dive', content: null, read: false },
    { num: 6, title: 'Chapter 6 – Case Studies', content: null, read: false },
    { num: 7, title: 'Chapter 7 – Advanced Topics', content: null, read: false },
    { num: 8, title: 'Chapter 8 – Conclusion', content: null, read: false },
];

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────

export default function ReaderScreen({ route, navigation }) {
    const { book, mode, chapter: initialChapter } = route.params;
    const isGutenberg = !!book.gutenbergTextUrl;

    // ── State ──
    const [chapters, setChapters] = useState([]);
    const [loadingChapters, setLoadingChapters] = useState(true);
    const [activeChapter, setActiveChapter] = useState(null);
    const [chapterContent, setChapterContent] = useState('');
    const [loadingContent, setLoadingContent] = useState(false);
    const [view, setView] = useState('toc'); // 'toc' | 'reader'
    const [fontSize, setFontSize] = useState(16);
    const scrollRef = useRef(null);

    // ── Load chapters ──
    useEffect(() => {
        (async () => {
            setLoadingChapters(true);
            try {
                let loadedChapters;
                if (isGutenberg) {
                    loadedChapters = await fetchGutenbergChapters(book.gutenbergTextUrl);
                } else {
                    const ai = await generateAIChapters(book).catch(() => null);
                    loadedChapters = ai
                        ? ai.map(c => ({ ...c, content: null, read: false }))
                        : FALLBACK_CHAPTERS(book);
                }
                setChapters(loadedChapters);

                // If launched in chapter mode, open that chapter
                if (mode === 'chapter' && initialChapter) {
                    const match = loadedChapters.find(c => c.num === initialChapter.num)
                        || loadedChapters[0];
                    if (match) openChapter(match, loadedChapters);
                } else if (mode === 'full') {
                    // Open first chapter
                    openChapter(loadedChapters[0], loadedChapters);
                }
            } catch (err) {
                setChapters(FALLBACK_CHAPTERS(book));
            } finally {
                setLoadingChapters(false);
            }
        })();
    }, []);

    // ── Open a chapter ──
    const openChapter = async (chapter, chapterList) => {
        setActiveChapter(chapter);
        setView('reader');
        scrollRef.current?.scrollTo({ y: 0, animated: false });

        // Gutenberg: content already in chapter object
        if (isGutenberg || chapter.content) {
            setChapterContent(chapter.content || '');
            return;
        }

        // AI mode: generate content
        setLoadingContent(true);
        setChapterContent('');
        try {
            const content = await generateAIChapterContent(book, chapter);
            setChapterContent(content);
            // Cache it
            setChapters(prev =>
                prev.map(c => c.num === chapter.num ? { ...c, content, read: true } : c)
            );
        } catch {
            setChapterContent(
                `Unable to load content for "${chapter.title}" right now. Please check your connection and try again.`
            );
        } finally {
            setLoadingContent(false);
        }
    };

    const goToNextChapter = () => {
        if (!activeChapter) return;
        const idx = chapters.findIndex(c => c.num === activeChapter.num);
        if (idx < chapters.length - 1) openChapter(chapters[idx + 1], chapters);
    };

    const goToPrevChapter = () => {
        if (!activeChapter) return;
        const idx = chapters.findIndex(c => c.num === activeChapter.num);
        if (idx > 0) openChapter(chapters[idx - 1], chapters);
    };

    const activeIndex = chapters.findIndex(c => c.num === activeChapter?.num);

    // ── Header ──
    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => {
                    if (view === 'reader') { setView('toc'); return; }
                    navigation.goBack();
                }}
            >
                <Text style={styles.headerBtnText}>‹ Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{book.title}</Text>
            {view === 'reader' && (
                <View style={styles.fontControls}>
                    <TouchableOpacity onPress={() => setFontSize(s => Math.max(12, s - 2))}>
                        <Text style={styles.fontBtn}>A-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setFontSize(s => Math.min(24, s + 2))}>
                        <Text style={styles.fontBtn}>A+</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    // ── Table of Contents ──
    if (view === 'toc') {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" />
                {renderHeader()}

                {/* Source badge */}
                <View style={[styles.sourceBadge, isGutenberg ? styles.sourceBadgeGreen : styles.sourceBadgePurple]}>
                    <Text style={styles.sourceBadgeText}>
                        {isGutenberg
                            ? '📚 Project Gutenberg — Original Text'
                            : '🤖 AI-Generated Chapter Summaries'}
                    </Text>
                </View>

                {loadingChapters ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color="#6200EE" />
                        <Text style={styles.loadingLabel}>
                            {isGutenberg ? 'Fetching full text…' : 'Building table of contents…'}
                        </Text>
                    </View>
                ) : (
                    <>
                        <Text style={styles.tocMeta}>
                            {chapters.length} chapter{chapters.length !== 1 ? 's' : ''}
                            {!isGutenberg && ` · ${chapters.filter(c => c.read).length} read`}
                        </Text>
                        <FlatList
                            data={chapters}
                            keyExtractor={c => String(c.num)}
                            contentContainerStyle={{ paddingBottom: 40 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.tocRow}
                                    onPress={() => openChapter(item, chapters)}
                                >
                                    <View style={styles.tocNumBadge}>
                                        <Text style={styles.tocNumText}>{item.num}</Text>
                                    </View>
                                    <View style={styles.tocInfo}>
                                        <Text style={styles.tocTitle}>{item.title}</Text>
                                        {item.subtitle ? (
                                            <Text style={styles.tocSubtitle}>{item.subtitle}</Text>
                                        ) : null}
                                    </View>
                                    {item.read && !isGutenberg && (
                                        <Text style={styles.readDot}>✓</Text>
                                    )}
                                    <Text style={styles.tocChevron}>›</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </>
                )}
            </View>
        );
    }

    // ── Reader view ──
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            {renderHeader()}

            {/* Chapter nav bar */}
            <View style={styles.chapterNav}>
                <TouchableOpacity
                    style={[styles.navBtn, activeIndex === 0 && styles.navBtnDisabled]}
                    onPress={goToPrevChapter}
                    disabled={activeIndex === 0}
                >
                    <Text style={styles.navBtnText}>‹ Prev</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navChapterLabel} onPress={() => setView('toc')}>
                    <Text style={styles.navChapterText} numberOfLines={1}>
                        {activeChapter?.title}
                    </Text>
                    <Text style={styles.navChapterMeta}>
                        {activeIndex + 1} / {chapters.length}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navBtn, activeIndex === chapters.length - 1 && styles.navBtnDisabled]}
                    onPress={goToNextChapter}
                    disabled={activeIndex === chapters.length - 1}
                >
                    <Text style={styles.navBtnText}>Next ›</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {loadingContent ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#6200EE" />
                    <Text style={styles.loadingLabel}>Generating chapter…</Text>
                </View>
            ) : (
                <ScrollView
                    ref={scrollRef}
                    style={styles.readerScroll}
                    contentContainerStyle={styles.readerContent}
                >
                    <Text style={[styles.readerText, { fontSize }]}>
                        {chapterContent}
                    </Text>

                    {/* Bottom nav */}
                    <View style={styles.bottomNav}>
                        {activeIndex > 0 && (
                            <TouchableOpacity
                                style={styles.bottomNavBtn}
                                onPress={goToPrevChapter}
                            >
                                <Text style={styles.bottomNavText}>← Previous Chapter</Text>
                            </TouchableOpacity>
                        )}
                        {activeIndex < chapters.length - 1 && (
                            <TouchableOpacity
                                style={[styles.bottomNavBtn, styles.bottomNavBtnPrimary]}
                                onPress={goToNextChapter}
                            >
                                <Text style={[styles.bottomNavText, styles.bottomNavTextPrimary]}>
                                    Next Chapter →
                                </Text>
                            </TouchableOpacity>
                        )}
                        {activeIndex === chapters.length - 1 && (
                            <TouchableOpacity
                                style={[styles.bottomNavBtn, styles.bottomNavBtnPrimary]}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={[styles.bottomNavText, styles.bottomNavTextPrimary]}>
                                    ✓ Finished
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

// ──────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAF8F4' },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1, borderBottomColor: '#EEE',
    },
    headerBtn: { paddingRight: 12 },
    headerBtnText: { fontSize: 16, color: '#6200EE', fontWeight: '600' },
    headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
    fontControls: { flexDirection: 'row', gap: 8 },
    fontBtn: { fontSize: 14, color: '#6200EE', fontWeight: '700', paddingHorizontal: 4 },

    // Source badge
    sourceBadge: {
        paddingVertical: 6, paddingHorizontal: 16,
        alignItems: 'center',
    },
    sourceBadgeGreen: { backgroundColor: '#E8F5E9' },
    sourceBadgePurple: { backgroundColor: '#EDE7F6' },
    sourceBadgeText: { fontSize: 12, fontWeight: '600', color: '#444' },

    // TOC
    tocMeta: {
        fontSize: 13, color: '#999', paddingHorizontal: 16,
        paddingVertical: 8,
    },
    tocRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFF', marginHorizontal: 16,
        marginBottom: 8, borderRadius: 12, padding: 14,
        shadowColor: '#000', shadowOpacity: 0.03,
        shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
        elevation: 1,
    },
    tocNumBadge: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#EDE7F6', alignItems: 'center',
        justifyContent: 'center', marginRight: 12,
    },
    tocNumText: { fontSize: 13, fontWeight: '700', color: '#6200EE' },
    tocInfo: { flex: 1 },
    tocTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
    tocSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },
    readDot: { color: '#4CAF50', fontSize: 14, marginRight: 4 },
    tocChevron: { fontSize: 20, color: '#CCC' },

    // Chapter nav bar
    chapterNav: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE',
        paddingHorizontal: 12, paddingVertical: 10,
    },
    navBtn: { paddingHorizontal: 8, paddingVertical: 4 },
    navBtnDisabled: { opacity: 0.3 },
    navBtnText: { fontSize: 14, color: '#6200EE', fontWeight: '600' },
    navChapterLabel: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
    navChapterText: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
    navChapterMeta: { fontSize: 11, color: '#AAA', marginTop: 1 },

    // Reader
    readerScroll: { flex: 1 },
    readerContent: { padding: 20, paddingBottom: 60 },
    readerText: {
        color: '#2A2A2A', lineHeight: 28,
        fontFamily: 'Georgia',
    },

    // Bottom nav
    bottomNav: {
        flexDirection: 'row', justifyContent: 'space-between',
        marginTop: 40, gap: 12,
    },
    bottomNavBtn: {
        flex: 1, paddingVertical: 14, borderRadius: 12,
        alignItems: 'center', backgroundColor: '#F0EBF8',
    },
    bottomNavBtnPrimary: { backgroundColor: '#6200EE' },
    bottomNavText: { fontSize: 14, fontWeight: '600', color: '#6200EE' },
    bottomNavTextPrimary: { color: '#FFF' },

    // Misc
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadingLabel: { marginTop: 12, fontSize: 14, color: '#888' },
});