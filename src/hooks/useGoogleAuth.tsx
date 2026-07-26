import React from 'react';
import { Alert, Platform } from 'react-native';
import { useAuthStore } from '../stores/authStore';

const GOOGLE_WEB_CLIENT_ID = '726476736350-o9j27vqrl98bde2brjt9va0n7149600k.apps.googleusercontent.com';

let GoogleSignin: any = null;
let statusCodes: any = null;
let googleSigninAvailable = false;

try {
  const gs = require('@react-native-google-signin/google-signin');
  GoogleSignin = gs.GoogleSignin;
  statusCodes = gs.statusCodes;
  googleSigninAvailable = true;
} catch (e) {
  console.warn('[GoogleSignIn] Module not available:', e);
  googleSigninAvailable = false;
}

export const configureGoogleSignIn = () => {
  if (!googleSigninAvailable || !GoogleSignin) return;
  try {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      scopes: ['profile', 'email'],
    });
  } catch (e) {
    console.warn('[GoogleSignIn] Configure failed:', e);
  }
};

export const googleLogin = async () => {
  if (!googleSigninAvailable || !GoogleSignin) {
    Alert.alert('Google Sign-In Not Available', 'Please use email and password to sign in.');
    return null;
  }

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo.data?.idToken;

    if (!idToken) {
      throw new Error('No ID token received from Google.');
    }

    const { googleLogin: storeGoogleLogin } = useAuthStore.getState();
    await storeGoogleLogin(idToken);
    return userInfo.data;
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return null;
    }
    if (error.code === statusCodes.IN_PROGRESS) {
      return null;
    }
    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      Alert.alert('Play Services Required', 'Please update Google Play Services to use Google Sign-In.');
      return null;
    }
    if (String(error.message || '').includes('DEVELOPER_ERROR') || String(error.code || '') === '10') {
      Alert.alert(
        'Google Sign-In Not Available',
        'Google login is not yet configured for this app build. Please use email and password to sign in.'
      );
      return null;
    }
    console.error('[GoogleSignIn] Error:', error);
    Alert.alert('Sign-In Error', 'Google sign-in failed. Please try email and password instead.');
    return null;
  }
};

export const googleLogout = async () => {
  if (!googleSigninAvailable || !GoogleSignin) return;
  try {
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
  } catch (error) {
    console.warn('[GoogleSignIn] Logout error:', error);
  }
};
