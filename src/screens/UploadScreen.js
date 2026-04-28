import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

const MOCK_UPLOADS = [
    { id: 1, name: 'Clean Code — Robert Martin.pdf', size: '3.2 MB', pages: 464, status: 'done' },
    { id: 2, name: 'Designing Data-Intensive Apps.pdf', size: '8.7 MB', pages: 551, status: 'processing', progress: 60 },
    { id: 3, name: 'The Pragmatic Programmer.pdf', size: '2.1 MB', pages: 352, status: 'done' },
];

export default function UploadScreen({ navigation }) {
    const [uploads, setUploads] = useState(MOCK_UPLOADS);

    const handleUpload = () => {
        Alert.alert(
            'Upload Book',
            'In the full app this will open your file picker to select a PDF.',
            [{ text: 'OK' }]
        );
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Upload a Book</Text>
                <Text style={styles.headerSub}>PDF format · max 50MB · chapters auto-detected</Text>
            </View>

            <View style={styles.body}>

                {/* Upload Zone */}
                <TouchableOpacity style={styles.dropZone} onPress={handleUpload} activeOpacity={0.7}>
                    <View style={styles.dropIconBox}>
                        <Ionicons name="cloud-upload-outline" size={28} color={COLORS.textMuted} />
                    </View>
                    <Text style={styles.dropTitle}>Tap to upload your PDF</Text>
                    <Text style={styles.dropSub}>We'll automatically detect chapters and generate a full summary</Text>
                    <View style={styles.dropBtn}>
                        <Ionicons name="folder-open-outline" size={13} color="#fff" />
                        <Text style={styles.dropBtnText}>Browse Files</Text>
                    </View>
                </TouchableOpacity>

                {/* Info Cards */}
                <View style={styles.infoRow}>
                    <View style={styles.infoCard}>
                        <Ionicons name="flash-outline" size={18} color={COLORS.success} />
                        <Text style={styles.infoTitle}>~2 min</Text>
                        <Text style={styles.infoSub}>Summary ready</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.success} />
                        <Text style={styles.infoTitle}>100%</Text>
                        <Text style={styles.infoSub}>Concepts captured</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <Ionicons name="layers-outline" size={18} color={COLORS.success} />
                        <Text style={styles.infoTitle}>Auto</Text>
                        <Text style={styles.infoSub}>Chapter detection</Text>
                    </View>
                </View>

                {/* How it works */}
                <View style={styles.howItWorks}>
                    <Text style={styles.sectionTitle}>How it works</Text>
                    {[
                        { icon: 'document-outline', step: '1', text: 'Upload your PDF book' },
                        { icon: 'cut-outline', step: '2', text: 'We detect and split chapters automatically' },
                        { icon: 'bulb-outline', step: '3', text: 'AI reads every page — nothing is skipped' },
                        { icon: 'checkmark-circle-outline', step: '4', text: 'Full summary ready in simple English' },
                    ].map((item) => (
                        <View key={item.step} style={styles.stepRow}>
                            <View style={styles.stepNum}>
                                <Text style={styles.stepNumText}>{item.step}</Text>
                            </View>
                            <Ionicons name={item.icon} size={18} color={COLORS.success} />
                            <Text style={styles.stepText}>{item.text}</Text>
                        </View>
                    ))}
                </View>

                {/* Recent Uploads */}
                <Text style={styles.sectionTitle}>Recent Uploads</Text>
                <View style={styles.uploadList}>
                    {uploads.map(upload => (
                        <View key={upload.id} style={styles.uploadItem}>

                            {/* PDF Icon */}
                            <View style={styles.pdfIcon}>
                                <Text style={styles.pdfIconText}>PDF</Text>
                            </View>

                            {/* Info */}
                            <View style={styles.uploadInfo}>
                                <Text style={styles.uploadName} numberOfLines={1}>{upload.name}</Text>
                                <Text style={styles.uploadMeta}>{upload.size} · {upload.pages} pages</Text>

                                {/* Progress bar for processing */}
                                {upload.status === 'processing' && (
                                    <View style={styles.progressTrack}>
                                        <View style={[styles.progressFill, { width: `${upload.progress}%` }]} />
                                    </View>
                                )}
                            </View>

                            {/* Status Badge */}
                            {upload.status === 'done' ? (
                                <TouchableOpacity
                                    style={styles.badgeDone}
                                    onPress={() => navigation.navigate('BookDetail')}
                                >
                                    <Text style={styles.badgeDoneText}>View</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.badgeProcessing}>
                                    <Text style={styles.badgeProcessingText}>{upload.progress}%</Text>
                                </View>
                            )}

                        </View>
                    ))}
                </View>

                {/* Tips */}
                <View style={styles.tipsBox}>
                    <View style={styles.tipsHeader}>
                        <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
                        <Text style={styles.tipsTitle}>Tips for best results</Text>
                    </View>
                    <Text style={styles.tipText}>• Use text-based PDFs, not scanned images</Text>
                    <Text style={styles.tipText}>• Books with clear chapter headings work best</Text>
                    <Text style={styles.tipText}>• English language books only for now</Text>
                    <Text style={styles.tipText}>• Maximum file size is 50MB</Text>
                </View>

            </View>
            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    // Header
    header: { backgroundColor: COLORS.primary, paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 5 },
    headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.45)' },

    body: { padding: 16 },

    // Drop Zone
    dropZone: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: 28, alignItems: 'center', marginBottom: 16, backgroundColor: COLORS.white },
    dropIconBox: { width: 56, height: 56, backgroundColor: COLORS.background, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    dropTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
    dropSub: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18, marginBottom: 16 },
    dropBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: 18, paddingVertical: 10 },
    dropBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

    // Info Cards
    infoRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
    infoCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 14, alignItems: 'center', borderWidth: 0.5, borderColor: COLORS.border, ...SHADOW.small },
    infoTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 6, marginBottom: 2 },
    infoSub: { fontSize: 10, color: COLORS.textMuted, textAlign: 'center' },

    // How it works
    howItWorks: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 16, marginBottom: 20, borderWidth: 0.5, borderColor: COLORS.border, ...SHADOW.small },
    sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
    stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.successLight, alignItems: 'center', justifyContent: 'center' },
    stepNumText: { fontSize: 11, fontWeight: '700', color: COLORS.success },
    stepText: { fontSize: 13, color: COLORS.text, flex: 1 },

    // Upload List
    uploadList: { gap: 2, marginBottom: 18 },
    uploadItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, padding: 14, borderRadius: RADIUS.lg, marginBottom: 8, borderWidth: 0.5, borderColor: COLORS.border, ...SHADOW.small },
    pdfIcon: { width: 40, height: 46, backgroundColor: COLORS.dangerLight, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    pdfIconText: { fontSize: 10, fontWeight: '700', color: COLORS.danger },
    uploadInfo: { flex: 1, minWidth: 0 },
    uploadName: { fontSize: 12, fontWeight: '500', color: COLORS.text, marginBottom: 3 },
    uploadMeta: { fontSize: 11, color: COLORS.textMuted },
    progressTrack: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, marginTop: 6 },
    progressFill: { height: 4, backgroundColor: COLORS.success, borderRadius: 2 },
    badgeDone: { backgroundColor: COLORS.successLight, borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 5 },
    badgeDoneText: { fontSize: 11, color: COLORS.success, fontWeight: '600' },
    badgeProcessing: { backgroundColor: COLORS.warningLight, borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 5 },
    badgeProcessingText: { fontSize: 11, color: COLORS.warning, fontWeight: '600' },

    // Tips
    tipsBox: { backgroundColor: '#e8f5ee', borderRadius: RADIUS.lg, padding: 16, borderWidth: 0.5, borderColor: '#b7dfc9' },
    tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
    tipsTitle: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
    tipText: { fontSize: 12, color: COLORS.text, lineHeight: 22 },
});