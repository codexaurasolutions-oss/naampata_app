import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Modal, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import BusinessCard from '../../components/BusinessCard';

export default function SearchResultsScreen({ route, navigation }: any) {
  const [searchQuery, setSearchQuery] = useState(route?.params?.query || '');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(route?.params?.category || '');
  const [selectedCity, setSelectedCity] = useState<string>(route?.params?.city || '');
  const [openNow, setOpenNow] = useState(false);
  const [topRated, setTopRated] = useState(false);

  // Fetch Options for Filters
  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: () => api.categories.getAll() });
  const { data: citiesData } = useQuery({ queryKey: ['cities'], queryFn: () => api.cities.getAll() });
  
  const categories = categoriesData?.data || categoriesData || [];
  const cities = citiesData?.data || citiesData || [];

  // Active Search Query
  const { data: searchData, isLoading } = useQuery({
    queryKey: ['search', searchQuery, selectedCategory, selectedCity, openNow, topRated],
    queryFn: () => {
      const params: any = {};
      if (searchQuery) params.query = searchQuery;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedCity) params.city = selectedCity;
      if (openNow) params.openNow = true;
      if (topRated) params.minRating = 4.5;
      
      return api.listings.search(params);
    },
  });

  const results = searchData?.data || searchData?.businesses || [];
  const activeFiltersCount = [selectedCategory, selectedCity, openNow, topRated].filter(Boolean).length;

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      {/* Search Header */}
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 border-b border-slate-100">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Icon name="arrow-back" size={24} color="#112D4E" />
          </TouchableOpacity>
          <Text className="text-2xl font-black text-[#112D4E]">Search Results</Text>
        </View>

        <View className="flex-row items-center">
          <View className="flex-1 bg-slate-50 flex-row items-center rounded-2xl px-4 py-3 border border-slate-200">
            <Icon name="search" size={24} color="#94A3B8" />
            <TextInput 
              placeholder="What are you looking for?" 
              className="flex-1 ml-3 h-6 text-slate-800 font-medium"
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
          
          {/* Advanced Filter Button */}
          <TouchableOpacity 
            className={`ml-3 w-12 h-12 rounded-2xl items-center justify-center border ${activeFiltersCount > 0 ? 'bg-[#112D4E] border-[#112D4E]' : 'bg-white border-slate-200'}`}
            onPress={() => setFilterModalVisible(true)}
          >
            <Icon name="tune" size={24} color={activeFiltersCount > 0 ? "#FFF" : "#64748B"} />
            {activeFiltersCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-[#FF7A30] w-5 h-5 rounded-full items-center justify-center border-2 border-white">
                <Text className="text-white text-[10px] font-black">{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Filter Chips (Mirroring Modal State) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 flex-row">
          <TouchableOpacity 
            className={`px-4 py-2 rounded-full mr-2 border ${openNow ? 'bg-[#FF7A30] border-[#FF7A30]' : 'bg-white border-slate-200'}`}
            onPress={() => setOpenNow(!openNow)}
          >
            <Text className={`font-bold text-sm ${openNow ? 'text-white' : 'text-slate-600'}`}>Open Now</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`px-4 py-2 rounded-full mr-2 border ${topRated ? 'bg-[#FF7A30] border-[#FF7A30]' : 'bg-white border-slate-200'}`}
            onPress={() => setTopRated(!topRated)}
          >
            <Text className={`font-bold text-sm ${topRated ? 'text-white' : 'text-slate-600'}`}>Top Rated (4.5+)</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Results Area */}
      <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-end mb-6">
          <Text className="text-xl font-bold text-slate-800">
            {searchQuery || activeFiltersCount > 0 ? 'Results' : 'Recommended'}
          </Text>
          <Text className="text-slate-500 font-medium">{results.length} found</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#FF7A30" className="my-10" />
        ) : results.length > 0 ? (
          results.map((biz: any, index: number) => (
            <BusinessCard 
              key={biz.id || index}
              business={biz}
              onPress={() => navigation.navigate('BusinessDetail', { id: biz.id })}
              onSave={() => {}} 
            />
          ))
        ) : (
          <View className="items-center mt-16 px-6">
            <View className="w-24 h-24 bg-slate-100 rounded-full items-center justify-center mb-6">
              <Icon name="search-off" size={48} color="#94A3B8" />
            </View>
            <Text className="text-2xl font-black text-slate-800 mb-2">No Results Found</Text>
            <Text className="text-slate-500 text-center leading-relaxed">
              We couldn't find any businesses matching your exact filters. Try clearing some filters or searching broadly.
            </Text>
            <TouchableOpacity 
              className="mt-8 bg-slate-900 px-6 py-3 rounded-xl"
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSelectedCity('');
                setOpenNow(false);
                setTopRated(false);
              }}
            >
              <Text className="text-white font-bold">Clear All Filters</Text>
            </TouchableOpacity>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>

      {/* Advanced Filter Modal */}
      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-[#FDFCFB]">
          <View className="px-4 py-4 border-b border-slate-100 flex-row justify-between items-center bg-white shadow-sm">
            <Text className="text-xl font-black text-slate-900">Filters</Text>
            <TouchableOpacity 
              className="bg-slate-100 w-8 h-8 rounded-full items-center justify-center"
              onPress={() => setFilterModalVisible(false)}
            >
              <Icon name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-5 py-6">
            <Text className="text-lg font-bold text-[#112D4E] mb-4">Categories</Text>
            <View className="flex-row flex-wrap mb-8">
              <TouchableOpacity 
                className={`px-4 py-2.5 rounded-xl mr-2 mb-3 border ${selectedCategory === '' ? 'bg-[#112D4E] border-[#112D4E]' : 'bg-white border-slate-200'}`}
                onPress={() => setSelectedCategory('')}
              >
                <Text className={`font-bold ${selectedCategory === '' ? 'text-white' : 'text-slate-600'}`}>All Categories</Text>
              </TouchableOpacity>
              {categories.slice(0, 15).map((cat: any) => (
                <TouchableOpacity 
                  key={cat.id}
                  className={`px-4 py-2.5 rounded-xl mr-2 mb-3 border ${selectedCategory === cat.id ? 'bg-[#112D4E] border-[#112D4E]' : 'bg-white border-slate-200'}`}
                  onPress={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                >
                  <Text className={`font-bold ${selectedCategory === cat.id ? 'text-white' : 'text-slate-600'}`}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-lg font-bold text-[#112D4E] mb-4">Location / City</Text>
            <View className="flex-row flex-wrap mb-8">
              <TouchableOpacity 
                className={`px-4 py-2.5 rounded-xl mr-2 mb-3 border ${selectedCity === '' ? 'bg-[#FF7A30] border-[#FF7A30]' : 'bg-white border-slate-200'}`}
                onPress={() => setSelectedCity('')}
              >
                <Text className={`font-bold ${selectedCity === '' ? 'text-white' : 'text-slate-600'}`}>Anywhere</Text>
              </TouchableOpacity>
              {cities.map((city: any) => (
                <TouchableOpacity 
                  key={city.id}
                  className={`px-4 py-2.5 rounded-xl mr-2 mb-3 border ${selectedCity === city.id ? 'bg-[#FF7A30] border-[#FF7A30]' : 'bg-white border-slate-200'}`}
                  onPress={() => setSelectedCity(selectedCity === city.id ? '' : city.id)}
                >
                  <Text className={`font-bold ${selectedCity === city.id ? 'text-white' : 'text-slate-600'}`}>{city.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="h-10" />
          </ScrollView>

          <View className="p-5 border-t border-slate-100 bg-white">
            <TouchableOpacity 
              className="bg-[#112D4E] py-4 rounded-xl items-center"
              onPress={() => setFilterModalVisible(false)}
            >
              <Text className="text-white font-bold text-lg">Show Results</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
