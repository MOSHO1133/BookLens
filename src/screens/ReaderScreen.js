import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, ActivityIndicator, Animated,
    Dimensions, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const FONT_SIZES = [13, 15, 17, 19, 21];
const THEMES = [
    { bg: '#fafafa', text: '#2d2d2d', label: 'Light', muted: '#6b7280' },
    { bg: '#f5f0e8', text: '#2d2418', label: 'Sepia', muted: '#7a6a50' },
    { bg: '#0f0f1a', text: '#d4d4d4', label: 'Dark', muted: '#6b7280' },
    { bg: '#0a1628', text: '#c8d8f0', label: 'Night', muted: '#6b8ab0' },
];

const BOOK_COLORS = [
    '#2d1b69', '#0c2340', '#0d2e1a', '#2d1515',
    '#1e1a0c', '#0e1f2d', '#1a0533', '#2a1a00',
];

const getColor = (title) => BOOK_COLORS[(title?.length || 0) % BOOK_COLORS.length];

const generateChapters = async (book) => {
    try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: `Generate a realistic chapter list for "${book.title}" by ${book.author}.
Return ONLY a JSON array. Each item: {"num":1,"title":"Chapter Title","subtitle":"One sentence describing this chapter"}.
Generate 8-12 chapters that reflect the real book. Return only the JSON array.`
                }]
            }),
        });
        const data = await res.json();
        const text = data.content?.[0]?.text || '[]';
        const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(clean);
    } catch {
        return [
            { num: 1, title: 'Introduction', subtitle: 'Setting the foundation for everything ahead' },
            { num: 2, title: 'The Core Idea', subtitle: 'The fundamental concept at the heart of this book' },
            { num: 3, title: 'Why It Matters', subtitle: 'Real-world impact and significance' },
            { num: 4, title: 'How It Works', subtitle: 'A deeper look at the mechanics' },
            { num: 5, title: 'Key Principles', subtitle: 'The rules that guide everything else' },
            { num: 6, title: 'Common Pitfalls', subtitle: 'Mistakes to avoid on your journey' },
            { num: 7, title: 'Putting It Into Practice', subtitle: 'Actionable steps you can take today' },
            { num: 8, title: 'The Bigger Picture', subtitle: 'How everything connects together' },
        ];
    }
};

const generateChapterContent = async (book, chapterNum, chapterTitle) => {
    try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: `Write engaging chapter content for a book reading app.

Book: "${book.title}" by ${book.author}
Chapter ${chapterNum}: "${chapterTitle}"

Write this as flowing prose — like reading the actual chapter. Include:
- A strong opening hook
- 3-4 substantial paragraphs with core ideas, real examples, stories
- Concrete and practical insights
- A memorable closing thought

Write in clear, engaging English. Around 400-500 words. No headers. Just the chapter text directly.`
                }]
            }),
        });
        const data = await res.json();
        return data.content?.[0]?.text || '';
    } catch {
        return `This chapter explores the key ideas of "${chapterTitle}" as presented in ${book.title}. The author takes us through a series of compelling insights and real-world examples that illuminate the central theme.\n\nThrough careful observation and research, we discover that the principles outlined here apply broadly to everyday situations. The author illustrates this through stories that feel both familiar and revealing.\n\nThe deeper we explore these ideas, the more we realize their transformative potential. What begins as a simple concept gradually unfolds into something profound — a new way of seeing the world around us.\n\nBy the end of this chapter, you'll find yourself equipped with a clearer framework for applying these lessons to your own life and work.`;
    }
};

export default function ReaderScreen({ navigation, route }) {
    const { book } = route.params;

    const [stage, setStage] = useState('chapters');
    const [chapters, setChapters] = useState([]);
    const [currentChapter, setCurrentChapter] = useState(null);
    const [chapterContent, setChapterContent] = useState('');
    const [loadingChapters, setLoadingChapters] = useState(true);
    const [loadingContent, setLoadingContent] = useState(false);
    const [fontIndex, setFontIndex] = useState(1);
    const [themeIndex, setThemeIndex] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const [readChapters, setReadChapters] = useState([]);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const fontSize = FONT_SIZES[fontIndex];
    const T = THEMES[themeIndex];

    useEffect(() => { loadChapters(); }, []);

    const loadChapters = async () => {
        setLoadingChapters(true);
        const chs = await generateChapters(book);
        setChapters(chs);
        setLoadingChapters(false);
    };

    const openChapter = async (ch) => {
        setCurrentChapter(ch);
        setStage('reading');
        setLoadingContent(true);
        setChapterContent('');
        setShowSettings(false);
        fadeAnim.setValue(0);

        const content = await generateChapterContent(book, ch.num, ch.title);
        setChapterContent(content);
        setLoadingContent(false);

        if (!readChapters.includes(ch.num)) {
            setReadChapters(p => [...p, ch.num]);
        }
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    };

    const chIdx = chapters.findIndex(c => c.num === currentChapter?.num);
    const hasPrev = chIdx > 0;
    const hasNext = chIdx < chapters.length - 1;

    // ── CHAPTER LIST ─────────────────────────────────────
    if (stage === 'chapters') {
        const progress = chapters.length > 0
            ? (readChapters.length / chapters.length) * 100 : 0;

        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={22} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle} numberOfLines={1}>{book.title}</Text>
                        <Text style={styles.headerAuthor}>{book.author}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.summaryChip}
                        onPress={() => navigation.navigate('Summary', { book, mode: 'full' })}
                    >
                        <Ionicons name="document-text-outline" size={13} color="#fff" />
                        <Text style={styles.summaryChipText}>Summary</Text>
                    </TouchableOpacity>
                </View>

                {/* Book card */}
                <View style={styles.bookCard}>
                    <View style={[styles.bookCover, { backgroundColor: getColor(book.title) }]}>
                        <Text style={styles.bookCoverText}>{book.title[0]}</Text>
                    </View>
                    <View style={styles.bookMeta}>
                        <Text style={styles.bookMetaTitle} numberOfLines={2}>{book.title}</Text>
                        <Text style={styles.bookMetaAuthor}>{book.author}</Text>
                        <View style={styles.bookMetaBadges}>
                            {book.rating && book.rating !== '—' && (
                                <View style={styles.badge}>
                                    <Ionicons name="star" size={10} color="#f59e0b" />
                                    <Text style={styles.badgeText}>{book.rating}</Text>
                                </View>
                            )}
                            <View style={styles.badge}>
                                <Ionicons name="book-outline" size={10} color="#6b7280" />
                                <Text style={styles.badgeText}>{readChapters.length}/{chapters.length} read</Text>
                            </View>
                        </View>
                        {progress > 0 && (
                            <View style={styles.progressTrack}>
                                <View style={[styles.progressFill, { width: `${progress}%` }]} />
                            </View>
                        )}
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* AI notice */}
                    <View style={styles.aiNotice}>
                        <Ionicons name="sparkles" size={13} color="#7c3aed" />
                        <Text style={styles.aiNoticeText}>
                            Chapters are intelligently generated to match the book's real content and structure
                        </Text>
                    </View>

                    {/* TOC */}
                    <Text style={styles.tocTitle}>Table of Contents</Text>

                    {loadingChapters ? (
                        <View style={styles.loadingBox}>
                            <ActivityIndicator color="#1a1a2e" />
                            <Text style={styles.loadingText}>Preparing chapters...</Text>
                        </View>
                    ) : (
                        chapters.map((ch) => (
                            <TouchableOpacity
                                key={ch.num}
                                style={styles.chRow}
                                onPress={() => openChapter(ch)}
                                activeOpacity={0.7}
                            >
                                <View style={[
                                    styles.chNumBubble,
                                    readChapters.includes(ch.num) && styles.chNumBubbleDone,
                                ]}>
                                    {readChapters.includes(ch.num)
                                        ? <Ionicons name="checkmark" size={12} color="#fff" />
                                        : <Text style={styles.chNumText}>{ch.num}</Text>
                                    }
                                </View>
                                <View style={styles.chTexts}>
                                    <Text style={styles.chName}>Chapter {ch.num}: {ch.title}</Text>
                                    <Text style={styles.chSub} numberOfLines={1}>{ch.subtitle}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={15} color="#9ca3af" />
                            </TouchableOpacity>
                        ))
                    )}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        );
    }

    // ── READING VIEW ──────────────────────────────────────
    return (
        <View style={[styles.reader, { backgroundColor: T.bg }]}>
            <StatusBar
                barStyle={themeIndex >= 2 ? 'light-content' : 'dark-content'}
                backgroundColor={T.bg}
            />

            {/* Reader top bar */}
            <View style={[styles.readerBar, { backgroundColor: T.bg, borderBottomColor: themeIndex >= 2 ? 'rgba(255,255,255,0.07)' : '#e5e7eb' }]}>
                <TouchableOpacity onPress={() => setStage('chapters')} style={styles.readerBarBtn}>
                    <Ionicons name="list" size={21} color={T.text} />
                </TouchableOpacity>
                <Text style={[styles.readerChTitle, { color: T.text }]} numberOfLines={1}>
                    Ch.{currentChapter?.num} · {currentChapter?.title}
                </Text>
                <TouchableOpacity onPress={() => setShowSettings(!showSettings)} style={styles.readerBarBtn}>
                    <Ionicons name={showSettings ? 'close' : 'settings-outline'} size={20} color={T.text} />
                </TouchableOpacity>
            </View>

            {/* Settings drawer */}
            {showSettings && (
                <View style={[styles.settingsDrawer, {
                    backgroundColor: themeIndex >= 2 ? '#1a1a2e' : '#fff',
                    borderBottomColor: themeIndex >= 2 ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
                }]}>
                    {/* Font size */}
                    <View style={styles.settingsRow}>
                        <Text style={[styles.settingsLabel, { color: T.text }]}>Text size</Text>
                        <View style={styles.settingsBtns}>
                            <TouchableOpacity
                                style={[styles.sBtn, { borderColor: themeIndex >= 2 ? 'rgba(255,255,255,0.15)' : '#e5e7eb' }]}
                                onPress={() => setFontIndex(Math.max(0, fontIndex - 1))}
                            >
                                <Text style={[styles.sBtnText, { color: T.text }]}>A−</Text>
                            </TouchableOpacity>
                            <Text style={[styles.sBtnText, { color: T.muted, minWidth: 24, textAlign: 'center' }]}>{fontSize}</Text>
                            <TouchableOpacity
                                style={[styles.sBtn, { borderColor: themeIndex >= 2 ? 'rgba(255,255,255,0.15)' : '#e5e7eb' }]}
                                onPress={() => setFontIndex(Math.min(FONT_SIZES.length - 1, fontIndex + 1))}
                            >
                                <Text style={[styles.sBtnText, { color: T.text }]}>A+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* Theme */}
                    <View style={styles.settingsRow}>
                        <Text style={[styles.settingsLabel, { color: T.text }]}>Background</Text>
                        <View style={styles.swatches}>
                            {THEMES.map((t, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[styles.swatch, {
                                        backgroundColor: t.bg,
                                        borderColor: themeIndex === i ? '#7c3aed' : (themeIndex >= 2 ? 'rgba(255,255,255,0.15)' : '#d1d5db'),
                                        borderWidth: themeIndex === i ? 2.5 : 1,
                                    }]}
                                    onPress={() => setThemeIndex(i)}
                                >
                                    <Text style={{ fontSize: 9, color: t.text, fontWeight: '600' }}>{t.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            )}

            {/* Chapter content */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.readerContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[styles.chapterLabel, { color: T.muted }]}>
                    CHAPTER {currentChapter?.num}
                </Text>
                <Text style={[styles.chapterTitle, { color: T.text }]}>
                    {currentChapter?.title}
                </Text>
                <View style={styles.titleUnderline} />

                {loadingContent ? (
                    <View style={styles.contentLoading}>
                        <ActivityIndicator color="#7c3aed" size="large" />
                        <Text style={[styles.contentLoadingText, { color: T.muted }]}>
                            Loading chapter...
                        </Text>
                    </View>
                ) : (
                    <Animated.Text style={[
                        styles.bodyText,
                        { color: T.text, fontSize, lineHeight: fontSize * 1.9, opacity: fadeAnim }
                    ]}>
                        {chapterContent}
                    </Animated.Text>
                )}

                {/* Chapter navigation */}
                {!loadingContent && chapterContent ? (
                    <View style={styles.chNav}>
                        <TouchableOpacity
                            style={[styles.chNavBtn, !hasPrev && styles.chNavBtnDisabled, { borderColor: themeIndex >= 2 ? 'rgba(255,255,255,0.15)' : '#e5e7eb' }]}
                            onPress={() => hasPrev && openChapter(chapters[chIdx - 1])}
                            disabled={!hasPrev}
                        >
                            <Ionicons name="chevron-back" size={16} color={hasPrev ? T.text : T.muted} />
                            <Text style={[styles.chNavText, { color: hasPrev ? T.text : T.muted }]}>Previous</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.chNavCenter}
                            onPress={() => setStage('chapters')}
                        >
                            <Text style={[styles.chNavCenterText, { color: T.muted }]}>
                                {chIdx + 1} / {chapters.length}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.chNavBtn, styles.chNavBtnRight, !hasNext && styles.chNavBtnDisabled, { borderColor: themeIndex >= 2 ? 'rgba(255,255,255,0.15)' : '#e5e7eb', backgroundColor: hasNext ? '#7c3aed' : 'transparent' }]}
                            onPress={() => hasNext && openChapter(chapters[chIdx + 1])}
                            disabled={!hasNext}
                        >
                            <Text style={[styles.chNavText, { color: hasNext ? '#fff' : T.muted }]}>Next</Text>
                            <Ionicons name="chevron-forward" size={16} color={hasNext ? '#fff' : T.muted} />
                        </TouchableOpacity>
                    </View>
                ) : null}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    // Chapter list
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { backgroundColor: '#1a1a2e', paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
    backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    headerInfo: { flex: 1 },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
    headerAuthor: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
    summaryChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
    summaryChipText: { fontSize: 11, color: '#fff', fontWeight: '600' },

    bookCard: { flexDirection: 'row', gap: 14, padding: 16, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#e5e7eb' },
    bookCover: { width: 64, height: 88, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    bookCoverText: { fontSize: 28, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
    bookMeta: { flex: 1, justifyContent: 'center' },
    bookMetaTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 3 },
    bookMetaAuthor: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
    bookMetaBadges: { flexDirection: 'row', gap: 8 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#f3f4f6', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
    badgeText: { fontSize: 10, color: '#6b7280', fontWeight: '500' },
    progressTrack: { height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, marginTop: 8, overflow: 'hidden' },
    progressFill: { height: 4, backgroundColor: '#10b981', borderRadius: 2 },

    aiNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, margin: 14, padding: 12, backgroundColor: 'rgba(124,58,237,0.06)', borderRadius: 10, borderWidth: 0.5, borderColor: 'rgba(124,58,237,0.18)' },
    aiNoticeText: { flex: 1, fontSize: 12, color: '#5b21b6', lineHeight: 17 },

    tocTitle: { fontSize: 13, fontWeight: '700', color: '#6b7280', paddingHorizontal: 16, paddingBottom: 6, letterSpacing: 0.5 },

    chRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 0.5, borderBottomColor: '#f3f4f6', backgroundColor: '#fff' },
    chNumBubble: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    chNumBubbleDone: { backgroundColor: '#10b981' },
    chNumText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
    chTexts: { flex: 1 },
    chName: { fontSize: 13, fontWeight: '600', color: '#1a1a2e', marginBottom: 2 },
    chSub: { fontSize: 11, color: '#9ca3af' },

    loadingBox: { alignItems: 'center', padding: 40, gap: 10 },
    loadingText: { fontSize: 13, color: '#6b7280' },

    // Reader
    reader: { flex: 1 },
    readerBar: { paddingTop: 52, paddingBottom: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 0.5 },
    readerBarBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
    readerChTitle: { flex: 1, fontSize: 13, fontWeight: '600', textAlign: 'center' },

    settingsDrawer: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, gap: 12 },
    settingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    settingsLabel: { fontSize: 13, fontWeight: '500' },
    settingsBtns: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    sBtn: { width: 34, height: 34, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    sBtnText: { fontSize: 13, fontWeight: '600' },
    swatches: { flexDirection: 'row', gap: 8 },
    swatch: { width: 48, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },

    readerContent: { paddingHorizontal: 22, paddingTop: 28, paddingBottom: 20 },
    chapterLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
    chapterTitle: { fontSize: 22, fontWeight: '800', lineHeight: 30, marginBottom: 12 },
    titleUnderline: { width: 40, height: 3, backgroundColor: '#7c3aed', borderRadius: 2, marginBottom: 24 },
    bodyText: {},
    contentLoading: { alignItems: 'center', paddingVertical: 60, gap: 14 },
    contentLoadingText: { fontSize: 14 },

    chNav: { flexDirection: 'row', alignItems: 'center', marginTop: 36, gap: 10 },
    chNavBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
    chNavBtnRight: {},
    chNavBtnDisabled: { opacity: 0.35 },
    chNavText: { fontSize: 13, fontWeight: '600' },
    chNavCenter: { paddingHorizontal: 12 },
    chNavCenterText: { fontSize: 12, fontWeight: '500' },
});