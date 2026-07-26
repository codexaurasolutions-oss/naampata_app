import React from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { useWizardStore } from '../../../stores/wizardStore';

export default function Step07Address() {
  const { formData, updateFormData } = useWizardStore();

  const handleAddressChange = (key: string, value: string) => {
    updateFormData({
      address: {
        ...formData.address,
        [key]: value
      }
    });
  };

  return (
    <ScrollView className="flex-1">
      <Text className="text-2xl font-bold text-primary mb-2">Location Address</Text>
      <Text className="text-textSecondary mb-6">Where is your business located?</Text>

      <Text className="text-textPrimary font-semibold mb-2">Country <Text className="text-danger">*</Text></Text>
      <TextInput 
        className="bg-white border border-border rounded-xl px-4 py-3 mb-4 text-textPrimary"
        placeholder="e.g. United States"
        value={formData.address?.country}
        onChangeText={(text) => handleAddressChange('country', text)}
      />

      <View className="flex-row justify-between mb-4">
        <View className="w-[48%]">
          <Text className="text-textPrimary font-semibold mb-2">State/Province <Text className="text-danger">*</Text></Text>
          <TextInput 
            className="bg-white border border-border rounded-xl px-4 py-3 text-textPrimary"
            placeholder="e.g. New York"
            value={formData.address?.state}
            onChangeText={(text) => handleAddressChange('state', text)}
          />
        </View>
        <View className="w-[48%]">
          <Text className="text-textPrimary font-semibold mb-2">City <Text className="text-danger">*</Text></Text>
          <TextInput 
            className="bg-white border border-border rounded-xl px-4 py-3 text-textPrimary"
            placeholder="e.g. Manhattan"
            value={formData.address?.city}
            onChangeText={(text) => handleAddressChange('city', text)}
          />
        </View>
      </View>

      <Text className="text-textPrimary font-semibold mb-2">Street Address <Text className="text-danger">*</Text></Text>
      <TextInput 
        className="bg-white border border-border rounded-xl px-4 py-3 mb-4 text-textPrimary h-24"
        placeholder="e.g. 123 Main St, Suite 400"
        multiline
        textAlignVertical="top"
        value={formData.address?.street}
        onChangeText={(text) => handleAddressChange('street', text)}
      />

      <Text className="text-textPrimary font-semibold mb-2">Zip/Postal Code <Text className="text-danger">*</Text></Text>
      <TextInput 
        className="bg-white border border-border rounded-xl px-4 py-3 mb-4 text-textPrimary"
        placeholder="e.g. 10001"
        keyboardType="default"
        value={formData.address?.pincode}
        onChangeText={(text) => handleAddressChange('pincode', text)}
      />

      <Text className="text-textPrimary font-semibold mb-2">Landmark (Optional)</Text>
      <TextInput 
        className="bg-white border border-border rounded-xl px-4 py-3 mb-4 text-textPrimary"
        placeholder="e.g. Near Main Mosque, Opposite Park"
        value={(formData as any).landmark || ''}
        onChangeText={(text) => updateFormData({ landmark: text } as any)}
      />
    </ScrollView>
  );
}
