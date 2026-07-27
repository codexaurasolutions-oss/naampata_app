import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthGuard from '../components/AuthGuard';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import AddListingWizard from '../screens/wizard/AddListingWizard';
import EditListingScreen from '../screens/dashboard/EditListingScreen';
import LeadsScreen from '../screens/dashboard/LeadsScreen';
import LeadDetailsScreen from '../screens/dashboard/LeadDetailsScreen';
import DealsScreen from '../screens/dashboard/DealsScreen';
import SubscriptionScreen from '../screens/dashboard/SubscriptionScreen';
import NotificationsScreen from '../screens/dashboard/NotificationsScreen';
import MessagesScreen from '../screens/dashboard/MessagesScreen';
import ChatScreen from '../screens/dashboard/ChatScreen';
import AffiliateScreen from '../screens/dashboard/AffiliateScreen';
import ReviewsScreen from '../screens/dashboard/ReviewsScreen';
import DemandScreen from '../screens/dashboard/DemandScreen';
import MyListingsScreen from '../screens/dashboard/MyListingsScreen';
import ManageOffersScreen from '../screens/dashboard/ManageOffersScreen';
import VendorBroadcastsScreen from '../screens/dashboard/VendorBroadcastsScreen';
import AnalyticsScreen from '../screens/dashboard/AnalyticsScreen';
import FollowingScreen from '../screens/dashboard/FollowingScreen';
import CommentsScreen from '../screens/dashboard/CommentsScreen';
import CustomerNotesScreen from '../screens/dashboard/CustomerNotesScreen';
import { useNavigation } from '@react-navigation/native';

const Dashboard = createNativeStackNavigator();

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation();
  return <AuthGuard navigation={navigation}>{children}</AuthGuard>;
}

export default function DashboardStack() {
  return (
    <DashboardGuard>
    <Dashboard.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#112D4E' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Dashboard.Screen
        name="DashboardHome"
        component={DashboardScreen}
        options={{ title: 'My Business' }}
      />
      <Dashboard.Screen
        name="AddListing"
        component={AddListingWizard}
        options={{ title: 'Add New Listing' }}
      />
      <Dashboard.Screen
        name="EditListing"
        component={EditListingScreen}
        options={{ headerShown: false }}
      />
      <Dashboard.Screen
        name="Leads"
        component={LeadsScreen}
        options={{ headerShown: false }}
      />
      <Dashboard.Screen
        name="LeadDetails"
        component={LeadDetailsScreen}
        options={{ headerShown: false }}
      />
      <Dashboard.Screen
        name="Deals"
        component={DealsScreen}
        options={{ headerShown: false }}
      />
      <Dashboard.Screen
        name="Reviews"
        component={ReviewsScreen}
        options={{ headerShown: false }}
      />
      <Dashboard.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{ headerShown: false }}
      />
      <Dashboard.Screen
        name="Affiliate"
        component={AffiliateScreen}
        options={{ headerShown: false }}
      />
      <Dashboard.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
      <Dashboard.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ headerShown: false }}
      />
      <Dashboard.Screen
        name="Chat"
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <Dashboard.Screen
        name="Demand"
        component={DemandScreen}
        options={{ headerShown: false }}
      />
      <Dashboard.Screen
        name="MyListings"
        component={MyListingsScreen}
        options={{ headerShown: false }}
      />
      <Dashboard.Screen
        name="ManageOffers"
        component={ManageOffersScreen}
        options={{ headerShown: false }}
      />
      <Dashboard.Screen
        name="VendorBroadcasts"
        component={VendorBroadcastsScreen}
        options={{ headerShown: false }}
      />
      <Dashboard.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ headerShown: false }}
      />
      <Dashboard.Screen
        name="Following"
        component={FollowingScreen}
        options={{ headerShown: false }}
      />
      <Dashboard.Screen
        name="Comments"
        component={CommentsScreen}
        options={{ headerShown: false }}
      />
      <Dashboard.Screen
        name="CustomerNotes"
        component={CustomerNotesScreen}
        options={{ headerShown: false }}
      />
    </Dashboard.Navigator>
    </DashboardGuard>
  );
}
