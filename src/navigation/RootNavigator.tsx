import React, { Suspense, lazy } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/splash/SplashScreen';

const MainTabNavigator = lazy(() => import('./MainTabNavigator'));
const DashboardStack = lazy(() => import('./DashboardStack'));
const AuthStack = lazy(() => import('./AuthStack'));
const BusinessDetailScreen = lazy(() => import('../screens/main/BusinessDetailScreen'));
const ExpertQuoteScreen = lazy(() => import('../screens/main/ExpertQuoteScreen'));
const SettingsScreen = lazy(() => import('../screens/main/SettingsScreen'));
const WriteReviewScreen = lazy(() => import('../screens/main/WriteReviewScreen'));
const BroadcastScreen = lazy(() => import('../screens/main/BroadcastScreen'));
const CategoriesScreen = lazy(() => import('../screens/main/CategoriesScreen'));
const CitiesScreen = lazy(() => import('../screens/main/CitiesScreen'));
const SearchResultsScreen = lazy(() => import('../screens/main/SearchResultsScreen'));
const EventsScreen = lazy(() => import('../screens/main/EventsScreen'));
const DeleteAccountScreen = lazy(() => import('../screens/main/DeleteAccountScreen'));
const AboutScreen = lazy(() => import('../screens/main/AboutScreen'));
const ContactScreen = lazy(() => import('../screens/main/ContactScreen'));
const CategoryDetailScreen = lazy(() => import('../screens/main/CategoryDetailScreen'));
const CityDetailScreen = lazy(() => import('../screens/main/CityDetailScreen'));

function LoadingFallback() {
  return (
    <View style={{ flex: 1, backgroundColor: '#112D4E', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#FF7A30" />
    </View>
  );
}

const RootStack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Suspense fallback={<LoadingFallback />}>
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
      </Suspense>
    </NavigationContainer>
  );
}
