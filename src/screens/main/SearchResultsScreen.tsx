import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Modal, SafeAreaView, Alert, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import BusinessCard from '../../components/BusinessCard';
import { useAuthStore } from '../../stores/authStore';

type SortOption = 'recommended' | 'nearest' | 'top_rated' | 'most_reviewed';
type RadiusOption = { label: string; value: number };

const SORT_OPTIONS: { key: SortOption; label: string; icon: string }[] = [
  { key: 'recommended', label: 'Recommended', icon: 'auto-awesome' },
  { key: 'nearest', label: 'Nearest', icon: 'near-me' },
  { key: 'top_rated', label: 'Top Rated', icon: 'star' },
  { key: 'most_reviewed', label: 'Most Reviewed', icon: 'reviews' },
];

const RADIUS_OPTIONS: RadiusOption[] = [
  { label: '1 km', value: 1 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
];

export default function SearchResultsScreen({ route, navigation }: any) {
  const [searchQuery, setSearchQuery] = useState(route?.params?.query || '');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>(route?.params?.category || '');
  const [selectedCountry, setSelectedCountry] = useState<string>(route?.params?.country || '');
  const [selectedCity, setSelectedCity] = useState<string>(route?.params?.city || '');
  const [selectedRadius, setSelectedRadius] = useState<number>(route?.params?.radius || 10);
  const [openNow, setOpenNow] = useState(false);
  const [topRated, setTopRated] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [onlineNow, setOnlineNow] = useState(false);
  const [fastResponse, setFastResponse] = useState(false);
  const [experience, setExperience] = useState(false);
  const [mostContacted, setMostContacted] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<SortOption>(route?.params?.sortBy || 'recommended');
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const latitude = route?.params?.latitude;
  const longitude = route?.params?.longitude;
  const hasLocation = !!latitude && !!longitude;

  const saveMutation = useMutation({
    mutationFn: (businessId: string) => api.users.addFavorite(businessId),
    onSuccess: () => { Alert.alert('Saved', 'Business saved to favorites!'); },
    onError: () => Alert.alert('Error', 'Failed to save.'),
  });

  const handleSave = (biz: any) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to save businesses.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Auth', { screen: 'Login' }) },
      ]);
      return;
    }
    saveMutation.mutate(biz.id || biz._id);
  };

  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: () => api.categories.getAll() });
  const { data: citiesData } = useQuery({ queryKey: ['cities'], queryFn: () => api.cities.getAll() });
  const { data: countriesData } = useQuery({ queryKey: ['countries'], queryFn: () => api.cities.getCountries() });

  const categories = categoriesData?.data || categoriesData?.categories || (Array.isArray(categoriesData) ? categoriesData : []);
  const cities = citiesData?.data || citiesData?.cities || (Array.isArray(citiesData) ? citiesData : []);
  const countries = Array.isArray(countriesData) ? countriesData : (countriesData?.data || []);

  const { data: searchData, isLoading } = useQuery({
    queryKey: ['search', searchQuery, selectedCategory, selectedCountry, selectedCity, selectedRadius, openNow, topRated, verifiedOnly, onlineNow, sortBy, latitude, longitude],
    queryFn: () => {
      const params: any = {};
      if (searchQuery) params.query = searchQuery;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedCountry) params.country = selectedCountry;
      if (selectedCity) params.city = selectedCity;
      if (latitude) params.latitude = latitude;
      if (longitude) params.longitude = longitude;
      if (hasLocation) params.radius = selectedRadius;
      if (openNow) params.openNow = true;
      if (topRated) params.minRating = 4.5;
      if (minRating > 0 && !topRated) params.minRating = minRating;
      if (verifiedOnly) params.verifiedOnly = true;
      if (onlineNow) params.onlineNow = true;
      if (fastResponse) params.fastResponse = true;
      if (experience) params.experience = true;
      if (mostContacted) params.mostContacted = true;
      if (sortBy === 'top_rated') params.sortBy = 'rating';
      else if (sortBy === 'most_reviewed') params.sortBy = 'reviews';
      else if (sortBy === 'nearest') params.sortBy = 'distance';
      else if (sortBy === 'recommended') params.sortBy = 'relevance';
      return api.listings.search(params);
    },
  });

  const results = searchData?.data || searchData?.businesses || (Array.isArray(searchData) ? searchData : []);
  const totalCount = searchData?.meta?.total || results.length;

  const activeFiltersCount = [
    selectedCategory, selectedCountry, selectedCity,
    openNow, topRated, verifiedOnly, onlineNow, fastResponse, experience, mostContacted,
    minRating > 0 ? 'rating' : '',
  ].filter(Boolean).length + (sortBy !== 'recommended' ? 1 : 0) + (hasLocation ? 1 : 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <Icon name="arrow-back" size={24} color="#112D4E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Results</Text>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Icon name="search" size={24} color="#94A3B8" />
            <TextInput
              placeholder="What are you looking for?"
              style={styles.searchInput}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="cancel" size={20} color="#CBD5E1" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.filterBtn, activeFiltersCount > 0 && styles.filterBtnActive]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Icon name="tune" size={24} color={activeFiltersCount > 0 ? '#FFF' : '#64748B'} />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.gridListBtn, { marginLeft: 8 }]}
            onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          >
            <Icon name={viewMode === 'list' ? 'view-list' : 'view-module'} size={22} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickFilters}>
          {hasLocation && (
            <TouchableOpacity style={[styles.chip, styles.chipNearMe]} disabled>
              <Icon name="my-location" size={14} color="#FF7A30" />
              <Text style={[styles.chipText, styles.chipTextNearMe]}>{selectedRadius}km</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.chip, openNow && styles.chipActiveOrange]}
            onPress={() => setOpenNow(!openNow)}
          >
            <Text style={[styles.chipText, openNow && styles.chipTextActiveOrange]}>Open Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, topRated && styles.chipActiveOrange]}
            onPress={() => setTopRated(!topRated)}
          >
            <Text style={[styles.chipText, topRated && styles.chipTextActiveOrange]}>Top Rated (4.5+)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, verifiedOnly && styles.chipActiveBlue]}
            onPress={() => setVerifiedOnly(!verifiedOnly)}
          >
            <Text style={[styles.chipText, verifiedOnly && styles.chipTextActiveBlue]}>Verified</Text>
          </TouchableOpacity>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.chip, sortBy === opt.key && styles.chipActiveDark]}
              onPress={() => setSortBy(opt.key)}
            >
              <Text style={[styles.chipText, sortBy === opt.key && styles.chipTextActiveDark]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {activeFiltersCount > 0 && (
          <View style={styles.activeChipsRow}>
            {selectedCategory && (
              <View style={styles.activeChip}>
                <Text style={styles.activeChipText}>{categories.find((c: any) => c.id === selectedCategory)?.name || 'Category'}</Text>
                <TouchableOpacity onPress={() => setSelectedCategory('')}><Icon name="close" size={14} color="#FF7A30" /></TouchableOpacity>
              </View>
            )}
            {selectedCountry && (
              <View style={styles.activeChip}>
                <Text style={styles.activeChipText}>{selectedCountry}</Text>
                <TouchableOpacity onPress={() => setSelectedCountry('')}><Icon name="close" size={14} color="#FF7A30" /></TouchableOpacity>
              </View>
            )}
            {selectedCity && (
              <View style={styles.activeChip}>
                <Text style={styles.activeChipText}>{selectedCity}</Text>
                <TouchableOpacity onPress={() => setSelectedCity('')}><Icon name="close" size={14} color="#FF7A30" /></TouchableOpacity>
              </View>
            )}
            {openNow && (
              <View style={styles.activeChip}>
                <Text style={styles.activeChipText}>Open Now</Text>
                <TouchableOpacity onPress={() => setOpenNow(false)}><Icon name="close" size={14} color="#FF7A30" /></TouchableOpacity>
              </View>
            )}
            {topRated && (
              <View style={styles.activeChip}>
                <Text style={styles.activeChipText}>Top Rated</Text>
                <TouchableOpacity onPress={() => setTopRated(false)}><Icon name="close" size={14} color="#FF7A30" /></TouchableOpacity>
              </View>
            )}
            {verifiedOnly && (
              <View style={styles.activeChip}>
                <Text style={styles.activeChipText}>Verified</Text>
                <TouchableOpacity onPress={() => setVerifiedOnly(false)}><Icon name="close" size={14} color="#FF7A30" /></TouchableOpacity>
              </View>
            )}
            {fastResponse && (
              <View style={styles.activeChip}>
                <Text style={styles.activeChipText}>Fast Response</Text>
                <TouchableOpacity onPress={() => setFastResponse(false)}><Icon name="close" size={14} color="#FF7A30" /></TouchableOpacity>
              </View>
            )}
            {experience && (
              <View style={styles.activeChip}>
                <Text style={styles.activeChipText}>Experienced</Text>
                <TouchableOpacity onPress={() => setExperience(false)}><Icon name="close" size={14} color="#FF7A30" /></TouchableOpacity>
              </View>
            )}
            {mostContacted && (
              <View style={styles.activeChip}>
                <Text style={styles.activeChipText}>Most Contacted</Text>
                <TouchableOpacity onPress={() => setMostContacted(false)}><Icon name="close" size={14} color="#FF7A30" /></TouchableOpacity>
              </View>
            )}
            {minRating > 0 && (
              <View style={styles.activeChip}>
                <Text style={styles.activeChipText}>Rating {minRating}+</Text>
                <TouchableOpacity onPress={() => setMinRating(0)}><Icon name="close" size={14} color="#FF7A30" /></TouchableOpacity>
              </View>
            )}
            {hasLocation && (
              <View style={styles.activeChip}>
                <Text style={styles.activeChipText}>{selectedRadius}km</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Search')}><Icon name="close" size={14} color="#FF7A30" /></TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>
            {searchQuery || activeFiltersCount > 0 ? 'Results' : 'Recommended'}
          </Text>
          <Text style={styles.resultCount}>{totalCount} found</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#FF7A30" style={{ marginVertical: 40 }} />
        ) : results.length > 0 ? (
          viewMode === 'grid' ? (
            <View style={styles.gridContainer}>
              {results.map((biz: any, index: number) => {
                const img = biz.coverImageUrl || biz.coverImage || biz.logoUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=200&auto=format&fit=crop';
                return (
                  <TouchableOpacity key={biz.id || index} style={styles.gridCard} onPress={() => navigation.navigate('BusinessDetail', { id: biz.id })}>
                    <View style={{ width: '100%', height: 90, backgroundColor: '#F1F5F9', borderTopLeftRadius: 14, borderTopRightRadius: 14 }}>
                      <Icon name="business" size={32} color="#CBD5E1" style={{ position: 'absolute', top: 28, alignSelf: 'center' }} />
                    </View>
                    <View style={{ padding: 10 }}>
                      <Text style={{ fontWeight: '700', fontSize: 12, color: '#112D4E' }} numberOfLines={1}>{biz.title || biz.name}</Text>
                      <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }} numberOfLines={1}>{biz.category?.name || ''}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
                        <Icon name="star" size={12} color="#F59E0B" />
                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#475569' }}>{Number(biz.averageRating || 0).toFixed(1)}</Text>
                        <Text style={{ fontSize: 10, color: '#94A3B8' }}>· {biz.city || ''}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            results.map((biz: any, index: number) => (
              <BusinessCard
                key={biz.id || index}
                business={biz}
                onPress={() => navigation.navigate('BusinessDetail', { id: biz.id })}
                onSave={() => handleSave(biz)}
              />
            ))
          )
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Icon name="search-off" size={48} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Results Found</Text>
            <Text style={styles.emptyText}>
              We couldn't find any businesses matching your exact filters. Try clearing some filters or searching broadly.
            </Text>
            <TouchableOpacity
              style={styles.clearAllBtn}
              onPress={() => {
                setSearchQuery(''); setSelectedCategory(''); setSelectedCountry('');
                setSelectedCity(''); setOpenNow(false); setTopRated(false);
                setVerifiedOnly(false); setOnlineNow(false); setFastResponse(false);
                setExperience(false); setMostContacted(false); setMinRating(0);
                setSortBy('recommended');
              }}
            >
              <Text style={styles.clearAllBtnText}>Clear All Filters</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>

      <Modal visible={isFilterModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setFilterModalVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FDFCFB' }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setFilterModalVisible(false)}>
              <Icon name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            <View style={styles.filterRow}>
              {SORT_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.filterChip, sortBy === opt.key && styles.filterChipActiveDark]}
                  onPress={() => setSortBy(opt.key)}
                >
                  <Icon name={opt.icon} size={16} color={sortBy === opt.key ? '#FFF' : '#64748B'} />
                  <Text style={[styles.filterChipText, sortBy === opt.key && styles.filterChipTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Distance</Text>
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[styles.filterChip, !hasLocation && styles.filterChipDisabled]}
                disabled={!hasLocation}
              >
                <Icon name="my-location" size={16} color={!hasLocation ? '#CBD5E1' : '#FF7A30'} />
                <Text style={[styles.filterChipText, !hasLocation && styles.filterChipTextDisabled]}>
                  {hasLocation ? `${selectedRadius}km` : 'Enable GPS first'}
                </Text>
              </TouchableOpacity>
              {RADIUS_OPTIONS.map(r => (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.filterChip, hasLocation && selectedRadius === r.value && styles.filterChipActiveOrange]}
                  onPress={() => hasLocation && setSelectedRadius(r.value)}
                  disabled={!hasLocation}
                >
                  <Text style={[styles.filterChipText, hasLocation && selectedRadius === r.value && styles.filterChipTextActive]}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Country</Text>
            <View style={styles.filterRow}>
              <TouchableOpacity style={[styles.filterChip, !selectedCountry && styles.filterChipActiveDark]} onPress={() => { setSelectedCountry(''); setSelectedCity(''); }}>
                <Text style={[styles.filterChipText, !selectedCountry && styles.filterChipTextActive]}>All Countries</Text>
              </TouchableOpacity>
              {countries.map((c: any, idx: number) => {
                const name = typeof c === 'string' ? c : c.name;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.filterChip, selectedCountry === name && styles.filterChipActiveDark]}
                    onPress={() => { setSelectedCountry(selectedCountry === name ? '' : name); setSelectedCity(''); }}
                  >
                    <Text style={[styles.filterChipText, selectedCountry === name && styles.filterChipTextActive]}>{name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.filterSectionTitle}>City</Text>
            <View style={styles.filterRow}>
              <TouchableOpacity style={[styles.filterChip, !selectedCity && styles.filterChipActiveOrange]} onPress={() => setSelectedCity('')}>
                <Text style={[styles.filterChipText, !selectedCity && styles.filterChipTextActive]}>Anywhere</Text>
              </TouchableOpacity>
              {cities.map((city: any) => (
                <TouchableOpacity
                  key={city.id}
                  style={[styles.filterChip, selectedCity === city.name && styles.filterChipActiveOrange]}
                  onPress={() => setSelectedCity(selectedCity === city.name ? '' : city.name)}
                >
                  <Text style={[styles.filterChipText, selectedCity === city.name && styles.filterChipTextActive]}>{city.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Categories</Text>
            <View style={styles.filterRow}>
              <TouchableOpacity style={[styles.filterChip, !selectedCategory && styles.filterChipActiveDark]} onPress={() => setSelectedCategory('')}>
                <Text style={[styles.filterChipText, !selectedCategory && styles.filterChipTextActive]}>All Categories</Text>
              </TouchableOpacity>
              {categories.slice(0, 15).map((cat: any) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.filterChip, selectedCategory === cat.id && styles.filterChipActiveDark]}
                  onPress={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                >
                  <Text style={[styles.filterChipText, selectedCategory === cat.id && styles.filterChipTextActive]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Minimum Rating</Text>
            <View style={styles.filterRow}>
              {[0, 2, 3, 4, 4.5].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.filterChip, minRating === r && styles.filterChipActiveOrange]}
                  onPress={() => setMinRating(minRating === r ? 0 : r)}
                >
                  <Icon name="star" size={14} color={minRating === r ? '#FFF' : '#F59E0B'} />
                  <Text style={[styles.filterChipText, minRating === r && styles.filterChipTextActive]}>{r === 0 ? 'Any' : `${r}+`}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Quick Filters</Text>
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[styles.filterChip, openNow && styles.filterChipActiveOrange]}
                onPress={() => setOpenNow(!openNow)}
              >
                <Icon name="schedule" size={16} color={openNow ? '#FFF' : '#64748B'} />
                <Text style={[styles.filterChipText, openNow && styles.filterChipTextActive]}>Open Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, topRated && styles.filterChipActiveOrange]}
                onPress={() => setTopRated(!topRated)}
              >
                <Icon name="star" size={16} color={topRated ? '#FFF' : '#64748B'} />
                <Text style={[styles.filterChipText, topRated && styles.filterChipTextActive]}>Top Rated (4.5+)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, verifiedOnly && styles.filterChipActiveBlue]}
                onPress={() => setVerifiedOnly(!verifiedOnly)}
              >
                <Icon name="verified" size={16} color={verifiedOnly ? '#FFF' : '#64748B'} />
                <Text style={[styles.filterChipText, verifiedOnly && styles.filterChipTextActive]}>Verified Only</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, onlineNow && styles.filterChipActiveDark]}
                onPress={() => setOnlineNow(!onlineNow)}
              >
                <Icon name="wifi" size={16} color={onlineNow ? '#FFF' : '#64748B'} />
                <Text style={[styles.filterChipText, onlineNow && styles.filterChipTextActive]}>Online Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, fastResponse && styles.filterChipActiveBlue]}
                onPress={() => setFastResponse(!fastResponse)}
              >
                <Icon name="flash-on" size={16} color={fastResponse ? '#FFF' : '#64748B'} />
                <Text style={[styles.filterChipText, fastResponse && styles.filterChipTextActive]}>Fast Response</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, experience && styles.filterChipActiveDark]}
                onPress={() => setExperience(!experience)}
              >
                <Icon name="work" size={16} color={experience ? '#FFF' : '#64748B'} />
                <Text style={[styles.filterChipText, experience && styles.filterChipTextActive]}>Experienced</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, mostContacted && styles.filterChipActiveOrange]}
                onPress={() => setMostContacted(!mostContacted)}
              >
                <Icon name="trending-up" size={16} color={mostContacted ? '#FFF' : '#64748B'} />
                <Text style={[styles.filterChipText, mostContacted && styles.filterChipTextActive]}>Most Contacted</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 30 }} />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.showResultsBtn} onPress={() => setFilterModalVisible(false)}>
              <Text style={styles.showResultsBtnText}>Show Results</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFCFB' },
  header: { backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'ios' ? 56 : 48, paddingBottom: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', zIndex: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#112D4E' },
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  searchBox: { flex: 1, backgroundColor: '#F8FAFC', flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, marginLeft: 12, height: 24, color: '#1E293B', fontWeight: '700', fontSize: 16 },
  filterBtn: { marginLeft: 12, width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  filterBtnActive: { backgroundColor: '#112D4E', borderColor: '#112D4E' },
  filterBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#FF7A30', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  filterBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  gridListBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  quickFilters: { marginTop: 12, flexDirection: 'row' },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', gap: 4 },
  chipActiveOrange: { backgroundColor: '#FF7A30', borderColor: '#FF7A30' },
  chipActiveBlue: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  chipActiveDark: { backgroundColor: '#112D4E', borderColor: '#112D4E' },
  chipNearMe: { borderColor: '#FF7A30', backgroundColor: '#FFF7ED' },
  chipText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  chipTextActiveOrange: { color: '#FFFFFF' },
  chipTextActiveBlue: { color: '#FFFFFF' },
  chipTextActiveDark: { color: '#FFFFFF' },
  chipTextNearMe: { color: '#FF7A30' },
  resultsContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },
  activeChipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, gap: 8 },
  activeChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: '#FF7A30', gap: 6 },
  activeChipText: { fontSize: 12, fontWeight: '700', color: '#FF7A30' },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  resultTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  resultCount: { fontSize: 14, fontWeight: '500', color: '#94A3B8' },
  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 24 },
  emptyIconWrap: { width: 96, height: 96, backgroundColor: '#F1F5F9', borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22 },
  clearAllBtn: { marginTop: 28, backgroundColor: '#112D4E', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  clearAllBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCard: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 12, overflow: 'hidden' },
  modalHeader: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#112D4E' },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9' },
  modalScroll: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  filterSectionTitle: { fontSize: 16, fontWeight: '800', color: '#112D4E', marginBottom: 12, marginTop: 8 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', gap: 4 },
  filterChipActiveOrange: { backgroundColor: '#FF7A30', borderColor: '#FF7A30' },
  filterChipActiveBlue: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  filterChipActiveDark: { backgroundColor: '#112D4E', borderColor: '#112D4E' },
  filterChipDisabled: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  filterChipText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  filterChipTextActive: { color: '#FFFFFF' },
  filterChipTextDisabled: { color: '#CBD5E1' },
  modalFooter: { padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  showResultsBtn: { backgroundColor: '#112D4E', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  showResultsBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 17 },
});
