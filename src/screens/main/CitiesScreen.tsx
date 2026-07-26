import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function CitiesScreen({ navigation }: any) {
  const [search, setSearch] = React.useState('');
  
  const { data, isLoading } = useQuery({ 
    queryKey: ['cities'], 
    queryFn: () => api.cities.getAll()
  });
  
  const cities = data?.data || data?.cities || (Array.isArray(data) ? data : []);
  
  const filteredCities = cities.filter((c: any) => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-back" size={24} color="#112D4E" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-[#112D4E]">Locations</Text>
      </View>

      <View className="px-4 py-6 bg-white border-b border-slate-100">
        <Text className="text-3xl font-black text-[#0F2747] mb-4">Choose Your City</Text>
        <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 py-2 border border-slate-200">
          <Icon name="search" size={24} color="#94A3B8" />
          <TextInput 
            className="flex-1 ml-3 h-12 text-slate-800 text-base font-medium"
            placeholder="Search for a city..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color="#FF7A30" className="my-10" />
        ) : (
          filteredCities.map((city: any, index: number) => (
            <TouchableOpacity 
              key={city.id || index}
              className="bg-white p-5 rounded-2xl mb-3 flex-row items-center justify-between border border-slate-100 shadow-sm"
              onPress={() => navigation.navigate('Search', { initialQuery: '', selectedCity: city.id })}
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-orange-50 rounded-xl items-center justify-center border border-orange-100">
                  <Icon name="location-city" size={24} color="#FF7A30" />
                </View>
                <View className="ml-4">
                  <Text className="text-lg font-bold text-slate-800">{city.name}</Text>
                  <Text className="text-sm font-medium text-slate-400 mt-1">{city.state || 'India'}</Text>
                </View>
              </View>
              <Icon name="chevron-right" size={24} color="#CBD5E1" />
            </TouchableOpacity>
          ))
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
