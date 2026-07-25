import React, { useEffect } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { useAuthStore } from '../stores/authStore';

const GOOGLE_WEB_CLIENT_ID = '726476736350-o9j27vqrl98bde2brjt9va0n7149600k.apps.googleusercontent.com';

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
};

export const googleLogin = async () => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo.data?.idToken;

    if (!idToken) {
      Alert.alert('Error', 'No ID token received from Google.');
      return;
    }

    const { googleLogin: storeGoogleLogin } = useAuthStore.getState();
    await storeGoogleLogin(idToken);
    return userInfo.data;
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('[GoogleSignIn] User cancelled');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log('[GoogleSignIn] Sign in in progress');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      Alert.alert('Error', 'Google Play Services not available.');
    } else {
      console.error('[GoogleSignIn] Error:', error);
      Alert.alert('Error', error.message || 'Google sign-in failed.');
    }
  }
};

export const googleLogout = async () => {
  try {
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('[GoogleSignIn] Logout error:', error);
  }
};

export const GoogleSignInButton = ({ style, size, color, disabled, onPress }: any) => {
  return (
    <GoogleSigninButton
      style={style}
      size={size || GoogleSigninButton.Size.Wide}
      color={color || GoogleSigninButton.Color.Light}
      disabled={disabled}
      onPress={onPress}
    />
  );
};