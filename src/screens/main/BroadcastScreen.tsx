import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

export default function BroadcastScreen({ navigation }: any) {
  const { isAuthenticated, user } = useAuthStore();

  const [step, setStep] = useState(1);
  const [categoryId, setCategoryId] = useState('');
  const [cityId, setCityId] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');

  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: () => api.categories.getAll() });
  const { data: citiesData } = useQuery({ queryKey: ['cities'], queryFn: () => api.cities.getAll() });
  
  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || categoriesData?.categories || []);
  const cities = Array.isArray(citiesData) ? citiesData : (citiesData?.data || citiesData?.cities || []);

  const broadcastMutation = useMutation({
    mutationFn: (data: any) => api.expertQuote.create(data), // Using the existing quote API for broadcasts
    onSuccess: () => {
      Alert.alert(
        "Broadcast Sent! 🚀", 
        "Your requirement has been instantly sent to top local experts. You will receive quotes shortly.",
        [{ text: "Awesome", onPress: () => navigation.navigate('Home') }]
      );
    },
    onError: (err: any) => {
      Alert.alert("Error", err.response?.data?.message || "Failed to broadcast your request.");
    }
  });

  const handleBroadcast = () => {
    if (!isAuthenticated) {
      Alert.alert("Login Required", "You must be logged in to broadcast a request.");
      navigation.navigate('Auth', { screen: 'Login' });
      return;
    }
    if (user?.role === 'vendor') {
      Alert.alert("Access Denied", "Vendor accounts cannot broadcast requests.");
      return;
    }

    broadcastMutation.mutate({
      categoryId,
      cityId,
      description,
      budget: budget ? Number(budget) : undefined,
      isBroadcast: true // Flag for backend to route to all relevant vendors
    });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-[#FDFCFB]">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 border-b border-slate-100 flex-row items-center">
        {step > 1 ? (
          <TouchableOpacity onPress={() => setStep(step - 1)} className="mr-4">
            <Icon name="arrow-back" size={24} color="#112D4E" />
          </TouchableOpacity>
        ) : (
          <View className="w-6 mr-4" />
        )}
        <Text className="text-xl font-black text-[#112D4E] flex-1 text-center pr-10">Broadcast Request</Text>
      </View>

      <ScrollView className="flex-1 px-5 py-8" showsVerticalScrollIndicator={false}>
        
        {step === 1 && (
          <View>
            <View className="flex-row items-center mb-6">
              <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mr-4 border border-blue-100">
                <Icon name="radar" size={24} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text className="text-3xl font-black text-[#0F2747] leading-tight">What do you need?</Text>
                <Text className="text-slate-500 font-medium mt-1">Select a category to find experts.</Text>
              </View>
            </View>

            <View className="flex-row flex-wrap mb-8">
              {categories.map((cat: any) => (
                <TouchableOpacity 
                  key={cat.id}
                  className={`w-[48%] p-4 rounded-2xl mb-4 mr-2 border ${categoryId === cat.id ? 'bg-[#112D4E] border-[#112D4E]' : 'bg-white border-slate-200 shadow-sm'}`}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Text className={`font-bold text-center ${categoryId === cat.id ? 'text-white' : 'text-slate-700'}`}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text className="text-3xl font-black text-[#0F2747] leading-tight mb-2">Describe Your Need</Text>
            <Text className="text-slate-500 font-medium mb-8">The more details you provide, the better quotes you'll get.</Text>

            <View className="mb-6">
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Requirement Details</Text>
              <TextInput 
                className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-800 text-base h-32"
                placeholder="I am looking for a professional to..."
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View className="mb-8">
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Estimated Budget (Optional)</Text>
              <View className="bg-white border border-slate-200 rounded-2xl flex-row items-center px-4 h-14">
                <Icon name="attach-money" size={20} color="#94A3B8" />
                <TextInput 
                  className="flex-1 ml-2 text-slate-800 text-base"
                  placeholder="e.g. 5000"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={budget}
                  onChangeText={setBudget}
                />
              </View>
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text className="text-3xl font-black text-[#0F2747] leading-tight mb-2">Where do you need it?</Text>
            <Text className="text-slate-500 font-medium mb-8">Select the city for this requirement.</Text>

            <View className="flex-row flex-wrap mb-8">
              {cities.map((city: any) => (
                <TouchableOpacity 
                  key={city.id}
                  className={`w-full p-4 rounded-2xl mb-3 border flex-row items-center ${cityId === city.id ? 'bg-[#FF7A30] border-[#FF7A30]' : 'bg-white border-slate-200 shadow-sm'}`}
                  onPress={() => setCityId(city.id)}
                >
                  <Icon name="location-city" size={24} color={cityId === city.id ? "#FFF" : "#64748B"} />
                  <Text className={`font-bold ml-3 text-lg ${cityId === city.id ? 'text-white' : 'text-slate-700'}`}>
                    {city.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View className="h-32" />
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-100 shadow-lg">
        {step < 3 ? (
          <TouchableOpacity 
            className={`py-4 rounded-xl items-center ${
              (step === 1 && !categoryId) || (step === 2 && description.length < 10) 
              ? 'bg-slate-200' 
              : 'bg-[#112D4E]'
            }`}
            onPress={() => setStep(step + 1)}
            disabled={(step === 1 && !categoryId) || (step === 2 && description.length < 10)}
          >
            <Text className={`font-bold text-lg ${
              (step === 1 && !categoryId) || (step === 2 && description.length < 10) 
              ? 'text-slate-400' 
              : 'text-white'
            }`}>
              Continue
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            className={`py-4 rounded-xl items-center flex-row justify-center ${!cityId ? 'bg-slate-200' : 'bg-[#FF7A30]'}`}
            onPress={handleBroadcast}
            disabled={!cityId || broadcastMutation.isPending}
          >
            {broadcastMutation.isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Icon name="send" size={20} color={!cityId ? '#94A3B8' : '#FFF'} className="mr-2" />
                <Text className={`font-bold text-lg ml-2 ${!cityId ? 'text-slate-400' : 'text-white'}`}>
                  Broadcast Now
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
