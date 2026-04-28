import React from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

const CHAPTERS = [
    { id: 1, title: 'The Two Systems', confidence: 97 },
    { id: 2, title: 'Attention and Effort', confidence: 95 },
    { id: 3, title: 'The Lazy Controller', confidence: 98 },
    { id: 4, title: 'The Associative Machine', confidence: 94 },
    { id: 5, title: 'Cognitive Ease', confidence: 96 },
    { id: 6, title: 'Norms, Surprises and Causes', confidence: 93 },
    { id: 7, title: 'A Machine for Jumping to Conclusions', confidence: 97 },
];

export default function BookDetailScreen({ navigation, route }) {
    const book = route.params?.book || {
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        pages: 499,
        color1: '#2d1b69',
        color2: '#11998e',
    };

    const overallConfidence = Math.round(
        CHAPTERS.reduce((sum, ch) => sum + ch.confidence, 0) / CHAPTERS.length
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* Cover */}
            <View style={[styles.cover, { backgroundColor: book.color1 }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={22} color="#fff" />
                </TouchableOpacity>
                <View style={[styles.coverAccent, { backgroundColor: book.color2 }]} />
                <View style={styles.coverBook}>
                    <Text style={styles.coverBookTitle} numberOfLines={3}>{book.title}</Text>
                    <Text style={styles.coverBookAuthor}>{book.author}</Text>
                </View>
            </View>

            {/* Info */}
            <View style={styles.body}>
                <Text style={styles.bookTitle}>{book.title}</Text>
                <Text style={styles.bookAuthor}>{book.author}</Text>

                {/* Meta Pills */}
                <View style={styles.metaRow}>
                    <View style={styles.metaPill}>
                        <Ionicons name="book-outline" size={11} color={COLORS.textMuted} />
                        <Text style={styles.metaText}>{book.pages} pages</Text>
                    </View>
                    <View style={styles.metaPill}>
                        <Ionicons name="time-outline" size={11} color={COLORS.textMuted} />
                        <Text style={styles.metaText}>8 min read</Text>
                    </View>
                    <View style={styles.metaPill}>
                        <Ionicons name="star" size={11} color="#f59e0b" />
                        <Text style={styles.metaText}>4.6</Text>
                    </View>
                    <View style={styles.metaPill}>
                        <Text style={styles.metaText}>Psychology</Text>
                    </View>
                </View>

                {/* Confidence Bar */}
                <View style={styles.confidenceBox}>
                    <View style={styles.confidenceHeader}>
                        <View>
                            <Text style={styles.confidenceLabel}>Summary Completeness</Text>
                            <Text style={styles.confidenceSubLabel}>All key concepts captured across {CHAPTERS.length} chapters</Text>
                        </View>
                        <Text style={styles.confidenceValue}>{overallConfidence}%</Text>
                    </View>
                    <View style={styles.confidenceTrack}>
                        <View style={[styles.confidenceFill, { width: `${overallConfidence}%` }]} />
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={() => navigation.navigate('Summary', { book, mode: 'full' })}
                    >
                        <Ionicons name="document-text-outline" size={16} color="#fff" />
                        <Text style={styles.primaryBtnText}>Full Summary</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={() => navigation.navigate('Summary', { book, mode: 'chapter' })}
                    >
                        <Ionicons name="list-outline" size={16} color={COLORS.text} />
                        <Text style={styles.secondaryBtnText}>By Chapter</Text>
                    </TouchableOpacity>
                </View>

                {/* About */}
                <Text style={styles.sectionTitle}>About this book</Text>
                <Text style={styles.aboutText}>
                    A groundbreaking work that explores the two systems that drive the way we think.
                    System 1 is fast, intuitive, and emotional. System 2 is slower, more deliberate,
                    and more logical. Kahneman reveals where we can and cannot trust our intuitions.
                </Text>

                {/* Chapters */}
                <Text style={styles.sectionTitle}>Chapters</Text>
                <View style={styles.chapterList}>
                    {CHAPTERS.map((ch, index) => (
                        <TouchableOpacity
                            key={ch.id}
                            style={styles.chapterRow}
                            onPress={() => navigation.navigate('Summary', { book, mode: 'chapter', chapter: ch })}
                        >
                            <View style={styles.chapterNum}>
                                <Text style={styles.chapterNumText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.chapterName} numberOfLines={1}>{ch.title}</Text>
                            <View style={styles.chapterBadge}>
                                <Text style={styles.chapterBadgeText}>{ch.confidence}%</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>

            </View>
            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    // Cover
    cover: { height: 220, justifyContent: 'flex-end', padding: 20, overflow: 'hidden' },
    backBtn: { position: 'absolute', top: 48, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
    coverAccent: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, opacity: 0.35 },
    coverBook: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: RADIUS.md, padding: 14, width: 100, minHeight: 130, justifyContent: 'flex-end' },
    coverBookTitle: { fontSize: 10, color: '#fff', fontWeight: '600', lineHeight: 14, marginBottom: 6 },
    coverBookAuthor: { fontSize: 8, color: 'rgba(255,255,255,0.6)' },

    // Body
    body: { padding: 20 },
    bookTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
    bookAuthor: { fontSize: 13, color: COLORS.textMuted, marginBottom: 14 },

    // Meta
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
    metaPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.white, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 0.5, borderColor: COLORS.border },
    metaText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500' },

    // Confidence
    confidenceBox: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 16, marginBottom: 18, borderWidth: 0.5, borderColor: COLORS.border, ...SHADOW.small },
    confidenceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    confidenceLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 3 },
    confidenceSubLabel: { fontSize: 11, color: COLORS.textMuted },
    confidenceValue: { fontSize: 22, fontWeight: '700', color: COLORS.success },
    confidenceTrack: { height: 6, backgroundColor: COLORS.border, borderRadius: 3 },
    confidenceFill: { height: 6, backgroundColor: COLORS.success, borderRadius: 3 },

    // Buttons
    actionRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
    primaryBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    secondaryBtn: { flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 0.5, borderColor: COLORS.border },
    secondaryBtnText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },

    // About
    sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 10 },
    aboutText: { fontSize: 13, color: COLORS.textMuted, lineHeight: 21, marginBottom: 22 },

    // Chapters
    chapterList: { gap: 2 },
    chapterRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, padding: 14, borderRadius: RADIUS.md, marginBottom: 6, borderWidth: 0.5, borderColor: COLORS.border, ...SHADOW.small },
    chapterNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
    chapterNumText: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },
    chapterName: { flex: 1, fontSize: 13, color: COLORS.text, fontWeight: '500' },
    chapterBadge: { backgroundColor: COLORS.successLight, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3 },
    chapterBadgeText: { fontSize: 10, color: COLORS.success, fontWeight: '600' },
});