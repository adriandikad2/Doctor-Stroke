import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as api from '../services/api';

// Match theme dari LandingScreen
const COLORS = {
  primary: '#8385CC',
  blue: '#68A1D1',
  teal: '#79AEB3',
  lavender: '#B199C7',
  bgLight: '#f0f6fb',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#64748b',
  lightGray: '#e2e8f0',
  error: '#ef4444'
};

export default function SignUpForm({ onClose, inline = false }) {
  const [mode, setMode] = useState('signup'); // 'signup' or 'login'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Validation', 'Email is required');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Validation', 'Password is required');
      return false;
    }
    if (!isLogin && password.length < 6) {
      Alert.alert('Validation', 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      let res;
      if (isLogin) {
        res = await api.login({ email, password });
      } else {
        res = await api.signUp({ name, email, password, source: 'expo-landing' });
      }
      
      setLoading(false);
      const successMsg = isLogin ? 'Login successful!' : 'Account created successfully!';
      Alert.alert('Success', res.message || successMsg, [
        { text: 'OK', onPress: onClose }
      ]);
      
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', err.message || String(err));
    }
  };

  const toggleMode = () => {
    setMode(isLogin ? 'signup' : 'login');
    // Reset password when switching modes
    setPassword('');
  };

  const renderForm = () => (
    <View style={[styles.card, inline && styles.inlineCard]}>
      {/* Header with gradient accent */}
      <View style={styles.headerAccent} />
      
      <View style={styles.cardContent}>
        <Text style={styles.title}>
          {isLogin ? 'Welcome back' : 'Get started'}
        </Text>
        <Text style={styles.subtitle}>
          {isLogin 
            ? 'Sign in to access your account' 
            : 'Create an account to access Doctor Stroke'}
        </Text>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name (optional)</Text>
              <TextInput
                placeholder="Enter your name"
                style={styles.input}
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              placeholder="your.email@example.com"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              placeholder="Enter password"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
            {!isLogin && (
              <Text style={styles.helperText}>Minimum 6 characters</Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.btn, styles.primaryBtn]}
            onPress={submit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.primaryBtnText}>
                {isLogin ? 'Sign In' : 'Sign Up'}
              </Text>
            )}
          </TouchableOpacity>

          {!inline && onClose && (
            <TouchableOpacity
              style={[styles.btn, styles.secondaryBtn]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Toggle Mode */}
        <View style={styles.toggleSection}>
          <Text style={styles.toggleText}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </Text>
          <TouchableOpacity onPress={toggleMode} disabled={loading}>
            <Text style={styles.toggleLink}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Decorative element */}
        <View style={styles.decorativeCircle} />
      </View>
    </View>
  );

  if (inline) {
    return (
      <View style={styles.inlineContainer}>
        {renderForm()}
        <View style={styles.inlineFooter}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Doctor Stroke — Group 7
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      {renderForm()}
    </View>
  );
}

const styles = StyleSheet.create({
  // Overlay & Container
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  inlineContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.bgLight
  },

  // Card
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10
  },
  inlineCard: {
    shadowOpacity: 0.1
  },
  
  // Header Accent
  headerAccent: {
    height: 6,
    background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.blue}, ${COLORS.teal})`,
    backgroundColor: COLORS.primary // fallback for React Native
  },

  // Card Content
  cardContent: {
    padding: 28,
    position: 'relative'
  },

  // Typography
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 8,
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.gray,
    marginBottom: 28,
    lineHeight: 22
  },

  // Form
  formContainer: {
    marginBottom: 24
  },
  inputGroup: {
    marginBottom: 18
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
    letterSpacing: 0.2
  },
  input: {
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.black,
    backgroundColor: COLORS.white,
    transition: 'border-color 0.2s'
  },
  helperText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 6,
    marginLeft: 4
  },

  // Buttons
  actionSection: {
    gap: 12
  },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50
  },
  primaryBtn: {
    backgroundColor: COLORS.blue,
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.lightGray
  },
  secondaryBtnText: {
    color: COLORS.gray,
    fontSize: 15,
    fontWeight: '700'
  },

  // Toggle Mode
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 6
  },
  toggleText: {
    fontSize: 14,
    color: COLORS.gray
  },
  toggleLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '800',
    textDecorationLine: 'underline'
  },

  // Decorative
  decorativeCircle: {
    position: 'absolute',
    right: -60,
    bottom: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.lavender,
    opacity: 0.08
  },

  // Footer
  inlineFooter: {
    paddingVertical: 24,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 13,
    color: COLORS.gray,
    opacity: 0.7
  }
});