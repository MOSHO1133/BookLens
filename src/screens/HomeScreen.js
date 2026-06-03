import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, StyleSheet, ScrollView,
    TouchableOpacity, Image, ActivityIndicator, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = Math.min((SCREEN_W - 52) / 3, 120);

const CATEGORIES = ['All', 'Self Help', 'Fiction', 'Science', 'History', 'Psychology', 'Business'];

const SUBJECT_MAP = {
    'Self Help': 'self_help',
    'Fiction': 'fiction',
    'Science': 'science',
    'History': 'history',
    'Psychology': 'psychology',
    'Business': 'business',
};

const normalize = (works = []) =>
    works.map((w, i) => {
        const coverId = w.cover_i || w.cover_id;
        let author = 'Unknown';
        if (w.author_name?.[0]) author = w.author_name[0];
        else if (w.authors?.[0]?.name) author = w.authors[0].name;
        return {
            id: w.key || String(i),
            title: w.title || 'Untitled',
            author,
            coverUrl: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null,
            rating: w.ratings_average ? parseFloat(w.ratings_average).toFixed(1) : '4.0',
            pages: w.number_of_pages_median || null,
            year: w.first_publish_year || null,
            isFree: true,
        };
    });

const COVER_COLORS = ['#2d1b69', '#0c2340', '#0d2e1a', '#2d1515', '#1e1a0c', '#0e1f2d', '#1a0533', '#2a1a00', '#1a2a0c', '#2a0a1a'];
const getCoverBg = (title = '') => COVER_COLORS[title.length % COVER_COLORS.length];

export default function HomeScreen({ navigation }) {
    const [userName, setUserName] = useState('Reader');
    const [greeting, setGreeting] = useState('Good morning');
    const [activeCategory, setActiveCategory] = useState('All');
    const [feedBooks, setFeedBooks] = useState([]);
    const [isFeedLoading, setIsFeedLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const h = new Date().getHours();
        setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');
    }, []);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) setUserName(user.email.split('@')[0]);
        };
        load();
    }, []);

    useEffect(() => {
        fetchFeed(activeCategory);
    }, [activeCategory]);

    const fetchFeed = async (cat) => {
        setIsFeedLoading(true);
        try {
            let url = 'https://openlibrary.org/trending/daily.json?limit=15';
            if (cat !== 'All') {
                const subject = SUBJECT_MAP[cat];
                url = `https://openlibrary.org/subjects/${subject}.json?limit=15`;
            }
            const res = await fetch(url);
            const data = await res.json();
            setFeedBooks(normalize(data.works || []));
        } catch { setFeedBooks([]); }
        setIsFeedLoading(false);
    };

    const handleSearch = async (text) => {
        setSearchQuery(text);
        if (text.trim().length < 3) { setSearchResults([]); return; }
        setIsSearching(true);
        try {
            const res = await fetch(
                `https://openlibrary.org/search.json?q=${encodeURIComponent(text)}&limit=15&fields=key,title,author_name,cover_i,ratings_average,number_of_pages_median,first_publish_year`
            );
            const data = await res.json();
            setSearchResults(normalize(data.docs || []));
        } catch { setSearchResults([]); }
        setIsSearching(false);
    };

    const goToSummary = (book) => navigation.navigate('Summary', { book, mode: 'full' });
    const goToReader = (book) => navigation.navigate('Reader', { book });
    const goToDetail = (book) => navigation.navigate('BookDetail', { book });

    return (
        <View style={s.container}>

            {/* ── Header (fixed, never scrolls) ── */}
            <View style={s.header}>
                <View style={s.headerTop}>
                    <View>
                        <Text style={s.greeting}>{greeting} 👋</Text>
                        <Text style={s.userName}>{userName}</Text>
                    </View>
                    <View style={s.avatarCircle}>
                        <Text style={s.avatarText}>{userName[0]?.toUpperCase() || 'R'}</Text>
                    </View>
                </View>
                <View style={s.searchBar}>
                    <Ionicons name="search" size={16} color="rgba(255,255,255,0.45)" />
                    <TextInput
                        style={s.searchInput}
                        placeholder="Search 20M+ books..."
                        placeholderTextColor="rgba(255,255,255,0.35)"
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                    {isSearching
                        ? <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" />
                        : searchQuery.length > 0
                            ? <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                                <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.5)" />
                            </TouchableOpacity>
                            : null
                    }
                </View>
            </View>

            {/* ── Category bar (fixed, never scrolls) ── */}
            <View style={s.catsWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.catsContent}
                    style={s.catsScroll}
                >
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[s.catPill, activeCategory === cat && s.catPillActive]}
                            onPress={() => setActiveCategory(cat)}
                            activeOpacity={0.75}
                        >
                            <Text style={[s.catText, activeCategory === cat && s.catTextActive]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* ── Scrollable body ── */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={s.body}
            >
                {searchQuery.trim().length >= 3 ? (
                    /* Search results */
                    <View>
                        <Text style={s.sectionTitle}>
                            {searchResults.length} results for "{searchQuery}"
                        </Text>
                        {searchResults.map(book => (
                            <TouchableOpacity
                                key={book.id}
                                style={s.resultCard}
                                onPress={() => goToDetail(book)}
                                activeOpacity={0.8}
                            >
                                <View style={[s.resultCover, { backgroundColor: getCoverBg(book.title) }]}>
                                    {book.coverUrl
                                        ? <Image source={{ uri: book.coverUrl }} style={s.resultCoverImg} resizeMode="cover" />
                                        : <Text style={s.resultCoverLetter}>{book.title[0]}</Text>
                                    }
                                </View>
                                <View style={s.resultInfo}>
                                    <Text style={s.resultTitle} numberOfLines={2}>{book.title}</Text>
                                    <Text style={s.resultAuthor} numberOfLines={1}>{book.author}</Text>
                                    <View style={s.resultMeta}>
                                        {book.rating !== '—' && (
                                            <View style={s.ratingPill}>
                                                <Ionicons name="star" size={10} color="#f59e0b" />
                                                <Text style={s.ratingText}>{book.rating}</Text>
                                            </View>
                                        )}
                                        {book.year && <Text style={s.metaText}>{book.year}</Text>}
                                        <View style={s.freePill}>
                                            <Text style={s.freePillText}>Free</Text>
                                        </View>
                                    </View>
                                    <View style={s.resultActions}>
                                        <TouchableOpacity style={s.btnSummary} onPress={() => goToSummary(book)}>
                                            <Text style={s.btnSummaryText}>AI Summary</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={s.btnRead} onPress={() => goToReader(book)}>
                                            <Text style={s.btnReadText}>Read Book</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    /* Default feed */
                    <>
                        {/* Banner */}
                        <TouchableOpacity
                            style={s.banner}
                            onPress={() => navigation.navigate('Library')}
                            activeOpacity={0.85}
                        >
                            <View>
                                <Text style={s.bannerTag}>Open Library</Text>
                                <Text style={s.bannerTitle}>20M+ Free Books</Text>
                                <Text style={s.bannerSub}>Read full books · Get AI summaries</Text>
                            </View>
                            <View style={s.bannerBtn}>
                                <Text style={s.bannerBtnText}>Explore →</Text>
                            </View>
                        </TouchableOpacity>

                        {/* AI card */}
                        <View style={s.aiCard}>
                            <View style={s.aiHeader}>
                                <View style={s.aiIcon}>
                                    <Text style={{ fontSize: 14 }}>🤖</Text>
                                </View>
                                <Text style={s.aiTitle}>AI Book Summaries</Text>
                                <View style={s.aiBadge}>
                                    <Text style={s.aiBadgeText}>Claude AI</Text>
                                </View>
                            </View>
                            <Text style={s.aiBody}>
                                Upload any PDF or pick a book below. Get a complete summary — every chapter, every key idea, nothing skipped. Choose Simple or Detailed mode.
                            </Text>
                            <View style={s.aiActions}>
                                <TouchableOpacity style={s.aiBtn} onPress={() => navigation.navigate('Upload')}>
                                    <Text style={s.aiBtnText}>📤 Upload Book</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[s.aiBtn, s.aiBtnPrimary]} onPress={() => navigation.navigate('Library')}>
                                    <Text style={[s.aiBtnText, { color: '#fff' }]}>Browse Library</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Grid header */}
                        <Text style={s.sectionTitle}>
                            {activeCategory === 'All' ? 'Trending Books' : `Popular in ${activeCategory}`}
                        </Text>

                        {isFeedLoading ? (
                            <View style={s.loader}>
                                <ActivityIndicator size="large" color="#1a1a2e" />
                                <Text style={s.loaderText}>Loading books...</Text>
                            </View>
                        ) : feedBooks.length === 0 ? (
                            <View style={s.loader}>
                                <Text style={{ fontSize: 32, marginBottom: 8 }}>📚</Text>
                                <Text style={s.loaderText}>No books found. Try another category.</Text>
                            </View>
                        ) : (
                            <View style={s.grid}>
                                {feedBooks.map(book => (
                                    <TouchableOpacity
                                        key={book.id}
                                        style={[s.gridItem, { width: CARD_W }]}
                                        onPress={() => goToDetail(book)}
                                        activeOpacity={0.8}
                                    >
                                        <View style={[
                                            s.gridCover,
                                            { width: CARD_W, height: CARD_W * 1.42, backgroundColor: getCoverBg(book.title) }
                                        ]}>
                                            {book.coverUrl
                                                ? <Image source={{ uri: book.coverUrl }} style={s.gridCoverImg} resizeMode="cover" />
                                                : <Text style={s.gridCoverLetter}>{book.title[0]}</Text>
                                            }
                                        </View>
                                        <Text style={s.gridTitle} numberOfLines={2}>{book.title}</Text>
                                        <Text style={s.gridAuthor} numberOfLines={1}>{book.author}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },

    // ── Header ──
    header: {
        backgroundColor: '#1a1a2e',
        paddingTop: 48,
        paddingBottom: 16,
        paddingHorizontal: 18,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    greeting: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 2 },
    userName: { fontSize: 20, fontWeight: '700', color: '#fff' },
    avatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#4ade80', alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
    searchInput: { flex: 1, color: '#fff', fontSize: 14 },

    // ── Category bar — KEY FIX: outer View has fixed height, does NOT scroll ──
    catsWrapper: {
        backgroundColor: '#fff',
        borderBottomWidth: 0.5,
        borderBottomColor: '#e5e7eb',
        height: 52,               // fixed height — never collapses or stretches
    },
    catsScroll: {
        flex: 1,
    },
    catsContent: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 8,
        alignItems: 'center',
        flexDirection: 'row',
    },
    catPill: {
        paddingHorizontal: 16,     // wider
        paddingVertical: 7,        // taller
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: '#f3f4f6',
    },
    catPillActive: {
        backgroundColor: '#1a1a2e',
        borderColor: '#1a1a2e',
    },
    catText: {
        fontSize: 13,              // bigger font
        color: '#374151',
        fontWeight: '500',
    },
    catTextActive: {
        color: '#fff',
        fontWeight: '700',
    },

    // ── Body ──
    body: { padding: 16, paddingBottom: 32 },

    // Search results
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 14 },
    resultCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, overflow: 'hidden', borderWidth: 0.5, borderColor: '#e5e7eb' },
    resultCover: { width: 72, minHeight: 100, alignItems: 'center', justifyContent: 'center' },
    resultCoverImg: { width: 72, height: '100%' },
    resultCoverLetter: { fontSize: 28, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
    resultInfo: { flex: 1, padding: 12 },
    resultTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 3 },
    resultAuthor: { fontSize: 12, color: '#6b7280', marginBottom: 7 },
    resultMeta: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 9, flexWrap: 'wrap' },
    ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    ratingText: { fontSize: 11, color: '#6b7280' },
    metaText: { fontSize: 11, color: '#9ca3af' },
    freePill: { backgroundColor: '#ecfdf5', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
    freePillText: { fontSize: 10, color: '#059669', fontWeight: '600' },
    resultActions: { flexDirection: 'row', gap: 7 },
    btnSummary: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f1f5f9', borderRadius: 6 },
    btnSummaryText: { fontSize: 11, fontWeight: '600', color: '#475569' },
    btnRead: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#1a1a2e', borderRadius: 6 },
    btnReadText: { fontSize: 11, fontWeight: '600', color: '#fff' },

    // Banner
    banner: { backgroundColor: '#1a1a2e', borderRadius: 14, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    bannerTag: { fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 4 },
    bannerTitle: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 3 },
    bannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
    bannerBtn: { backgroundColor: '#4ade80', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
    bannerBtnText: { fontSize: 12, fontWeight: '700', color: '#1a1a2e' },

    // AI card
    aiCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 18, borderWidth: 0.5, borderColor: '#e5e7eb' },
    aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    aiIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' },
    aiTitle: { fontSize: 14, fontWeight: '700', color: '#111827', flex: 1 },
    aiBadge: { backgroundColor: '#ede9fe', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    aiBadgeText: { fontSize: 10, color: '#7c3aed', fontWeight: '600' },
    aiBody: { fontSize: 12, color: '#6b7280', lineHeight: 18, marginBottom: 12 },
    aiActions: { flexDirection: 'row', gap: 8 },
    aiBtn: { flex: 1, padding: 9, borderRadius: 8, backgroundColor: '#f8fafc', borderWidth: 0.5, borderColor: '#e5e7eb', alignItems: 'center' },
    aiBtnPrimary: { backgroundColor: '#1a1a2e' },
    aiBtnText: { fontSize: 12, fontWeight: '600', color: '#374151' },

    // Grid
    loader: { paddingVertical: 50, alignItems: 'center', gap: 10 },
    loaderText: { fontSize: 13, color: '#9ca3af' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    gridItem: { marginBottom: 6 },
    gridCover: { borderRadius: 8, overflow: 'hidden', marginBottom: 6, alignItems: 'center', justifyContent: 'center' },
    gridCoverImg: { width: '100%', height: '100%' },
    gridCoverLetter: { fontSize: 28, fontWeight: '700', color: 'rgba(255,255,255,0.35)' },
    gridTitle: { fontSize: 11, fontWeight: '600', color: '#111827', lineHeight: 15 },
    gridAuthor: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
});