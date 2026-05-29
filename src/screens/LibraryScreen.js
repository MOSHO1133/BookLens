import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LibraryScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('Reading');

    const tabs = ['All', 'Reading', 'Completed', 'Wishlist', 'Uploads'];

    const libraryBooks = [
        {
            id: '1',
            title: 'Le parfum des fleurs la nuit',
            author: 'Leïla Slimani',
            status: 'Reading',
            coverUrl: 'https://covers.openlibrary.org/b/id/12567302-M.jpg'
        }
    ];

    const filteredBooks = libraryBooks.filter(
        book => book.status === activeTab || activeTab === 'All'
    );

    return (
        <View style={styles.container}>

            {/* Dark Navy Header (Sharp Edges) */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Library</Text>
                <Text style={styles.headerSub}>20M+ books via Open Library</Text>

                <View style={styles.searchBar}>
                    <Ionicons name="search" size={16} color="rgba(255,255,255,0.4)" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search books, authors..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={styles.searchInput}
                    />
                </View>
            </View>

            {/* Category Filter Pills Container */}
            <View style={styles.tabContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabScroll}
                >
                    {tabs.map(tab => {
                        const isSelected = activeTab === tab;
                        return (
                            <TouchableOpacity
                                key={tab}
                                style={[
                                    styles.tabPill,
                                    isSelected ? styles.tabPillActive : styles.tabPillInactive
                                ]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[
                                    styles.tabPillText,
                                    isSelected ? styles.tabPillTextActive : styles.tabPillTextInactive
                                ]}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Main Content List Area */}
            <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
                {filteredBooks.length > 0 ? (
                    filteredBooks.map(book => (
                        <TouchableOpacity
                            key={book.id}
                            style={styles.bookRow}
                            onPress={() => navigation && navigation.navigate('BookDetail', { book })}
                        >
                            <Image source={{ uri: book.coverUrl }} style={styles.coverImage} resizeMode="cover" />
                            <View style={styles.bookInfo}>
                                <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                                <Text style={styles.bookAuthor}>{book.author}</Text>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>{book.status}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    /* Original Empty State View Layout */
                    <View style={styles.emptyContainer}>
                        <Image
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3429/3429149.png' }}
                            style={styles.emptyImage}
                        />
                        <Text style={styles.emptyTitle}>No books here yet</Text>
                        <Text style={styles.emptySub}>Search and save books to your library</Text>

                        <TouchableOpacity
                            style={styles.browseBtn}
                            onPress={() => navigation && navigation.navigate('Home')}
                        >
                            <Text style={styles.browseBtnText}>Browse Books</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff'
    },
    header: {
        backgroundColor: '#1b183a',
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 25
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 4
    },
    headerSub: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 16
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 42,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 8,
        paddingHorizontal: 12
    },
    searchIcon: {
        marginRight: 8
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#ffffff',
        padding: 0
    },

    tabContainer: {
        paddingVertical: 14,
        backgroundColor: '#ffffff'
    },
    tabScroll: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center'
    },
    tabPill: {
        paddingHorizontal: 16,
        height: 36,               // FIXED: Explicit height rule prevents layout engines from stretching the pills
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
        borderWidth: 1,
        marginRight: 8,
        alignSelf: 'center'
    },
    tabPillActive: {
        backgroundColor: '#1b183a',
        borderColor: '#1b183a'
    },
    tabPillInactive: {
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0'
    },
    tabPillText: {
        fontSize: 13,
        fontWeight: '500'
    },
    tabPillTextActive: {
        color: '#ffffff',
        fontWeight: '600'
    },
    tabPillTextInactive: {
        color: '#64748b'
    },

    scrollBody: {
        flexGrow: 1,
        paddingHorizontal: 16
    },
    bookRow: {
        flexDirection: 'row',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        alignItems: 'center'
    },
    coverImage: {
        width: 42,
        height: 58,
        borderRadius: 4,
        marginRight: 14
    },
    bookInfo: {
        flex: 1,
        justifyContent: 'center'
    },
    bookTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 2
    },
    bookAuthor: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 6
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: '#e2e8f0',
        alignSelf: 'flex-start'
    },
    statusText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#475569'
    },

    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 50,
        paddingHorizontal: 40
    },
    emptyImage: {
        width: 64,
        height: 64,
        marginBottom: 16
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 6
    },
    emptySub: {
        fontSize: 13,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 20
    },
    browseBtn: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 6,
        backgroundColor: '#1b183a'
    },
    browseBtnText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600'
    }
});