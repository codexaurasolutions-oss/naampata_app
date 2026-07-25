import React from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { useWizardStore } from '../../../stores/wizardStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Step09Contact() {
  const { formData, updateFormData } = useWizardStore();

  const handleContactChange = (key: string, value: string) => {
    updateFormData({
      contact: {
        ...formData.contact,
        [key]: value
      }
    });
  };

  return (
    <ScrollView className="flex-1">
      <Text className="text-2xl font-bold text-primary mb-2">Contact Details</Text>
      <Text className="text-textSecondary mb-6">How can customers reach you?</Text>

      <View className="bg-white flex-row items-center rounded-xl px-4 py-3 mb-4 shadow-sm border border-border">
        <Icon name="phone" size={20} color="#94A3B8" />
        <TextInput 
          placeholder="Business Phone Number" 
          className="flex-1 ml-3 text-textPrimary text-base"
          keyboardType="phone-pad"
          value={formData.contact?.phone}
          onChangeText={(text) => handleContactChange('phone', text)}
        />
      </View>

      <View className="bg-white flex-row items-center rounded-xl px-4 py-3 mb-4 shadow-sm border border-border">
        <Icon name="chat" size={20} color="#22C55E" />
        <TextInput 
          placeholder="WhatsApp Number" 
          className="flex-1 ml-3 text-textPrimary text-base"
          keyboardType="phone-pad"
          value={formData.contact?.whatsapp}
          onChangeText={(text) => handleContactChange('whatsapp', text)}
        />
      </View>

      <View className="bg-white flex-row items-center rounded-xl px-4 py-3 mb-4 shadow-sm border border-border">
        <Icon name="email" size={20} color="#94A3B8" />
        <TextInput 
          placeholder="Business Email" 
          className="flex-1 ml-3 text-textPrimary text-base"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.contact?.email}
          onChangeText={(text) => handleContactChange('email', text)}
        />
      </View>

      <View className="bg-white flex-row items-center rounded-xl px-4 py-3 mb-4 shadow-sm border border-border">
        <Icon name="language" size={20} color="#94A3B8" />
        <TextInput 
          placeholder="Website URL (e.g. https://yoursite.com)" 
          className="flex-1 ml-3 text-textPrimary text-base"
          keyboardType="url"
          autoCapitalize="none"
          value={formData.contact?.website}
          onChangeText={(text) => handleContactChange('website', text)}
        />
      </View>
    </ScrollView>
  );
}
