import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, PermissionsAndroid, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function DemandScreen({ navigation }: any) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
        }
        const geo = (globalThis as any).navigator?.geolocation;
        if (geo) {
          geo.getCurrentPosition(
            (pos: { coords: { latitude: number; longitude: number } }) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => setCoords({ lat: 30.3753, lng: 69.3451 }),
            { timeout: 5000 }
          );
        } else {
          setCoords({ lat: 30.3753, lng: 69.3451 });
        }
      } catch {
        setCoords({ lat: 30.3753, lng: 69.3451 });
      }
    };
    getLocation();
  }, []);

  const lat = coords?.lat ?? 30.3753;
  const lng = coords?.lng ?? 69.3451;

  const { data, isLoading, error } = useQuery({
    queryKey: ['demand', lat, lng],
    queryFn: () => api.demand.getNearby(lat, lng),
    enabled: !!coords,
  });

  const insights = data || [];

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-back" size={24} color="#112D4E" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-[#112D4E]">Market Demand</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center mb-2">
          <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-3">
            <Icon name="trending-up" size={24} color="#2563EB" />
          </View>
          <Text className="text-3xl font-black text-[#0F2747]">Nearby Demand</Text>
        </View>
        <Text className="text-slate-500 font-medium mb-8 leading-relaxed">
          Discover what customers are searching for in your local area right now. Tailor your services to meet local needs.
        </Text>

        {isLoading ? (
          <ActivityIndicator color="#2563EB" className="my-10" />
        ) : error ? (
          <View className="bg-red-50 p-6 rounded-2xl border border-red-100 items-center">
            <Icon name="error-outline" size={32} color="#EF4444" />
            <Text className="text-red-600 font-bold mt-2">Failed to load insights.</Text>
          </View>
        ) : insights.length === 0 ? (
          <View className="items-center justify-center py-10 bg-white rounded-3xl border border-slate-100">
            <Icon name="analytics" size={64} color="#CBD5E1" />
            <Text className="text-xl font-bold text-slate-800 mt-4">No strong trends right now</Text>
            <Text className="text-slate-500 text-center mt-2 px-6">There isn't a significant volume of local searches in your immediate area to show trending data.</Text>
          </View>
        ) : (
          <View className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden mb-8">
            <View className="p-5 border-b border-slate-100 bg-slate-50 flex-row justify-between items-center">
              <Text className="font-bold text-slate-800">Trending Keywords</Text>
              <View className="flex-row items-center bg-white px-3 py-1 rounded-full border border-slate-200">
                <Icon name="my-location" size={14} color="#FF7A30" />
                <Text className="text-xs font-bold text-slate-500 ml-1">Local Area</Text>
              </View>
            </View>
            
            {insights.map((insight: any, idx: number) => (
              <View key={idx} className="p-5 border-b border-slate-50 flex-row items-center">
                <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mr-4">
                  <Text className="text-blue-600 font-black">#{idx + 1}</Text>
                </View>
                
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-lg font-bold text-slate-900 capitalize mr-2">{insight.keyword}</Text>
                    {insight.isTrending && (
                      <View className="bg-green-100 px-2 py-0.5 rounded-md flex-row items-center">
                        <Icon name="local-fire-department" size={12} color="#16A34A" />
                        <Text className="text-green-700 text-[10px] font-bold uppercase ml-1">Hot</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm font-medium text-slate-500 mt-1">Activity Score: {insight.score}</Text>
                </View>
                
                <View className="items-end">
                  <Text className="font-bold text-slate-800">{insight.count24h}</Text>
                  <Text className="text-[10px] uppercase font-bold text-slate-400">Last 24h</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
