import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

const FULL_SUMMARY = {
    readTime: '8 min read',
    overview: `This book explains how our brain uses two completely different ways of thinking. System 1 is fast, automatic, and emotional — it handles most of your daily decisions without you even noticing. System 2 is slow, careful, and logical — you use it when solving hard problems that need real focus and attention.\n\nKahneman spent decades studying how people make decisions and discovered that we are far less rational than we think. Most of our choices are driven by System 1, which is full of biases and shortcuts that often lead us to wrong conclusions.`,
    detailedOverview: `Nobel Prize winner Daniel Kahneman presents decades of research on human judgment and decision-making in this landmark work. He introduces the dual-process theory of mind, demonstrating through hundreds of experiments that human cognition operates through two fundamentally different systems with distinct characteristics, speeds, and error profiles.\n\nSystem 1 operates automatically with no sense of voluntary control, while System 2 allocates attention to effortful mental activities. The book meticulously documents the systematic biases that arise when we over-rely on System 1 thinking in contexts that require System 2 deliberation.`,
    keyIdeas: [
        { num: '01', title: 'Overconfidence bias', text: 'We are far more confident in our own judgments than we should be. This affects doctors, investors, and everyday decisions.' },
        { num: '02', title: 'Anchoring effect', text: 'The first number you hear influences all your future estimates, even when the number is completely random.' },
        { num: '03', title: 'Loss aversion', text: 'Losses feel about twice as painful as gains of the same size. This shapes most of our financial and personal decisions.' },
        { num: '04', title: 'The halo effect', text: 'If we like one thing about a person, we tend to assume everything about them is good.' },
        { num: '05', title: 'Availability heuristic', text: 'We judge how likely something is by how easily an example comes to mind, not by actual statistics.' },
    ],
    chapters: [
        { id: 1, title: 'The Two Systems', confidence: 97, summary: 'Your brain has two systems. System 1 runs automatically and System 2 requires effort. Most mistakes happen when System 1 is used for problems that need System 2.' },
        { id: 2, title: 'Attention and Effort', confidence: 95, summary: 'Mental effort is real and limited. When System 2 is busy, System 1 takes over more decisions than it should.' },
        { id: 3, title: 'The Lazy Controller', confidence: 98, summary: 'System 2 is lazy by nature. It avoids effort whenever possible, which means System 1 makes most of our decisions by default.' },
        { id: 4, title: 'The Associative Machine', confidence: 94, summary: 'System 1 constantly builds a story from whatever information is available, even when that information is incomplete.' },
        { id: 5, title: 'Cognitive Ease', confidence: 96, summary: 'When things feel easy to process, we trust them more. This is why familiar and clearly written things feel more true.' },
    ],
};

export default function SummaryScreen({ navigation, route }) {
    const book = route.params?.book || { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', color1: '#2d1b69' };
    const [activeTab, setActiveTab] = useState('overview');
    const [isSimple, setIsSimple] = useState(true);

    const tabs = ['overview', 'keyIdeas', 'chapters'];
    const tabLabels = { overview: 'Overview', keyIdeas: 'Key Ideas', chapters: 'Chapters' };

    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={[styles.header, { backgroundColor: book.color1 || COLORS.primary }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{book.title}</Text>
                <Text style={styles.headerSub}>Full Book Summary · {FULL_SUMMARY.chapters.length} chapters</Text>
            </View>

            {/* Simple / Detailed Toggle */}
            <View style={styles.toggleBox}>
                <Text style={styles.toggleLabel}>Reading level:</Text>
                <View style={styles.togglePills}>
                    <TouchableOpacity
                        style={[styles.togglePill, isSimple && styles.togglePillActive]}
                        onPress={() => setIsSimple(true)}
                    >
                        <Text style={[styles.togglePillText, isSimple && styles.togglePillTextActive]}>Simple</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.togglePill, !isSimple && styles.togglePillActive]}
                        onPress={() => setIsSimple(false)}
                    >
                        <Text style={[styles.togglePillText, !isSimple && styles.togglePillTextActive]}>Detailed</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
                {tabs.map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.tabActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                            {tabLabels[tab]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <View style={styles.tabContent}>
                        <View style={styles.readTimeRow}>
                            <View style={styles.readTimeDot} />
                            <Text style={styles.readTimeText}>{FULL_SUMMARY.readTime} · no important concept skipped</Text>
                        </View>
                        <Text style={styles.summaryText}>
                            {isSimple ? FULL_SUMMARY.overview : FULL_SUMMARY.detailedOverview}
                        </Text>
                    </View>
                )}

                {/* Key Ideas Tab */}
                {activeTab === 'keyIdeas' && (
                    <View style={styles.tabContent}>
                        <Text style={styles.tabIntro}>The most important concepts from this book, explained simply.</Text>
                        {FULL_SUMMARY.keyIdeas.map(idea => (
                            <View key={idea.num} style={styles.ideaCard}>
                                <View style={styles.ideaNumBox}>
                                    <Text style={styles.ideaNum}>{idea.num}</Text>
                                </View>
                                <View style={styles.ideaContent}>
                                    <Text style={styles.ideaTitle}>{idea.title}</Text>
                                    <Text style={styles.ideaText}>{idea.text}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Chapters Tab */}
                {activeTab === 'chapters' && (
                    <View style={styles.tabContent}>
                        <Text style={styles.tabIntro}>Summary of each chapter. Tap to expand.</Text>
                        {FULL_SUMMARY.chapters.map((ch, index) => (
                            <ChapterItem key={ch.id} chapter={ch} index={index} />
                        ))}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

function ChapterItem({ chapter, index }) {
    const [expanded, setExpanded] = useState(false);
    return (
        <TouchableOpacity
            style={styles.chapterCard}
            onPress={() => setExpanded(!expanded)}
            activeOpacity={0.8}
        >
            <View style={styles.chapterCardHeader}>
                <View style={styles.chapterIdx}>
                    <Text style={styles.chapterIdxText}>{index + 1}</Text>
                </View>
                <Text style={styles.chapterCardTitle} numberOfLines={1}>{chapter.title}</Text>
                <View style={styles.chapterConf}>
                    <Text style={styles.chapterConfText}>{chapter.confidence}%</Text>
                </View>
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={COLORS.textMuted}
                />
            </View>
            {expanded && (
                <Text style={styles.chapterSummaryText}>{chapter.summary}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    // Header
    header: { paddingTop: 52, paddingBottom: 18, paddingHorizontal: 20 },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
    backText: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
    headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.45)' },

    // Toggle
    toggleBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: COLORS.white, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
    toggleLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
    togglePills: { flexDirection: 'row', backgroundColor: COLORS.background, borderRadius: RADIUS.full, padding: 3, gap: 2 },
    togglePill: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: RADIUS.full },
    togglePillActive: { backgroundColor: COLORS.primary },
    togglePillText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
    togglePillTextActive: { color: '#fff' },

    // Tabs
    tabRow: { flexDirection: 'row', backgroundColor: COLORS.white, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
    tabText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
    tabTextActive: { color: COLORS.primary, fontWeight: '600' },

    // Content
    content: { flex: 1 },
    tabContent: { padding: 20 },
    readTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    readTimeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.accent },
    readTimeText: { fontSize: 12, color: COLORS.textMuted },
    summaryText: { fontSize: 15, color: COLORS.text, lineHeight: 26 },
    tabIntro: { fontSize: 13, color: COLORS.textMuted, marginBottom: 16, lineHeight: 20 },

    // Key Ideas
    ideaCard: { flexDirection: 'row', gap: 14, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 16, marginBottom: 10, borderWidth: 0.5, borderColor: COLORS.border, ...SHADOW.small },
    ideaNumBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.successLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
    ideaNum: { fontSize: 12, fontWeight: '700', color: COLORS.success },
    ideaContent: { flex: 1 },
    ideaTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 5 },
    ideaText: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20 },

    // Chapters
    chapterCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 14, marginBottom: 8, borderWidth: 0.5, borderColor: COLORS.border, ...SHADOW.small },
    chapterCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    chapterIdx: { width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
    chapterIdxText: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },
    chapterCardTitle: { flex: 1, fontSize: 13, fontWeight: '500', color: COLORS.text },
    chapterConf: { backgroundColor: COLORS.successLight, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3 },
    chapterConfText: { fontSize: 10, color: COLORS.success, fontWeight: '600' },
    chapterSummaryText: { fontSize: 13, color: COLORS.textMuted, lineHeight: 21, marginTop: 12, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: COLORS.border },
});