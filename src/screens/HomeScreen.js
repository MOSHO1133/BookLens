import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, Image, RefreshControl, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';
import { getTrending, getFeatured, searchBooks } from '../services/openLibrary';
import { supabase } from '../services/supabase';

const CATEGORIES = ['All', 'Self Help', 'Fiction', 'Science', 'History', 'Psychology', 'Business'];
const BOOK_COLORS = ['#2d1b69', '#0c2340', '#0d2e1a', '#2d1515', '#1e1a0c', '#0e1f2d', '#1a0533', '#2a1a00'];

export default function HomeScreen({ navigation }) {
    const [trending, setTrending] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const [userName, setUserName] = useState('Reader');

    useEffect(() => {
        loadData();
        loadUser();
    }, []);

    // Re-fetch when category changes
    useEffect(() => {
        if (activeCategory !== 'All') {
            fetchByCategory(activeCategory);
        } else {
            loadData();
        }
    }, [activeCategory]);

    const loadUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
            setUserName(user.email.split('@')[0]);
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [t, f] = await Promise.all([getTrending(), getFeatured()]);
            setTrending(t);
            setFeatured(f);
        } catch (e) {
            console.log(e);
        }
        setLoading(false);
    };

    const fetchByCategory = async (category) => {
        setLoading(true);
        const queryMap = {
            'Self Help': 'self improvement habits productivity',
            'Fiction': 'fiction novel story literature',
            'Science': 'science physics biology chemistry',
            'History': 'history world civilization ancient',
            'Psychology': 'psychology mind behavior human',
            'Business': 'business entrepreneurship management',
        };
        const query = queryMap[category] || category;
        try {
            const books = await searchBooks(query, 10);
            setTrending(books);
        } catch (e) {
            console.log(e);
        }
        setLoading(false);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, []);

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const BookCard = ({ book, size = 'md' }) => {
        const colorIndex = book.title.length % BOOK_COLORS.length;
        const bgColor = BOOK_COLORS[colorIndex];
        const isLarge = size === 'lg';

        return (
            <TouchableOpacity
                style={[styles.bookCard, isLarge && styles.bookCardLg]}
                onPress={() => navigation.navigate('BookDetail', { book })}
                activeOpacity={0.85}
            >
                <View style={[styles.bookCover, isLarge && styles.bookCoverLg, { backgroundColor: bgColor }]}>
                    {book.coverUrl ? (
                        <Image
                            source={{ uri: book.coverUrl }}
                            style={styles.coverImg}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.coverPlaceholder}>
                            <Text style={styles.coverInitial}>{book.title[0]}</Text>
                        </View>
                    )}
                    {book.isFree && (
                        <View style={styles.freeBadge}>
                            <Text style={styles.freeBadgeText}>Free</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
                {book.rating && book.rating !== '—' && (
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={10} color="#f59e0b" />
                        <Text style={styles.ratingText}>{book.rating}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>{getGreeting()} 👋</Text>
                        <Text style={styles.userName}>{userName}</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Search')}>
                            <Ionicons name="search-outline" size={20} color="rgba(255,255,255,0.8)" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.avatar}>
                            <Text style={styles.avatarText}>{userName[0]?.toUpperCase()}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                <TouchableOpacity
                    style={styles.searchBar}
                    onPress={() => { }}
                    activeOpacity={0.8}
                >
                    <Ionicons name="search-outline" size={15} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.searchText}>Search 20M+ books from Open Library...</Text>
                </TouchableOpacity>
            </View>

            {/* Categories */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.catsContent}
                style={styles.catsScroll}
            >
                {CATEGORIES.map(cat => (
                    <TouchableOpacity
                        key={cat}
                        style={[styles.catPill, activeCategory === cat && styles.catPillActive]}
                        onPress={() => setActiveCategory(cat)}
                    >
                        <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Featured Banner */}
            <View style={styles.featuredBanner}>
                <View>
                    <Text style={styles.featuredLabel}>Featured today</Text>
                    <Text style={styles.featuredTitle}>Open Library</Text>
                    <Text style={styles.featuredSub}>20M+ free books · No signup required</Text>
                </View>
                <TouchableOpacity
                    style={styles.featuredBtn}
                    onPress={() => navigation.navigate('Library')}
                >
                    <Text style={styles.featuredBtnText}>Explore</Text>
                </TouchableOpacity>
            </View>

            {/* AI Card */}
            <View style={styles.aiCard}>
                <View style={styles.aiHeader}>
                    <View style={styles.aiIcon}>
                        <Text>🤖</Text>
                    </View>
                    <Text style={styles.aiTitle}>AI Book Assistant</Text>
                    <View style={styles.aiBadge}>
                        <Text style={styles.aiBadgeText}>Claude AI</Text>
                    </View>
                </View>
                <Text style={styles.aiText}>
                    Upload any book and get a complete AI-powered summary in minutes. Every chapter summarized in simple English — no important concept skipped.
                </Text>
                <View style={styles.aiActions}>
                    <TouchableOpacity
                        style={styles.aiBtn}
                        onPress={() => navigation.navigate('Upload')}
                    >
                        <Text style={styles.aiBtnText}>📤 Upload Book</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.aiBtn, styles.aiBtnPrimary]}
                        onPress={() => navigation.navigate('Library')}
                    >
                        <Text style={[styles.aiBtnText, { color: '#fff' }]}>🔮 Explore</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Trending Books */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Trending Books</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Library')}>
                    <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingRow}>
                    <ActivityIndicator color={COLORS.primary} />
                    <Text style={styles.loadingText}>Fetching from Open Library...</Text>
                </View>
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.booksRow}
                >
                    {trending.map((book, i) => (
                        <BookCard key={book.id || i} book={book} />
                    ))}
                </ScrollView>
            )}

            {/* Free Classics */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Free Classics</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAll}>Browse all</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingRow}>
                    <ActivityIndicator color={COLORS.primary} />
                </View>
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.booksRow}
                >
                    {featured.map((book, i) => (
                        <BookCard key={book.id || i} book={book} />
                    ))}
                </ScrollView>
            )}

            {/* Stats Bar */}
            <View style={styles.statsBar}>
                {[
                    { icon: '📚', value: '20M+', label: 'Books' },
                    { icon: '🤖', value: 'AI', label: 'Summaries' },
                    { icon: '📴', value: 'Free', label: 'Forever' },
                ].map((s, i) => (
                    <View key={i} style={styles.statItem}>
                        <Text style={styles.statIcon}>{s.icon}</Text>
                        <Text style={styles.statValue}>{s.value}</Text>
                        <Text style={styles.statLabel}>{s.label}</Text>
                    </View>
                ))}
            </View>

            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    header: { backgroundColor: COLORS.primary, paddingTop: 52, paddingBottom: 18, paddingHorizontal: 18 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    greeting: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
    userName: { fontSize: 20, fontWeight: '700', color: '#fff', marginTop: 2 },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
    searchBar: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: RADIUS.md, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 8 },
    searchText: { fontSize: 12, color: 'rgba(255,255,255,0.4)', flex: 1 },

    catsScroll: { backgroundColor: COLORS.white, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
    catsContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    catPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 0.5, borderColor: COLORS.border, backgroundColor: COLORS.background },
    catPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    catText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
    catTextActive: { color: '#fff' },

    featuredBanner: { margin: 16, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    featuredLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 3 },
    featuredTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 2 },
    featuredSub: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
    featuredBtn: { backgroundColor: COLORS.accent, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 8 },
    featuredBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

    aiCard: { margin: 16, backgroundColor: 'rgba(26,26,46,0.05)', borderRadius: RADIUS.lg, padding: 16, borderWidth: 1, borderColor: `${COLORS.primary}30` },
    aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    aiIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
    aiTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, flex: 1 },
    aiBadge: { backgroundColor: `${COLORS.primary}15`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    aiBadgeText: { fontSize: 10, color: COLORS.primary, fontWeight: '600' },
    aiText: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18, marginBottom: 12 },
    aiActions: { flexDirection: 'row', gap: 8 },
    aiBtn: { flex: 1, padding: 9, borderRadius: RADIUS.md, backgroundColor: COLORS.background, borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center' },
    aiBtnPrimary: { backgroundColor: COLORS.primary },
    aiBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.text },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12, marginTop: 4 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    seeAll: { fontSize: 12, color: COLORS.success, fontWeight: '600' },

    loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingBottom: 20 },
    loadingText: { fontSize: 12, color: COLORS.textMuted },

    booksRow: { paddingHorizontal: 16, gap: 12, paddingBottom: 8 },
    bookCard: { width: 110 },
    bookCardLg: { width: 140 },
    bookCover: { height: 150, borderRadius: RADIUS.md, marginBottom: 8, overflow: 'hidden', ...SHADOW.small },
    bookCoverLg: { height: 190 },
    coverImg: { width: '100%', height: '100%' },
    coverPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    coverInitial: { fontSize: 36, fontWeight: '700', color: 'rgba(255,255,255,0.3)' },
    freeBadge: { position: 'absolute', bottom: 6, left: 6, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
    freeBadgeText: { fontSize: 9, fontWeight: '700', color: '#fff' },
    bookTitle: { fontSize: 12, fontWeight: '600', color: COLORS.text, lineHeight: 16 },
    bookAuthor: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
    ratingText: { fontSize: 10, color: COLORS.textMuted },

    statsBar: { flexDirection: 'row', margin: 16, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border, overflow: 'hidden' },
    statItem: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRightWidth: 0.5, borderRightColor: COLORS.border },
    statIcon: { fontSize: 18, marginBottom: 4 },
    statValue: { fontSize: 14, fontWeight: '700', color: COLORS.text },
    statLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
});