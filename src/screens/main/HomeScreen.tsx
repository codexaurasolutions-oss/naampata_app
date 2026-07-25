import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: categoriesData, isLoading: loadingCategories } = useQuery({ queryKey: ['categories', 'popular'], queryFn: () => api.categories.getPopular() });
  const { data: featuredData, isLoading: loadingBusinesses } = useQuery({ queryKey: ['businesses', 'featured'], queryFn: () => api.listings.getFeatured(1, 12) });

  const categories = categoriesData?.data || [];
  const featuredBusinesses = featuredData?.data || [];

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="pt-20 pb-12 px-4 items-center">
          <Text className="text-4xl font-black text-[#112D4E] text-center mb-4 leading-tight">
            Discover Local Businesses{'\n'}
            <Text className="text-[#FF7A30]">Instantly</Text>
          </Text>
          <Text className="text-base text-slate-500 text-center mb-8 font-medium px-4">
            Search, compare & contact the best services near you — fast and reliable.
          </Text>

          {/* Search Bar - Web Style */}
          <View className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
            <View className="flex-row items-center px-4 py-3 border-b border-gray-50">
              <Icon name="public" size={20} color="#CBD5E1" />
              <Text className="ml-3 text-slate-400 font-medium">All Countries</Text>
            </View>
            <View className="flex-row items-center px-4 py-3 border-b border-gray-50">
              <View className="flex-col">
                <Text className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Your Area</Text>
                <Text className="text-slate-400 font-medium mt-1">Select City...</Text>
              </View>
            </View>
            <View className="flex-row items-center px-4 py-3">
              <Icon name="search" size={20} color="#CBD5E1" />
              <TextInput 
                placeholder="Search categories or businesses..."
                className="flex-1 ml-3 h-10 text-slate-900 font-medium"
                placeholderTextColor="#CBD5E1"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => navigation.navigate('Search', { initialQuery: searchQuery })}
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity 
              className="bg-[#FF7A30] py-4 items-center justify-center flex-row"
              onPress={() => navigation.navigate('Search', { initialQuery: searchQuery })}
            >
              <Icon name="search" size={20} color="#FFF" />
              <Text className="text-white font-black text-lg ml-2">Search</Text>
            </TouchableOpacity>
          </View>

          {/* CTA Cards */}
          <View className="w-full mb-8">
            <TouchableOpacity 
              className="bg-white rounded-3xl border border-gray-50 p-6 flex-row items-center mb-4 shadow-sm"
              onPress={() => navigation.navigate('Offers')}
            >
              <View className="w-16 h-16 rounded-2xl bg-orange-50 items-center justify-center">
                <Icon name="local-offer" size={32} color="#F97316" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-black text-[#112D4E] text-xl mb-1">Hot Local Deals</Text>
                <Text className="text-slate-400 font-medium">Best deals & events near you</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white rounded-3xl border border-gray-50 p-6 flex-row items-center mb-4 shadow-sm"
              onPress={() => navigation.navigate('Events')}
            >
              <View className="w-16 h-16 rounded-2xl bg-purple-50 items-center justify-center">
                <Icon name="event" size={32} color="#A855F7" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-black text-[#112D4E] text-xl mb-1">Local Events</Text>
                <Text className="text-slate-400 font-medium">Discover what's happening near you</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white rounded-3xl border border-gray-50 p-6 flex-row items-center shadow-sm"
              onPress={() => navigation.navigate('ExpertQuote')}
            >
              <View className="w-16 h-16 rounded-2xl bg-blue-50 items-center justify-center">
                <Icon name="campaign" size={32} color="#3B82F6" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-black text-[#112D4E] text-xl mb-1">Get Expert Quotes</Text>
                <Text className="text-slate-400 font-medium">Post your requirement easily</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Feature Highlights */}
          <View className="w-full bg-white/50 rounded-3xl border border-gray-100 p-4 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm border border-gray-50">
                <Icon name="verified-user" size={20} color="#F97316" />
              </View>
              <View className="ml-3">
                <Text className="font-bold text-[#112D4E] text-xs uppercase tracking-wider">Local Businesses</Text>
                <Text className="text-slate-400 text-[10px] font-medium">Active and reliable listings</Text>
              </View>
            </View>
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm border border-gray-50">
                <Icon name="search" size={20} color="#22C55E" />
              </View>
              <View className="ml-3">
                <Text className="font-bold text-[#112D4E] text-xs uppercase tracking-wider">Fast & Easy Search</Text>
                <Text className="text-slate-400 text-[10px] font-medium">Find what you need instantly</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm border border-gray-50">
                <Icon name="headset-mic" size={20} color="#3B82F6" />
              </View>
              <View className="ml-3">
                <Text className="font-bold text-[#112D4E] text-xs uppercase tracking-wider">Local Support</Text>
                <Text className="text-slate-400 text-[10px] font-medium">We're here to help</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Popular Categories */}
        <View className="bg-white py-12 px-4">
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-[#202124] mb-2">Popular Categories</Text>
            <View className="w-12 h-1 bg-[#FF7A30] rounded-full" />
          </View>

          {loadingCategories ? (
            <ActivityIndicator color="#FF7A30" />
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {categories.slice(0, 4).map((cat: any, idx: number) => (
                <TouchableOpacity key={idx} className="w-[48%] bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 items-center">
                  <View className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 items-center justify-center mb-3">
                    <Icon name={cat.icon || 'category'} size={24} color="#2563EB" />
                  </View>
                  <Text className="font-bold text-sm text-slate-900 uppercase tracking-tight text-center">{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Featured Businesses */}
        <View className="bg-white py-12 px-4">
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-[#202124] mb-2">Featured Businesses</Text>
            <View className="w-12 h-1 bg-[#FF7A30] rounded-full" />
          </View>

          {loadingBusinesses ? (
            <ActivityIndicator color="#FF7A30" />
          ) : (
             featuredBusinesses.map((biz: any, index: number) => (
              <TouchableOpacity 
                key={biz.id || index}
                className="bg-white rounded-3xl p-3 mb-4 shadow-sm border border-border flex-row items-center"
                onPress={() => navigation.navigate('BusinessDetail', { id: biz.id })}
              >
                <Image 
                  source={{ uri: biz.coverImage || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=200&auto=format&fit=crop' }}
                  className="w-24 h-24 rounded-2xl bg-slate-200"
                />
                <View className="flex-1 ml-4 justify-center">
                  <Text className="text-textMuted text-xs font-medium mb-1">{biz.category?.name || 'Category'}</Text>
                  <Text className="text-lg font-bold text-[#112D4E] mb-1">{biz.name}</Text>
                  <View className="flex-row items-center mb-2">
                    <Icon name="star" size={16} color="#F59E0B" />
                    <Text className="text-slate-900 font-bold text-xs ml-1">{biz.rating || '4.8'}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Icon name="location-on" size={14} color="#94A3B8" />
                    <Text className="text-slate-500 text-xs ml-1" numberOfLines={1}>
                      {biz.address?.city || 'New York'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* How It Works */}
        <View className="bg-white py-12 px-4 mb-10">
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-[#202124] mb-2">How It Works</Text>
            <View className="w-12 h-1 bg-[#FF7A30] rounded-full" />
          </View>
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
              <Icon name="search" size={24} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-bold text-[#202124] mb-2">Search & Find</Text>
            <Text className="text-[#70757a] text-sm text-center">Choose the service you need from our top categories.</Text>
          </View>
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
              <Icon name="favorite" size={24} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-bold text-[#202124] mb-2">Compare & Review</Text>
            <Text className="text-[#70757a] text-sm text-center">Read reviews & select the best local providers.</Text>
          </View>
          <View className="items-center">
            <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
              <Icon name="phone" size={24} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-bold text-[#202124] mb-2">Contact & Connect</Text>
            <Text className="text-[#70757a] text-sm text-center">Reach out directly to your chosen business in seconds.</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
