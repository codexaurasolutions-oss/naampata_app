import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';
import DashboardStack from './DashboardStack';
import BusinessDetailScreen from '../screens/main/BusinessDetailScreen';
import ExpertQuoteScreen from '../screens/main/ExpertQuoteScreen';
import { useAuthStore } from '../stores/authStore';

import SplashScreen from '../screens/splash/SplashScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import WriteReviewScreen from '../screens/main/WriteReviewScreen';
import BroadcastScreen from '../screens/main/BroadcastScreen';
import CategoriesScreen from '../screens/main/CategoriesScreen';
import CitiesScreen from '../screens/main/CitiesScreen';
import SearchResultsScreen from '../screens/main/SearchResultsScreen';
import EventsScreen from '../screens/main/EventsScreen';
import DeleteAccountScreen from '../screens/main/DeleteAccountScreen';
import AboutScreen from '../screens/main/AboutScreen';
import ContactScreen from '../screens/main/ContactScreen';
import CategoryDetailScreen from '../screens/main/CategoryDetailScreen';
import CityDetailScreen from '../screens/main/CityDetailScreen';

const RootStack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Splash" component={SplashScreen} />
        <RootStack.Screen name="Main" component={MainTabNavigator} />
        <RootStack.Screen name="BusinessDetail" component={BusinessDetailScreen} />
        <RootStack.Screen name="WriteReview" component={WriteReviewScreen} />
        <RootStack.Screen name="Broadcast" component={BroadcastScreen} />
        <RootStack.Screen name="Categories" component={CategoriesScreen} />
        <RootStack.Screen name="Cities" component={CitiesScreen} />
        <RootStack.Screen name="ExpertQuote" component={ExpertQuoteScreen} />
        <RootStack.Screen name="SearchResults" component={SearchResultsScreen} />
        <RootStack.Screen name="Events" component={EventsScreen} />
        <RootStack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
        <RootStack.Screen name="About" component={AboutScreen} />
        <RootStack.Screen name="Contact" component={ContactScreen} />
        <RootStack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
        <RootStack.Screen name="CityDetail" component={CityDetailScreen} />
        <RootStack.Screen name="Auth" component={AuthStack} />
        <RootStack.Screen name="Dashboard" component={DashboardStack} />
        <RootStack.Screen name="Settings" component={SettingsScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
