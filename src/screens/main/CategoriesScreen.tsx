import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function CategoriesScreen({ navigation }: any) {
  const { data, isLoading } = useQuery({ 
    queryKey: ['categories'], 
    queryFn: () => api.categories.getAll() 
  });
  
  const categories = data?.data || data || [];

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-back" size={24} color="#112D4E" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-[#112D4E]">All Categories</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-black text-[#0F2747] mb-2">Explore Services</Text>
        <Text className="text-slate-500 font-medium mb-8">Find the best local experts in every category.</Text>

        {isLoading ? (
          <ActivityIndicator color="#FF7A30" className="my-10" />
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {categories.map((cat: any) => (
              <TouchableOpacity 
                key={cat.id}
                className="w-[48%] bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100 items-center justify-center h-40"
                onPress={() => navigation.navigate('Search', { initialQuery: '', selectedCategory: cat.id })}
              >
                <View className="w-16 h-16 bg-blue-50 rounded-2xl items-center justify-center mb-4 border border-blue-100">
                  <Icon name={cat.icon || "category"} size={32} color="#2563EB" />
                </View>
                <Text className="font-bold text-slate-800 text-center">{cat.name}</Text>
                <Text className="text-xs font-medium text-slate-400 mt-1">{cat.businessesCount || 0} listings</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
