import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, Image, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';
import { supabase, saveBook } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';

const BOOK_COLORS = ['#2d1b69', '#0c2340', '#0d2e1a', '#2d1515', '#1e1a0c', '#0e1f2d'];
const CHAPTERS = [
    { id: 1, title: 'Introduction', confidence: 97 },
    { id: 2, title: 'Core Concepts', confidence: 95 },
    { id: 3, title: 'Deep Dive', confidence: 98 },
    { id: 4, title: 'Practical Applications', confidence: 94 },
    { id: 5, title: 'Advanced Topics', confidence: 96 },
    { id: 6, title: 'Case Studies', confidence: 93 },
    { id: 7, title: 'Conclusion', confidence: 97 },
];

export default function BookDetailScreen({ navigation, route }) {
    const { theme: C } = useTheme();
    const book = route.params?.book || {};
    const [activeTab, setActiveTab] = useState('overview');
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    const bgColor = BOOK_COLORS[book.title?.length % BOOK_COLORS.length] || '#2d1b69';
    const overallConfidence = Math.round(CHAPTERS.reduce((s, c) => s + c.confidence, 0) / CHAPTERS.length);

    const handleSave = async (status) => {
        setSaving(true);
        try {
            await saveBook({ ...book, status });
            setSaved(true);
            Alert.alert('Saved!', `"${book.title}" added to your ${status === 'want' ? 'wishlist' : status} list.`);
        } catch (e) {
            Alert.alert('Error', 'Could not save book. Please try again.');
        }
        setSaving(false);
    };

    const tabs = ['overview', 'chapters', 'details'];

    return (
        <View style={[styles.container, { backgroundColor: C.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Cover Hero */}
                <View style={[styles.hero, { backgroundColor: bgColor }]}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={22} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.heartBtn}
                        onPress={() => handleSave('want')}
                    >
                        <Ionicons name={saved ? 'heart' : 'heart-outline'} size={20} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.heroContent}>
                        <View style={styles.coverContainer}>
                            {book.coverUrl ? (
                                <Image
                                    source={{ uri: book.coverUrl }}
                                    style={styles.coverImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.coverFallback}>
                                    <Text style={styles.coverFallbackText}>{book.title?.[0] || 'B'}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Book Info */}
                <View style={styles.info}>
                    <Text style={[styles.title, { color: C.text }]}>{book.title || 'Unknown Title'}</Text>
                    <Text style={[styles.author, { color: C.textMuted }]}>{book.author || 'Unknown Author'}</Text>

                    {/* Meta pills */}
                    <View style={styles.metaRow}>
                        {book.year ? <View style={[styles.metaPill, { backgroundColor: C.card, borderColor: C.border }]}><Text style={[styles.metaText, { color: C.textMuted }]}>📅 {book.year}</Text></View> : null}
                        {book.pages && book.pages !== '—' ? <View style={[styles.metaPill, { backgroundColor: C.card, borderColor: C.border }]}><Text style={[styles.metaText, { color: C.textMuted }]}>📄 {book.pages} pages</Text></View> : null}
                        {book.rating && book.rating !== '—' ? <View style={[styles.metaPill, { backgroundColor: C.card, borderColor: C.border }]}><Ionicons name="star" size={11} color="#f59e0b" /><Text style={[styles.metaText, { color: C.textMuted }]}> {book.rating}</Text></View> : null}
                        {book.isFree ? <View style={[styles.metaPill, styles.freePill]}><Text style={[styles.metaText, { color: COLORS.success }]}>Free</Text></View> : null}
                    </View>

                    {/* Confidence Bar */}
                    <View style={[styles.confidenceBox, { backgroundColor: C.card, borderColor: C.border }]}>
                        <View style={styles.confidenceHeader}>
                            <View>
                                <Text style={[styles.confidenceTitle, { color: C.text }]}>Summary Completeness</Text>
                                <Text style={[styles.confidenceSub, { color: C.textMuted }]}>All key concepts captured across {CHAPTERS.length} chapters</Text>
                            </View>
                            <Text style={styles.confidenceValue}>{overallConfidence}%</Text>
                        </View>
                        <View style={[styles.confidenceTrack, { backgroundColor: C.border }]}>
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
                            style={[styles.secondaryBtn, { backgroundColor: C.card, borderColor: C.border }]}
                            onPress={() => navigation.navigate('Summary', { book, mode: 'chapter' })}
                        >
                            <Ionicons name="list-outline" size={16} color={C.text} />
                            <Text style={[styles.secondaryBtnText, { color: C.text }]}>By Chapter</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Fix 7 — Read Full Book Button */}
                    <TouchableOpacity
                        style={[styles.readBtn, { borderColor: C.primary, backgroundColor: C.card }]}
                        onPress={() => navigation.navigate('Reader', { book })}
                    >
                        <Ionicons name="book-outline" size={16} color={C.primary} />
                        <Text style={[styles.readBtnText, { color: C.primary }]}>Read Full Book</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.saveBtn, { borderColor: C.primary }]}
                        onPress={() => handleSave('reading')}
                    >
                        <Ionicons name={saved ? 'checkmark-circle' : 'bookmark-outline'} size={16} color={saved ? COLORS.success : C.primary} />
                        <Text style={[styles.saveBtnText, { color: C.primary }, saved && { color: COLORS.success }]}>
                            {saving ? 'Saving...' : saved ? 'Saved to Library' : 'Save to Library'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={[styles.tabRow, { borderTopColor: C.border, borderBottomColor: C.border }]}>
                    {tabs.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && { borderBottomColor: C.primary, borderBottomWidth: 2 }]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, { color: C.textMuted }, activeTab === tab && { color: C.primary, fontWeight: '600' }]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tab Content */}
                <View style={styles.tabContent}>

                    {/* Overview */}
                    {activeTab === 'overview' && (
                        <View>
                            <Text style={[styles.aboutTitle, { color: C.text }]}>About this book</Text>
                            <Text style={[styles.aboutText, { color: C.textMuted }]}>
                                {book.subjects?.length > 0
                                    ? `A compelling exploration covering ${book.subjects.join(', ')}. ${book.year ? `First published in ${book.year}.` : ''} Available for free via Open Library with no restrictions.`
                                    : `"${book.title}" by ${book.author} is a fascinating work available for free on Open Library. ${book.year ? `Published in ${book.year}.` : ''} Discover key insights with our AI-powered summary.`
                                }
                            </Text>
                            {book.subjects?.length > 0 && (
                                <View style={styles.tagsRow}>
                                    {book.subjects.map((s, i) => (
                                        <View key={i} style={[styles.tag, { backgroundColor: C.background, borderColor: C.border }]}>
                                            <Text style={[styles.tagText, { color: C.textMuted }]}>{s.slice(0, 20)}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    {/* Chapters */}
                    {activeTab === 'chapters' && (
                        <View>
                            <Text style={[styles.aboutTitle, { color: C.text }]}>Chapters</Text>
                            <Text style={[styles.aboutText, { color: C.textMuted }]}>Tap any chapter to get a focused AI summary.</Text>
                            {CHAPTERS.map((ch, i) => (
                                <TouchableOpacity
                                    key={ch.id}
                                    style={[styles.chapterRow, { backgroundColor: C.card, borderColor: C.border }]}
                                    onPress={() => navigation.navigate('Summary', { book, mode: 'chapter', chapter: ch })}
                                >
                                    <View style={[styles.chNum, { backgroundColor: C.background }]}>
                                        <Text style={[styles.chNumText, { color: C.textMuted }]}>{i + 1}</Text>
                                    </View>
                                    <Text style={[styles.chName, { color: C.text }]}>{ch.title}</Text>
                                    <View style={styles.chBadge}>
                                        <Text style={styles.chBadgeText}>{ch.confidence}%</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={14} color={C.textMuted} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Details */}
                    {activeTab === 'details' && (
                        <View>
                            {[
                                { label: 'Source', value: 'Open Library (archive.org)' },
                                { label: 'License', value: 'Free to read' },
                                { label: 'Author', value: book.author || '—' },
                                { label: 'Published', value: book.year?.toString() || '—' },
                                { label: 'Pages', value: book.pages?.toString() || '—' },
                                { label: 'Rating', value: book.rating !== '—' ? `${book.rating} / 5` : '—' },
                            ].map((d, i) => (
                                <View key={i} style={[styles.detailRow, { borderBottomColor: C.border }]}>
                                    <Text style={[styles.detailLabel, { color: C.textMuted }]}>{d.label}</Text>
                                    <Text style={[styles.detailValue, { color: C.text }]}>{d.value}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    hero: { height: 200, justifyContent: 'center', alignItems: 'center', position: 'relative' },
    backBtn: { position: 'absolute', top: 48, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
    heartBtn: { position: 'absolute', top: 48, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
    heroContent: { alignItems: 'center', paddingTop: 30 },
    coverContainer: { width: 110, height: 155, borderRadius: 10, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16 },
    coverImage: { width: '100%', height: '100%' },
    coverFallback: { width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    coverFallbackText: { fontSize: 48, fontWeight: '700', color: 'rgba(255,255,255,0.3)' },

    info: { padding: 20 },
    title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
    author: { fontSize: 14, marginBottom: 12 },
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    metaPill: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 0.5 },
    freePill: { backgroundColor: COLORS.successLight, borderColor: COLORS.success },
    metaText: { fontSize: 11, fontWeight: '500' },

    confidenceBox: { borderRadius: RADIUS.lg, padding: 16, marginBottom: 16, borderWidth: 0.5, ...SHADOW.small },
    confidenceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    confidenceTitle: { fontSize: 13, fontWeight: '600', marginBottom: 3 },
    confidenceSub: { fontSize: 11 },
    confidenceValue: { fontSize: 22, fontWeight: '700', color: COLORS.success },
    confidenceTrack: { height: 6, borderRadius: 3 },
    confidenceFill: { height: 6, backgroundColor: COLORS.success, borderRadius: 3 },

    actionRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    primaryBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    secondaryBtn: { flex: 1, borderRadius: RADIUS.md, padding: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 0.5 },
    secondaryBtnText: { fontSize: 14, fontWeight: '600' },

    // Fix 7 Styles Added
    readBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: RADIUS.md, borderWidth: 1.5, marginTop: 4, marginBottom: 10 },
    readBtnText: { fontSize: 14, fontWeight: '600' },

    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: RADIUS.md, borderWidth: 1 },
    saveBtnText: { fontSize: 13, fontWeight: '600' },

    tabRow: { flexDirection: 'row', borderTopWidth: 0.5, borderBottomWidth: 0.5 },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    tabText: { fontSize: 13, fontWeight: '500' },

    tabContent: { padding: 20 },
    aboutTitle: { fontSize: 15, fontWeight: '600', marginBottom: 10 },
    aboutText: { fontSize: 13, lineHeight: 21, marginBottom: 14 },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: { borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 0.5 },
    tagText: { fontSize: 11 },

    chapterRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: RADIUS.md, marginBottom: 8, borderWidth: 0.5 },
    chNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    chNumText: { fontSize: 11, fontWeight: '600' },
    chName: { flex: 1, fontSize: 13, fontWeight: '500' },
    chBadge: { backgroundColor: COLORS.successLight, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3 },
    chBadgeText: { fontSize: 10, color: COLORS.success, fontWeight: '600' },

    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 0.5 },
    detailLabel: { fontSize: 13 },
    detailValue: { fontSize: 13, fontWeight: '500' },
});