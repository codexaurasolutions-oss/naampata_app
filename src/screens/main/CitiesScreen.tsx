import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function CitiesScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['cities'], queryFn: () => api.cities.getAll() });
  const { data: countriesData } = useQuery({ queryKey: ['countries'], queryFn: () => api.cities.getCountries() });

  const cities = data?.data || data?.cities || (Array.isArray(data) ? data : []);
  const countries = Array.isArray(countriesData) ? countriesData : (countriesData?.data || []);

  const filteredCities = cities.filter((c: any) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesCountry = !selectedCountry || c.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const uniqueCountries = [...new Set(cities.map((c: any) => c.country).filter(Boolean))] as string[];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
          <Icon name="arrow-back" size={24} color="#112D4E" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Locations</Text>
      </View>

      <View style={s.searchSection}>
        <Text style={s.heroTitle}>Choose Your City</Text>
        <View style={s.searchBox}>
          <Icon name="search" size={22} color="#94A3B8" />
          <TextInput style={s.searchInput} placeholder="Search for a city..." placeholderTextColor="#94A3B8" value={search} onChangeText={setSearch} />
        </View>

        {uniqueCountries.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            <TouchableOpacity style={[s.pill, !selectedCountry && s.pillActive]} onPress={() => setSelectedCountry('')}>
              <Text style={[s.pillText, !selectedCountry && s.pillTextActive]}>All Countries</Text>
            </TouchableOpacity>
            {uniqueCountries.map((country: string, idx: number) => (
              <TouchableOpacity
                key={idx}
                style={[s.pill, selectedCountry === country && s.pillActive]}
                onPress={() => setSelectedCountry(selectedCountry === country ? '' : country)}
              >
                <Text style={[s.pillText, selectedCountry === country && s.pillTextActive]}>{country}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color="#FF7A30" style={{ marginVertical: 40 }} />
        ) : filteredCities.length > 0 ? (
          filteredCities.map((city: any, index: number) => (
            <TouchableOpacity key={city.id || index} style={s.cityCard} onPress={() => navigation.navigate('Search', { city: city.name, country: city.country })}>
              <View style={s.cityIconWrap}>
                <Icon name="location-city" size={24} color="#FF7A30" />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={s.cityName}>{city.name}</Text>
                <Text style={s.cityMeta}>{city.state ? `${city.state}, ` : ''}{city.country || ''}</Text>
              </View>
              <Icon name="chevron-right" size={22} color="#CBD5E1" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Icon name="location-off" size={48} color="#E2E8F0" />
            <Text style={{ color: '#94A3B8', marginTop: 12, fontSize: 15 }}>No cities found</Text>
          </View>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFCFB' },
  header: { backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'ios' ? 56 : 48, paddingBottom: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#112D4E' },
  searchSection: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#112D4E', marginBottom: 16 },
  searchBox: { backgroundColor: '#F8FAFC', flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, marginLeft: 10, height: 22, color: '#1E293B', fontWeight: '600', fontSize: 15 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F8FAFC', borderRadius: 999, marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  pillActive: { backgroundColor: '#112D4E', borderColor: '#112D4E' },
  pillText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  pillTextActive: { color: '#FFFFFF' },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  cityCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 18, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  cityIconWrap: { width: 48, height: 48, backgroundColor: '#FFF7ED', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cityName: { fontSize: 17, fontWeight: '800', color: '#112D4E' },
  cityMeta: { fontSize: 13, color: '#94A3B8', marginTop: 2, fontWeight: '500' },
});
