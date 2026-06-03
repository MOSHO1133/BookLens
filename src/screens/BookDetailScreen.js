import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert, Image
} from 'react-native';
import { ANTHROPIC_KEY } from '../constants/config';

// ──────────────────────────────────────────────
// Gutenberg lookup
// ──────────────────────────────────────────────
const lookupGutenberg = async (book) => {
    try {
        const query = encodeURIComponent(book.title);
        const res = await fetch(
            `https://gutendex.com/books/?search=${query}&languages=en`
        );
        const data = await res.json();

        if (!data.results?.length) return null;

        // Try to find a title match (case-insensitive)
        const bookTitleLower = book.title.toLowerCase();
        const match =
            data.results.find(r =>
                r.title.toLowerCase().includes(bookTitleLower) ||
                bookTitleLower.includes(r.title.toLowerCase())
            ) || data.results[0];

        // Pick a plain-text URL
        const formats = match.formats || {};
        const textUrl =
            formats['text/plain; charset=utf-8'] ||
            formats['text/plain; charset=us-ascii'] ||
            formats['text/plain'] ||
            Object.entries(formats).find(([k, v]) => k.startsWith('text/plain'))?.[1] ||
            Object.values(formats).find(v => typeof v === 'string' && v.endsWith('.txt'));

        if (!textUrl) return null;

        return {
            id: match.id,
            textUrl,
            title: match.title,
            authors: match.authors?.map(a => a.name).join(', ') || '',
        };
    } catch {
        return null;
    }
};

// ──────────────────────────────────────────────
// AI chapter generator (fallback)
// ──────────────────────────────────────────────
const fetchAIChapters = async (book) => {
    try {
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
                    content: `List the main chapters of "${book.title}" by ${book.author}. 
Return ONLY a JSON array like: [{"num":1,"title":"Chapter Title","summary":"One sentence"}]
No markdown, no extra text.`,
                }],
            }),
        });

        if (!res.ok) throw new Error(`API error ${res.status}`);

        const data = await res.json();
        const text = data.content?.[0]?.text || '[]';
        const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(clean);
    } catch {
        return null;
    }
};

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
export default function BookDetailScreen({ route, navigation }) {
    const { book } = route.params;

    const [chapters, setChapters] = useState([]);
    const [loadingChapters, setLoadingChapters] = useState(true);
    const [gutenbergInfo, setGutenbergInfo] = useState(null);
    const [checkingGutenberg, setCheckingGutenberg] = useState(true);

    // Check Gutenberg availability
    useEffect(() => {
        (async () => {
            setCheckingGutenberg(true);
            const info = await lookupGutenberg(book);
            setGutenbergInfo(info);
            setCheckingGutenberg(false);
        })();
    }, [book]);

    // Load chapter list
    useEffect(() => {
        (async () => {
            setLoadingChapters(true);
            const aiChapters = await fetchAIChapters(book);
            setChapters(aiChapters || [
                { num: 1, title: 'Chapter 1', summary: '' },
                { num: 2, title: 'Chapter 2', summary: '' },
                { num: 3, title: 'Chapter 3', summary: '' },
            ]);
            setLoadingChapters(false);
        })();
    }, [book]);

    const handleReadFullBook = () => {
        navigation.navigate('Reader', {
            book: {
                ...book,
                gutenbergTextUrl: gutenbergInfo?.textUrl || null,
                gutenbergId: gutenbergInfo?.id || null,
            },
            mode: 'full',
        });
    };

    const handleReadChapter = (chapter) => {
        navigation.navigate('Reader', {
            book: {
                ...book,
                gutenbergTextUrl: gutenbergInfo?.textUrl || null,
                gutenbergId: gutenbergInfo?.id || null,
            },
            mode: 'chapter',
            chapter,
        });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Cover */}
            <View style={styles.coverSection}>
                {book.coverUrl ? (
                    <Image source={{ uri: book.coverUrl }} style={styles.cover} />
                ) : (
                    <View style={[styles.cover, styles.coverPlaceholder]}>
                        <Text style={styles.coverEmoji}>📖</Text>
                    </View>
                )}
            </View>

            {/* Title / Author */}
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.author}>{book.author}</Text>

            {/* Gutenberg badge */}
            {checkingGutenberg ? (
                <View style={styles.badge}>
                    <ActivityIndicator size="small" color="#4CAF50" />
                    <Text style={styles.badgeText}>Checking availability…</Text>
                </View>
            ) : gutenbergInfo ? (
                <View style={[styles.badge, styles.badgeGreen]}>
                    <Text style={styles.badgeText}>✓ Free Full Text Available</Text>
                </View>
            ) : (
                <View style={[styles.badge, styles.badgeGray]}>
                    <Text style={styles.badgeText}>AI-Generated Content</Text>
                </View>
            )}

            {/* Description */}
            {book.description ? (
                <Text style={styles.description}>{book.description}</Text>
            ) : null}

            {/* Read Full Book */}
            <TouchableOpacity style={styles.primaryButton} onPress={handleReadFullBook}>
                <Text style={styles.primaryButtonText}>
                    {gutenbergInfo ? '📖 Read Full Book (Free)' : '📖 Read Full Book'}
                </Text>
            </TouchableOpacity>

            {/* Chapter list */}
            <Text style={styles.sectionHeader}>Chapters</Text>

            {loadingChapters ? (
                <ActivityIndicator size="large" color="#6200EE" style={{ marginTop: 20 }} />
            ) : (
                chapters.map((ch) => (
                    <TouchableOpacity
                        key={ch.num}
                        style={styles.chapterRow}
                        onPress={() => handleReadChapter(ch)}
                    >
                        <View style={styles.chapterNumBadge}>
                            <Text style={styles.chapterNumText}>{ch.num}</Text>
                        </View>
                        <View style={styles.chapterInfo}>
                            <Text style={styles.chapterTitle}>{ch.title}</Text>
                            {ch.summary ? (
                                <Text style={styles.chapterSummary} numberOfLines={2}>
                                    {ch.summary}
                                </Text>
                            ) : null}
                        </View>
                        <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F5F0' },
    content: { padding: 20, paddingBottom: 40 },

    coverSection: { alignItems: 'center', marginBottom: 16 },
    cover: { width: 160, height: 240, borderRadius: 8 },
    coverPlaceholder: {
        backgroundColor: '#E0D6C8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    coverEmoji: { fontSize: 64 },

    title: {
        fontSize: 24, fontWeight: '700', textAlign: 'center',
        color: '#1A1A1A', marginBottom: 6,
    },
    author: {
        fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 12,
    },

    badge: {
        flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
        paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
        backgroundColor: '#EEE', marginBottom: 16, gap: 6,
    },
    badgeGreen: { backgroundColor: '#E8F5E9' },
    badgeGray: { backgroundColor: '#F0F0F0' },
    badgeText: { fontSize: 13, color: '#444', fontWeight: '600' },

    description: {
        fontSize: 14, color: '#555', lineHeight: 22,
        marginBottom: 20, textAlign: 'center',
    },

    primaryButton: {
        backgroundColor: '#6200EE',
        paddingVertical: 14, borderRadius: 12,
        alignItems: 'center', marginBottom: 28,
    },
    primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

    sectionHeader: {
        fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 12,
    },

    chapterRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFF', borderRadius: 12,
        padding: 14, marginBottom: 10,
        shadowColor: '#000', shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
        elevation: 2,
    },
    chapterNumBadge: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#EDE7F6', alignItems: 'center', justifyContent: 'center',
        marginRight: 12,
    },
    chapterNumText: { fontSize: 14, fontWeight: '700', color: '#6200EE' },
    chapterInfo: { flex: 1 },
    chapterTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
    chapterSummary: { fontSize: 13, color: '#888', marginTop: 2 },
    chevron: { fontSize: 22, color: '#BBB', marginLeft: 8 },
});