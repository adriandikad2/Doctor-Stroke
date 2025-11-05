import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Platform, ScrollView, Alert } from 'react-native';
import * as api from '../services/api';
import SignUpForm from './SignUpForm';

// New theme palette
const COLORS = {
  primary: '#8385CC', // purple
  blue: '#68A1D1',
  teal: '#79AEB3',
  green: '#A4CEA9',
  lavender: '#B199C7',
  soft: '#E0BEE6', // soft accent
  bgLight: '#f0f6fb', // soft blue background
  white: '#FFFFFF',
  black: '#000000'
};

const LandingScreen = () => {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 900;

  const showPreview = !(isDesktop);
  const scrollRef = useRef(null);

  const handleSignUp = () => {
    // try native ScrollView.scrollToEnd
    try {
      if (scrollRef.current && typeof scrollRef.current.scrollToEnd === 'function') {
        scrollRef.current.scrollToEnd({ animated: true });
        return;
      }
      // fallback for web: attempt element scroll
      if (scrollRef.current && scrollRef.current.scrollTo) {
        // scroll to bottom
        // some refs on web expose the DOM node under .getScrollableNode()
        const node = scrollRef.current.getScrollableNode ? scrollRef.current.getScrollableNode() : scrollRef.current;
        if (node && node.scrollTo) {
          node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
          return;
        }
      }
    } catch (e) {
      // ignore and show alert below
    }
    Alert.alert('Sign up', 'Use the signup form below on this page.');
  };

  const handleLearnMore = async () => {
    try {
      const res = await api.getLandingInfo();
      const message = res && res.message ? res.message : 'Loaded info (mock).';
      Alert.alert('Info', message);
    } catch (err) {
      Alert.alert('Error', err.message || String(err));
    }
  };

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={[styles.container, { backgroundColor: COLORS.bgLight }]}> 
      <View style={[styles.header, isDesktop && styles.headerDesktop]}> 
        <View style={styles.brand}> 
          <View style={styles.brandMark} /> 
          <Text style={styles.logo}>Doctor Stroke</Text>
        </View>
        <View style={styles.nav}> 
          <Text style={styles.navItem}>Home</Text>
          <Text style={styles.navItem}>Modules</Text>
          <Text style={styles.navItem}>Team</Text>
          <TouchableOpacity onPress={handleSignUp} style={[styles.button, styles.primaryButton]}> 
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.hero, isDesktop && styles.heroDesktop]}> 
        <View style={styles.heroText}> 
          <Text style={styles.title}>Care, Coordinated.</Text>
          <Text style={styles.subtitle}>A modern platform to manage post‑stroke rehabilitation — scheduling, medication, and progress reporting in one place.</Text>

          <Text style={styles.paragraph}>Doctor Stroke reduces caregiver burden and helps clinicians make data‑driven decisions between visits.</Text>

          <View style={styles.bullets}> 
            <Text style={styles.bullet}>✅ Centralized schedules</Text>
            <Text style={styles.bullet}>✅ Automated medication reminders</Text>
            <Text style={styles.bullet}>✅ Real‑time progress & structured reports</Text>
          </View>

          <View style={styles.ctaRow}> 
        <TouchableOpacity onPress={() => Alert.alert('Sign up', 'Use the signup form below on this page.')} style={[styles.button, styles.primaryButton, styles.ctaPrimary]}> 
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLearnMore} style={[styles.button, styles.ghostButton, styles.ctaGhost]}> 
              <Text style={styles.buttonTextGhost}>Learn More</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showPreview && (
          <View style={styles.heroGraphicWrap}>
            <View style={styles.heroGraphic}>
              <Text style={styles.placeholderText}>App preview</Text>
            </View>
            <View style={styles.accentCircle} />
          </View>
        )}
  </View>

      <View style={styles.features}>
        <Text style={styles.sectionTitle}>Core Modules</Text>
        <View style={[styles.featureList, isDesktop && styles.featureListDesktop]}>
          <View style={[styles.featureCard, styles.featureCardElevated]}>
            <Text style={styles.featureIcon}>📅</Text>
            <Text style={styles.featureTitle}>Scheduling</Text>
            <Text style={styles.featureText}>Easily book and manage doctor and therapy sessions.</Text>
          </View>
          <View style={[styles.featureCard, styles.featureCardElevated]}>
            <Text style={styles.featureIcon}>💊</Text>
            <Text style={styles.featureTitle}>Medication</Text>
            <Text style={styles.featureText}>Automated reminders and adherence logging for caregivers.</Text>
          </View>
          <View style={[styles.featureCard, styles.featureCardElevated]}>
            <Text style={styles.featureIcon}>📈</Text>
            <Text style={styles.featureTitle}>Progress</Text>
            <Text style={styles.featureText}>Structured reports and therapy notes for clinicians.</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© {new Date().getFullYear()} Doctor Stroke — Group 7</Text>
      </View>
      {/* Inline signup section — kept on the same landing page */}
      <View style={styles.signupSection}>
        <SignUpForm inline />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
  header: { padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerDesktop: { paddingHorizontal: 80 },
  brand: { flexDirection: 'row', alignItems: 'center' },
  brandMark: { width: 14, height: 14, borderRadius: 6, backgroundColor: COLORS.primary, marginRight: 10 },
  logo: { fontSize: 20, fontWeight: '900', color: COLORS.primary },
  nav: { flexDirection: 'row', alignItems: 'center' },
  navItem: { marginHorizontal: 8, color: COLORS.black, opacity: 0.85 },
  button: { marginLeft: 12, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10 },
  primaryButton: { backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOpacity: 0.15, shadowRadius: 8 },
  ghostButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.primary },
  buttonText: { color: COLORS.white, fontWeight: '800' },
  buttonTextGhost: { color: COLORS.primary, fontWeight: '700' },

  hero: { padding: 28, alignItems: 'center' },
  heroDesktop: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 80 },
  heroText: { flex: 1, maxWidth: 680 },
  title: { fontSize: 36, fontWeight: '900', color: COLORS.primary, marginBottom: 10 },
  subtitle: { fontSize: 18, color: COLORS.black, marginBottom: 16, opacity: 0.85 },
  paragraph: { fontSize: 15, color: COLORS.black, marginBottom: 8, opacity: 0.9 },
  bullets: { marginTop: 8 },
  bullet: { fontSize: 15, color: COLORS.black, marginBottom: 6 },
  ctaRow: { flexDirection: 'row', marginTop: 16 },
  ctaPrimary: { paddingHorizontal: 20 },
  ctaGhost: { marginLeft: 12, paddingHorizontal: 18 },

  heroGraphicWrap: { width: 360, height: 360, alignItems: 'center', justifyContent: 'center' },
  heroGraphic: { width: 320, height: 420, borderRadius: 20, backgroundColor: COLORS.card || COLORS.white, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 6 },
  placeholderText: { color: '#59636b' },
  accentCircle: { position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: COLORS.lavender, opacity: 0.12 },

  features: { padding: 28 },
  sectionTitle: { fontSize: 20, fontWeight: '900', marginBottom: 14, color: COLORS.black },
  featureList: { flexDirection: 'column' },
  featureListDesktop: { flexDirection: 'row', justifyContent: 'space-between' },
  featureCard: { backgroundColor: 'rgba(255,255,255,0.98)', padding: 20, borderRadius: 14, marginBottom: 12, flex: 1, marginHorizontal: 8 },
  featureCardElevated: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 },
  featureIcon: { fontSize: 28, marginBottom: 8 },
  featureTitle: { fontSize: 16, fontWeight: '900', marginBottom: 8, color: COLORS.primary },
  featureText: { color: COLORS.black, opacity: 0.9 },

  footer: { padding: 28, alignItems: 'center' },
  footerText: { color: COLORS.black, opacity: 0.7 }
});

export default LandingScreen;
