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

export default function CategoryDetailScreen({ route, navigation }: any) {
  const { categoryId, categoryName } = route.params || {};
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [selectedCity, setSelectedCity] = useState('');

  const { data: categoryData, isLoading: loadingCategory } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => api.categories.getById(categoryId),
    enabled: !!categoryId,
  });

  const { data: businessesData, isLoading: loadingBusinesses } = useQuery({
    queryKey: ['categoryBusinesses', categoryId, sortBy, selectedCity],
    queryFn: () => {
      const params: any = { category: categoryId };
      if (sortBy === 'top_rated') params.sortBy = 'rating';
      else if (sortBy === 'most_reviewed') params.sortBy = 'reviews';
      else params.sortBy = 'relevance';
      if (selectedCity) params.city = selectedCity;
      return api.listings.search(params);
    },
    enabled: !!categoryId,
  });

  const { data: citiesData } = useQuery({ queryKey: ['cities'], queryFn: () => api.cities.getAll() });
  const cities = citiesData || [];

  const category = categoryData || {};
  const businesses = businessesData || [];

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-back" size={24} color="#112D4E" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-[#112D4E]">{categoryName || category.name || 'Category'}</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {category.description && (
          <View className="px-4 pt-4 pb-2">
            <Text className="text-slate-600">{category.description}</Text>
          </View>
        )}

        <View className="px-4 py-4">
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

          <Text className="font-bold text-slate-700 mb-2">City</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <TouchableOpacity
              className={`px-4 py-2 rounded-full mr-2 border ${!selectedCity ? 'bg-[#FF7A30] border-[#FF7A30]' : 'bg-white border-slate-200'}`}
              onPress={() => setSelectedCity('')}
            >
              <Text className={`font-bold text-sm ${!selectedCity ? 'text-white' : 'text-slate-600'}`}>All</Text>
            </TouchableOpacity>
            {cities.map((city: any) => (
              <TouchableOpacity
                key={city.id}
                className={`px-4 py-2 rounded-full mr-2 border ${selectedCity === city.name ? 'bg-[#FF7A30] border-[#FF7A30]' : 'bg-white border-slate-200'}`}
                onPress={() => setSelectedCity(selectedCity === city.name ? '' : city.name)}
              >
                <Text className={`font-bold text-sm ${selectedCity === city.name ? 'text-white' : 'text-slate-600'}`}>{city.name}</Text>
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
              <Icon name="storefront" size={64} color="#E2E8F0" />
              <Text className="text-slate-500 mt-4">No businesses found in this category.</Text>
            </View>
          )}
        </View>
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
