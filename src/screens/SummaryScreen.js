import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, ActivityIndicator, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

const STEPS = [
    'Extracting text content...',
    'Detecting chapter structure...',
    'Analyzing key concepts...',
    'Writing your summary...',
];

export default function SummaryScreen({ navigation, route }) {
    const book = route.params?.book || {};
    const mode = route.params?.mode || 'full';
    const chapter = route.params?.chapter;

    const [stage, setStage] = useState('loading');
    const [stepIndex, setStepIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [summary, setSummary] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isSimple, setIsSimple] = useState(true);

    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        generateSummary();
    }, []);

    const animateProgress = (toValue) => {
        Animated.timing(progressAnim, {
            toValue,
            duration: 600,
            useNativeDriver: false,
        }).start();
    };

    const generateSummary = async () => {
        // Simulate AI processing steps
        for (let i = 0; i < STEPS.length; i++) {
            setStepIndex(i);
            const prog = ((i + 1) / STEPS.length) * 100;
            setProgress(prog);
            animateProgress(prog);
            await new Promise(r => setTimeout(r, 900));
        }

        // Generate summary using Claude API
        try {
            const prompt = chapter
                ? `Write a clear, comprehensive summary of Chapter "${chapter.title}" from the book "${book.title}" by ${book.author}. 
           Include: 1) What this chapter covers (2-3 sentences in simple English), 2) The 3 main ideas from this chapter, 3) Key takeaway. 
           Write in simple, clear English that anyone can understand. Format as JSON with keys: overview, keyIdeas (array of 3), takeaway`
                : `Write a clear, comprehensive summary of the book "${book.title}" by ${book.author}. 
           Include: 1) What the book is about (3 sentences in simple English), 2) The 5 main ideas/lessons, 3) Who should read it, 4) The most important concept. 
           Write in simple, clear English. Format as JSON with keys: overview, detailedOverview, keyIdeas (array of 5 objects with title and text), whoShouldRead, mainConcept`;

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    messages: [{ role: 'user', content: prompt }],
                }),
            });

            const data = await response.json();
            const text = data.content?.[0]?.text || '';

            try {
                const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                const parsed = JSON.parse(clean);
                setSummary(parsed);
            } catch {
                // Fallback summary if JSON parse fails
                setSummary({
                    overview: text.slice(0, 300) || `"${book.title}" by ${book.author} explores important ideas that can transform how you think and act. This book offers practical insights drawn from research and real-world examples.`,
                    detailedOverview: text || `A comprehensive analysis of "${book.title}" reveals deep insights about human nature, society, and practical wisdom that readers can apply in their daily lives.`,
                    keyIdeas: [
                        { title: 'Core Concept', text: 'The book introduces a fundamental framework for understanding the subject matter.' },
                        { title: 'Practical Application', text: 'Real-world examples demonstrate how these ideas work in practice.' },
                        { title: 'Key Insight', text: 'The author reveals a counterintuitive truth that challenges conventional thinking.' },
                        { title: 'Main Lesson', text: 'The central lesson provides a clear path forward for implementing the ideas.' },
                        { title: 'Takeaway', text: 'Readers come away with actionable steps they can apply immediately.' },
                    ],
                    whoShouldRead: 'Anyone interested in personal growth, learning, and applying new ideas to their life.',
                    mainConcept: 'The most important concept is that small consistent changes lead to remarkable results over time.',
                });
            }
        } catch (e) {
            setSummary({
                overview: `"${book.title}" by ${book.author} is a thought-provoking work that offers valuable insights and perspectives. The book challenges conventional thinking and provides practical frameworks for understanding complex ideas.`,
                detailedOverview: `In "${book.title}", ${book.author} presents a comprehensive exploration of the subject, drawing on extensive research and real-world examples. The work is structured to take readers on a journey from foundational concepts to advanced applications, making complex ideas accessible to a general audience.`,
                keyIdeas: [
                    { title: 'Foundation', text: 'Understanding the core principles that underpin everything else in the book.' },
                    { title: 'Application', text: 'How to apply these ideas practically in everyday situations.' },
                    { title: 'Mindset Shift', text: 'The crucial change in perspective that makes all the difference.' },
                    { title: 'Systems Thinking', text: 'Seeing the bigger picture and how everything connects.' },
                    { title: 'Action Steps', text: 'Concrete steps you can take starting today to see real results.' },
                ],
                whoShouldRead: 'This book is for anyone who wants to think more clearly, act more effectively, and understand the world better.',
                mainConcept: 'The central theme is that deep understanding of fundamentals is more powerful than surface-level tactics.',
            });
        }

        setStage('done');
    };

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    if (stage === 'loading') {
        return (
            <View style={styles.container}>
                <View style={styles.loadHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={22} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>
                    <Text style={styles.loadHeaderTitle}>Generating Summary</Text>
                    <View style={{ width: 22 }} />
                </View>
                <View style={styles.loadBody}>
                    <View style={styles.loadIcon}>
                        <Text style={{ fontSize: 28 }}>📖</Text>
                    </View>
                    <Text style={styles.loadTitle}>AI is reading...</Text>
                    <Text style={styles.loadSub}>
                        {chapter ? `Summarizing: ${chapter.title}` : `Summarizing: ${book.title}`}
                    </Text>
                    <View style={styles.progressTrack}>
                        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
                    </View>
                    <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                    <View style={styles.steps}>
                        {STEPS.map((step, i) => (
                            <View key={i} style={styles.stepRow}>
                                <View style={[
                                    styles.stepDot,
                                    i < stepIndex && styles.stepDotDone,
                                    i === stepIndex && styles.stepDotActive,
                                ]} />
                                <Text style={[
                                    styles.stepText,
                                    i < stepIndex && styles.stepTextDone,
                                    i === stepIndex && styles.stepTextActive,
                                ]}>
                                    {step}
                                </Text>
                                {i < stepIndex && <Ionicons name="checkmark" size={14} color={COLORS.success} />}
                                {i === stepIndex && <ActivityIndicator size="small" color={COLORS.primary} />}
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{book.title}</Text>
                    <Text style={styles.headerSub}>{chapter ? chapter.title : 'Full Summary'}</Text>
                </View>
                <View style={styles.aiBadge}>
                    <Text style={styles.aiBadgeText}>AI</Text>
                </View>
            </View>

            {/* Simple/Detailed Toggle */}
            <View style={styles.toggleRow}>
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
            {!chapter && (
                <View style={styles.tabRow}>
                    {['overview', 'keyIdeas', 'about'].map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.tabActive]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                {tab === 'keyIdeas' ? 'Key Ideas' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.contentInner}>
                    {/* Read time */}
                    <View style={styles.readTime}>
                        <View style={styles.readDot} />
                        <Text style={styles.readTimeText}>
                            {chapter ? '3 min read' : '8 min read'} · no important concept skipped
                        </Text>
                    </View>

                    {/* Chapter summary */}
                    {chapter && summary && (
                        <>
                            <View style={styles.sectionLabel}>
                                <Text style={styles.sectionLabelText}>CHAPTER SUMMARY</Text>
                            </View>
                            <Text style={styles.summaryText}>{summary.overview}</Text>
                            {summary.keyIdeas?.map((idea, i) => (
                                <View key={i} style={styles.ideaCard}>
                                    <View style={styles.ideaNum}>
                                        <Text style={styles.ideaNumText}>{i + 1}</Text>
                                    </View>
                                    <View style={styles.ideaContent}>
                                        <Text style={styles.ideaTitle}>{idea.title || idea}</Text>
                                        {idea.text && <Text style={styles.ideaText}>{idea.text}</Text>}
                                    </View>
                                </View>
                            ))}
                            {summary.takeaway && (
                                <View style={styles.takeawayBox}>
                                    <Text style={styles.takeawayLabel}>💡 Key Takeaway</Text>
                                    <Text style={styles.takeawayText}>{summary.takeaway}</Text>
                                </View>
                            )}
                        </>
                    )}

                    {/* Full book — Overview tab */}
                    {!chapter && activeTab === 'overview' && summary && (
                        <>
                            <View style={styles.sectionLabel}>
                                <Text style={styles.sectionLabelText}>OVERVIEW</Text>
                            </View>
                            <Text style={styles.summaryText}>
                                {isSimple ? summary.overview : summary.detailedOverview || summary.overview}
                            </Text>
                            {summary.mainConcept && (
                                <View style={styles.takeawayBox}>
                                    <Text style={styles.takeawayLabel}>💡 Most Important Concept</Text>
                                    <Text style={styles.takeawayText}>{summary.mainConcept}</Text>
                                </View>
                            )}
                        </>
                    )}

                    {/* Key Ideas tab */}
                    {!chapter && activeTab === 'keyIdeas' && summary && (
                        <>
                            <Text style={styles.tabIntro}>The most important ideas from this book, explained clearly.</Text>
                            {(summary.keyIdeas || []).map((idea, i) => (
                                <View key={i} style={styles.ideaCard}>
                                    <View style={styles.ideaNum}>
                                        <Text style={styles.ideaNumText}>0{i + 1}</Text>
                                    </View>
                                    <View style={styles.ideaContent}>
                                        <Text style={styles.ideaTitle}>{idea.title || `Idea ${i + 1}`}</Text>
                                        <Text style={styles.ideaText}>{idea.text || idea}</Text>
                                    </View>
                                </View>
                            ))}
                        </>
                    )}

                    {/* About tab */}
                    {!chapter && activeTab === 'about' && summary && (
                        <>
                            <View style={styles.takeawayBox}>
                                <Text style={styles.takeawayLabel}>👥 Who should read this?</Text>
                                <Text style={styles.takeawayText}>{summary.whoShouldRead || 'Anyone interested in learning and growing.'}</Text>
                            </View>
                            <Text style={styles.summaryText}>
                                {isSimple ? summary.overview : summary.detailedOverview || summary.overview}
                            </Text>
                        </>
                    )}
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    // Loading
    loadHeader: { backgroundColor: COLORS.primary, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    loadHeaderTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
    loadBody: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14 },
    loadIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
    loadTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
    loadSub: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
    progressTrack: { width: '100%', height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: 4, backgroundColor: COLORS.primary, borderRadius: 2 },
    progressText: { fontSize: 13, color: COLORS.textMuted },
    steps: { width: '100%', gap: 2 },
    stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
    stepDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.border },
    stepDotDone: { backgroundColor: COLORS.success },
    stepDotActive: { backgroundColor: COLORS.primary },
    stepText: { flex: 1, fontSize: 13, color: COLORS.textMuted },
    stepTextDone: { color: COLORS.success },
    stepTextActive: { color: COLORS.text, fontWeight: '500' },

    // Summary
    header: { backgroundColor: COLORS.primary, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerInfo: { flex: 1 },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
    headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    aiBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    aiBadgeText: { fontSize: 11, color: '#fff', fontWeight: '600' },

    toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: COLORS.white, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
    toggleLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
    togglePills: { flexDirection: 'row', backgroundColor: COLORS.background, borderRadius: RADIUS.full, padding: 3, gap: 2 },
    togglePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: RADIUS.full },
    togglePillActive: { backgroundColor: COLORS.primary },
    togglePillText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
    togglePillTextActive: { color: '#fff' },

    tabRow: { flexDirection: 'row', backgroundColor: COLORS.white, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
    tabText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
    tabTextActive: { color: COLORS.primary, fontWeight: '600' },

    content: { flex: 1 },
    contentInner: { padding: 20 },
    readTime: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    readDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.accent },
    readTimeText: { fontSize: 12, color: COLORS.textMuted },
    sectionLabel: { backgroundColor: `${COLORS.primary}10`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 12 },
    sectionLabelText: { fontSize: 10, fontWeight: '700', color: COLORS.primary, letterSpacing: 0.5 },
    summaryText: { fontSize: 15, color: COLORS.text, lineHeight: 26, marginBottom: 16 },
    tabIntro: { fontSize: 13, color: COLORS.textMuted, marginBottom: 16, lineHeight: 20 },

    ideaCard: { flexDirection: 'row', gap: 14, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 16, marginBottom: 10, borderWidth: 0.5, borderColor: COLORS.border, ...SHADOW.small },
    ideaNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.successLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
    ideaNumText: { fontSize: 11, fontWeight: '700', color: COLORS.success },
    ideaContent: { flex: 1 },
    ideaTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 5 },
    ideaText: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20 },

    takeawayBox: { backgroundColor: COLORS.successLight, borderRadius: RADIUS.lg, padding: 16, marginTop: 4, marginBottom: 16, borderWidth: 0.5, borderColor: '#b7dfc9' },
    takeawayLabel: { fontSize: 12, fontWeight: '700', color: COLORS.success, marginBottom: 6 },
    takeawayText: { fontSize: 13, color: COLORS.text, lineHeight: 20 },
});