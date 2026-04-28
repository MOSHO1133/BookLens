import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ScrollView, KeyboardAvoidingView,
    Platform, ActivityIndicator, Animated, Dimensions, Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { supabase } from '../services/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();
const { width } = Dimensions.get('window');

function useFloat(amplitude, period, phase = 0) {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const startTime = Date.now() - phase * period;
        const id = setInterval(() => {
            const t = (Date.now() - startTime) / period;
            anim.setValue(amplitude * Math.sin(t * 2 * Math.PI));
        }, 16);
        return () => clearInterval(id);
    }, []);
    return anim;
}

function usePulse(lo, hi, period, phase = 0) {
    const anim = useRef(new Animated.Value(lo + (hi - lo) * phase)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: hi, duration: period / 2, easing: Easing.inOut(Easing.sine), useNativeDriver: false }),
                Animated.timing(anim, { toValue: lo, duration: period / 2, easing: Easing.inOut(Easing.sine), useNativeDriver: false }),
            ])
        ).start();
    }, []);
    return anim;
}

function BookSparkle({ x, y, accent, delay, size = 3, drift = 6 }) {
    const anim = useRef(new Animated.Value(0)).current;
    const driftX = useRef(drift * (Math.random() > 0.5 ? 1 : -1)).current;
    useEffect(() => {
        const run = () => {
            anim.setValue(0);
            Animated.timing(anim, {
                toValue: 1, duration: 1300 + Math.random() * 900,
                easing: Easing.linear, useNativeDriver: false, delay,
            }).start(({ finished }) => { if (finished) run(); });
        };
        run();
    }, []);
    return (
        <Animated.View style={{
            position: 'absolute', left: x, top: y,
            width: size, height: size, borderRadius: size / 2,
            backgroundColor: accent,
            opacity: anim.interpolate({ inputRange: [0, 0.12, 0.65, 1], outputRange: [0, 0.95, 0.45, 0] }),
            transform: [
                { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -40] }) },
                { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, driftX] }) },
                { scale: anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.1, 1.4, 0.1] }) },
            ],
        }} />
    );
}

function HoloBook({ accent, left, top, scale = 1, phase = 0 }) {
    const floatY = useFloat(14, 3500, phase);
    const floatX = useFloat(6, 4500, phase + 0.3);
    const glowOp = usePulse(0.12, 0.38, 2500, phase);
    const coreOp = usePulse(0.35, 0.85, 2000, phase + 0.5);
    const bw = 52, bh = 68;
    const hex2rgba = (hex, a) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${a})`;
    };
    return (
        <Animated.View style={{
            position: 'absolute', left, top,
            transform: [{ translateY: floatY }, { translateX: floatX }, { scale }],
        }}>
            <Animated.View style={{
                position: 'absolute', top: -28, left: -28,
                width: bw + 56, height: bh + 56, borderRadius: 60,
                backgroundColor: accent, opacity: glowOp,
            }} />
            <View style={{
                position: 'absolute', top: -4, left: -4,
                width: bw + 8, height: bh + 8, borderRadius: 10,
                borderWidth: 0.5, borderColor: accent, opacity: 0.3,
            }} />
            <View style={{
                width: bw, height: bh, borderRadius: 7,
                borderWidth: 1.5, borderColor: accent,
                backgroundColor: hex2rgba(accent, 0.1),
                overflow: 'hidden',
            }}>
                <View style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: bh * 0.42, backgroundColor: 'rgba(255,255,255,0.07)',
                    borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.1)',
                }} />
                <Animated.View style={{
                    position: 'absolute', top: 8, left: 8, right: 8, bottom: 8,
                    borderRadius: 4, borderWidth: 1, borderColor: accent,
                    backgroundColor: hex2rgba(accent, 0.18),
                    opacity: coreOp, paddingLeft: 5, paddingTop: 5,
                }}>
                    {[0.55, 0.75, 0.45, 0.65, 0.35].map((w, i) => (
                        <View key={i} style={{
                            height: 1.5, width: `${w * 100}%`,
                            backgroundColor: accent, opacity: 0.7,
                            borderRadius: 1, marginBottom: 5,
                        }} />
                    ))}
                    <View style={{
                        position: 'absolute', bottom: 5, right: 5,
                        width: 13, height: 17, borderWidth: 1,
                        borderColor: accent, borderRadius: 2,
                        backgroundColor: hex2rgba(accent, 0.25),
                    }}>
                        {[0, 1, 2].map(i => (
                            <View key={i} style={{
                                position: 'absolute', left: -4, top: 3 + i * 4,
                                width: 3, height: 1.5, backgroundColor: accent, opacity: 0.8,
                            }} />
                        ))}
                    </View>
                </Animated.View>
                {[[4, 4], [bw - 10, 4], [4, bh - 10], [bw - 10, bh - 10]].map(([x, y], i) => (
                    <View key={i} style={{
                        position: 'absolute', left: x, top: y,
                        width: 4, height: 4, borderRadius: 2,
                        backgroundColor: accent, opacity: 0.6,
                    }} />
                ))}
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: accent, opacity: 0.8 }} />
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: accent, opacity: 0.5 }} />
                <View style={{ position: 'absolute', top: 0, left: 0, width: 2, height: bh, backgroundColor: 'rgba(255,255,255,0.15)' }} />
            </View>
            <View style={{
                position: 'absolute', top: 2, left: -6,
                width: 6, height: bh - 2,
                backgroundColor: hex2rgba(accent, 0.35),
                borderTopLeftRadius: 3, borderBottomLeftRadius: 3,
                borderLeftWidth: 1, borderLeftColor: accent,
            }} />
            <View style={{
                position: 'absolute', bottom: -5, left: 4,
                width: bw - 8, height: 8, borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.6)',
            }} />
            <View style={{ position: 'absolute', bottom: -30, left: 12, width: 1.5, height: 30, backgroundColor: accent, opacity: 0.5 }} />
            <View style={{ position: 'absolute', bottom: -30, left: 8, width: 8, height: 1.5, backgroundColor: accent, opacity: 0.5 }} />
            <View style={{ position: 'absolute', bottom: -20, right: 14, width: 1, height: 20, backgroundColor: accent, opacity: 0.3 }} />
            <View style={{ position: 'absolute', bottom: -20, right: 10, width: 6, height: 1, backgroundColor: accent, opacity: 0.3 }} />
            <BookSparkle x={2} y={8} accent={accent} delay={0} size={2.5} drift={7} />
            <BookSparkle x={bw - 4} y={-8} accent={accent} delay={500} size={2} drift={-5} />
            <BookSparkle x={bw / 2} y={bh + 8} accent={accent} delay={900} size={1.5} drift={4} />
        </Animated.View>
    );
}

function Particle({ x, delay, size = 3 }) {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const run = () => {
            anim.setValue(0);
            Animated.timing(anim, {
                toValue: 1, duration: 2800 + Math.random() * 800,
                easing: Easing.linear, useNativeDriver: false, delay,
            }).start(({ finished }) => { if (finished) run(); });
        };
        run();
    }, []);
    return (
        <Animated.View style={{
            position: 'absolute', left: x, bottom: 8,
            width: size, height: size, borderRadius: size / 2,
            backgroundColor: COLORS.accent,
            opacity: anim.interpolate({ inputRange: [0, 0.1, 0.7, 1], outputRange: [0, 0.9, 0.3, 0] }),
            transform: [
                { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -130] }) },
                { scale: anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.3, 1.5, 0.2] }) },
            ],
        }} />
    );
}

function ErrorBanner({ message }) {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.spring(anim, { toValue: message ? 1 : 0, friction: 6, useNativeDriver: false }).start();
    }, [message]);
    if (!message) return null;
    return (
        <Animated.View style={[styles.errorBanner, { opacity: anim, transform: [{ scale: anim }] }]}>
            <Ionicons name="alert-circle" size={16} color="#fff" />
            <Text style={styles.errorText}>{message}</Text>
        </Animated.View>
    );
}

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [focusedInput, setFocusedInput] = useState(null);

    const formAnim = useRef(new Animated.Value(50)).current;
    const formOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.7)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: false }),
            Animated.timing(logoOpacity, { toValue: 1, duration: 900, useNativeDriver: false }),
            Animated.timing(formAnim, { toValue: 0, duration: 700, delay: 350, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
            Animated.timing(formOpacity, { toValue: 1, duration: 700, delay: 350, useNativeDriver: false }),
        ]).start();
    }, []);

    const clearError = () => setErrorMsg('');

    const getFriendlyError = (msg) => {
        if (msg.includes('Invalid login credentials')) return 'Incorrect email or password. Please try again.';
        if (msg.includes('Email not confirmed')) return 'Please confirm your email before signing in.';
        if (msg.includes('User already registered')) return 'An account with this email already exists.';
        if (msg.includes('Password should be at least')) return 'Password must be at least 6 characters.';
        if (msg.includes('Unable to validate email')) return 'Please enter a valid email address.';
        return msg;
    };

    const handleAuth = async () => {
        clearError();
        if (!email || !password) { setErrorMsg('Please enter your email and password.'); return; }
        if (isSignUp && password.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return; }
        setLoading(true);
        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                if (data.session) navigation.replace('Main');
                else { clearError(); setIsSignUp(false); }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigation.replace('Main');
            }
        } catch (e) { setErrorMsg(getFriendlyError(e.message)); }
        finally { setLoading(false); }
    };

    const handleGoogle = async () => {
        clearError();
        setGoogleLoading(true);
        try {
            const redirectUrl = AuthSession.makeRedirectUri({ useProxy: true });
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
            });
            if (error) throw error;
            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
            if (result.type === 'success') {
                const params = new URLSearchParams(result.url.split('#')[1]);
                const access_token = params.get('access_token');
                const refresh_token = params.get('refresh_token');
                if (access_token) {
                    const { error: se } = await supabase.auth.setSession({ access_token, refresh_token });
                    if (se) throw se;
                    navigation.replace('Main');
                }
            }
        } catch (e) { setErrorMsg(getFriendlyError(e.message)); }
        finally { setGoogleLoading(false); }
    };

    const books = [
        { accent: '#9333ea', left: -5, top: 10, scale: 0.75, phase: 0.00 },
        { accent: '#ef4444', left: width * 0.10, top: 140, scale: 0.90, phase: 0.14 },
        { accent: '#10b981', left: width * 0.28, top: 20, scale: 0.85, phase: 0.28 },
        { accent: '#f59e0b', left: width * 0.35, top: 150, scale: 0.95, phase: 0.43 },
        { accent: '#3b82f6', left: width * 0.58, top: 15, scale: 0.80, phase: 0.57 },
        { accent: '#06b6d4', left: width * 0.70, top: 130, scale: 1.05, phase: 0.71 },
        { accent: '#6366f1', left: width * 0.88, top: 40, scale: 0.70, phase: 0.85 },
    ];

    const particles = [
        { x: 28, delay: 0, size: 3 }, { x: 82, delay: 900, size: 2 },
        { x: 155, delay: 1700, size: 4 }, { x: 218, delay: 450, size: 2 },
        { x: 280, delay: 1200, size: 3 }, { x: 345, delay: 300, size: 2 },
        { x: width - 40, delay: 750, size: 3 }, { x: width - 100, delay: 600, size: 2 },
    ];

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
                <View style={styles.hero}>
                    <View style={[styles.orb, { width: 400, height: 400, top: -200, left: -150, backgroundColor: 'rgba(139,92,246,0.15)' }]} />
                    <View style={[styles.orb, { width: 350, height: 350, top: -50, right: -150, backgroundColor: 'rgba(6,182,212,0.1)' }]} />
                    <View style={[styles.orb, { width: 250, height: 250, bottom: -80, left: -20, backgroundColor: 'rgba(16,185,129,0.08)' }]} />
                    {books.map((b, i) => <HoloBook key={i} {...b} />)}
                    {particles.map((p, i) => <Particle key={i} {...p} />)}
                    <Animated.View style={[styles.logoArea, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
                        <View style={styles.logoGlow} />
                        <View style={styles.logoBox}>
                            <View style={styles.logoInner}>
                                <View style={styles.logoDot} />
                            </View>
                        </View>
                        <Text style={styles.appName}>BOOKLENS</Text>
                        <Text style={styles.tagline}>Read smarter, not harder</Text>
                        <View style={styles.pills}>
                            {[
                                { icon: 'flash', label: 'AI Summaries' },
                                { icon: 'library', label: '1000+ Books' },
                                { icon: 'time', label: 'Save Hours' },
                            ].map((p) => (
                                <View key={p.label} style={styles.pill}>
                                    <Ionicons name={p.icon} size={9} color={COLORS.accent} />
                                    <Text style={styles.pillText}>{p.label}</Text>
                                </View>
                            ))}
                        </View>
                    </Animated.View>
                </View>

                <Animated.View style={[styles.form, { opacity: formOpacity, transform: [{ translateY: formAnim }] }]}>
                    <View style={styles.tabToggle}>
                        <TouchableOpacity style={[styles.tabBtn, !isSignUp && styles.tabBtnActive]} onPress={() => { setIsSignUp(false); clearError(); }}>
                            <Text style={[styles.tabBtnText, !isSignUp && styles.tabBtnTextActive]}>Sign In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.tabBtn, isSignUp && styles.tabBtnActive]} onPress={() => { setIsSignUp(true); clearError(); }}>
                            <Text style={[styles.tabBtnText, isSignUp && styles.tabBtnTextActive]}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.formSub}>
                        {isSignUp ? 'Create your free account and start reading smarter' : 'Welcome back! Sign in to continue reading'}
                    </Text>

                    <ErrorBanner message={errorMsg} />

                    {isSignUp && (
                        <View style={[styles.inputGroup, focusedInput === 'name' && styles.inputFocused]}>
                            <View style={styles.inputIcon}>
                                <Ionicons name="person-outline" size={16} color={focusedInput === 'name' ? COLORS.primary : COLORS.textMuted} />
                            </View>
                            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} onFocus={() => setFocusedInput('name')} onBlur={() => setFocusedInput(null)} />
                        </View>
                    )}

                    <View style={[styles.inputGroup, focusedInput === 'email' && styles.inputFocused]}>
                        <View style={styles.inputIcon}>
                            <Ionicons name="mail-outline" size={16} color={focusedInput === 'email' ? COLORS.primary : COLORS.textMuted} />
                        </View>
                        <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor={COLORS.textMuted} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={t => { setEmail(t); clearError(); }} onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)} />
                    </View>

                    <View style={[styles.inputGroup, focusedInput === 'password' && styles.inputFocused]}>
                        <View style={styles.inputIcon}>
                            <Ionicons name="lock-closed-outline" size={16} color={focusedInput === 'password' ? COLORS.primary : COLORS.textMuted} />
                        </View>
                        <TextInput style={[styles.input, { flex: 1 }]} placeholder="Password" placeholderTextColor={COLORS.textMuted} secureTextEntry={!showPassword} value={password} onChangeText={t => { setPassword(t); clearError(); }} onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput(null)} />
                        <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {!isSignUp && (
                        <TouchableOpacity style={styles.forgotRow}>
                            <Text style={styles.forgot}>Forgot password?</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={[styles.mainBtn, loading && { opacity: 0.75 }]} onPress={handleAuth} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> :
                            <View style={styles.mainBtnInner}>
                                <Text style={styles.mainBtnText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
                                <Ionicons name="arrow-forward" size={18} color="#fff" />
                            </View>
                        }
                    </TouchableOpacity>

                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity style={[styles.googleBtn, googleLoading && { opacity: 0.75 }]} onPress={handleGoogle} disabled={googleLoading}>
                        {googleLoading ? <ActivityIndicator size="small" color={COLORS.text} /> :
                            <>
                                <View style={styles.googleIconBox}><Text style={styles.googleIcon}>G</Text></View>
                                <Text style={styles.googleText}>Continue with Google</Text>
                            </>
                        }
                    </TouchableOpacity>

                    {isSignUp && (
                        <Text style={styles.terms}>
                            By signing up you agree to our <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
                        </Text>
                    )}
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#05050A' },
    hero: { height: 400, backgroundColor: '#05050A', overflow: 'hidden', position: 'relative', alignItems: 'center', justifyContent: 'flex-end' },
    orb: { position: 'absolute', borderRadius: 999 },
    logoArea: { alignItems: 'center', paddingBottom: 28, zIndex: 10 },
    logoGlow: { position: 'absolute', bottom: 54, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(74,222,128,0.11)' },
    logoBox: { width: 68, height: 68, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    logoInner: { width: 36, height: 36, borderWidth: 2, borderColor: '#fff', borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    logoDot: { width: 14, height: 14, backgroundColor: COLORS.accent, borderRadius: 4 },
    appName: { fontSize: 26, fontWeight: '700', color: '#fff', letterSpacing: 7, marginBottom: 5 },
    tagline: { fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 16, letterSpacing: 0.5 },
    pills: { flexDirection: 'row', gap: 6 },
    pill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)' },
    pillText: { fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
    form: { backgroundColor: COLORS.background, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 28, minHeight: 500 },
    tabToggle: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: RADIUS.full, padding: 4, marginBottom: 18, borderWidth: 0.5, borderColor: COLORS.border },
    tabBtn: { flex: 1, paddingVertical: 10, borderRadius: RADIUS.full, alignItems: 'center' },
    tabBtnActive: { backgroundColor: COLORS.primary },
    tabBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
    tabBtnTextActive: { color: '#fff' },
    formSub: { fontSize: 12, color: COLORS.textMuted, marginBottom: 16, textAlign: 'center', lineHeight: 18 },
    errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#dc2626', borderRadius: RADIUS.md, padding: 12, marginBottom: 14 },
    errorText: { flex: 1, color: '#fff', fontSize: 13, fontWeight: '500' },
    inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, marginBottom: 12 },
    inputFocused: { borderColor: COLORS.primary, borderWidth: 1.5 },
    inputIcon: { width: 44, alignItems: 'center', justifyContent: 'center', borderRightWidth: 0.5, borderRightColor: COLORS.border, paddingVertical: 14 },
    input: { flex: 1, paddingHorizontal: 12, paddingVertical: 14, fontSize: 14, color: COLORS.text },
    eyeBtn: { padding: 14 },
    forgotRow: { alignItems: 'flex-end', marginBottom: 16, marginTop: -4 },
    forgot: { fontSize: 12, color: COLORS.success, fontWeight: '500' },
    mainBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: 16, alignItems: 'center', marginBottom: 20, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8 },
    mainBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    mainBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
    dividerLine: { flex: 1, height: 0.5, backgroundColor: COLORS.border },
    dividerText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500' },
    googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 13, backgroundColor: COLORS.white, marginBottom: 20 },
    googleIconBox: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#4285F4', alignItems: 'center', justifyContent: 'center' },
    googleIcon: { fontSize: 14, fontWeight: '700', color: '#fff' },
    googleText: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
    terms: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18 },
    termsLink: { color: COLORS.success, fontWeight: '500' },
});