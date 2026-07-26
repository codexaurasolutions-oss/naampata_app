import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

export default function ExpertQuoteScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [preferredContact, setPreferredContact] = useState('phone');
  const [city, setCity] = useState('');
  const { isAuthenticated } = useAuthStore();

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.getAll(),
  });
  const categories = categoriesData || [];

  const { data: citiesData } = useQuery({
    queryKey: ['cities'],
    queryFn: () => api.cities.getAll(),
  });
  const cities = citiesData || [];

  const submitMutation = useMutation({
    mutationFn: () => api.expertQuote.create({
      name, email, phone, categoryId, description, preferredContact, city,
    }),
    onSuccess: () => {
      Alert.alert('Success', 'Your request has been submitted! Experts in your area will respond shortly.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit. Please try again.');
    },
  });

  const handleSubmit = () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to submit an expert quote request.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Auth', { screen: 'Login' }) },
      ]);
      return;
    }
    if (!name.trim()) return Alert.alert('Error', 'Please enter your name.');
    if (!email.trim()) return Alert.alert('Error', 'Please enter your email.');
    if (!phone.trim()) return Alert.alert('Error', 'Please enter your phone number.');
    if (!categoryId) return Alert.alert('Error', 'Please select a category.');
    if (!description.trim()) return Alert.alert('Error', 'Please describe what you need.');
    if (!city.trim()) return Alert.alert('Error', 'Please enter your city.');
    submitMutation.mutate();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-[#FDFCFB]">
      <View className="bg-white pt-14 pb-4 px-4 flex-row items-center shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#112D4E" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#112D4E] ml-4">Get Expert Quotes</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        <View className="w-16 h-16 rounded-2xl bg-blue-50 items-center justify-center mb-4">
          <Icon name="campaign" size={32} color="#3B82F6" />
        </View>
        <Text className="text-3xl font-black text-[#112D4E] mb-2">Post a Requirement</Text>
        <Text className="text-slate-500 mb-8">
          Describe what you need and local experts will send you quotes within minutes.
        </Text>

        <Text className="font-bold text-slate-700 mb-2">Your Name *</Text>
        <TextInput
          className="bg-white border border-slate-200 rounded-xl p-4 h-12 text-slate-900 mb-4"
          placeholder="John Doe"
          placeholderTextColor="#94A3B8"
          value={name}
          onChangeText={setName}
        />

        <Text className="font-bold text-slate-700 mb-2">Email *</Text>
        <TextInput
          className="bg-white border border-slate-200 rounded-xl p-4 h-12 text-slate-900 mb-4"
          placeholder="john@example.com"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text className="font-bold text-slate-700 mb-2">Phone Number *</Text>
        <TextInput
          className="bg-white border border-slate-200 rounded-xl p-4 h-12 text-slate-900 mb-4"
          placeholder="+1 234 567 890"
          placeholderTextColor="#94A3B8"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text className="font-bold text-slate-700 mb-2">Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {categories.map((cat: any) => (
            <TouchableOpacity
              key={cat.id}
              className={`px-4 py-2 rounded-full mr-2 border ${categoryId === cat.id ? 'bg-[#112D4E] border-[#112D4E]' : 'bg-white border-slate-200'}`}
              onPress={() => setCategoryId(cat.id)}
            >
              <Text className={`font-bold text-sm ${categoryId === cat.id ? 'text-white' : 'text-slate-600'}`}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text className="font-bold text-slate-700 mb-2">City *</Text>
        <TextInput
          className="bg-white border border-slate-200 rounded-xl p-4 h-12 text-slate-900 mb-4"
          placeholder="e.g. New York, London..."
          placeholderTextColor="#94A3B8"
          value={city}
          onChangeText={setCity}
        />

        <Text className="font-bold text-slate-700 mb-2">Preferred Contact Method</Text>
        <View className="flex-row mb-4">
          {['phone', 'email', 'whatsapp'].map((method) => (
            <TouchableOpacity
              key={method}
              className={`flex-1 py-3 rounded-xl items-center mr-2 border ${preferredContact === method ? 'bg-[#FF7A30] border-[#FF7A30]' : 'bg-white border-slate-200'}`}
              onPress={() => setPreferredContact(method)}
            >
              <Text className={`font-bold text-sm capitalize ${preferredContact === method ? 'text-white' : 'text-slate-600'}`}>{method}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="font-bold text-slate-700 mb-2">Describe What You Need *</Text>
        <TextInput
          className="bg-white border border-slate-200 rounded-2xl p-4 h-32 text-slate-900 mb-8"
          placeholder="e.g. I need a plumber to fix a leaking pipe in my kitchen..."
          placeholderTextColor="#94A3B8"
          multiline
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity
          className="bg-[#FF7A30] rounded-2xl py-4 items-center mb-8"
          onPress={handleSubmit}
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text className="text-white font-black text-lg">Submit Request</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
