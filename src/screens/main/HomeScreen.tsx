import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, Dimensions, StyleSheet, PermissionsAndroid, Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import FadeInView from '../../components/FadeInView';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=200&auto=format&fit=crop';

const CATEGORIES = [
  { name: 'B2B', iconUrl: 'https://img.icons8.com/color/96/handshake.png', slug: 'b2b' },
  { name: 'Doctors', iconUrl: 'https://img.icons8.com/color/96/medical-doctor.png', slug: 'doctors' },
  { name: 'Travel', iconUrl: 'https://img.icons8.com/color/96/airplane-take-off.png', slug: 'travel' },
  { name: 'Beauty', iconUrl: 'https://img.icons8.com/color/96/cosmetics.png', slug: 'beauty' },
  { name: 'Education', iconUrl: 'https://img.icons8.com/color/96/graduation-cap.png', slug: 'education' },
  { name: 'Consultants', iconUrl: 'https://img.icons8.com/color/96/consultation.png', slug: 'consultants' },
  { name: 'Rent & Hire', iconUrl: 'https://img.icons8.com/color/96/key.png', slug: 'rent-hire' },
  { name: 'Wedding', iconUrl: 'https://img.icons8.com/color/96/wedding-rings.png', slug: 'wedding' },
  { name: 'Interiors', iconUrl: 'https://img.icons8.com/color/96/sofa.png', slug: 'interiors' },
  { name: 'Home Serv.', iconUrl: 'https://img.icons8.com/color/96/broom.png', slug: 'home-services' },
  { name: 'Repairs', iconUrl: 'https://img.icons8.com/color/96/maintenance.png', slug: 'repairs' },
  { name: 'Contractors', iconUrl: 'https://img.icons8.com/color/96/worker-male.png', slug: 'contractors' },
  { name: 'Loans', iconUrl: 'https://img.icons8.com/color/96/money-bag.png', badge: 'INSTANT', slug: 'loans' },
  { name: 'Real Estate', iconUrl: 'https://img.icons8.com/color/96/house.png', slug: 'real-estate' },
  { name: 'Jd Xperts', iconUrl: 'https://img.icons8.com/color/96/service.png', badge: 'NEW', slug: 'jd-xperts' },
];

export default function HomeScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [featuredPage, setFeaturedPage] = useState(1);
  const [allFeatured, setAllFeatured] = useState<any[]>([]);

  const detectMyLocation = async () => {
    setLocationLoading(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          { title: 'Location Permission', message: 'Naampata needs your location to find nearby businesses.', buttonPositive: 'Allow', buttonNegative: 'Deny' }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setLocationLoading(false);
          Alert.alert('Location Denied', 'Please enable location in settings.');
          return;
        }
      }
      const geo = (globalThis as any).navigator?.geolocation;
      if (!geo) {
        setLocationLoading(false);
        Alert.alert('Error', 'Geolocation not available on this device.');
        return;
      }
      geo.getCurrentPosition(
        (pos: any) => {
          setLocationLoading(false);
          navigation.navigate('Search', { query: '', latitude: pos.coords.latitude, longitude: pos.coords.longitude, radius: 10, sortBy: 'distance' });
        },
        () => { setLocationLoading(false); Alert.alert('Location Error', 'Could not get your location. Please try again.'); },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch {
      setLocationLoading(false);
      Alert.alert('Error', 'Failed to get location.');
    }
  };

  const { data: featuredData, isLoading: loadingBusinesses } = useQuery({
    queryKey: ['businesses', 'featured', featuredPage],
    queryFn: () => api.listings.getFeatured(featuredPage, 6),
  });

  const newFeatured = Array.isArray(featuredData) ? featuredData : (featuredData?.data || featuredData?.businesses || []);

  useEffect(() => {
    if (newFeatured.length > 0) {
      if (featuredPage === 1) {
        setAllFeatured(newFeatured);
      } else {
        setAllFeatured(prev => [...prev, ...newFeatured.filter((b: any) => !prev.some((p: any) => (p.id || p._id) === (b.id || b._id)))]);
      }
    }
  }, [newFeatured, featuredPage]);

  const handleSearch = () => {
    navigation.navigate('Search', { initialQuery: searchQuery, country: selectedCountry, city: selectedCity });
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.avatarWrap}>
          <Text style={s.avatarText}>U</Text>
        </TouchableOpacity>
        <View style={s.logoWrap}>
          <Text style={s.logoTextBlue}>Just</Text>
          <Text style={s.logoTextOrange}>dial</Text>
        </View>
        <View style={s.headerIcons}>
          <TouchableOpacity style={s.iconButton}>
            <Icon name="bookmark-border" size={26} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity style={s.iconButton}>
            <Icon name="notifications-none" size={26} color="#111" />
            <View style={s.badge}>
              <Text style={s.badgeText}>1</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Search Bar */}
        <View style={s.searchContainer}>
          <View style={s.searchBox}>
            <Icon name="search" size={22} color="#0052cc" />
            <TextInput
              style={s.searchInput}
              placeholder="Packers and Movers"
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity style={s.searchActionIcon}>
              <Icon name="center-focus-weak" size={22} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity style={s.searchActionIcon}>
              <Icon name="mic" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories Grid */}
        <View style={s.categoriesSection}>
          <View style={s.categoriesGrid}>
            {CATEGORIES.map((cat, idx) => (
              <TouchableOpacity key={idx} style={s.categoryItem} onPress={() => navigation.navigate('Search', { category: cat.slug })}>
                {cat.badge && (
                  <View style={s.categoryBadge}>
                    <Text style={s.categoryBadgeText}>{cat.badge}</Text>
                  </View>
                )}
                <View style={s.categoryIconWrap}>
                  <Image source={{ uri: cat.iconUrl }} style={s.categoryIcon} resizeMode="contain" />
                </View>
                <Text style={s.categoryName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
            
            {/* Show More */}
            <TouchableOpacity style={s.categoryItem} onPress={() => navigation.navigate('Categories')}>
              <View style={[s.categoryIconWrap, { backgroundColor: '#4b6bf5' }]}>
                <Icon name="keyboard-arrow-down" size={30} color="#FFF" />
              </View>
              <Text style={s.categoryName}>Show More</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Sheet Like Section */}
        <View style={s.bottomSheet}>
          <View style={s.handle} />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.promoCardsContainer}>
            {/* Order Food */}
            <TouchableOpacity style={[s.promoCard, { borderColor: '#FED7AA', borderWidth: 1 }]} onPress={() => navigation.navigate('Search', { initialQuery: 'food' })}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop' }} style={s.promoImage} />
              <View style={s.promoGradientOverlay} />
              <View style={s.promoTextWrap}>
                <Text style={s.promoTextBig}>ORDER</Text>
                <Text style={s.promoTextBig}>FOOD</Text>
              </View>
            </TouchableOpacity>

            {/* Gift Cards */}
            <TouchableOpacity style={[s.promoCard, { backgroundColor: '#5E2CA5' }]} onPress={() => navigation.navigate('Search', { initialQuery: 'gift' })}>
              <Image source={{ uri: 'https://img.icons8.com/color/96/gift.png' }} style={s.promoIconFloat} />
              <View style={s.promoTextWrapBottom}>
                <Text style={s.promoTextBig}>GIFT</Text>
                <Text style={s.promoTextBig}>CARDS</Text>
              </View>
            </TouchableOpacity>

            {/* Shopping */}
            <TouchableOpacity style={[s.promoCard, { backgroundColor: '#1F8D98' }]} onPress={() => navigation.navigate('Search', { initialQuery: 'shopping' })}>
              <Image source={{ uri: 'https://img.icons8.com/color/96/shopping-bag--v1.png' }} style={s.promoIconFloatSmall} />
              <View style={s.promoTextWrapBottom}>
                <Text style={s.promoTextBig}>SHOPPING</Text>
              </View>
            </TouchableOpacity>

            {/* Pay Bills */}
            <TouchableOpacity style={[s.promoCard, { backgroundColor: '#152B6A' }]} onPress={() => navigation.navigate('Search', { initialQuery: 'bills' })}>
              <View style={s.promoBIconWrap}>
                <Text style={s.promoBIcon}>B</Text>
              </View>
              <View style={s.promoTextWrapBottom}>
                <Text style={[s.promoTextBig, { textAlign: 'center' }]}>PAY BILLS</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Banner */}
          <TouchableOpacity style={s.banner}>
            <View style={s.bannerLeft}>
              <Text style={s.bannerTitle}>Propel your career towards growth</Text>
              <Text style={s.bannerSubtitle}>Connect with Career Experts</Text>
              <View style={s.bannerBtn}>
                <Text style={s.bannerBtnText}>Enquire Now</Text>
              </View>
            </View>
            <View style={s.bannerRight}>
              <Image source={{ uri: 'https://img.icons8.com/color/96/bullseye.png' }} style={s.bannerIcon} />
            </View>
          </TouchableOpacity>

          {/* Featured Businesses Section (to keep the old logic active) */}
          {allFeatured.length > 0 && (
            <View style={s.featuredSection}>
              <Text style={s.sectionTitle}>Featured Businesses</Text>
              {allFeatured.map((biz: any, index: number) => {
                const img = biz.coverImageUrl || biz.coverImage || biz.logoUrl || FALLBACK_IMG;
                return (
                  <TouchableOpacity
                    key={biz.id || index}
                    style={s.businessCard}
                    onPress={() => navigation.navigate('BusinessDetail', { id: biz.id, slug: biz.slug })}
                  >
                    <Image source={{ uri: img }} style={s.businessImage} />
                    <View style={s.businessInfo}>
                      <Text style={s.businessCategory}>{biz.category?.name || 'Local Business'}</Text>
                      <Text style={s.businessName} numberOfLines={1}>{biz.title || biz.name || 'Business'}</Text>
                      <View style={s.ratingRow}>
                        <Icon name="star" size={16} color="#F59E0B" />
                        <Text style={s.ratingText}>{Number(biz.averageRating || biz.rating || 0).toFixed(1)}</Text>
                      </View>
                      <View style={s.locationRow}>
                        <Icon name="location-on" size={14} color="#94A3B8" />
                        <Text style={s.locationText} numberOfLines={1}>{biz.city || biz.address?.city || ''}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: '#64748B' },
  logoWrap: { flexDirection: 'row', alignItems: 'center' },
  logoTextBlue: { fontSize: 24, fontWeight: '900', color: '#0052cc' },
  logoTextOrange: { fontSize: 24, fontWeight: '900', color: '#ff6b00' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { position: 'relative', padding: 4 },
  badge: {
    position: 'absolute',
    top: 2,
    right: 4,
    backgroundColor: '#ff6b00',
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  badgeText: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },
  searchContainer: { paddingHorizontal: 16, marginBottom: 20, marginTop: 4 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: { flex: 1, height: 46, fontSize: 16, color: '#1E293B', marginLeft: 10, fontWeight: '500' },
  searchActionIcon: { padding: 6, marginLeft: 4 },
  categoriesSection: { paddingHorizontal: 16, paddingBottom: 24 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryItem: { width: (width - 40) / 4, alignItems: 'center', marginBottom: 24, position: 'relative' },
  categoryIconWrap: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  categoryIcon: { width: 36, height: 36 },
  categoryName: { fontSize: 12, fontWeight: '600', color: '#334155', textAlign: 'center' },
  categoryBadge: { position: 'absolute', bottom: 20, zIndex: 10, backgroundColor: '#FFF', borderColor: '#EF4444', borderWidth: 1, borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1 },
  categoryBadgeText: { color: '#EF4444', fontSize: 8, fontWeight: 'bold' },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    minHeight: 500,
  },
  handle: { width: 40, height: 5, backgroundColor: '#D1D5DB', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  promoCardsContainer: { paddingHorizontal: 16, gap: 12, paddingBottom: 24 },
  promoCard: { width: 110, height: 110, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  promoImage: { width: '100%', height: '100%', position: 'absolute' },
  promoGradientOverlay: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.3)' },
  promoTextWrap: { position: 'absolute', bottom: 10, left: 10 },
  promoTextWrapBottom: { position: 'absolute', bottom: 10, left: 10, right: 10 },
  promoTextBig: { color: '#FFF', fontSize: 14, fontWeight: '900' },
  promoIconFloat: { width: 44, height: 44, position: 'absolute', top: 8, right: 8 },
  promoIconFloatSmall: { width: 40, height: 40, position: 'absolute', top: 8, right: 8 },
  promoBIconWrap: { position: 'absolute', top: 12, alignSelf: 'center' },
  promoBIcon: { fontSize: 44, fontWeight: '900', color: '#FF7A30' },
  banner: {
    marginHorizontal: 16,
    backgroundColor: '#2a2c3a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    height: 120,
    marginBottom: 32,
  },
  bannerLeft: { flex: 1, justifyContent: 'center' },
  bannerTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  bannerSubtitle: { color: '#CBD5E1', fontSize: 12, marginBottom: 12 },
  bannerBtn: { backgroundColor: '#a62b3b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, alignSelf: 'flex-start' },
  bannerBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  bannerRight: { width: 80, justifyContent: 'flex-end', alignItems: 'flex-end' },
  bannerIcon: { width: 60, height: 60, opacity: 0.8, transform: [{ translateX: 10 }, { translateY: 10 }] },
  
  // Featured section styles to prevent undefined errors
  featuredSection: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#112D4E', marginBottom: 16 },
  businessCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  businessImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#E2E8F0' },
  businessInfo: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  businessCategory: { color: '#94A3B8', fontSize: 12, marginBottom: 4 },
  businessName: { fontSize: 16, fontWeight: 'bold', color: '#112D4E', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  ratingText: { marginLeft: 4, fontSize: 12, fontWeight: 'bold', color: '#1E293B' },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { marginLeft: 4, fontSize: 12, color: '#64748B' },
});
