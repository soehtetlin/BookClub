import React from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts } from '../../constants/theme';
import { Button } from '../../components/Button';

export default function LandingScreen() {
  const router = useRouter();

  const features = [
    { icon: '✨', title: 'Create sessions instantly', desc: 'Add title, author, chapters, and cover. Ready in seconds.' },
    { icon: '🔗', title: 'Share a single link', desc: 'No complex invites. Send the link and anyone can join.' },
    { icon: '📊', title: 'Track progress privately', desc: 'Update your chapters. Others only see aggregate stats.' },
    { icon: '💬', title: 'One cozy thread', desc: 'A flat, chronological thread. Simple and focused.' },
    { icon: '👥', title: 'Up to 5,000 readers', desc: 'Perfect for large read-alongs or small groups.' },
  ];

  const steps = [
    { num: '1', title: 'Create session', desc: 'Publish details of your book.' },
    { num: '2', title: 'Share link', desc: 'Send it to your reading group.' },
    { num: '3', title: 'Read & discuss', desc: 'Track chapters and chat.' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.paper} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Community reading made simple</Text>
          </View>

          <Text style={styles.heroTitle}>
            Read together,{'\n'}
            <Text style={styles.heroTitleAccent}>discuss together</Text>
          </Text>

          <Text style={styles.heroDesc}>
            Create reading sessions for any book, invite friends with a link,
            track your progress privately, and share thoughts in one cozy thread.
          </Text>

          <View style={styles.authActions}>
            <Button
              onPress={() => router.push('/signup')}
              style={styles.signupBtn}
            >
              Create free account
            </Button>
            <Button
              variant="secondary"
              onPress={() => router.push('/login')}
              style={styles.loginBtn}
            >
              Sign in
            </Button>
          </View>
        </View>

        {/* Stats banner */}
        <View style={styles.statsBanner}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5,000</Text>
            <Text style={styles.statLabel}>Max readers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>∞</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>Free</Text>
            <Text style={styles.statLabel}>Forever</Text>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Everything your book club needs</Text>
          <Text style={styles.sectionSubtitle}>
            No complex setups, no subscriptions. Just start reading together.
          </Text>

          <View style={styles.featuresGrid}>
            {features.map((feature, idx) => (
              <View key={idx} style={styles.featureCard}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Steps Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get started in 3 steps</Text>

          <View style={styles.stepsContainer}>
            {steps.map((step, idx) => (
              <View key={idx} style={styles.stepItem}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNumber}>{step.num}</Text>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quote Section */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteEmoji}>📖</Text>
          <Text style={styles.quoteText}>
            "A reader lives a thousand lives before he dies. The man who never reads lives only one."
          </Text>
          <Text style={styles.quoteAuthor}>— George R.R. Martin</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 24,
    textAlign: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
    gap: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  badgeText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.accent,
  },
  heroTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 36,
    textAlign: 'center',
    color: Colors.ink,
    lineHeight: 44,
  },
  heroTitleAccent: {
    color: Colors.accent,
  },
  heroDesc: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    textAlign: 'center',
    color: Colors.inkMuted,
    lineHeight: 22,
    marginTop: 16,
    paddingHorizontal: 10,
  },
  authActions: {
    width: '100%',
    marginTop: 32,
    gap: 12,
  },
  signupBtn: {
    alignSelf: 'stretch',
  },
  loginBtn: {
    alignSelf: 'stretch',
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.paperDark,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 24,
    paddingVertical: 16,
    marginTop: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: Fonts.serifBold,
    fontSize: 22,
    color: Colors.accent,
  },
  statLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  section: {
    marginTop: 40,
  },
  sectionTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 22,
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 12,
  },
  featureTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 16,
    color: Colors.ink,
  },
  featureDesc: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.inkMuted,
    lineHeight: 18,
    marginTop: 6,
  },
  stepsContainer: {
    gap: 24,
    marginTop: 12,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  stepNumber: {
    color: Colors.card,
    fontFamily: Fonts.sansBold,
    fontSize: 14,
  },
  stepTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 16,
    color: Colors.ink,
  },
  stepDesc: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.inkMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  quoteCard: {
    backgroundColor: Colors.sage,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginTop: 40,
  },
  quoteEmoji: {
    fontSize: 28,
    marginBottom: 10,
  },
  quoteText: {
    fontFamily: Fonts.serifItalic,
    fontSize: 16,
    color: Colors.card,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.95,
  },
  quoteAuthor: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.card,
    marginTop: 12,
    opacity: 0.8,
  },
});
