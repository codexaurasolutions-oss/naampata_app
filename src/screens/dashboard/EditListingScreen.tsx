import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Switch, Image, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function EditListingScreen({ route, navigation }: any) {
  const { listingId } = route.params;
  const queryClient = useQueryClient();

  const { data, isLoading: loadingData } = useQuery({
    queryKey: ['listingDetail', listingId],
    queryFn: () => api.listings.getById(listingId),
    enabled: !!listingId,
  });

  const listing = data?.data || {};

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    if (listing) {
      setName(listing.name || '');
      setTagline(listing.tagline || '');
      setDescription(listing.description || '');
      setShortDescription(listing.shortDescription || '');
      setContactPhone(listing.contactPhone || listing.phone || '');
      setContactEmail(listing.contactEmail || listing.email || '');
      setWebsite(listing.website || '');
      setWhatsapp(listing.whatsapp || '');
    }
  }, [listing]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.listings.update(listingId, data),
    onSuccess: () => {
      Alert.alert('Success', 'Listing updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['listingDetail', listingId] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update listing.');
    },
  });

  const handleSave = () => {
    if (!name.trim()) return Alert.alert('Error', 'Business name is required.');
    updateMutation.mutate({
      name, tagline, description, shortDescription,
      contactPhone, contactEmail, website, whatsapp,
    });
  };

  if (loadingData) {
    return (
      <View className="flex-1 bg-[#FDFCFB] items-center justify-center">
        <ActivityIndicator size="large" color="#FF7A30" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-[#FDFCFB]">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Icon name="arrow-back" size={24} color="#112D4E" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#112D4E]">Edit Listing</Text>
        </View>
        <TouchableOpacity onPress={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <ActivityIndicator color="#FF7A30" />
          ) : (
            <Text className="text-[#FF7A30] font-bold">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-6" keyboardShouldPersistTaps="handled">
        {listing.coverImage && (
          <Image source={{ uri: listing.coverImage }} className="w-full h-48 rounded-2xl mb-6 bg-slate-200" resizeMode="cover" />
        )}

        <Text className="font-bold text-slate-700 mb-2">Business Name *</Text>
        <TextInput
          className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900 mb-4"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#94A3B8"
        />

        <Text className="font-bold text-slate-700 mb-2">Tagline</Text>
        <TextInput
          className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900 mb-4"
          value={tagline}
          onChangeText={setTagline}
          placeholder="e.g. Your trusted local plumber"
          placeholderTextColor="#94A3B8"
        />

        <Text className="font-bold text-slate-700 mb-2">Short Description</Text>
        <TextInput
          className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900 mb-4"
          value={shortDescription}
          onChangeText={setShortDescription}
          placeholder="One line about your business"
          placeholderTextColor="#94A3B8"
        />

        <Text className="font-bold text-slate-700 mb-2">Full Description</Text>
        <TextInput
          className="bg-white border border-slate-200 rounded-2xl p-4 h-32 text-slate-900 mb-4"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your business in detail..."
          placeholderTextColor="#94A3B8"
          multiline
          textAlignVertical="top"
        />

        <Text className="text-lg font-bold text-[#112D4E] mb-4 mt-4">Contact Information</Text>

        <Text className="font-bold text-slate-700 mb-2">Phone</Text>
        <TextInput
          className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900 mb-4"
          value={contactPhone}
          onChangeText={setContactPhone}
          keyboardType="phone-pad"
          placeholderTextColor="#94A3B8"
        />

        <Text className="font-bold text-slate-700 mb-2">WhatsApp</Text>
        <TextInput
          className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900 mb-4"
          value={whatsapp}
          onChangeText={setWhatsapp}
          keyboardType="phone-pad"
          placeholderTextColor="#94A3B8"
        />

        <Text className="font-bold text-slate-700 mb-2">Email</Text>
        <TextInput
          className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900 mb-4"
          value={contactEmail}
          onChangeText={setContactEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#94A3B8"
        />

        <Text className="font-bold text-slate-700 mb-2">Website</Text>
        <TextInput
          className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900 mb-6"
          value={website}
          onChangeText={setWebsite}
          keyboardType="url"
          autoCapitalize="none"
          placeholder="https://yourwebsite.com"
          placeholderTextColor="#94A3B8"
        />

        <TouchableOpacity
          className="bg-[#FF7A30] py-4 rounded-xl items-center mb-8"
          onPress={handleSave}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text className="text-white font-bold text-lg">Update Listing</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
