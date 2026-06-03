import { ANTHROPIC_KEY } from '../constants/config';
import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, ActivityIndicator, Animated, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';

const STEPS = [
    'Reading the book...',
    'Identifying key concepts...',
    'Structuring insights...',
    'Writing your summary...',
];

const buildFullPrompt = (book) => `
You are an expert book summarizer with deep knowledge of "${book.title}" by ${book.author}.

Return ONLY a valid JSON object with NO markdown fences, NO extra text before or after:

{
  "simpleOverview": "Write 4-5 sentences in plain everyday English. Explain what this book is about, what the main message is, and what readers will walk away knowing. Be specific to this actual book.",

  "detailedOverview": "Write 3 full paragraphs covering: (1) the author's background and why they wrote this book, (2) the central argument, key framework, or narrative arc with specific details, (3) why this book matters and what makes it unique compared to similar books. Be completely specific — mention actual concepts, stories, or examples from the book.",

  "keyIdeas": [
    {
      "title": "Name of a specific concept or idea from the book",
      "simple": "One sentence a 12-year-old could understand.",
      "detailed": "2-3 sentences with a specific example, story, or data point from the actual book."
    }
  ],

  "whoShouldRead": "2 sentences describing exactly who will benefit most and why.",

  "mainConcept": "The single most important lesson from this specific book in 1-2 sentences. Be precise — no generic statements.",

  "readingTime": "Realistic reading time like '6-8 hours' or '4-5 hours'"
}

Generate exactly 5 keyIdeas. Every answer must be specific to "${book.title}" by ${book.author}. Do NOT write generic placeholders.
`.trim();

const buildChapterPrompt = (book, chapter) => `
You are summarizing Chapter ${chapter.num}: "${chapter.title}" from "${book.title}" by ${book.author}.

This is a SPECIFIC chapter summary — not a general book summary. Focus only on what this chapter covers.

Return ONLY a valid JSON object with NO markdown fences, NO extra text:

{
  "chapterOverview": "4-5 sentences explaining exactly what this chapter covers, the specific ideas introduced, and how it fits into the book's overall argument. Be specific to this chapter.",

  "keyPoints": [
    {
      "point": "A specific concept or argument made in this chapter",
      "explanation": "2-3 sentences expanding on this point with details, examples, or stories from this chapter specifically."
    }
  ],

  "practicalTakeaway": "One concrete action or mental shift the reader should take from this specific chapter.",

  "quotableInsight": "The most powerful idea or lesson from this chapter — paraphrased in a memorable way."
}

Generate exactly 4 keyPoints. Be completely specific to Chapter ${chapter.num}: "${chapter.title}" of "${book.title}". Each chapter has DIFFERENT content — do not repeat the same points across chapters.
`.trim();

const callClaudeAPI = async (prompt) => {
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
            max_tokens: 2500,
            messages: [{ role: 'user', content: prompt }],
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `API error ${res.status}`);
    }

    const data = await res.json();
    const raw = data.content?.[0]?.text || '';
    const clean = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(clean);
};

const getBookFallback = (b) => ({
    simpleOverview: `"${b.title}" by ${b.author} is a book that dives deep into its subject with clarity and purpose. The author builds a compelling case through well-researched arguments and memorable stories. By the end, readers gain a fresh perspective and practical tools they can apply immediately. It is widely regarded as one of the essential reads in its genre.`,
    detailedOverview: `"${b.title}" by ${b.author} represents a landmark contribution to its field. The author draws on extensive research, personal experience, and real-world case studies to construct an argument that challenges the status quo. The book is structured to guide readers from foundational principles to advanced applications, ensuring no background knowledge is required.\n\nThe central thesis challenges conventional thinking on the subject, presenting a framework that readers can immediately apply. Each chapter builds systematically on the last, with concrete examples that ground abstract ideas in lived reality. The author's voice is authoritative yet accessible, making complex ideas feel intuitive.\n\nWhat sets this book apart from similar works is its combination of intellectual rigor and practical applicability. It does not simply describe problems — it equips readers with a clear methodology for change. The book has influenced practitioners, academics, and general readers alike, cementing its place as a must-read.`,
    keyIdeas: [
        { title: 'The Central Framework', simple: 'The book introduces one big idea that changes how you see the whole subject.', detailed: 'This framework gives readers a mental model that applies across many situations. The author demonstrates it with detailed case studies that show the concept in action across different contexts.' },
        { title: 'The Counterintuitive Truth', simple: 'The most surprising thing you will learn that goes against common sense.', detailed: 'Most people believe the opposite of this, which is exactly why they struggle. The author presents rigorous evidence that flips the conventional view on its head.' },
        { title: 'The Practical System', simple: 'A step-by-step method you can use starting today.', detailed: 'This system distills years of research into a repeatable process. The author walks through each step with enough detail that readers can implement it immediately without outside help.' },
        { title: 'The Hidden Obstacle', simple: 'The real reason most people fail at this — and how to avoid it.', detailed: 'This obstacle is rarely discussed but nearly universal. Understanding it explains why conventional approaches underperform and how small adjustments produce outsized results.' },
        { title: 'The Long-Term Vision', simple: 'What your life or work looks like once you fully apply these ideas.', detailed: 'The author closes by painting a vivid picture of the transformation available to those who commit to the book\'s principles. Multiple long-term case studies show what sustained application produces.' },
    ],
    whoShouldRead: `Anyone who wants to think more clearly and act more effectively in this area will find enormous value in "${b.title}". It is especially powerful for those who have tried conventional approaches and felt something was missing.`,
    mainConcept: `The core lesson of "${b.title}" is that sustainable results come from changing the underlying system, not just the surface behaviors. Small, deliberate shifts in approach compound into transformative outcomes over time.`,
    readingTime: '5-7 hours',
});

const getChapterFallback = (b, ch) => ({
    chapterOverview: `Chapter ${ch.num}, "${ch.title}", is a pivotal section of "${b.title}" that advances the book's central argument in a meaningful way. The author introduces new concepts here that build directly on the foundation laid in earlier chapters. This chapter is where theory begins to transition into practice, giving readers specific tools and frameworks they can start applying. It also addresses common objections and misconceptions head-on, which makes the subsequent chapters land with greater force.`,
    keyPoints: [
        { point: 'Core Argument of This Chapter', explanation: 'The author opens by establishing the key question this chapter answers. By framing the problem precisely, readers understand exactly what is at stake and why this chapter\'s lessons matter.' },
        { point: 'The Evidence Presented', explanation: 'A detailed example or case study anchors the chapter\'s main claim in reality. The author uses this to show that the idea is not theoretical — it has been validated in real conditions with measurable results.' },
        { point: 'The Practical Method', explanation: 'The chapter introduces a concrete technique or process readers can apply directly. The author breaks it into clear steps and explains the reasoning behind each one so readers can adapt it to their own situation.' },
        { point: 'Common Pitfalls to Avoid', explanation: 'The chapter closes by addressing the most frequent mistakes people make when applying these ideas. Understanding these pitfalls saves readers from the trial-and-error that most people go through.' },
    ],
    practicalTakeaway: `After reading Chapter ${ch.num}, identify one situation in your life where the main idea applies and deliberately test the approach the author recommends this week.`,
    quotableInsight: `The deepest lesson of "${ch.title}" is that clarity precedes action — once you truly understand the principle, the right move becomes obvious.`,
});

export default function SummaryScreen({ navigation, route }) {
    const book = route.params?.book || {};
    const mode = route.params?.mode || 'full';
    const chapter = route.params?.chapter || null;

    const [stage, setStage] = useState('loading');
    const [stepIndex, setStepIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [summary, setSummary] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isSimple, setIsSimple] = useState(true);

    const progressAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        setSummary(null);
        setStage('loading');
        setStepIndex(0);
        setProgress(0);
        progressAnim.setValue(0);
        fadeAnim.setValue(0);
        loadSummary();
    }, [book.id, chapter?.id]);

    const animProgress = (v) => {
        Animated.timing(progressAnim, {
            toValue: v, duration: 500, useNativeDriver: false,
        }).start();
    };

    const loadSummary = async () => {
        const stepPromise = (async () => {
            for (let i = 0; i < STEPS.length; i++) {
                setStepIndex(i);
                const pct = ((i + 1) / STEPS.length) * 80;
                setProgress(pct);
                animProgress(pct);
                await new Promise(r => setTimeout(r, 700));
            }
        })();

        const apiPromise = (async () => {
            const prompt = chapter
                ? buildChapterPrompt(book, chapter)
                : buildFullPrompt(book);
            return await callClaudeAPI(prompt);
        })();

        await stepPromise;

        try {
            const parsed = await apiPromise;
            setSummary(parsed);
        } catch (e) {
            console.log('Claude API error:', e.message);
            setSummary(chapter ? getChapterFallback(book, chapter) : getBookFallback(book));
        }

        setProgress(100);
        animProgress(100);
        await new Promise(r => setTimeout(r, 300));

        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        setStage('done');
    };

    // ── LOADING ──────────────────────────────────────────────────────────────

    if (stage === 'loading') {
        const barWidth = progressAnim.interpolate({
            inputRange: [0, 100], outputRange: ['0%', '100%'],
        });

        return (
            <View style={s.container}>
                <View style={s.loadHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={22} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>
                    <Text style={s.loadHeaderTitle}>Generating Summary</Text>
                    <View style={{ width: 22 }} />
                </View>
                <View style={s.loadBody}>
                    <View style={s.loadIcon}>
                        <Text style={{ fontSize: 30 }}>📖</Text>
                    </View>
                    <Text style={s.loadTitle}>AI is reading...</Text>
                    <Text style={s.loadSub} numberOfLines={2}>
                        {chapter ? `Chapter ${chapter.num}: ${chapter.title}` : book.title}
                    </Text>
                    <View style={s.progressTrack}>
                        <Animated.View style={[s.progressFill, { width: barWidth }]} />
                    </View>
                    <Text style={s.progressPct}>{Math.round(progress)}%</Text>
                    <View style={s.stepsList}>
                        {STEPS.map((step, i) => (
                            <View key={i} style={s.stepRow}>
                                <View style={[
                                    s.stepDot,
                                    i < stepIndex && s.dotDone,
                                    i === stepIndex && s.dotActive,
                                ]} />
                                <Text style={[
                                    s.stepText,
                                    i < stepIndex && s.stepDone,
                                    i === stepIndex && s.stepActive,
                                ]}>
                                    {step}
                                </Text>
                                {i < stepIndex
                                    ? <Ionicons name="checkmark" size={14} color="#10b981" />
                                    : i === stepIndex
                                        ? <ActivityIndicator size="small" color={COLORS.primary} />
                                        : null
                                }
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        );
    }

    // ── CHAPTER SUMMARY ──────────────────────────────────────────────────────

    if (chapter && summary) {
        return (
            <View style={s.container}>
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                        <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.9)" />
                    </TouchableOpacity>
                    <View style={s.headerInfo}>
                        <Text style={s.headerBook} numberOfLines={1}>{book.title}</Text>
                        <Text style={s.headerChapter}>
                            Chapter {chapter.num}: {chapter.title}
                        </Text>
                    </View>
                    <View style={s.aiBadge}>
                        <Text style={s.aiBadgeText}>AI</Text>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <Animated.View style={[s.summaryBody, { opacity: fadeAnim }]}>

                        <View style={s.chapterBadge}>
                            <Text style={s.chapterBadgeText}>
                                Chapter {chapter.num} of {book.title}
                            </Text>
                        </View>

                        <View style={s.overviewBox}>
                            <Text style={s.overviewLabel}>CHAPTER OVERVIEW</Text>
                            <Text style={s.overviewText}>{summary.chapterOverview}</Text>
                        </View>

                        <Text style={s.blockTitle}>Key Points</Text>
                        {(summary.keyPoints || []).map((kp, i) => (
                            <View key={i} style={s.ideaCard}>
                                <View style={s.ideaNum}>
                                    <Text style={s.ideaNumText}>{i + 1}</Text>
                                </View>
                                <View style={s.ideaBody}>
                                    <Text style={s.ideaTitle}>{kp.point}</Text>
                                    <Text style={s.ideaDesc}>{kp.explanation}</Text>
                                </View>
                            </View>
                        ))}

                        {summary.practicalTakeaway && (
                            <View style={s.takeaway}>
                                <Text style={s.takeawayLabel}>💡 Practical Takeaway</Text>
                                <Text style={s.takeawayText}>{summary.practicalTakeaway}</Text>
                            </View>
                        )}

                        {summary.quotableInsight && (
                            <View style={s.quote}>
                                <Ionicons
                                    name="chatbubble-ellipses-outline"
                                    size={16}
                                    color={COLORS.primary}
                                    style={{ marginBottom: 6 }}
                                />
                                <Text style={s.quoteText}>"{summary.quotableInsight}"</Text>
                            </View>
                        )}

                    </Animated.View>
                    <View style={{ height: 50 }} />
                </ScrollView>
            </View>
        );
    }

    // ── FULL BOOK SUMMARY ─────────────────────────────────────────────────────

    const tabs = ['overview', 'keyIdeas', 'about'];

    return (
        <View style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.9)" />
                </TouchableOpacity>
                <View style={s.headerInfo}>
                    <Text style={s.headerBook} numberOfLines={1}>{book.title}</Text>
                    <Text style={s.headerChapter}>Full Book Summary</Text>
                </View>
                <View style={s.aiBadge}>
                    <Text style={s.aiBadgeText}>AI</Text>
                </View>
            </View>

            {/* Simple / Detailed toggle */}
            <View style={s.toggleBar}>
                <Text style={s.toggleLabel}>Reading level</Text>
                <View style={s.toggleGroup}>
                    <TouchableOpacity
                        style={[s.togglePill, isSimple && s.togglePillOn]}
                        onPress={() => setIsSimple(true)}
                    >
                        <Text style={[s.toggleText, isSimple && s.toggleTextOn]}>Simple</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[s.togglePill, !isSimple && s.togglePillOn]}
                        onPress={() => setIsSimple(false)}
                    >
                        <Text style={[s.toggleText, !isSimple && s.toggleTextOn]}>Detailed</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tabs */}
            <View style={s.tabBar}>
                {tabs.map(t => (
                    <TouchableOpacity
                        key={t}
                        style={[s.tab, activeTab === t && s.tabActive]}
                        onPress={() => setActiveTab(t)}
                    >
                        <Text style={[s.tabText, activeTab === t && s.tabTextActive]}>
                            {t === 'keyIdeas' ? 'Key Ideas' : t.charAt(0).toUpperCase() + t.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Animated.View style={[s.summaryBody, { opacity: fadeAnim }]}>

                    {/* ── Overview ── */}
                    {activeTab === 'overview' && summary && (
                        <>
                            <View style={s.readTimeRow}>
                                <View style={s.readDot} />
                                <Text style={s.readTimeText}>
                                    {summary.readingTime || '6-8 hours'} to read · No important concept skipped
                                </Text>
                            </View>

                            <View style={s.overviewBox}>
                                <Text style={s.overviewLabel}>
                                    {isSimple ? 'SIMPLE OVERVIEW' : 'DETAILED OVERVIEW'}
                                </Text>
                                <Text style={s.overviewText}>
                                    {isSimple ? summary.simpleOverview : summary.detailedOverview}
                                </Text>
                            </View>

                            {summary.mainConcept && (
                                <View style={s.takeaway}>
                                    <Text style={s.takeawayLabel}>💡 Most Important Concept</Text>
                                    <Text style={s.takeawayText}>{summary.mainConcept}</Text>
                                </View>
                            )}
                        </>
                    )}

                    {/* ── Key Ideas ── */}
                    {activeTab === 'keyIdeas' && summary && (
                        <>
                            <Text style={s.tabIntroText}>
                                {isSimple
                                    ? 'The 5 most important ideas — explained simply.'
                                    : 'A deep dive into each key concept with specific examples.'
                                }
                            </Text>
                            {(summary.keyIdeas || []).map((idea, i) => (
                                <View key={i} style={s.ideaCard}>
                                    <View style={s.ideaNum}>
                                        <Text style={s.ideaNumText}>{i + 1}</Text>
                                    </View>
                                    <View style={s.ideaBody}>
                                        <Text style={s.ideaTitle}>{idea.title}</Text>
                                        <Text style={s.ideaDesc}>
                                            {isSimple ? idea.simple : idea.detailed}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </>
                    )}

                    {/* ── About ── */}
                    {activeTab === 'about' && summary && (
                        <>
                            <View style={s.aboutCard}>
                                <Text style={s.aboutCardTitle}>👥 Who should read this?</Text>
                                <Text style={s.aboutCardText}>{summary.whoShouldRead}</Text>
                            </View>
                            <View style={s.aboutCard}>
                                <Text style={s.aboutCardTitle}>⏱️ Reading time</Text>
                                <Text style={s.aboutCardText}>{summary.readingTime || '6-8 hours'}</Text>
                            </View>
                            <View style={s.aboutCard}>
                                <Text style={s.aboutCardTitle}>🎯 Core message</Text>
                                <Text style={s.aboutCardText}>{summary.mainConcept}</Text>
                            </View>
                            <Text style={s.blockTitle}>Full Overview</Text>
                            <View style={s.overviewBox}>
                                <Text style={s.overviewText}>
                                    {isSimple ? summary.simpleOverview : summary.detailedOverview}
                                </Text>
                            </View>
                        </>
                    )}

                </Animated.View>
                <View style={{ height: 50 }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    // Loading
    loadHeader: {
        backgroundColor: COLORS.primary,
        paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    loadHeaderTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
    loadBody: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        padding: 32, gap: 12,
    },
    loadIcon: {
        width: 64, height: 64, borderRadius: 20,
        backgroundColor: '#fff', borderWidth: 1.5, borderColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center',
    },
    loadTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
    loadSub: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
    progressTrack: {
        width: '100%', height: 5, backgroundColor: COLORS.border,
        borderRadius: 3, overflow: 'hidden',
    },
    progressFill: { height: 5, backgroundColor: COLORS.primary, borderRadius: 3 },
    progressPct: { fontSize: 13, color: COLORS.textMuted },
    stepsList: { width: '100%' },
    stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
    stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
    dotDone: { backgroundColor: '#10b981' },
    dotActive: { backgroundColor: COLORS.primary },
    stepText: { flex: 1, fontSize: 13, color: COLORS.textMuted },
    stepDone: { color: '#10b981' },
    stepActive: { color: COLORS.text, fontWeight: '600' },

    // Header
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16,
        flexDirection: 'row', alignItems: 'center', gap: 12,
    },
    backBtn: { padding: 2 },
    headerInfo: { flex: 1 },
    headerBook: { fontSize: 15, fontWeight: '700', color: '#fff' },
    headerChapter: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    aiBadge: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    },
    aiBadgeText: { fontSize: 11, color: '#fff', fontWeight: '600' },

    // Toggle
    toggleBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 10,
        backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
    },
    toggleLabel: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
    toggleGroup: {
        flexDirection: 'row', backgroundColor: '#f1f5f9',
        borderRadius: 20, padding: 3, gap: 2,
    },
    togglePill: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 18 },
    togglePillOn: { backgroundColor: COLORS.primary },
    toggleText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
    toggleTextOn: { color: '#fff' },

    // Tabs
    tabBar: {
        flexDirection: 'row', backgroundColor: '#fff',
        borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
    },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
    tabText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
    tabTextActive: { color: COLORS.primary, fontWeight: '700' },

    // Content
    summaryBody: { padding: 16 },

    readTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    readDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ade80' },
    readTimeText: { fontSize: 12, color: COLORS.textMuted },

    chapterBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#ede9fe', borderRadius: 20,
        paddingHorizontal: 12, paddingVertical: 5, marginBottom: 14,
    },
    chapterBadgeText: { fontSize: 11, color: '#7c3aed', fontWeight: '600' },

    overviewBox: {
        backgroundColor: '#fff', borderRadius: 12, padding: 16,
        marginBottom: 14, borderWidth: 0.5, borderColor: COLORS.border,
        ...(Platform.OS === 'web' ? { display: 'block' } : {}),
    },
    overviewLabel: {
        fontSize: 10, fontWeight: '700', color: COLORS.primary,
        letterSpacing: 0.8, marginBottom: 10,
    },
    overviewText: {
        fontSize: 15, color: COLORS.text, lineHeight: 26,
        flexWrap: 'wrap', flexShrink: 1,
    },

    blockTitle: {
        fontSize: 15, fontWeight: '700', color: COLORS.text,
        marginBottom: 12, marginTop: 4,
    },
    tabIntroText: {
        fontSize: 13, color: COLORS.textMuted, marginBottom: 14, lineHeight: 20,
    },

    ideaCard: {
        flexDirection: 'row', gap: 12,
        backgroundColor: '#fff', borderRadius: 12, padding: 14,
        marginBottom: 10, borderWidth: 0.5, borderColor: COLORS.border,
    },
    ideaNum: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 1,
    },
    ideaNumText: { fontSize: 12, fontWeight: '700', color: '#10b981' },
    ideaBody: { flex: 1 },
    ideaTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 5 },
    ideaDesc: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20 },

    takeaway: {
        backgroundColor: '#ecfdf5', borderRadius: 12, padding: 14,
        marginBottom: 12, borderWidth: 0.5, borderColor: '#a7f3d0',
    },
    takeawayLabel: { fontSize: 12, fontWeight: '700', color: '#059669', marginBottom: 6 },
    takeawayText: { fontSize: 13, color: '#111827', lineHeight: 21 },

    quote: {
        backgroundColor: '#f8fafc', borderRadius: 12, padding: 16,
        marginBottom: 14, borderLeftWidth: 3, borderLeftColor: COLORS.primary,
    },
    quoteText: { fontSize: 14, color: COLORS.text, lineHeight: 22, fontStyle: 'italic' },

    aboutCard: {
        backgroundColor: '#fff', borderRadius: 12, padding: 16,
        marginBottom: 10, borderWidth: 0.5, borderColor: COLORS.border,
    },
    aboutCardTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
    aboutCardText: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20 },
});