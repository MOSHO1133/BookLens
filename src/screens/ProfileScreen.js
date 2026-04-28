import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

const STATS = [
    { label: 'Books Read', value: '12' },
    { label: 'Hours Saved', value: '48' },
    { label: 'Summaries', value: '9' },
];

const MENU_ITEMS = [
    { icon: 'bookmark-outline', label: 'Saved Summaries', color: COLORS.primary },
    { icon: 'cloud-upload-outline', label: 'My Uploads', color: COLORS.primary },
    { icon: 'notifications-outline', label: 'Notifications', color: COLORS.primary },
    { icon: 'language-outline', label: 'Language', color: COLORS.primary },
    { icon: 'shield-checkmark-outline', label: 'Privacy & Security', color: COLORS.primary },
    { icon: 'help-circle-outline', label: 'Help & Support', color: COLORS.primary },
    { icon: 'log-out-outline', label: 'Sign Out', color: COLORS.danger },
];

export default function ProfileScreen({ navigation }) {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.avatarLarge}>
                    <Text style={styles.avatarText}>MU</Text>
                </View>
                <Text style={styles.name}>Muhammad</Text>
                <Text style={styles.email}>muhammad@email.com</Text>
                <TouchableOpacity style={styles.editBtn}>
                    <Text style={styles.editBtnText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.body}>

                {/* Stats */}
                <View style={styles.statsRow}>
                    {STATS.map(stat => (
                        <View key={stat.label} style={styles.statCard}>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Reading Plan */}
                <View style={styles.planBox}>
                    <View style={styles.planHeader}>
                        <Ionicons name="trophy-outline" size={18} color="#f59e0b" />
                        <Text style={styles.planTitle}>Free Plan</Text>
                    </View>
                    <Text style={styles.planSub}>5 summaries per month · Upgrade for unlimited</Text>
                    <TouchableOpacity style={styles.upgradeBtn}>
                        <Ionicons name="flash" size={14} color={COLORS.primary} />
                        <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
                    </TouchableOpacity>
                </View>

                {/* Menu */}
                <View style={styles.menuCard}>
                    {MENU_ITEMS.map((item, index) => (
                        <TouchableOpacity
                            key={item.label}
                            style={[
                                styles.menuItem,
                                index < MENU_ITEMS.length - 1 && styles.menuItemBorder
                            ]}
                            onPress={() => {
                                if (item.label === 'Sign Out') navigation.replace('Login');
                            }}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: item.color === COLORS.danger ? COLORS.dangerLight : COLORS.successLight }]}>
                                <Ionicons name={item.icon} size={16} color={item.color} />
                            </View>
                            <Text style={[styles.menuLabel, item.color === COLORS.danger && { color: COLORS.danger }]}>
                                {item.label}
                            </Text>
                            {item.label !== 'Sign Out' && (
                                <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.version}>BookLens v1.0.0</Text>
            </View>

            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { backgroundColor: COLORS.primary, paddingTop: 52, paddingBottom: 28, alignItems: 'center' },
    avatarLarge: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
    avatarText: { fontSize: 24, fontWeight: '700', color: '#fff' },
    name: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
    email: { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 16 },
    editBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: RADIUS.full, paddingHorizontal: 20, paddingVertical: 7 },
    editBtnText: { fontSize: 12, color: '#fff', fontWeight: '500' },
    body: { padding: 16 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    statCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 14, alignItems: 'center', borderWidth: 0.5, borderColor: COLORS.border, ...SHADOW.small },
    statValue: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
    statLabel: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center' },
    planBox: { backgroundColor: '#fefce8', borderRadius: RADIUS.lg, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: '#fde68a' },
    planHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
    planTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
    planSub: { fontSize: 12, color: COLORS.textMuted, marginBottom: 12 },
    upgradeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef08a', borderRadius: RADIUS.md, padding: 10, justifyContent: 'center' },
    upgradeBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
    menuCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, borderWidth: 0.5, borderColor: COLORS.border, marginBottom: 16, ...SHADOW.small },
    menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
    menuItemBorder: { borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
    menuIcon: { width: 32, height: 32, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
    menuLabel: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '500' },
    version: { textAlign: 'center', fontSize: 11, color: COLORS.textMuted },
});