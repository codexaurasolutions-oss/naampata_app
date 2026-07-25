import { useEffect } from 'react';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { Alert } from 'react-native';

export const usePushNotifications = () => {
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!user || !token) return;

    const requestPermission = async () => {
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('[FCM] Permission granted');
          getToken();
        } else {
          console.log('[FCM] Permission denied');
        }
      } catch (error) {
        console.error('[FCM] Permission error:', error);
      }
    };

    const getToken = async () => {
      try {
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
          console.log('[FCM] Token:', fcmToken);
          await api.users.updateDeviceToken(fcmToken);
        }
      } catch (error) {
        console.error('[FCM] Get token error:', error);
      }
    };

    requestPermission();

    const unsubscribeOnTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
      console.log('[FCM] Token refreshed:', newToken);
      await api.users.updateDeviceToken(newToken);
    });

    const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
      console.log('[FCM] Foreground message:', remoteMessage);
    });

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('[FCM] Background message:', remoteMessage);
    });

    return () => {
      unsubscribeOnTokenRefresh();
      unsubscribeOnMessage();
    };
  }, [user, token]);
};

export const initPushNotifications = async () => {
  try {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    console.log('[FCM] Initial token:', token);
    return token;
  } catch (error) {
    console.error('[FCM] Init error:', error);
  }
};