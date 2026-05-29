import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

const MOCK_UPLOADS = [
    { id: 1, name: 'Clean Code — Robert Martin.pdf', size: '3.2 MB', pages: 464, status: 'done' },
    { id: 2, name: 'Designing Data-Intensive Apps.pdf', size: '8.7 MB', pages: 551, status: 'processing', progress: 60 },
    { id: 3, name: 'The Pragmatic Programmer.pdf', size: '2.1 MB', pages: 352, status: 'done' },
];

export default function UploadScreen({ navigation }) {
    const [uploads, setUploads] = useState(MOCK_UPLOADS);
    const [uploading, setUploading] = useState(false);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets?.length > 0) {
                const file = result.assets[0];
                const newUpload = {
                    id: Date.now(),
                    name: file.name,
                    size: file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : 'Unknown',
                    pages: '—',
                    status: 'processing',
                    progress: 0,
                };
                setUploads(prev => [newUpload, ...prev]);
                simulateProcessing(newUpload.id);
            }
        } catch (e) {
            Alert.alert('Error', 'Could not pick file. Please try again.');
        }
    };

    const simulateProcessing = (id) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setUploads(prev => prev.map(u =>
                    u.id === id ? { ...u, progress: 100, status: 'done', pages: Math.floor(Math.random() * 400 + 100) } : u
                ));
                Alert.alert('Summary Ready!', 'Your book has been processed. Tap "View" to see the AI summary.');
            } else {
                setUploads(prev => prev.map(u =>
                    u.id === id ? { ...u, progress: Math.floor(progress) } : u
                ));
            }
        }, 400);
    };

    const removeUpload = (id) => {
        Alert.alert('Remove Book', 'Remove this book from your uploads?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => setUploads(prev => prev.filter(u => u.id !== id)) },
        ]);
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Upload a Book</Text>
                <Text style={styles.headerSub}>PDF format · chapters auto-detected · AI summary in ~2 min</Text>
            </View>

            <View style={styles.body}>
                {/* Drop Zone */}
                <TouchableOpacity style={styles.dropZone} onPress={pickDocument} activeOpacity={0.8}>
                    <View style={styles.dropIconBox}>
                        <Ionicons name="cloud-upload-outline" size={30} color={COLORS.textMuted} />
                    </View>
                    <Text style={styles.dropTitle}>Tap to upload your PDF</Text>
                    <Text style={styles.dropSub}>
                        We'll automatically detect chapters and generate a complete AI summary
                    </Text>
                    <View style={styles.dropBtn}>
                        <Ionicons name="folder-open-outline" size={14} color="#fff" />
                        <Text style={styles.dropBtnText}>Choose PDF File</Text>
                    </View>
                </TouchableOpacity>

                {/* Info Cards */}
                <View style={styles.infoRow}>
                    {[
                        { icon: 'flash', color: COLORS.success, value: '~2 min', label: 'Processing' },
                        { icon: 'shield-checkmark', color: COLORS.success, value: '100%', label: 'Concepts' },
                        { icon: 'layers', color: COLORS.success, value: 'Auto', label: 'Chapters' },
                    ].map((item, i) => (
                        <View key={i} style={styles.infoCard}>
                            <Ionicons name={`${item.icon}-outline`} size={20} color={item.color} />
                            <Text style={styles.infoValue}>{item.value}</Text>
                            <Text style={styles.infoLabel}>{item.label}</Text>
                        </View>
                    ))}
                </View>

                {/* How it works */}
                <View style={styles.howBox}>
                    <Text style={styles.sectionTitle}>How it works</Text>
                    {[
                        { step: '1', icon: 'document', text: 'Upload your PDF book' },
                        { step: '2', icon: 'cut', text: 'We detect and split chapters automatically' },
                        { step: '3', icon: 'bulb', text: 'AI reads every page — nothing is skipped' },
                        { step: '4', icon: 'checkmark-circle', text: 'Full summary ready in simple English' },
                    ].map(item => (
                        <View key={item.step} style={styles.stepRow}>
                            <View style={styles.stepNum}>
                                <Text style={styles.stepNumText}>{item.step}</Text>
                            </View>
                            <Ionicons name={`${item.icon}-outline`} size={18} color={COLORS.success} />
                            <Text style={styles.stepText}>{item.text}</Text>
                        </View>
                    ))}
                </View>

                {/* My Uploads */}
                <Text style={styles.sectionTitle}>My Uploads</Text>
                <View style={styles.uploadList}>
                    {uploads.map(upload => (
                        <View key={upload.id} style={styles.uploadItem}>
                            <View style={styles.pdfIcon}>
                                <Text style={styles.pdfIconText}>PDF</Text>
                            </View>
                            <View style={styles.uploadInfo}>
                                <Text style={styles.uploadName} numberOfLines={1}>{upload.name}</Text>
                                <Text style={styles.uploadMeta}>
                                    {upload.size} {upload.pages !== '—' ? `· ${upload.pages} pages` : ''}
                                </Text>
                                {upload.status === 'processing' && (
                                    <View style={styles.progressTrack}>
                                        <View style={[styles.progressFill, { width: `${upload.progress}%` }]} />
                                    </View>
                                )}
                                {upload.status === 'done' && (
                                    <View style={styles.doneRow}>
                                        <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
                                        <Text style={styles.doneText}>Summary ready</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.uploadActions}>
                                {upload.status === 'done' ? (
                                    <TouchableOpacity
                                        style={styles.viewBtn}
                                        onPress={() => navigation.navigate('Summary', {
                                            book: { title: upload.name.replace('.pdf', ''), author: 'Unknown', id: `upload_${upload.id}` },
                                            mode: 'full'
                                        })}
                                    >
                                        <Text style={styles.viewBtnText}>View</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.processingBadge}>
                                        <Text style={styles.processingText}>{upload.progress}%</Text>
                                    </View>
                                )}
                                <TouchableOpacity onPress={() => removeUpload(upload.id)}>
                                    <Ionicons name="trash-outline" size={16} color={COLORS.textMuted} />
                                </TouchableOpacity>
                            </View>
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
                    <Text style={styles.tipText}>• English books only for now</Text>
                    <Text style={styles.tipText}>• Maximum file size is 50MB</Text>
                </View>
            </View>
            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { backgroundColor: COLORS.primary, paddingTop: 52, paddingBottom: 22, paddingHorizontal: 20 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 5 },
    headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.45)' },
    body: { padding: 16 },
    dropZone: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: 28, alignItems: 'center', marginBottom: 16, backgroundColor: COLORS.white },
    dropIconBox: { width: 58, height: 58, backgroundColor: COLORS.background, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    dropTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
    dropSub: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18, marginBottom: 16 },
    dropBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: 18, paddingVertical: 10 },
    dropBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
    infoRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
    infoCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 14, alignItems: 'center', borderWidth: 0.5, borderColor: COLORS.border, ...SHADOW.small },
    infoValue: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 6, marginBottom: 2 },
    infoLabel: { fontSize: 10, color: COLORS.textMuted, textAlign: 'center' },
    howBox: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 16, marginBottom: 20, borderWidth: 0.5, borderColor: COLORS.border },
    sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
    stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.successLight, alignItems: 'center', justifyContent: 'center' },
    stepNumText: { fontSize: 11, fontWeight: '700', color: COLORS.success },
    stepText: { fontSize: 13, color: COLORS.text, flex: 1 },
    uploadList: { gap: 2, marginBottom: 18 },
    uploadItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, padding: 14, borderRadius: RADIUS.lg, marginBottom: 8, borderWidth: 0.5, borderColor: COLORS.border },
    pdfIcon: { width: 40, height: 46, backgroundColor: COLORS.dangerLight, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    pdfIconText: { fontSize: 10, fontWeight: '700', color: COLORS.danger },
    uploadInfo: { flex: 1, minWidth: 0 },
    uploadName: { fontSize: 12, fontWeight: '500', color: COLORS.text, marginBottom: 3 },
    uploadMeta: { fontSize: 11, color: COLORS.textMuted },
    progressTrack: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, marginTop: 6 },
    progressFill: { height: 4, backgroundColor: COLORS.success, borderRadius: 2 },
    doneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    doneText: { fontSize: 11, color: COLORS.success, fontWeight: '500' },
    uploadActions: { flexDirection: 'column', alignItems: 'center', gap: 8 },
    viewBtn: { backgroundColor: COLORS.successLight, borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 5 },
    viewBtnText: { fontSize: 11, color: COLORS.success, fontWeight: '600' },
    processingBadge: { backgroundColor: COLORS.warningLight, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 5 },
    processingText: { fontSize: 11, color: COLORS.warning, fontWeight: '600' },
    tipsBox: { backgroundColor: COLORS.successLight, borderRadius: RADIUS.lg, padding: 16, borderWidth: 0.5, borderColor: '#b7dfc9' },
    tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
    tipsTitle: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
    tipText: { fontSize: 12, color: COLORS.text, lineHeight: 22 },
});