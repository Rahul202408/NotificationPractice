import React from 'react';
import { useEffect, useState } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import {
  getMessaging,
  requestPermission,
  getToken,
  onTokenRefresh,
  onMessage,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';

function App() {
  const messagingInstance = getMessaging();

  useEffect(() => {
    let unsubscribeOnMessage: (() => void) | undefined;
    let unsubscribeOnTokenRefresh: (() => void) | undefined;

    const setupNotifications = async () => {
      try {
        // 1. Create Android notification channel
        await notifee.createChannel({
          id: 'default',
          name: 'Default Notifications',
          importance: 4,
        });

        // 2. Request notification permission
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Notification permission denied');
            return;
          }
        } else if (Platform.OS === 'ios') {
          const status = await requestPermission(messagingInstance);

          if (
            status !== AuthorizationStatus.AUTHORIZED &&
            status !== AuthorizationStatus.PROVISIONAL
          ) {
            console.log('Notification permission denied');
            return;
          }
        }

        // 3. Get FCM token
        const token = await getToken(messagingInstance);
        console.log('FCM Token:', token);

        // 4. Listen for token refresh
        unsubscribeOnTokenRefresh = onTokenRefresh(
          messagingInstance,
          newToken => {
            console.log('New FCM Token:', newToken);
          },
        );

        // 5. Listen for foreground messages
        unsubscribeOnMessage = onMessage(
          messagingInstance,
          async remoteMessage => {
            console.log('Foreground message:', remoteMessage);

            await notifee.displayNotification({
              title:
                remoteMessage.notification?.title ??
                remoteMessage.data?.title?.toString() ??
                'New Notification',
              body:
                remoteMessage.notification?.body ??
                remoteMessage.data?.body?.toString() ??
                'You received a new message!',
              android: {
                channelId: 'default',
                pressAction: {
                  id: 'default',
                },
              },
            });
          },
        );
      } catch (error) {
        console.error('Notification setup error:', error);
      }
    };

    setupNotifications();

    return () => {
      unsubscribeOnMessage?.();
      unsubscribeOnTokenRefresh?.();
    };
  }, [messagingInstance]);

  const checkPermission = async () => {
    const authStatus = await requestPermission(messagingInstance);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      getFcmToken();
    }
  };

  const getFcmToken = async () => {
    const fcmToken = await getToken(messagingInstance);

    if (fcmToken) {
      console.log('TOKEEENEENN ---> ', fcmToken);
    } else {
      console.log('Failed', 'No token received');
    }
  };

  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Notification permission granted (Android)');
      } else {
        console.log('Notification permission denied (Android)');
      }
    } else if (Platform.OS === 'ios') {
      const authStatus = await requestPermission(messagingInstance);
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        console.log('Notification permission granted (iOS)');
      } else {
        console.log('Notification permission denied (iOS)');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#F5F7FF" barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>🔔</Text>
          <Text style={styles.title}>NotifyLab</Text>
          <Text style={styles.subtitle}>Notification Practice App</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back! 👋</Text>
          <Text style={styles.cardSubtitle}>
            Learn and practice notifications with a simple interface.
          </Text>

          <View style={styles.status}>
            <View style={styles.dot} />
            <Text style={styles.statusText}>UI Ready for Practice</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Notification Features</Text>

        <TouchableOpacity style={styles.featureCard}>
          <View style={[styles.iconBox, { backgroundColor: '#EDE9FE' }]}>
            <Text style={styles.icon}>🔔</Text>
          </View>
          <View style={styles.featureInfo}>
            <Text style={styles.featureTitle}>Instant Notification</Text>
            <Text style={styles.featureSubtitle}>
              Practice basic notifications
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureCard}>
          <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
            <Text style={styles.icon}>⏰</Text>
          </View>
          <View style={styles.featureInfo}>
            <Text style={styles.featureTitle}>Scheduled Notification</Text>
            <Text style={styles.featureSubtitle}>
              Learn time-based notifications
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureCard}>
          <View style={[styles.iconBox, { backgroundColor: '#D1FAE5' }]}>
            <Text style={styles.icon}>🛡️</Text>
          </View>
          <View style={styles.featureInfo}>
            <Text style={styles.featureTitle}>Notification Permission</Text>
            <Text style={styles.featureSubtitle}>
              Understand Android permissions
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Learning Tip</Text>
          <Text style={styles.tipText}>
            Start with basic notifications, then learn scheduling and
            permissions step by step.
          </Text>
        </View>

        <Text style={styles.footer}>Built with React Native CLI</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  content: {
    padding: 20,
    paddingBottom: 35,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 25,
  },
  logo: {
    fontSize: 42,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#171B34',
  },
  subtitle: {
    fontSize: 14,
    color: '#7A8199',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#4F46E5',
    padding: 23,
    borderRadius: 22,
    marginBottom: 28,
  },
  cardTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    lineHeight: 21,
    marginTop: 9,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 7,
  },
  statusText: {
    color: '#3730A3',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#171B34',
    marginBottom: 15,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 17,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#EAECF5',
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  featureInfo: {
    flex: 1,
    marginLeft: 13,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#171B34',
  },
  featureSubtitle: {
    fontSize: 11,
    color: '#858BA0',
    marginTop: 5,
  },
  arrow: {
    fontSize: 27,
    color: '#A1A6B8',
    marginLeft: 5,
  },
  tipCard: {
    backgroundColor: '#EDE9FE',
    padding: 18,
    borderRadius: 17,
    marginTop: 13,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4338CA',
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#5B5680',
    marginTop: 8,
  },
  footer: {
    textAlign: 'center',
    color: '#969BB0',
    fontSize: 12,
    marginTop: 25,
  },
});

export default App;
