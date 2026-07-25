import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useWizardStore } from '../../../stores/wizardStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Step20ReviewSubmit() {
  const { formData } = useWizardStore();

  return (
    <ScrollView className="flex-1">
      <View className="items-center mb-6">
        <View className="w-16 h-16 bg-success/20 rounded-full items-center justify-center mb-4">
          <Icon name="check-circle" size={40} color="#22C55E" />
        </View>
        <Text className="text-2xl font-bold text-primary">Review Details</Text>
        <Text className="text-textSecondary text-center px-4 mt-2">
          You are almost done! Review your information before publishing your business listing.
        </Text>
      </View>

      <View className="bg-white rounded-xl border border-border overflow-hidden mb-6">
        <View className="bg-background px-4 py-3 border-b border-border">
          <Text className="font-bold text-primary">Basic Info</Text>
        </View>
        <View className="p-4">
          <Text className="text-textMuted text-xs">Business Name</Text>
          <Text className="text-textPrimary font-semibold mb-3">{formData.name || 'Not provided'}</Text>
          
          <Text className="text-textMuted text-xs">Category</Text>
          <Text className="text-textPrimary font-semibold mb-3">{formData.categoryId || 'Not provided'}</Text>
          
          <Text className="text-textMuted text-xs">Phone</Text>
          <Text className="text-textPrimary font-semibold">{formData.contact?.phone || 'Not provided'}</Text>
        </View>
      </View>

      <View className="bg-white rounded-xl border border-border overflow-hidden mb-8">
        <View className="bg-background px-4 py-3 border-b border-border">
          <Text className="font-bold text-primary">Location</Text>
        </View>
        <View className="p-4">
          <Text className="text-textPrimary font-semibold">
            {formData.address?.street ? `${formData.address.street}, ` : ''}
            {formData.address?.city ? `${formData.address.city}, ` : ''}
            {formData.address?.state ? `${formData.address.state} ` : ''}
            {formData.address?.country}
          </Text>
        </View>
      </View>

      <Text className="text-textMuted text-center text-xs px-4 mb-4">
        By submitting this listing, you agree to NAAMPATA's Terms of Service and Privacy Policy.
      </Text>
    </ScrollView>
  );
}
