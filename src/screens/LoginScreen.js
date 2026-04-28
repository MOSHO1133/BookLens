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

// 100% static book — zero animations, zero crashes
function StaticBook({ accent, left, top, scale = 1 }) {
  const bw = 52;
  const bh = 68;
  return (
    <View style={{
      position: 'absolute', left, top,
      transform: [{ scale }],
    }}>
      {/* Glow */}
      <View style={{
        position: 'absolute',
        top: -20, left: -20,
        width: bw + 40, height: bh + 40,
        borderRadius: 50,
        backgroundColor: accent,
        opacity: 0.18,
      }} />
      {/* Spine */}
      <View style={{
        position: 'absolute', top: 2, left: -5,
        width: 5, height: bh - 2,
        borderRadius: 2,
        backgroundColor: accent,
        opacity: 0.6,
      }} />
      {/* Cover */}
      <View style={{
        width: bw, height: bh,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: accent,
        backgroundColor: '#0d0d1a',
        overflow: 'hidden',
      }}>
        {/* Top bar */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: accent }} />
        {/* Bottom bar */}
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: accent, opacity: 0.5 }} />
        {/* Lines */}
        <View style={{ position: 'absolute', top: 14, left: 8, width: 28, height: 1, backgroundColor: accent, opacity: 0.6 }} />
        <View style={{ position: 'absolute', top: 22, left: 8, width: 36, height: 1, backgroundColor: accent, opacity: 0.5 }} />
        <View style={{ position: 'absolute', top: 30, left: 8, width: 20, height: 1, backgroundColor: accent, opacity: 0.4 }} />
        <View style={{ position: 'absolute', top: 38, left: 8, width: 32, height: 1, backgroundColor: accent, opacity: 0.5 }} />
        {/* Corner dots */}
        <View style={{ position: 'absolute', top: 5, left: 5, width: 3, height: 3, borderRadius: 2, backgroundColor: accent, opacity: 0.8 }} />
        <View style={{ position: 'absolute', top: 5, right: 5, width: 3, height: 3, borderRadius: 2, backgroundColor: accent, opacity: 0.8 }} />
        <View style={{ position: 'absolute', bottom: 5, left: 5, width: 3, height: 3, borderRadius: 2, backgroundColor: accent, opacity: 0.8 }} />
        <View style={{ position: 'absolute', bottom: 5, right: 5, width: 3, height: 3, borderRadius: 2, backgroundColor: accent, opacity: 0.8 }} />
        {/* Gloss */}
        <View style={{ position: 'absolute', top: 0, left: 0, width: 2, height: bh, backgroundColor: 'rgba(255,255,255,0.1)' }} />
      </View>
      {/* Shadow */}
      <View style={{
        position: 'absolute', bottom: -5, left: 4,
        width: bw - 8, height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(0,0,0,0.4)',
      }} />
    </View>
  );
}

function ErrorBanner({ message }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: message ? 1 : 0,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [message]);
  if (!message) return null;
  return (
    <Animated.View style={[
      styles.errorBanner,
      { opacity: anim, transform: [{ scale: anim }] }
    ]}>
      <Ionicons name="alert-circle" size={16} color="#fff" />
      <Text style={styles.errorText}>{message}</Text>
    </Animated.View>
  );
}

export default function LoginScreen({ navigation }) {
  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [name,          setName]          = useState('');
  const [isSignUp,      setIsSignUp]      = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword,  setShowPassword]  = useState(false);
  const [errorMsg,      setErrorMsg]      = useState('');
  const [focusedInput,  setFocusedInput]  = useState(null);

  const formAnim    = useRef(new Animated.Value(40)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(logoScale,   { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(formOpacity, { toValue: 1, duration: 600, delay: 300, useNativeDriver: true }),
      Animated.timing(formAnim,    { toValue: 0, duration: 600, delay: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, []);

  const clearError = () => setErrorMsg('');

  const getFriendlyError = (msg) => {
    if (msg.includes('Invalid login credentials')) return 'Incorrect email or password.';
    if (msg.includes('Email not confirmed'))       return 'Please confirm your email first.';
    if (msg.includes('User already registered'))   return 'An account already exists with this email.';
    if (msg.includes('Password should be at least')) return 'Password must be at least 6 characters.';
    if (msg.includes('Unable to validate email'))  return 'Please enter a valid email address.';
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
        const params        = new URLSearchParams(result.url.split('#')[1]);
        const access_token  = params.get('access_token');
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
    { accent: '#9333ea', left: 8,            top: 20,  scale: 0.78 },
    { accent: '#3b82f6', left: width * 0.72,  top: 8,   scale: 1.0  },
    { accent: '#10b981', left: width * 0.40,  top: 50,  scale: 0.82 },
    { accent: '#ef4444', left: width * 0.18,  top: 55,  scale: 0.70 },
    { accent: '#f59e0b', left: width * 0.58,  top: 60,  scale: 0.86 },
    { accent: '#06b6d4', left: width * 0.84,  top: 50,  scale: 0.68 },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          {/* Orbs */}
          <View style={[styles.orb, { width: 380, height: 380, top: -180, left: -120, backgroundColor: 'rgba(147,51,234,0.14)' }]} />
          <View style={[styles.orb, { width: 300, height: 300, top: -40,  right: -120, backgroundColor: 'rgba(6,182,212,0.1)' }]} />
          <View style={[styles.orb, { width: 220, height: 220, bottom: -60, left: -10, backgroundColor: 'rgba(16,185,129,0.08)' }]} />

          {/* Static books */}
          {books.map((b, i) => <StaticBook key={i} {...b} />)}

          {/* Logo */}
          <Animated.View style={[
            styles.logoArea,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] }
          ]}>
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
                { icon: 'flash',   label: 'AI Summaries' },
                { icon: 'library', label: '1000+ Books'  },
                { icon: 'time',    label: 'Save Hours'   },
              ].map((p) => (
                <View key={p.label} style={styles.pill}>
                  <Ionicons name={p.icon} size={9} color={COLORS.accent} />
                  <Text style={styles.pillText}>{p.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </View>

        {/* Form */}
        <Animated.View style={[
          styles.form,
          { opacity: formOpacity, transform: [{ translateY: formAnim }] }
        ]}>
          {/* Tab toggle */}
          <View style={styles.tabToggle}>
            <TouchableOpacity
              style={[styles.tabBtn, !isSignUp && styles.tabBtnActive]}
              onPress={() => { setIsSignUp(false); clearError(); }}
            >
              <Text style={[styles.tabBtnText, !isSignUp && styles.tabBtnTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, isSignUp && styles.tabBtnActive]}
              onPress={() => { setIsSignUp(true); clearError(); }}
            >
              <Text style={[styles.tabBtnText, isSignUp && styles.tabBtnTextActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.formSub}>
            {isSignUp
              ? 'Create your free account and start reading smarter'
              : 'Welcome back! Sign in to continue reading'}
          </Text>

          <ErrorBanner message={errorMsg} />

          {isSignUp && (
            <View style={[styles.inputGroup, focusedInput === 'name' && styles.inputFocused]}>
              <View style={styles.inputIcon}>
                <Ionicons name="person-outline" size={16} color={focusedInput === 'name' ? COLORS.primary : COLORS.textMuted} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          )}

          <View style={[styles.inputGroup, focusedInput === 'email' && styles.inputFocused]}>
            <View style={styles.inputIcon}>
              <Ionicons name="mail-outline" size={16} color={focusedInput === 'email' ? COLORS.primary : COLORS.textMuted} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={t => { setEmail(t); clearError(); }}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          <View style={[styles.inputGroup, focusedInput === 'password' && styles.inputFocused]}>
            <View style={styles.inputIcon}>
              <Ionicons name="lock-closed-outline" size={16} color={focusedInput === 'password' ? COLORS.primary : COLORS.textMuted} />
            </View>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={t => { setPassword(t); clearError(); }}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          </View>

          {!isSignUp && (
            <TouchableOpacity style={styles.forgotRow}>
              <Text style={styles.forgot}>Forgot password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.mainBtn, loading && { opacity: 0.75 }]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <View style={styles.mainBtnInner}>
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

          <TouchableOpacity
            style={[styles.googleBtn, googleLoading && { opacity: 0.75 }]}
            onPress={handleGoogle}
            disabled={googleLoading}
          >
            {googleLoading
              ? <ActivityIndicator size="small" color={COLORS.text} />
              : <>
                  <View style={styles.googleIconBox}>
                    <Text style={styles.googleIcon}>G</Text>
                  </View>
                  <Text style={styles.googleText}>Continue with Google</Text>
                </>
            }
          </TouchableOpacity>

          {isSignUp && (
            <Text style={styles.terms}>
              By signing up you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#05050A' },
  hero:              { height: 380, backgroundColor: '#05050A', overflow: 'hidden', position: 'relative', alignItems: 'center', justifyContent: 'flex-end' },
  orb:               { position: 'absolute', borderRadius: 999 },
  logoArea:          { alignItems: 'center', paddingBottom: 26, zIndex: 10 },
  logoGlow:          { position: 'absolute', bottom: 52, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(74,222,128,0.1)' },
  logoBox:           { width: 66, height: 66, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoInner:         { width: 34, height: 34, borderWidth: 2, borderColor: '#fff', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logoDot:           { width: 13, height: 13, backgroundColor: COLORS.accent, borderRadius: 3 },
  appName:           { fontSize: 25, fontWeight: '700', color: '#fff', letterSpacing: 6, marginBottom: 5 },
  tagline:           { fontSize: 12, color: 'rgba(255,255,255,0.32)', marginBottom: 15, letterSpacing: 0.5 },
  pills:             { flexDirection: 'row', gap: 6 },
  pill:              { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)' },
  pillText:          { fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  form:              { backgroundColor: COLORS.background, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 28, minHeight: 500 },
  tabToggle:         { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: RADIUS.full, padding: 4, marginBottom: 18, borderWidth: 0.5, borderColor: COLORS.border },
  tabBtn:            { flex: 1, paddingVertical: 10, borderRadius: RADIUS.full, alignItems: 'center' },
  tabBtnActive:      { backgroundColor: COLORS.primary },
  tabBtnText:        { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  tabBtnTextActive:  { color: '#fff' },
  formSub:           { fontSize: 12, color: COLORS.textMuted, marginBottom: 16, textAlign: 'center', lineHeight: 18 },
  errorBanner:       { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#dc2626', borderRadius: RADIUS.md, padding: 12, marginBottom: 14 },
  errorText:         { flex: 1, color: '#fff', fontSize: 13, fontWeight: '500' },
  inputGroup:        { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, marginBottom: 12 },
  inputFocused:      { borderColor: COLORS.primary, borderWidth: 1.5 },
  inputIcon:         { width: 44, alignItems: 'center', justifyContent: 'center', borderRightWidth: 0.5, borderRightColor: COLORS.border, paddingVertical: 14 },
  input:             { flex: 1, paddingHorizontal: 12, paddingVertical: 14, fontSize: 14, color: COLORS.text },
  eyeBtn:            { padding: 14 },
  forgotRow:         { alignItems: 'flex-end', marginBottom: 16, marginTop: -4 },
  forgot:            { fontSize: 12, color: COLORS.success, fontWeight: '500' },
  mainBtn:           { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: 16, alignItems: 'center', marginBottom: 20, elevation: 4 },
  mainBtnInner:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mainBtnText:       { color: '#fff', fontSize: 15, fontWeight: '700' },
  dividerRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  dividerLine:       { flex: 1, height: 0.5, backgroundColor: COLORS.border },
  dividerText:       { fontSize: 11, color: COLORS.textMuted, fontWeight: '500' },
  googleBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 13, backgroundColor: COLORS.white, marginBottom: 20 },
  googleIconBox:     { width: 26, height: 26, borderRadius: 13, backgroundColor: '#4285F4', alignItems: 'center', justifyContent: 'center' },
  googleIcon:        { fontSize: 14, fontWeight: '700', color: '#fff' },
  googleText:        { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  terms:             { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18 },
  termsLink:         { color: COLORS.success, fontWeight: '500' },
});