import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

const ALL_BOOKS = [
    { id: 1, title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', pages: 499, category: 'Psychology', color1: '#2d1b69', color2: '#11998e' },
    { id: 2, title: 'Sapiens', author: 'Yuval Noah Harari', pages: 443, category: 'History', color1: '#993C1D', color2: '#D85A30' },
    { id: 3, title: 'Atomic Habits', author: 'James Clear', pages: 320, category: 'Business', color1: '#0C447C', color2: '#378ADD' },
    { id: 4, title: 'Deep Work', author: 'Cal Newport', pages: 296, category: 'Business', color1: '#1a1a2e', color2: '#0f3460' },
    { id: 5, title: 'The Selfish Gene', author: 'Richard Dawkins', pages: 360, category: 'Science', color1: '#0f6e56', color2: '#4ade80' },
    { id: 6, title: 'A Brief History of Time', author: 'Stephen Hawking', pages: 212, category: 'Science', color1: '#854F0B', color2: '#EF9F27' },
    { id: 7, title: 'Meditations', author: 'Marcus Aurelius', pages: 254, category: 'Philosophy', color1: '#533489', color2: '#7F77DD' },
    { id: 8, title: 'The Art of War', author: 'Sun Tzu', pages: 68, category: 'Philosophy', color1: '#993556', color2: '#D4537E' },
];

const CATEGORIES = ['All', 'Psychology', 'History', 'Business', 'Science', 'Philosophy'];

export default function LibraryScreen({ navigation }) {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const filtered = ALL_BOOKS.filter(book => {
        const matchCat = activeCategory === 'All' || book.category === activeCategory;
        const matchSearch = book.title.toLowerCase().includes(search.toLowerCase()) ||
            book.author.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Library</Text>
                <Text style={styles.headerSub}>{ALL_BOOKS.length} books available</Text>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.4)" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search books, authors..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.4)" />
                        </TouchableOpacity>
                    )}
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
                        <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Results count */}
            <Text style={styles.resultCount}>{filtered.length} books</Text>

            {/* Book Grid */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
                {filtered.map(book => (
                    <TouchableOpacity
                        key={book.id}
                        style={styles.bookCard}
                        onPress={() => navigation.navigate('BookDetail', { book })}
                    >
                        <View style={[styles.bookCover, { backgroundColor: book.color1 }]}>
                            <View style={[styles.coverAccent, { backgroundColor: book.color2 }]} />
                            <Text style={styles.coverTitle} numberOfLines={3}>{book.title}</Text>
                        </View>
                        <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
                        <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
                        <View style={styles.bookMeta}>
                            <Text style={styles.bookPages}>{book.pages}p</Text>
                            <View style={styles.freeBadge}>
                                <Text style={styles.freeBadgeText}>Free</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { backgroundColor: COLORS.primary, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 3 },
    headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 14 },
    searchBar: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: RADIUS.md, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 8 },
    searchInput: { flex: 1, fontSize: 13, color: '#fff', outlineStyle: 'none' },
    catsScroll: { backgroundColor: COLORS.white, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
    catsContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    catPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 0.5, borderColor: COLORS.border, backgroundColor: COLORS.background },
    catPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    catText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
    catTextActive: { color: '#fff' },
    resultCount: { fontSize: 12, color: COLORS.textMuted, paddingHorizontal: 16, paddingVertical: 10 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 12, paddingBottom: 30 },
    bookCard: { width: '46%', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 0.5, borderColor: COLORS.border, ...SHADOW.small },
    bookCover: { height: 130, padding: 12, justifyContent: 'flex-end', overflow: 'hidden' },
    coverAccent: { position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: 50, opacity: 0.35 },
    coverTitle: { fontSize: 11, color: '#fff', fontWeight: '600', lineHeight: 15 },
    bookTitle: { fontSize: 12, fontWeight: '600', color: COLORS.text, padding: 10, paddingBottom: 3 },
    bookAuthor: { fontSize: 11, color: COLORS.textMuted, paddingHorizontal: 10 },
    bookMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, paddingTop: 6 },
    bookPages: { fontSize: 10, color: COLORS.textMuted },
    freeBadge: { backgroundColor: COLORS.successLight, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2 },
    freeBadgeText: { fontSize: 10, color: COLORS.success, fontWeight: '600' },
});