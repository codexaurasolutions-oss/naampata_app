import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import BusinessCard from '../../components/BusinessCard';

type SortOption = 'recommended' | 'top_rated' | 'most_reviewed';

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'top_rated', label: 'Top Rated' },
  { key: 'most_reviewed', label: 'Most Reviewed' },
];

export default function CityDetailScreen({ route, navigation }: any) {
  const { cityId, cityName } = route.params || {};
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: cityData, isLoading: loadingCity } = useQuery({
    queryKey: ['city', cityId],
    queryFn: () => api.cities.getBySlug(cityName?.toLowerCase().replace(/\s+/g, '-')),
    enabled: !!cityName,
  });

  const { data: businessesData, isLoading: loadingBusinesses } = useQuery({
    queryKey: ['cityBusinesses', cityName, sortBy, selectedCategory],
    queryFn: () => {
      const params: any = {};
      if (cityName) params.city = cityName;
      if (selectedCategory) params.category = selectedCategory;
      if (sortBy === 'top_rated') params.sortBy = 'rating';
      else if (sortBy === 'most_reviewed') params.sortBy = 'reviews';
      else params.sortBy = 'relevance';
      return api.listings.search(params);
    },
    enabled: !!cityName,
  });

  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: () => api.categories.getAll() });
  const categories = categoriesData?.data || categoriesData?.categories || (Array.isArray(categoriesData) ? categoriesData : []);

  const city = cityData || {};
  const businesses = businessesData?.data || businessesData?.businesses || (Array.isArray(businessesData) ? businessesData : []);

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-back" size={24} color="#112D4E" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-[#112D4E]">{cityName || city.name || 'City'}</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-[#112D4E] rounded-3xl p-6 mx-4 mt-4 mb-4">
          <View className="flex-row items-center mb-2">
            <Icon name="location-on" size={20} color="#FF7A30" />
            <Text className="text-white font-bold text-xl ml-2">{cityName || city.name}</Text>
          </View>
          {city.country && (
            <Text className="text-blue-200 text-sm">{city.country}</Text>
          )}
          <Text className="text-white/80 text-sm mt-2">{businesses.length} businesses in this city</Text>
        </View>

        <View className="px-4 py-2">
          <Text className="font-bold text-slate-700 mb-2">Sort By</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                className={`px-4 py-2 rounded-full mr-2 border ${sortBy === opt.key ? 'bg-[#112D4E] border-[#112D4E]' : 'bg-white border-slate-200'}`}
                onPress={() => setSortBy(opt.key)}
              >
                <Text className={`font-bold text-sm ${sortBy === opt.key ? 'text-white' : 'text-slate-600'}`}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text className="font-bold text-slate-700 mb-2">Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <TouchableOpacity
              className={`px-4 py-2 rounded-full mr-2 border ${!selectedCategory ? 'bg-[#FF7A30] border-[#FF7A30]' : 'bg-white border-slate-200'}`}
              onPress={() => setSelectedCategory('')}
            >
              <Text className={`font-bold text-sm ${!selectedCategory ? 'text-white' : 'text-slate-600'}`}>All</Text>
            </TouchableOpacity>
            {categories.slice(0, 15).map((cat: any) => (
              <TouchableOpacity
                key={cat.id}
                className={`px-4 py-2 rounded-full mr-2 border ${selectedCategory === cat.id ? 'bg-[#FF7A30] border-[#FF7A30]' : 'bg-white border-slate-200'}`}
                onPress={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
              >
                <Text className={`font-bold text-sm ${selectedCategory === cat.id ? 'text-white' : 'text-slate-600'}`}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="px-4">
          <Text className="text-slate-500 font-medium mb-4">{businesses.length} businesses found</Text>
          {loadingBusinesses ? (
            <ActivityIndicator color="#FF7A30" className="my-10" />
          ) : businesses.length > 0 ? (
            businesses.map((biz: any, index: number) => (
              <BusinessCard
                key={biz.id || index}
                business={biz}
                onPress={() => navigation.navigate('BusinessDetail', { id: biz.id })}
              />
            ))
          ) : (
            <View className="items-center mt-10 py-10">
              <Icon name="location-city" size={64} color="#E2E8F0" />
              <Text className="text-slate-500 mt-4">No businesses found in this city.</Text>
            </View>
          )}
        </View>
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
