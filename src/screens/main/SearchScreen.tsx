import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function SearchScreen({ route, navigation }: any) {
  const [searchQuery, setSearchQuery] = useState(route?.params?.initialQuery || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // Debounce logic for suggestions
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
    : ((suggestionsData as any)?.data || []);

  const { data: categoriesData } = useQuery({ 
    queryKey: ['categories', 'popular'], 
    queryFn: () => api.categories.getPopular() 
  });
  const popularCategories = categoriesData?.data || categoriesData?.categories || (Array.isArray(categoriesData) ? categoriesData : []);

  const handleSearchSubmit = (query: string = searchQuery, categorySlug: string = '') => {
    if (!query && !categorySlug) return;
    navigation.navigate('SearchResults', { query, category: categorySlug });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-white">
      {/* Header Search Bar */}
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 border-b border-slate-100">
        <View className="flex-row items-center">
          <View className="flex-1 bg-slate-50 flex-row items-center rounded-2xl px-4 py-3 border border-slate-200">
            <Icon name="search" size={24} color="#94A3B8" />
            <TextInput 
              placeholder="Search services, businesses, locations..." 
              className="flex-1 ml-3 h-6 text-slate-800 font-bold"
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
      </View>

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        {/* Auto Suggestions */}
        {searchQuery.length > 1 && (
          <View className="bg-white py-2 border-b border-slate-100 shadow-sm">
            {loadingSuggestions ? (
              <ActivityIndicator color="#FF7A30" className="py-4" />
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion: string, idx: number) => (
                <TouchableOpacity 
                  key={idx} 
                  className="flex-row items-center px-6 py-4 border-b border-slate-50"
                  onPress={() => handleSearchSubmit(suggestion)}
                >
                  <Icon name="search" size={20} color="#94A3B8" />
                  <Text className="ml-4 font-bold text-slate-700">{suggestion}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View className="px-6 py-4">
                <Text className="text-slate-500 font-medium">Press search to find "{searchQuery}"</Text>
              </View>
            )}
          </View>
        )}

        {/* Default View (When not searching) */}
        {searchQuery.length <= 1 && (
          <View className="px-5 pt-8">
            <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Trending Searches</Text>
            <View className="flex-row flex-wrap mb-8">
              {['Restaurants', 'Salons', 'Gyms', 'Clinics', 'Cafes'].map((term, idx) => (
                <TouchableOpacity 
                  key={idx}
                  className="px-4 py-2 bg-slate-50 rounded-full mr-2 mb-3 border border-slate-200"
                  onPress={() => {
                    setSearchQuery(term);
                    handleSearchSubmit(term);
                  }}
                >
                  <Text className="text-slate-700 font-bold text-sm">{term}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Popular Categories</Text>
            <View className="flex-row flex-wrap justify-between">
              {popularCategories.slice(0, 6).map((cat: any, idx: number) => (
                <TouchableOpacity 
                  key={idx} 
                  className="w-[48%] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-4 flex-row items-center"
                  onPress={() => handleSearchSubmit('', cat.id)}
                >
                  <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center">
                    <Icon name={cat.icon || 'category'} size={20} color="#3B82F6" />
                  </View>
                  <Text className="ml-3 font-bold text-slate-800 flex-1" numberOfLines={1}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
