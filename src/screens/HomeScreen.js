import React from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

const CATEGORIES = ['All', 'Science', 'History', 'Business', 'Fiction', 'Psychology'];

const TRENDING_BOOKS = [
    { id: 1, title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', pages: 499, color1: '#2d1b69', color2: '#11998e' },
    { id: 2, title: 'Sapiens', author: 'Yuval Noah Harari', pages: 443, color1: '#993C1D', color2: '#D85A30' },
    { id: 3, title: 'Atomic Habits', author: 'James Clear', pages: 320, color1: '#0C447C', color2: '#378ADD' },
    { id: 4, title: 'Deep Work', author: 'Cal Newport', pages: 296, color1: '#1a1a2e', color2: '#0f3460' },
];

const MY_UPLOADS = [
    { id: 1, title: 'Clean Code.pdf', status: 'done' },
    { id: 2, title: 'DDIA.pdf', status: 'processing' },
];

export default function HomeScreen({ navigation }) {
    const [activeCategory, setActiveCategory] = React.useState('All');

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>Good morning 👋</Text>
                        <Text style={styles.username}>Muhammad</Text>
                    </View>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>MU</Text>
                    </View>
                </View>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.searchText}>Search books, authors...</Text>
                </View>
            </View>

            {/* Categories */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.catsScroll}
                contentContainerStyle={styles.catsContent}
            >
                {CATEGORIES.map(cat => (
                    <TouchableOpacity
                        key={cat}
                        style={[styles.catPill, activeCategory === cat && styles.catPillActive]}
                        onPress={() => setActiveCategory(cat)}
                    >
                        <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Featured Book */}
            <View style={styles.featured}>
                <View>
                    <Text style={styles.featuredLabel}>Featured today</Text>
                    <Text style={styles.featuredTitle}>Atomic Habits</Text>
                    <Text style={styles.featuredAuthor}>James Clear · 4 min read</Text>
                </View>
                <TouchableOpacity
                    style={styles.featuredBtn}
                    onPress={() => navigation.navigate('BookDetail')}
                >
                    <Text style={styles.featuredBtnText}>Read now</Text>
                </TouchableOpacity>
            </View>

            {/* Trending Books */}
            <Text style={styles.sectionTitle}>Trending Books</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.booksRow}
            >
                {TRENDING_BOOKS.map(book => (
                    <TouchableOpacity
                        key={book.id}
                        style={styles.bookCard}
                        onPress={() => navigation.navigate('BookDetail', { book })}
                    >
                        <View style={[styles.bookCover, { backgroundColor: book.color1 }]}>
                            <View style={[styles.bookCoverAccent, { backgroundColor: book.color2 }]} />
                            <Text style={styles.bookCoverTitle} numberOfLines={3}>{book.title}</Text>
                        </View>
                        <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                        <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* My Uploads */}
            <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>My Uploads</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Upload')}>
                    <Text style={styles.seeAll}>+ Add new</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.uploadsRow}>
                {MY_UPLOADS.map(upload => (
                    <View key={upload.id} style={styles.uploadCard}>
                        <Text style={styles.uploadTitle} numberOfLines={1}>{upload.title}</Text>
                        <Text style={[
                            styles.uploadStatus,
                            { color: upload.status === 'done' ? COLORS.success : COLORS.warning }
                        ]}>
                            {upload.status === 'done' ? 'Summary ready' : 'Processing...'}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Recently Added */}
            <Text style={styles.sectionTitle}>Recently Added</Text>
            <View style={styles.listContainer}>
                {TRENDING_BOOKS.slice(0, 3).map(book => (
                    <TouchableOpacity
                        key={book.id}
                        style={styles.listItem}
                        onPress={() => navigation.navigate('BookDetail', { book })}
                    >
                        <View style={[styles.listCover, { backgroundColor: book.color1 }]}>
                            <Text style={styles.listCoverText} numberOfLines={1}>{book.title[0]}</Text>
                        </View>
                        <View style={styles.listInfo}>
                            <Text style={styles.listTitle} numberOfLines={1}>{book.title}</Text>
                            <Text style={styles.listAuthor}>{book.author}</Text>
                            <Text style={styles.listPages}>{book.pages} pages</Text>
                        </View>
                        <View style={styles.listBadge}>
                            <Text style={styles.listBadgeText}>Free</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    // Header
    header: { backgroundColor: COLORS.primary, paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    greeting: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
    username: { fontSize: 20, fontWeight: '600', color: '#fff', marginTop: 2 },
    avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 13, fontWeight: '600', color: '#fff' },
    searchBar: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: RADIUS.md, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
    searchText: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },

    // Categories
    catsScroll: { marginTop: 14 },
    catsContent: { paddingHorizontal: 16, gap: 8 },
    catPill: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: RADIUS.full, borderWidth: 0.5, borderColor: COLORS.border, backgroundColor: COLORS.white },
    catPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    catText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
    catTextActive: { color: '#fff' },

    // Featured
    featured: { margin: 16, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    featuredLabel: { fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 4 },
    featuredTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 3 },
    featuredAuthor: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
    featuredBtn: { backgroundColor: COLORS.accent, borderRadius: RADIUS.sm, paddingHorizontal: 14, paddingVertical: 8 },
    featuredBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },

    // Section
    sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, paddingHorizontal: 16, marginBottom: 12, marginTop: 4 },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16, marginTop: 4 },
    seeAll: { fontSize: 12, color: COLORS.success, fontWeight: '500' },

    // Book cards
    booksRow: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
    bookCard: { width: 110 },
    bookCover: { height: 148, borderRadius: RADIUS.md, padding: 10, justifyContent: 'flex-end', overflow: 'hidden', ...SHADOW.small },
    bookCoverAccent: { position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: 40, opacity: 0.4 },
    bookCoverTitle: { fontSize: 10, color: '#fff', fontWeight: '600', lineHeight: 14 },
    bookTitle: { fontSize: 11, color: COLORS.text, marginTop: 7, fontWeight: '500' },
    bookAuthor: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },

    // Uploads
    uploadsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 20 },
    uploadCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: 12, borderWidth: 0.5, borderColor: COLORS.border, ...SHADOW.small },
    uploadTitle: { fontSize: 12, color: COLORS.text, fontWeight: '500', marginBottom: 4 },
    uploadStatus: { fontSize: 11 },

    // List
    listContainer: { paddingHorizontal: 16, gap: 2, marginBottom: 8 },
    listItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, padding: 12, borderRadius: RADIUS.md, marginBottom: 8, borderWidth: 0.5, borderColor: COLORS.border, ...SHADOW.small },
    listCover: { width: 44, height: 52, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
    listCoverText: { fontSize: 20, color: '#fff', fontWeight: '700' },
    listInfo: { flex: 1 },
    listTitle: { fontSize: 13, fontWeight: '500', color: COLORS.text },
    listAuthor: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
    listPages: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
    listBadge: { backgroundColor: COLORS.successLight, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3 },
    listBadgeText: { fontSize: 10, color: COLORS.success, fontWeight: '500' },
});