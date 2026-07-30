import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image, StyleSheet, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuthStore } from '../../stores/authStore';
import { googleLogin } from '../../hooks/useGoogleAuth';

export default function LoginScreen({ navigation, route }: any) {
  const redirectScreen = route?.params?.redirectScreen;
  const redirectParams = route?.params?.redirectParams;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    Keyboard.dismiss();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      await login({ email: email.trim(), password });

      if (redirectScreen) {
        navigation.replace(redirectScreen, redirectParams || {});
      } else {
        navigation.getParent()?.navigate('Main');
      }
    } catch (error: any) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || error.response?.data?.error;

      if (status === 401) {
        setErrorMsg(msg || 'Invalid email or password. Please try again.');
      } else if (status === 404) {
        setErrorMsg('Account not found. Please register first.');
      } else if (status === 0 || !error.response) {
        setErrorMsg('Cannot reach server. Check your internet connection.');
      } else {
        setErrorMsg(msg || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://naampata.com/logo.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to manage your NAAMPATA account.</Text>
        </View>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Icon name="error-outline" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <View style={styles.inputRow}>
          <Icon name="email" size={22} color="#94A3B8" />
          <TextInput
            placeholder="Email Address"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#CBD5E1"
            editable={!loading}
          />
        </View>

        <View style={styles.inputRow}>
          <Icon name="lock" size={22} color="#94A3B8" />
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#CBD5E1"
            editable={!loading}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.loginBtnText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={async () => {
              setGoogleLoading(true);
              try {
                await googleLogin();
              } catch (error) {
                console.warn('Google login failed:', error);
              } finally {
                setGoogleLoading(false);
              }
            }}
            disabled={loading || googleLoading}
            activeOpacity={0.8}
          >
            {googleLoading ? (
              <ActivityIndicator color="#4285F4" size="small" />
            ) : (
              <>
                <View style={styles.googleIcon}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  inner: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
  header: { marginBottom: 30 },
  logo: { width: 48, height: 48, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '900', color: '#112D4E', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#64748B' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2',
    borderWidth: 1, borderColor: '#FECACA', borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { color: '#DC2626', fontSize: 13, marginLeft: 8, flex: 1 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 14,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  input: { flex: 1, marginLeft: 12, fontSize: 16, color: '#1E293B' },
  loginBtn: {
    backgroundColor: '#112D4E', paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', marginBottom: 14, marginTop: 6,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  forgotText: { color: '#FF7A30', fontSize: 14, fontWeight: '600', textAlign: 'right', marginBottom: 24 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { paddingHorizontal: 14, color: '#94A3B8', fontSize: 13, fontWeight: '500' },
  socialRow: { marginBottom: 30 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 14,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  googleIcon: {
    width: 22, height: 22, borderRadius: 4, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0',
  },
  googleIconText: { fontWeight: '900', fontSize: 16, color: '#4285F4' },
  googleBtnText: { color: '#334155', fontSize: 16, fontWeight: '600', marginLeft: 10 },
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  registerText: { color: '#64748B', fontSize: 14 },
  registerLink: { color: '#FF7A30', fontSize: 14, fontWeight: '700' },
});
