import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: vendorStatsData, isLoading: loadingVendorStats, refetch: refetchVendor } = useQuery({
    queryKey: ['vendorDashboardStats'],
    queryFn: () => api.vendors.getDashboardStats(),
  });

  const { data: leadStatsData, refetch: refetchLeads } = useQuery({
    queryKey: ['vendorLeadStats'],
    queryFn: () => api.leads.getStats(),
  });

  const { data: broadcastStatsData } = useQuery({
    queryKey: ['vendorBroadcastStats'],
    queryFn: () => api.broadcasts.getVendorStats(),
  });

  const { data: subData } = useQuery({
    queryKey: ['activeSubscription'],
    queryFn: () => api.subscriptions.getActive(),
  });

  const { data: listingsData } = useQuery({
    queryKey: ['myListings'],
    queryFn: () => api.listings.getMyListings(),
  });

  const vendorStats = vendorStatsData?.data || {};
  const leadStats = leadStatsData?.data || {};
  const broadcastStats = broadcastStatsData?.data || {};
  const subscription = subData?.data;
  const listings = listingsData?.data || [];

  const profileCompletion = vendorStats.profileCompletion || vendorStats.completionPercentage || 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchVendor(), refetchLeads()]);
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      <View className="bg-[#112D4E] pt-14 pb-8 px-4 rounded-b-[32px] shadow-sm">
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-1">
            <Text className="text-white/80 font-medium">Welcome back,</Text>
            <Text className="text-white font-bold text-2xl" numberOfLines={1}>{user?.fullName || user?.firstName || 'Business Owner'}</Text>
          </View>
          <TouchableOpacity
            className="w-12 h-12 bg-white/10 rounded-full items-center justify-center border border-white/20"
            onPress={() => navigation.navigate('Settings')}
          >
            <Image
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop' }}
              className="w-10 h-10 rounded-full"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="bg-gradient-to-r from-orange-500 to-orange-400 p-4 rounded-2xl flex-row justify-between items-center shadow-lg"
          onPress={() => navigation.navigate('Subscription')}
        >
          <View>
            <Text className="text-white font-black text-lg">{subscription?.plan?.name || 'Free Plan'}</Text>
            <Text className="text-white/80 text-xs font-medium mt-1">Upgrade for more visibility</Text>
          </View>
          <View className="bg-white/20 px-4 py-2 rounded-xl">
            <Text className="text-white font-bold text-xs uppercase tracking-widest">Upgrade</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4 py-6"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7A30" />}
      >
        <View className="flex-row justify-between mb-8">
          {[
            { icon: 'add-business', color: '#3B82F6', bgColor: '#EFF6FF', borderColor: '#DBEAFE', label: 'Add Listing', route: 'AddListing' },
            { icon: 'mail-outline', color: '#FF7A30', bgColor: '#FFF7ED', borderColor: '#FED7AA', label: 'Leads', route: 'Leads', badge: leadStats.new || 0 },
            { icon: 'local-offer', color: '#A855F7', bgColor: '#FAF5FF', borderColor: '#E9D5FF', label: 'Offers', route: 'ManageOffers' },
            { icon: 'star-outline', color: '#22C55E', bgColor: '#F0FDF4', borderColor: '#BBF7D0', label: 'Premium', route: 'Subscription' },
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              className="items-center"
              onPress={() => navigation.navigate(item.route)}
            >
              <View className="w-14 h-14 rounded-2xl items-center justify-center mb-2 shadow-sm border relative" style={{ backgroundColor: item.bgColor, borderColor: item.borderColor }}>
                <Icon name={item.icon} size={24} color={item.color} />
                {item.badge ? (
                  <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center border-2 border-white">
                    <Text className="text-white text-[10px] font-bold">{item.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text className="text-slate-700 font-bold text-xs">{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-xl font-bold text-[#112D4E] mb-4">Advanced Tools</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
          {[
            { icon: 'bar-chart', color: '#6366F1', bgColor: '#EEF2FF', label: 'Analytics', route: 'Analytics' },
            { icon: 'radar', color: '#06B6D4', bgColor: '#ECFEFF', label: 'Local Demand', route: 'Demand' },
            { icon: 'rss-feed', color: '#F43F5E', bgColor: '#FFF1F2', label: 'Broadcast Inbox', route: 'VendorBroadcasts' },
            { icon: 'storefront', color: '#64748B', bgColor: '#F8FAFC', label: 'My Listings', route: 'MyListings' },
            { icon: 'chat', color: '#8B5CF6', bgColor: '#F5F3FF', label: 'Comments', route: 'Comments' },
            { icon: 'note', color: '#F59E0B', bgColor: '#FFFBEB', label: 'Customer Notes', route: 'CustomerNotes' },
            { icon: 'group', color: '#10B981', bgColor: '#ECFDF5', label: 'Following', route: 'Following' },
            { icon: 'share', color: '#EC4899', bgColor: '#FDF2F8', label: 'Affiliate', route: 'Affiliate' },
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              className="bg-white rounded-2xl p-4 mr-3 border border-slate-100 shadow-sm w-32 items-center"
              onPress={() => navigation.navigate(item.route)}
            >
              <View className="w-12 h-12 rounded-full items-center justify-center mb-3" style={{ backgroundColor: item.bgColor }}>
                <Icon name={item.icon} size={22} color={item.color} />
              </View>
              <Text className="font-bold text-slate-800 text-center text-xs">{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text className="text-xl font-bold text-[#112D4E] mb-4">Performance Overview</Text>
        {loadingVendorStats ? (
          <ActivityIndicator color="#FF7A30" className="my-10" />
        ) : (
          <View className="flex-row flex-wrap justify-between mb-8">
            {[
              { icon: 'visibility', color: '#3B82F6', bgColor: '#EFF6FF', value: vendorStats.views || vendorStats.profileViews || 0, label: 'Profile Views' },
              { icon: 'campaign', color: '#FF7A30', bgColor: '#FFF7ED', value: vendorStats.leads || leadStats.total || 0, label: 'Total Leads' },
              { icon: 'star', color: '#22C55E', bgColor: '#F0FDF4', value: vendorStats.rating || vendorStats.avgRating || '0.0', label: 'Avg Rating' },
              { icon: 'reviews', color: '#A855F7', bgColor: '#FAF5FF', value: vendorStats.reviews || vendorStats.reviewCount || 0, label: 'Reviews' },
            ].map((card, idx) => (
              <TouchableOpacity
                key={idx}
                className="w-[48%] bg-white rounded-3xl p-5 mb-4 border border-slate-100 shadow-sm"
                onPress={() => idx === 3 && navigation.navigate('Reviews')}
              >
                <View className="w-10 h-10 rounded-full items-center justify-center mb-3" style={{ backgroundColor: card.bgColor }}>
                  <Icon name={card.icon} size={20} color={card.color} />
                </View>
                <Text className="text-3xl font-black text-slate-900 mb-1">{card.value}</Text>
                <Text className="text-slate-400 font-medium text-xs uppercase tracking-widest">{card.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {listings.length > 0 && (
          <>
            <Text className="text-xl font-bold text-[#112D4E] mb-4">My Listings</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
              {listings.slice(0, 5).map((listing: any) => (
                <TouchableOpacity
                  key={listing.id}
                  className="bg-white rounded-2xl p-3 mr-3 border border-slate-100 shadow-sm w-48"
                  onPress={() => navigation.navigate('EditListing', { listingId: listing.id })}
                >
                  <Image
                    source={{ uri: listing.coverImageUrl || listing.coverImage || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=200&auto=format&fit=crop' }}
                    className="w-full h-24 rounded-xl bg-slate-200 mb-2"
                  />
                  <Text className="font-bold text-slate-800" numberOfLines={1}>{listing.title || listing.name}</Text>
                  <Text className="text-slate-400 text-xs">{listing.category?.name || 'Business'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {profileCompletion > 0 && profileCompletion < 100 && (
          <View className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-10">
            <View className="flex-row justify-between items-end mb-3">
              <Text className="font-bold text-[#112D4E] text-lg">Profile Completion</Text>
              <Text className="font-black text-[#FF7A30]">{profileCompletion}%</Text>
            </View>
            <View className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
              <View className="h-full bg-[#FF7A30] rounded-full" style={{ width: `${profileCompletion}%` }} />
            </View>
            <Text className="text-slate-500 font-medium text-sm mb-4">
              Complete your profile to rank higher in local search results.
            </Text>
            <TouchableOpacity
              className="bg-[#112D4E] py-3 rounded-xl items-center"
              onPress={() => listings.length > 0 ? navigation.navigate('EditListing', { listingId: listings[0].id }) : navigation.navigate('AddListing')}
            >
              <Text className="text-white font-bold">{listings.length > 0 ? 'Complete Profile' : 'Add Listing'}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
