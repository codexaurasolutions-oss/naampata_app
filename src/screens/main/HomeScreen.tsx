import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import FadeInView from '../../components/FadeInView';

const { width } = Dimensions.get('window');
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=200&auto=format&fit=crop';
const CATEGORY_ICONS: Record<string, string> = {
  'restaurant': 'restaurant', 'bakery': 'cake', 'cafe': 'local-cafe', 'automotive': 'directions-car',
  'education': 'school', 'health': 'local-hospital', 'beauty': 'spa', 'fitness': 'fitness-center',
  'real-estate': 'home', 'technology': 'computer', 'fashion': 'checkroom', 'grocery': 'shopping-cart',
  'pets': 'pets', 'travel': 'flight', 'entertainment': 'movie', 'default': 'category',
};

export default function HomeScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories', 'popular'],
    queryFn: () => api.categories.getPopular(8),
  });
  const { data: featuredData, isLoading: loadingBusinesses } = useQuery({
    queryKey: ['businesses', 'featured'],
    queryFn: () => api.listings.getFeatured(1, 12),
  });
  const { data: citiesData } = useQuery({
    queryKey: ['cities', 'popular'],
    queryFn: () => api.cities.getPopular(),
  });
  const { data: offersData } = useQuery({
    queryKey: ['offers', 'home'],
    queryFn: () => api.offers.searchPublic({ limit: 4 }),
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || categoriesData?.categories || []);
  const featuredBusinesses = Array.isArray(featuredData) ? featuredData : (featuredData?.data || featuredData?.businesses || []);
  const topCities = Array.isArray(citiesData) ? citiesData : (citiesData?.data || citiesData?.cities || []);
  const latestOffers = Array.isArray(offersData) ? offersData : (offersData?.data || offersData?.offers || []);

  return (
    <View style={s.container}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.headerSection}>
          <FadeInView delay={0} direction="up">
            <Text style={s.heroTitle}>
              Discover Local Businesses{'\n'}
              <Text style={s.heroAccent}>Instantly</Text>
            </Text>
            <Text style={s.heroSubtitle}>
              Search, compare & contact the best services near you — fast and reliable.
            </Text>
          </FadeInView>

          <FadeInView delay={150} direction="up" style={{ width: '100%' }}>
            <View style={s.searchBox}>
              <View style={s.searchInputRow}>
                <Icon name="search" size={20} color="#CBD5E1" />
                <TextInput
                  placeholder="Search businesses..."
                  style={s.searchInput}
                  placeholderTextColor="#CBD5E1"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={() => navigation.navigate('Search', { initialQuery: searchQuery })}
                  returnKeyType="search"
                />
              </View>
              <TouchableOpacity
                style={s.searchButton}
                onPress={() => navigation.navigate('Search', { initialQuery: searchQuery })}
              >
                <Icon name="search" size={20} color="#FFF" />
                <Text style={s.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>
          </FadeInView>

          <View style={{ width: '100%', marginBottom: 32 }}>
            <FadeInView delay={250} direction="up">
              <TouchableOpacity style={s.featureCard} onPress={() => navigation.navigate('Offers')}>
                <View style={[s.featureIcon, { backgroundColor: '#FFF7ED' }]}>
                  <Icon name="local-offer" size={32} color="#F97316" />
                </View>
                <View style={s.featureTextWrap}>
                  <Text style={s.featureTitle}>Hot Local Deals</Text>
                  <Text style={s.featureSubtitle}>Best deals & events near you</Text>
                </View>
              </TouchableOpacity>
            </FadeInView>
            <FadeInView delay={350} direction="up">
              <TouchableOpacity style={s.featureCard} onPress={() => navigation.navigate('Events')}>
                <View style={[s.featureIcon, { backgroundColor: '#FAF5FF' }]}>
                  <Icon name="event" size={32} color="#A855F7" />
                </View>
                <View style={s.featureTextWrap}>
                  <Text style={s.featureTitle}>Local Events</Text>
                  <Text style={s.featureSubtitle}>Discover what's happening near you</Text>
                </View>
              </TouchableOpacity>
            </FadeInView>
            <FadeInView delay={450} direction="up">
              <TouchableOpacity style={s.featureCard} onPress={() => navigation.navigate('ExpertQuote')}>
                <View style={[s.featureIcon, { backgroundColor: '#EFF6FF' }]}>
                  <Icon name="campaign" size={32} color="#3B82F6" />
                </View>
                <View style={s.featureTextWrap}>
                  <Text style={s.featureTitle}>Get Expert Quotes</Text>
                  <Text style={s.featureSubtitle}>Post your requirement easily</Text>
                </View>
              </TouchableOpacity>
            </FadeInView>
          </View>

          <FadeInView delay={550} direction="up" style={{ width: '100%' }}>
            <View style={s.trustBox}>
              <View style={s.trustRow}>
                <View style={s.trustIconWrap}>
                  <Icon name="verified-user" size={20} color="#F97316" />
                </View>
                <View style={s.trustTextWrap}>
                  <Text style={s.trustTitle}>LOCAL BUSINESSES</Text>
                  <Text style={s.trustSubtitle}>Active and reliable listings</Text>
                </View>
              </View>
              <View style={s.trustRow}>
                <View style={s.trustIconWrap}>
                  <Icon name="search" size={20} color="#22C55E" />
                </View>
                <View style={s.trustTextWrap}>
                  <Text style={s.trustTitle}>FAST & EASY SEARCH</Text>
                  <Text style={s.trustSubtitle}>Find what you need instantly</Text>
                </View>
              </View>
              <View style={[s.trustRow, { marginBottom: 0 }]}>
                <View style={s.trustIconWrap}>
                  <Icon name="headset-mic" size={20} color="#3B82F6" />
                </View>
                <View style={s.trustTextWrap}>
                  <Text style={s.trustTitle}>LOCAL SUPPORT</Text>
                  <Text style={s.trustSubtitle}>We're here to help</Text>
                </View>
              </View>
            </View>
          </FadeInView>
        </View>

        <View style={s.sectionWhite}>
          <FadeInView delay={100} direction="up">
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Popular Categories</Text>
              <View style={s.sectionDivider} />
            </View>
          </FadeInView>

          {loadingCategories ? (
            <ActivityIndicator color="#FF7A30" size="large" style={{ marginVertical: 20 }} />
          ) : (
            <View style={s.categoriesGrid}>
              {categories.slice(0, 8).map((cat: any, idx: number) => {
                const slug = (cat.slug || cat.name || '').toLowerCase().replace(/[^a-z]/g, '');
                const iconName = Object.entries(CATEGORY_ICONS).find(([key]) => slug.includes(key))?.[1] || CATEGORY_ICONS.default;
                return (
                  <FadeInView key={cat.id || idx} delay={200 + idx * 60} direction="up">
                    <TouchableOpacity
                      style={s.categoryItem}
                      onPress={() => navigation.navigate('Search', { category: cat.slug || cat.name })}
                    >
                      <View style={s.categoryIconWrap}>
                        <Icon name={iconName} size={22} color="#FF7A30" />
                      </View>
                      <Text style={s.categoryName} numberOfLines={2}>{cat.name}</Text>
                      {cat.businessCount > 0 && (
                        <Text style={s.categoryCount}>{cat.businessCount} listing{cat.businessCount !== 1 ? 's' : ''}</Text>
                      )}
                    </TouchableOpacity>
                  </FadeInView>
                );
              })}
            </View>
          )}
        </View>

        <View style={s.sectionWhite}>
          <FadeInView delay={100} direction="up">
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Featured Businesses</Text>
              <View style={s.sectionDivider} />
            </View>
          </FadeInView>

          {loadingBusinesses ? (
            <ActivityIndicator color="#FF7A30" size="large" style={{ marginVertical: 20 }} />
          ) : featuredBusinesses.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 30 }}>
              <Icon name="business-center" size={48} color="#E2E8F0" />
              <Text style={{ color: '#94A3B8', marginTop: 12, fontSize: 14 }}>No featured businesses yet</Text>
            </View>
          ) : (
            featuredBusinesses.map((biz: any, index: number) => {
              const img = biz.coverImageUrl || biz.coverImage || biz.logoUrl || FALLBACK_IMG;
              return (
                <FadeInView key={biz.id || index} delay={200 + index * 80} direction="up">
                  <TouchableOpacity
                    style={s.businessCard}
                    onPress={() => navigation.navigate('BusinessDetail', { id: biz.id, slug: biz.slug })}
                  >
                    <Image
                      source={{ uri: img }}
                      style={s.businessImage}
                    />
                    <View style={s.businessInfo}>
                      <Text style={s.businessCategory}>{biz.category?.name || ''}</Text>
                      <Text style={s.businessName} numberOfLines={1}>{biz.title || biz.name || 'Business'}</Text>
                      <View style={s.ratingRow}>
                        <Icon name="star" size={16} color="#F59E0B" />
                        <Text style={s.ratingText}>{Number(biz.averageRating || biz.rating || 0).toFixed(1)}</Text>
                      </View>
                      <View style={s.locationRow}>
                        <Icon name="location-on" size={14} color="#94A3B8" />
                        <Text style={s.locationText} numberOfLines={1}>
                          {biz.city || biz.address?.city || ''}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </FadeInView>
              );
            })
          )}
        </View>

        {topCities.length > 0 && (
          <View style={s.sectionWhite}>
            <FadeInView delay={100} direction="up">
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Top Cities</Text>
                <View style={s.sectionDivider} />
              </View>
            </FadeInView>
            <View style={s.citiesGrid}>
              {topCities.slice(0, 6).map((city: any, idx: number) => (
                <FadeInView key={city.id || idx} delay={200 + idx * 60} direction="up">
                  <TouchableOpacity
                    style={s.cityCard}
                    onPress={() => navigation.navigate('Search', { city: city.name, country: city.country })}
                  >
                    <View style={[s.cityIconWrap, { backgroundColor: idx % 2 === 0 ? '#FFF7ED' : '#EFF6FF' }]}>
                      <Icon name="location-city" size={24} color={idx % 2 === 0 ? '#FF7A30' : '#3B82F6'} />
                    </View>
                    <Text style={s.cityName} numberOfLines={1}>{city.name}</Text>
                    <Text style={s.cityCountry} numberOfLines={1}>{city.country}</Text>
                  </TouchableOpacity>
                </FadeInView>
              ))}
            </View>
          </View>
        )}

        {latestOffers.length > 0 && (
          <View style={s.sectionWhite}>
            <FadeInView delay={100} direction="up">
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Latest Deals</Text>
                <View style={s.sectionDivider} />
              </View>
            </FadeInView>
            <View style={s.offersGrid}>
              {latestOffers.map((offer: any, idx: number) => (
                <FadeInView key={offer.id || idx} delay={200 + idx * 80} direction="up">
                  <TouchableOpacity
                    style={s.offerCard}
                    onPress={() => navigation.navigate('Offers')}
                  >
                    {offer.imageUrl && (
                      <Image source={{ uri: offer.imageUrl }} style={s.offerImage} />
                    )}
                    <View style={s.offerInfo}>
                      <Text style={s.offerTitle} numberOfLines={1}>{offer.title || offer.name || 'Deal'}</Text>
                      {offer.discount && <Text style={s.offerDiscount}>{offer.discount}</Text>}
                    </View>
                  </TouchableOpacity>
                </FadeInView>
              ))}
            </View>
          </View>
        )}

        <View style={[s.sectionWhite, { paddingBottom: 40 }]}>
          <FadeInView delay={100} direction="up">
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>How It Works</Text>
              <View style={s.sectionDivider} />
            </View>
          </FadeInView>
          <FadeInView delay={200} direction="up">
            <View style={s.howItem}>
              <View style={s.howIconWrap}>
                <Icon name="search" size={24} color="#FF7A30" />
              </View>
              <Text style={s.howTitle}>Search & Find</Text>
              <Text style={s.howSubtitle}>Choose the service you need from our top categories.</Text>
            </View>
          </FadeInView>
          <FadeInView delay={300} direction="up">
            <View style={s.howItem}>
              <View style={s.howIconWrap}>
                <Icon name="favorite" size={24} color="#FF7A30" />
              </View>
              <Text style={s.howTitle}>Compare & Review</Text>
              <Text style={s.howSubtitle}>Read reviews & select the best local providers.</Text>
            </View>
          </FadeInView>
          <FadeInView delay={400} direction="up">
            <View style={s.howItem}>
              <View style={s.howIconWrap}>
                <Icon name="phone" size={24} color="#FF7A30" />
              </View>
              <Text style={s.howTitle}>Contact & Connect</Text>
              <Text style={s.howSubtitle}>Reach out directly to your chosen business in seconds.</Text>
            </View>
          </FadeInView>
        </View>

        <View style={s.sectionWhite}>
          <FadeInView delay={100} direction="up">
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>What People Say</Text>
              <View style={s.sectionDivider} />
            </View>
          </FadeInView>
          {[
            { name: 'Ahmed K.', text: 'Found a great electrician in minutes. Very reliable platform!', rating: 5 },
            { name: 'Sara M.', text: 'Best local business directory in Pakistan. Love the reviews feature.', rating: 5 },
            { name: 'Usman R.', text: 'Listed my business and got 10x more customers. Highly recommended!', rating: 5 },
          ].map((t, idx) => (
            <FadeInView key={idx} delay={200 + idx * 100} direction="up">
              <View style={s.testimonialCard}>
                <View style={s.testimonialStars}>{[1,2,3,4,5].map(s => <Icon key={s} name="star" size={14} color="#F59E0B" />)}</View>
                <Text style={s.testimonialText}>"{t.text}"</Text>
                <Text style={s.testimonialName}>— {t.name}</Text>
              </View>
            </FadeInView>
          ))}
        </View>

        <View style={{ backgroundColor: '#112D4E', marginHorizontal: 16, borderRadius: 24, padding: 32, marginBottom: 40, alignItems: 'center' }}>
          <FadeInView delay={100} direction="up">
            <Icon name="business-center" size={48} color="#FF7A30" />
            <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '900', textAlign: 'center', marginTop: 16, marginBottom: 8 }}>Own a Business?</Text>
            <Text style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 }}>List your business for free and reach thousands of customers in your area.</Text>
            <TouchableOpacity style={{ backgroundColor: '#FF7A30', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 }} onPress={() => navigation.navigate('Auth', { screen: 'Register' })}>
              <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 16 }}>Sign Up Free</Text>
            </TouchableOpacity>
          </FadeInView>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFCFB' },
  scroll: { flex: 1 },
  headerSection: { paddingTop: 80, paddingBottom: 48, paddingHorizontal: 16, alignItems: 'center' },
  heroTitle: { fontSize: 34, fontWeight: '900', color: '#112D4E', textAlign: 'center', marginBottom: 16, lineHeight: 42 },
  heroAccent: { color: '#FF7A30' },
  heroSubtitle: { fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 32, fontWeight: '500', paddingHorizontal: 16 },
  searchBox: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 32, overflow: 'hidden' },
  searchInputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  searchInput: { flex: 1, marginLeft: 12, height: 40, color: '#1E293B', fontWeight: '500', fontSize: 15 },
  searchButton: { backgroundColor: '#FF7A30', paddingVertical: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  searchButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 17, marginLeft: 8 },
  featureCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#F9FAFB' },
  featureIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  featureTextWrap: { marginLeft: 16, flex: 1 },
  featureTitle: { fontWeight: '900', color: '#112D4E', fontSize: 20, marginBottom: 4 },
  featureSubtitle: { color: '#94A3B8', fontWeight: '500', fontSize: 14 },
  trustBox: { width: '100%', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 24, borderWidth: 1, borderColor: '#F3F4F6', padding: 16 },
  trustRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  trustIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F9FAFB' },
  trustTextWrap: { marginLeft: 12 },
  trustTitle: { fontWeight: '700', color: '#112D4E', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  trustSubtitle: { color: '#94A3B8', fontSize: 10, fontWeight: '500', marginTop: 2 },
  sectionWhite: { backgroundColor: '#FFFFFF', paddingVertical: 48, paddingHorizontal: 16 },
  sectionHeader: { alignItems: 'center', marginBottom: 32 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: '#202124', marginBottom: 8 },
  sectionDivider: { width: 48, height: 4, backgroundColor: '#FF7A30', borderRadius: 2 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryItem: { width: (width - 64) / 4, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 16, alignItems: 'center' },
  categoryIconWrap: { width: 48, height: 48, backgroundColor: '#FFFFFF', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  categoryName: { fontWeight: '700', fontSize: 11, color: '#334155', textAlign: 'center' },
  categoryCount: { color: '#94A3B8', fontSize: 9, marginTop: 4 },
  businessCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  businessImage: { width: 96, height: 96, borderRadius: 20, backgroundColor: '#E2E8F0' },
  businessInfo: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  businessCategory: { color: '#94A3B8', fontSize: 12, fontWeight: '500', marginBottom: 4 },
  businessName: { fontSize: 17, fontWeight: '700', color: '#112D4E', marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  ratingText: { color: '#1E293B', fontWeight: '700', fontSize: 12, marginLeft: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { color: '#64748B', fontSize: 12, marginLeft: 4 },
  citiesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cityCard: { width: (width - 64) / 3, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 12, alignItems: 'center' },
  cityIconWrap: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  cityName: { fontWeight: '700', fontSize: 13, color: '#112D4E', textAlign: 'center' },
  cityCountry: { color: '#94A3B8', fontSize: 10, marginTop: 2, textAlign: 'center' },
  offersGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  offerCard: { width: (width - 56) / 2, backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 12 },
  offerImage: { width: '100%', height: 80, backgroundColor: '#F1F5F9' },
  offerInfo: { padding: 12 },
  offerTitle: { fontWeight: '700', fontSize: 13, color: '#112D4E', marginBottom: 4 },
  offerDiscount: { color: '#FF7A30', fontWeight: '800', fontSize: 12 },
  howItem: { alignItems: 'center', marginBottom: 32 },
  howIconWrap: { width: 64, height: 64, backgroundColor: '#F9FAFB', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  howTitle: { fontSize: 18, fontWeight: '700', color: '#202124', marginBottom: 8 },
  howSubtitle: { color: '#70757A', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  testimonialCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  testimonialStars: { flexDirection: 'row', marginBottom: 8, gap: 2 },
  testimonialText: { color: '#475569', fontSize: 14, lineHeight: 22, marginBottom: 8 },
  testimonialName: { color: '#94A3B8', fontWeight: '700', fontSize: 13 },
});
