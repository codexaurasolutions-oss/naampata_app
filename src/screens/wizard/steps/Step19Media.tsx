import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useWizardStore } from '../../../stores/wizardStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Step19Media() {
  const { formData } = useWizardStore();

  return (
    <ScrollView className="flex-1">
      <Text className="text-2xl font-bold text-primary mb-2">Media & Branding</Text>
      <Text className="text-textSecondary mb-6">Upload photos to make your listing stand out.</Text>

      <View className="flex-row justify-between mb-6">
        <View className="w-[48%]">
          <Text className="text-textPrimary font-semibold mb-2">Logo</Text>
          <TouchableOpacity className="h-32 bg-white border border-dashed border-border rounded-xl items-center justify-center">
            <Icon name="add-a-photo" size={32} color="#94A3B8" />
            <Text className="text-textMuted mt-2 text-xs">Upload Logo</Text>
          </TouchableOpacity>
        </View>
        <View className="w-[48%]">
          <Text className="text-textPrimary font-semibold mb-2">Cover Photo</Text>
          <TouchableOpacity className="h-32 bg-white border border-dashed border-border rounded-xl items-center justify-center">
            <Icon name="add-photo-alternate" size={32} color="#94A3B8" />
            <Text className="text-textMuted mt-2 text-xs">Upload Cover</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text className="text-textPrimary font-semibold mb-2">Photo Gallery (Up to 10 photos)</Text>
      <TouchableOpacity className="h-40 bg-white border border-dashed border-border rounded-xl items-center justify-center mb-6">
        <View className="w-12 h-12 bg-accent/10 rounded-full items-center justify-center mb-2">
          <Icon name="cloud-upload" size={24} color="#FF7A30" />
        </View>
        <Text className="text-textPrimary font-semibold">Tap to select photos</Text>
        <Text className="text-textMuted text-xs mt-1">JPG or PNG (Max 5MB each)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
