import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, PermissionsAndroid, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function SearchScreen({ route, navigation }: any) {
  const [searchQuery, setSearchQuery] = useState(route?.params?.initialQuery || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: suggestionsData, isLoading: loadingSuggestions } = useQuery({
    queryKey: ['suggestions', debouncedQuery],
    queryFn: () => api.listings.getSuggestions(debouncedQuery),
    enabled: debouncedQuery.length > 1,
  });

  const suggestions: string[] = Array.isArray(suggestionsData)
    ? suggestionsData
    : ((suggestionsData as any)?.data || (suggestionsData as any)?.suggestions || []);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'popular'],
    queryFn: () => api.categories.getPopular()
  });
  const popularCategories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || categoriesData?.categories || []);

  const { data: countriesData } = useQuery({
    queryKey: ['countries'],
    queryFn: () => api.cities.getCountries(),
  });
  const countries = Array.isArray(countriesData) ? countriesData : (countriesData?.data || []);

  const { data: citiesData } = useQuery({
    queryKey: ['cities', selectedCountry],
    queryFn: () => api.cities.getAll(selectedCountry || undefined),
  });
  const cities = Array.isArray(citiesData) ? citiesData : (citiesData?.data || citiesData?.cities || []);

  const requestLocationPermission = async () => {
    setLocationLoading(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Naampata needs access to your location to find nearby businesses.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setLocationLoading(false);
          Alert.alert('Location Denied', 'Please enable location services in settings to use Near Me.');
          return;
        }
      }

      const geo = (globalThis as any).navigator?.geolocation;
      if (!geo) {
        setLocationLoading(false);
        Alert.alert('Error', 'Geolocation is not available on this device.');
        return;
      }
      geo.getCurrentPosition(
        (position: any) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setLocationLoading(false);
          navigation.navigate('SearchResults', {
            query: searchQuery || '',
            latitude,
            longitude,
            radius: 10,
            sortBy: 'distance',
          });
        },
        (error: any) => {
          setLocationLoading(false);
          Alert.alert('Location Error', 'Could not get your location. Please try again.');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (e) {
      setLocationLoading(false);
      Alert.alert('Error', 'Failed to request location permission.');
    }
  };

  const handleSearchSubmit = (query: string = searchQuery, categorySlug: string = '') => {
    if (!query && !categorySlug && !selectedCountry && !selectedCity && !userLocation) return;
    navigation.navigate('SearchResults', {
      query,
      category: categorySlug,
      country: selectedCountry || undefined,
      city: selectedCity || undefined,
      latitude: userLocation?.latitude,
      longitude: userLocation?.longitude,
    });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={s.header}>
        <View style={s.searchRow}>
          <View style={s.searchBox}>
            <Icon name="search" size={24} color="#94A3B8" />
            <TextInput
              placeholder="Search services, businesses..."
              style={s.searchInput}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              onSubmitEditing={() => handleSearchSubmit()}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="cancel" size={20} color="#CBD5E1" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={s.locationBar}>
          <TouchableOpacity style={s.nearMeBtn} onPress={requestLocationPermission} disabled={locationLoading}>
            {locationLoading ? (
              <ActivityIndicator size="small" color="#FF7A30" />
            ) : (
              <Icon name="my-location" size={18} color={userLocation ? '#FF7A30' : '#64748B'} />
            )}
            <Text style={[s.nearMeText, userLocation && { color: '#FF7A30' }]}>
              {userLocation ? 'Near Me Active' : 'My Location'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.locationPickerBtn} onPress={() => setShowLocationPicker(!showLocationPicker)}>
            <Icon name="public" size={18} color="#64748B" />
            <Text style={s.locationPickerText}>
              {selectedCountry || selectedCity ? `${selectedCity || selectedCountry}` : 'Country / City'}
            </Text>
            <Icon name={showLocationPicker ? 'expand-less' : 'expand-more'} size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        {showLocationPicker && (
          <View style={s.locationDropdown}>
            <Text style={s.locationSectionLabel}>COUNTRY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              <TouchableOpacity
                style={[s.pill, !selectedCountry && s.pillActive]}
                onPress={() => { setSelectedCountry(''); setSelectedCity(''); }}
              >
                <Text style={[s.pillText, !selectedCountry && s.pillTextActive]}>All</Text>
              </TouchableOpacity>
              {countries.map((c: any, idx: number) => {
                const name = typeof c === 'string' ? c : c.name;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[s.pill, selectedCountry === name && s.pillActive]}
                    onPress={() => { setSelectedCountry(selectedCountry === name ? '' : name); setSelectedCity(''); }}
                  >
                    <Text style={[s.pillText, selectedCountry === name && s.pillTextActive]}>{name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {selectedCountry ? (
              <>
                <Text style={s.locationSectionLabel}>CITY</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[s.pill, !selectedCity && s.pillActiveOrange]}
                    onPress={() => setSelectedCity('')}
                  >
                    <Text style={[s.pillText, !selectedCity && s.pillTextActiveOrange]}>All Cities</Text>
                  </TouchableOpacity>
                  {cities.map((city: any, idx: number) => (
                    <TouchableOpacity
                      key={idx}
                      style={[s.pill, selectedCity === city.name && s.pillActiveOrange]}
                      onPress={() => setSelectedCity(selectedCity === city.name ? '' : city.name)}
                    >
                      <Text style={[s.pillText, selectedCity === city.name && s.pillTextActiveOrange]}>{city.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : null}
          </View>
        )}
      </View>

      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        {searchQuery.length > 1 && (
          <View style={s.suggestionsContainer}>
            {loadingSuggestions ? (
              <ActivityIndicator color="#FF7A30" style={{ paddingVertical: 16 }} />
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion: string, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  style={s.suggestionItem}
                  onPress={() => handleSearchSubmit(suggestion)}
                >
                  <Icon name="search" size={20} color="#94A3B8" />
                  <Text style={s.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
                <Text style={{ color: '#64748B', fontWeight: '500' }}>Press search to find "{searchQuery}"</Text>
              </View>
            )}
          </View>
        )}

        {searchQuery.length <= 1 && (
          <View style={{ paddingHorizontal: 20, paddingTop: 32 }}>
            <Text style={s.sectionLabel}>TRENDING SEARCHES</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 32 }}>
              {['Restaurants', 'Salons', 'Gyms', 'Clinics', 'Cafes'].map((term, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={s.trendingChip}
                  onPress={() => {
                    setSearchQuery(term);
                    handleSearchSubmit(term);
                  }}
                >
                  <Text style={s.trendingChipText}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.sectionLabel}>POPULAR CATEGORIES</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {popularCategories.slice(0, 6).map((cat: any, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  style={s.categoryCard}
                  onPress={() => handleSearchSubmit('', cat.slug || cat.id)}
                >
                  <View style={s.categoryIconWrap}>
                    <Icon name={cat.icon || 'category'} size={20} color="#3B82F6" />
                  </View>
                  <Text style={s.categoryText} numberOfLines={1}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: '#FFFFFF', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', zIndex: 10 },
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  searchBox: { flex: 1, backgroundColor: '#F8FAFC', flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, marginLeft: 12, height: 24, color: '#1E293B', fontWeight: '700', fontSize: 16 },
  locationBar: { flexDirection: 'row', marginTop: 12, gap: 8 },
  nearMeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 6 },
  nearMeText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  locationPickerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 6, flex: 1 },
  locationPickerText: { flex: 1, fontSize: 13, fontWeight: '700', color: '#64748B' },
  locationDropdown: { backgroundColor: '#FFFFFF', paddingTop: 12, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  locationSectionLabel: { fontSize: 10, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#F8FAFC', borderRadius: 999, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  pillActive: { backgroundColor: '#112D4E', borderColor: '#112D4E' },
  pillActiveOrange: { backgroundColor: '#FF7A30', borderColor: '#FF7A30' },
  pillText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  pillTextActive: { color: '#FFFFFF' },
  pillTextActiveOrange: { color: '#FFFFFF' },
  suggestionsContainer: { backgroundColor: '#FFFFFF', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  suggestionText: { marginLeft: 16, fontWeight: '700', color: '#334155', fontSize: 15 },
  sectionLabel: { fontSize: 11, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 },
  trendingChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F8FAFC', borderRadius: 999, marginRight: 8, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  trendingChipText: { color: '#334155', fontWeight: '700', fontSize: 14 },
  categoryCard: { width: '48%', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 16, flexDirection: 'row', alignItems: 'center' },
  categoryIconWrap: { width: 40, height: 40, backgroundColor: '#EFF6FF', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  categoryText: { marginLeft: 12, fontWeight: '700', color: '#1E293B', flex: 1, fontSize: 14 },
});
