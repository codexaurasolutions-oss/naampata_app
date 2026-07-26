import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView, Modal, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuthStore } from '../../stores/authStore';
import { googleLogin } from '../../hooks/useGoogleAuth';
import FadeInView from '../../components/FadeInView';

const COUNTRY_CODES = [
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
];

export default function RegisterScreen({ navigation }: any) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register } = useAuthStore();

  const handleRegister = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter a password.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      Alert.alert('Weak Password', 'Password must contain uppercase, lowercase, number, and special character.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (!agreedToTerms) {
      Alert.alert('Error', 'You must agree to the Terms & Conditions.');
      return;
    }

    const fullPhone = `${selectedCountry.code}${phone.replace(/^0+/, '')}`;

    setLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: fullPhone,
        password,
      });
      Alert.alert('Registration Successful', 'Please check your email for a verification code.', [
        { text: 'Verify Now', onPress: () => navigation.navigate('VerifyEmail', { email }) },
      ]);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    try {
      await googleLogin();
    } catch (error: any) {
      console.warn('Google register failed:', error);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <FadeInView delay={0} direction="up">
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Text style={{ fontSize: 34, fontWeight: '900', color: '#0F172A', marginBottom: 8 }}>Join Naampata</Text>
            <Text style={{ color: '#64748B', fontWeight: '500', textAlign: 'center', paddingHorizontal: 16 }}>
              One account to browse local businesses or list your own when you are ready.
            </Text>
          </View>
        </FadeInView>

        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9', padding: 24, marginBottom: 24 }}>
          <FadeInView delay={80} direction="up">
            <View style={{ marginBottom: 16 }}>
              <Text style={s.label}>FULL NAME</Text>
              <View style={s.inputBox}>
                <Icon name="person" size={20} color="#CBD5E1" />
                <TextInput
                  placeholder="Enter your full name"
                  style={s.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
          </FadeInView>

          <FadeInView delay={140} direction="up">
            <View style={{ marginBottom: 16 }}>
              <Text style={s.label}>PHONE NUMBER</Text>
              <View style={s.inputBox}>
                <Icon name="phone" size={20} color="#CBD5E1" />
                <TouchableOpacity
                  style={s.countryPicker}
                  onPress={() => setShowCountryPicker(true)}
                >
                  <Text style={s.countryFlag}>{selectedCountry.flag}</Text>
                  <Text style={s.countryCode}>{selectedCountry.code}</Text>
                  <Icon name="arrow-drop-down" size={18} color="#64748B" />
                </TouchableOpacity>
                <TextInput
                  placeholder="3001234567"
                  style={[s.input, { marginLeft: 8 }]}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  placeholderTextColor="#94A3B8"
                  maxLength={15}
                />
              </View>
            </View>
          </FadeInView>

          <FadeInView delay={200} direction="up">
            <View style={{ marginBottom: 16 }}>
              <Text style={s.label}>EMAIL ADDRESS</Text>
              <View style={s.inputBox}>
                <Icon name="mail" size={20} color="#CBD5E1" />
                <TextInput
                  placeholder="name@example.com"
                  style={s.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
          </FadeInView>

          <FadeInView delay={260} direction="up">
            <View style={{ marginBottom: 16 }}>
              <Text style={s.label}>PASSWORD</Text>
              <View style={s.inputBox}>
                <Icon name="lock" size={20} color="#CBD5E1" />
                <TextInput
                  placeholder="At least 8 characters"
                  style={s.input}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor="#94A3B8"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon name={showPassword ? "visibility" : "visibility-off"} size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>
          </FadeInView>

          <FadeInView delay={320} direction="up">
            <View style={{ marginBottom: 24 }}>
              <Text style={s.label}>RE-TYPE PASSWORD</Text>
              <View style={s.inputBox}>
                <Icon name="lock" size={20} color="#CBD5E1" />
                <TextInput
                  placeholder="Re-type your password"
                  style={s.input}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholderTextColor="#94A3B8"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Icon name={showConfirmPassword ? "visibility" : "visibility-off"} size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>
          </FadeInView>

          <FadeInView delay={360} direction="up">
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingLeft: 4 }}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              activeOpacity={0.7}
            >
              <View style={[s.checkbox, agreedToTerms && s.checkboxChecked]}>
                {agreedToTerms && <Icon name="check" size={14} color="#FFF" />}
              </View>
              <Text style={{ color: '#64748B', fontWeight: '500', fontSize: 12, flex: 1, marginLeft: 12 }}>
                I agree to the <Text style={{ color: '#FF7A30', fontWeight: '700' }}>Terms & Conditions</Text> and <Text style={{ color: '#FF7A30', fontWeight: '700' }}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
          </FadeInView>

          <FadeInView delay={400} direction="up">
            <TouchableOpacity
              style={[s.createButton, (!fullName || !email || !password || !confirmPassword || !phone || !agreedToTerms) && { backgroundColor: '#CBD5E1' }]}
              onPress={handleRegister}
              disabled={loading || !fullName || !email || !password || !confirmPassword || !phone || !agreedToTerms}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 15, marginRight: 8 }}>Create Account</Text>
                  <Icon name="arrow-forward" size={18} color="#FFF" />
                </>
              )}
            </TouchableOpacity>
          </FadeInView>

          <FadeInView delay={440} direction="up">
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, marginTop: 8 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
              <Text style={{ paddingHorizontal: 16, color: '#94A3B8', fontSize: 14, fontWeight: '500' }}>or continue with</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
            </View>
          </FadeInView>

          <FadeInView delay={480} direction="up">
            <TouchableOpacity
              style={s.googleButton}
              onPress={handleGoogleRegister}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator color="#FF7A30" />
              ) : (
                <>
                  <View style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <Text style={{ fontWeight: '900', fontSize: 16, color: '#4285F4' }}>G</Text>
                  </View>
                  <Text style={{ color: '#334155', fontWeight: '700', fontSize: 16, marginLeft: 12 }}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>
          </FadeInView>

          <FadeInView delay={520} direction="up">
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
              <Text style={{ color: '#64748B', fontWeight: '700', fontSize: 14 }}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={{ color: '#FF7A30', fontWeight: '700', fontSize: 14 }}>Log in here</Text>
              </TouchableOpacity>
            </View>
          </FadeInView>
        </View>
      </ScrollView>

      <Modal visible={showCountryPicker} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#0F172A' }}>Select Country Code</Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <Icon name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC', backgroundColor: selectedCountry.code === item.code ? '#FFF7ED' : '#FFFFFF' }}
                  onPress={() => { setSelectedCountry(item); setShowCountryPicker(false); }}
                >
                  <Text style={{ fontSize: 24, marginRight: 12 }}>{item.flag}</Text>
                  <Text style={{ flex: 1, fontWeight: '600', color: '#1E293B', fontSize: 15 }}>{item.country}</Text>
                  <Text style={{ fontWeight: '700', color: '#FF7A30', fontSize: 15 }}>{item.code}</Text>
                  {selectedCountry.code === item.code && <Icon name="check" size={20} color="#FF7A30" style={{ marginLeft: 8 }} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, marginLeft: 4 },
  inputBox: { backgroundColor: '#F8FAFC', flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  input: { flex: 1, marginLeft: 12, color: '#0F172A', fontWeight: '700', fontSize: 16 },
  countryPicker: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#E2E8F0', marginRight: 4 },
  countryFlag: { fontSize: 18, marginRight: 4 },
  countryCode: { fontWeight: '700', color: '#1E293B', fontSize: 14, marginRight: 2 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#FF7A30', borderColor: '#FF7A30' },
  createButton: { backgroundColor: '#112D4E', paddingVertical: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  googleButton: { backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
});
