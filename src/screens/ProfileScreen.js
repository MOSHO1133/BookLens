import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';
import { supabase } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const BAR_VALS = [45, 30, 62, 20, 80, 55, 40];
const MAX_VAL = Math.max(...BAR_VALS);

export default function ProfileScreen({ navigation }) {
    const { theme: C, toggleTheme, isDark } = useTheme();
    const [user, setUser] = useState(null);
    const [stats] = useState({ books: 28, pages: 4830, streak: 47, offline: 5 });

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };

    const handleSignOut = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out', style: 'destructive', onPress: async () => {
                    await supabase.auth.signOut();
                    navigation.replace('Login');
                }
            },
        ]);
    };

    const userName = user?.email?.split('@')[0] || 'Reader';
    const userInitial = userName[0]?.toUpperCase() || 'R';

    const menuItems = [
        { icon: 'bookmark-outline', label: 'Saved Summaries', value: '12 saved', color: COLORS.primary },
        { icon: 'cloud-upload-outline', label: 'My Uploads', value: '3 books', color: COLORS.primary, onPress: () => navigation.navigate('Upload') },
        { icon: 'notifications-outline', label: 'Notifications', value: 'Daily 8 PM', color: COLORS.primary },
        { icon: 'language-outline', label: 'Language', value: 'English', color: COLORS.primary },
        { icon: 'shield-checkmark-outline', label: 'Privacy & Security', value: '', color: COLORS.primary },
        { icon: 'help-circle-outline', label: 'Help & Support', value: '', color: COLORS.primary },
        { icon: 'log-out-outline', label: 'Sign Out', value: '', color: COLORS.danger, onPress: handleSignOut },
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.avatarLarge}>
                    <Text style={styles.avatarText}>{userInitial}</Text>
                </View>
                <Text style={styles.name}>{userName}</Text>
                <Text style={styles.email}>{user?.email || ''}</Text>
                <TouchableOpacity style={styles.editBtn}>
                    <Text style={styles.editBtnText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.body}>
                {/* Stats */}
                <View style={styles.statsRow}>
                    {[
                        { value: stats.books, label: 'Books Read' },
                        { value: stats.pages.toLocaleString(), label: 'Pages' },
                        { value: `${stats.streak}🔥`, label: 'Day Streak' },
                    ].map((s, i) => (
                        <View key={i} style={styles.statCard}>
                            <Text style={styles.statValue}>{s.value}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Plan */}
                <View style={styles.planBox}>
                    <View style={styles.planHeader}>
                        <Ionicons name="trophy-outline" size={18} color="#f59e0b" />
                        <Text style={styles.planTitle}>Free Plan</Text>
                    </View>
                    <Text style={styles.planSub}>5 AI summaries per month · Upgrade for unlimited</Text>
                    <TouchableOpacity style={styles.upgradeBtn}>
                        <Ionicons name="flash" size={14} color={COLORS.primary} />
                        <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
                    </TouchableOpacity>
                </View>

                {/* Reading Activity */}
                <View style={styles.activityCard}>
                    <Text style={styles.activityTitle}>Reading Activity</Text>
                    <View style={styles.barsRow}>
                        {BAR_VALS.map((v, i) => (
                            <View key={i} style={styles.barCol}>
                                <View style={[
                                    styles.bar,
                                    {
                                        height: Math.max(4, (v / MAX_VAL) * 60),
                                        backgroundColor: i === 4 ? COLORS.primary : `${COLORS.primary}40`,
                                    }
                                ]} />
                            </View>
                        ))}
                    </View>
                    <View style={styles.daysRow}>
                        {DAYS.map(d => <Text key={d} style={styles.dayText}>{d}</Text>)}
                    </View>
                </View>

                {/* Dark Mode Toggle */}
                <View style={[styles.themeRow, { backgroundColor: C.card, borderColor: C.border }]}>
                    <View style={[styles.menuIcon, { backgroundColor: isDark ? '#2d1a4a' : '#e8f5ee' }]}>
                        <Ionicons name={isDark ? 'moon' : 'sunny'} size={16} color={isDark ? '#a78bfa' : '#f59e0b'} />
                    </View>
                    <Text style={[styles.menuLabel, { color: C.text }]}>Dark Mode</Text>
                    <TouchableOpacity
                        onPress={toggleTheme}
                        style={[styles.toggle, { backgroundColor: isDark ? C.primary : C.border }]}
                    >
                        <View style={[styles.toggleThumb, { left: isDark ? 20 : 2 }]} />
                    </TouchableOpacity>
                </View>

                {/* Menu */}
                <View style={styles.menuCard}>
                    {menuItems.map((item, i) => (
                        <TouchableOpacity
                            key={item.label}
                            style={[styles.menuItem, i < menuItems.length - 1 && styles.menuItemBorder]}
                            onPress={item.onPress || (() => Alert.alert(item.label, 'This feature is coming soon!'))}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: item.color === COLORS.danger ? COLORS.dangerLight : COLORS.successLight }]}>
                                <Ionicons name={item.icon} size={16} color={item.color} />
                            </View>
                            <Text style={[styles.menuLabel, item.color === COLORS.danger && { color: COLORS.danger }]}>
                                {item.label}
                            </Text>
                            {item.value ? <Text style={styles.menuValue}>{item.value}</Text> : null}
                            {item.label !== 'Sign Out' && (
                                <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.version}>BookLens v1.0.0 · Powered by Open Library & Claude AI</Text>
            </View>
            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { backgroundColor: COLORS.primary, paddingTop: 52, paddingBottom: 28, alignItems: 'center' },
    avatarLarge: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
    avatarText: { fontSize: 26, fontWeight: '700', color: '#fff' },
    name: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
    email: { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 16 },
    editBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: RADIUS.full, paddingHorizontal: 20, paddingVertical: 7 },
    editBtnText: { fontSize: 12, color: '#fff', fontWeight: '500' },
    body: { padding: 16 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    statCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 14, alignItems: 'center', borderWidth: 0.5, borderColor: COLORS.border, ...SHADOW.small },
    statValue: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
    statLabel: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center' },
    planBox: { backgroundColor: '#fefce8', borderRadius: RADIUS.lg, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: '#fde68a' },
    planHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
    planTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
    planSub: { fontSize: 12, color: COLORS.textMuted, marginBottom: 12 },
    upgradeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef08a', borderRadius: RADIUS.md, padding: 10, justifyContent: 'center' },
    upgradeBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
    activityCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: COLORS.border },
    activityTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
    barsRow: { flexDirection: 'row', alignItems: 'flex-end', height: 70, gap: 4, marginBottom: 6 },
    barCol: { flex: 1, justifyContent: 'flex-end' },
    bar: { borderRadius: 3 },
    daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
    dayText: { flex: 1, fontSize: 10, color: COLORS.textMuted, textAlign: 'center', fontWeight: '500' },
    themeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 0.5, marginBottom: 12 },
    toggle: { width: 42, height: 24, borderRadius: 12, position: 'relative' },
    toggleThumb: { position: 'absolute', top: 3, width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff' },
    menuCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border, marginBottom: 16 },
    menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
    menuItemBorder: { borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
    menuIcon: { width: 32, height: 32, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
    menuLabel: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '500' },
    menuValue: { fontSize: 12, color: COLORS.textMuted, marginRight: 4 },
    version: { textAlign: 'center', fontSize: 11, color: COLORS.textMuted, marginBottom: 8 },
});