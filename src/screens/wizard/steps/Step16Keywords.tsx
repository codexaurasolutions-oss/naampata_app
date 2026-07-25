import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useWizardStore } from '../../../stores/wizardStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Step16Keywords() {
  const { formData, updateFormData } = useWizardStore();
  const [keyword, setKeyword] = useState('');

  const addKeyword = () => {
    if (keyword.trim()) {
      const keys = formData.keywords || [];
      if (!keys.includes(keyword.trim().toLowerCase())) {
        updateFormData({ keywords: [...keys, keyword.trim().toLowerCase()] });
      }
      setKeyword('');
    }
  };

  const removeKeyword = (kw: string) => {
    const keys = (formData.keywords || []).filter(k => k !== kw);
    updateFormData({ keywords: keys });
  };

  return (
    <ScrollView className="flex-1">
      <Text className="text-2xl font-bold text-primary mb-2">Search Keywords</Text>
      <Text className="text-textSecondary mb-6">Add words that help customers find you in search.</Text>

      <View className="flex-row items-center mb-6">
        <TextInput 
          className="flex-1 bg-white border border-border rounded-xl px-4 py-3 text-textPrimary mr-2"
          placeholder="e.g. fast food, emergency plumber"
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={addKeyword}
        />
        <TouchableOpacity onPress={addKeyword} className="bg-accent p-3 rounded-xl items-center justify-center">
          <Icon name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap">
        {formData.keywords?.map((kw, index) => (
          <View key={index} className="flex-row items-center bg-white border border-border rounded-full px-3 py-1 mr-2 mb-2">
            <Text className="text-textPrimary mr-2">{kw}</Text>
            <TouchableOpacity onPress={() => removeKeyword(kw)}>
              <Icon name="close" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
