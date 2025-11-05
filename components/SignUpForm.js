import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as api from '../services/api';

export default function SignUpForm({ onClose, inline = false }){
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email) return Alert.alert('Validation', 'Email is required');
    setLoading(true);
    try {
      const res = await api.signUp({ name, email, source: 'expo-landing' });
      setLoading(false);
      Alert.alert('Success', res.message || 'Signup received', [{ text: 'OK', onPress: onClose }]);
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', err.message || String(err));
    }
  };

  // If inline, render without overlay and without Cancel button
  if (inline) {
    return (
      <View style={[styles.inlineCardContainer]}>
        <View style={[styles.card, styles.inlineCard]}>
          <Text style={styles.title}>Get started — create an account</Text>
          <Text style={styles.help}>Sign up to get access to the Doctor Stroke app.</Text>
          <TextInput placeholder="Full name (optional)" style={styles.input} value={name} onChangeText={setName} />
          <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

          <View style={styles.actionsInline}>
            <TouchableOpacity style={[styles.btn, styles.primary]} onPress={submit} disabled={loading}>
              {loading ? <ActivityIndicator color="white"/> : <Text style={styles.primaryText}>Sign up</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>Create an account</Text>
        <Text style={styles.help}>Sign up to get access to the Doctor Stroke app.</Text>
        <TextInput placeholder="Full name (optional)" style={styles.input} value={name} onChangeText={setName} />
        <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.ghost]} onPress={onClose} disabled={loading}>
            <Text style={styles.ghostText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.primary]} onPress={submit} disabled={loading}>
            {loading ? <ActivityIndicator color="white"/> : <Text style={styles.primaryText}>Sign up</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', left: 0, right:0, top:0, bottom:0, backgroundColor: 'rgba(0,0,0,0.35)', alignItems:'center', justifyContent:'center' },
  card: { width: '90%', maxWidth: 520, backgroundColor: '#f8fafc', borderRadius: 14, padding: 18, elevation: 8 },
  title: { fontSize: 20, fontWeight: '900', marginBottom: 6, color: '#8385CC' },
  help: { color: '#334155', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 10, marginBottom: 10 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  primary: { backgroundColor: '#68A1D1' },
  ghost: { borderWidth: 1, borderColor:'#8385CC', marginRight: 8, backgroundColor: 'transparent' },
  primaryText: { color: 'white', fontWeight: '800' },
  ghostText: { color: '#8385CC', fontWeight: '700' }
});
