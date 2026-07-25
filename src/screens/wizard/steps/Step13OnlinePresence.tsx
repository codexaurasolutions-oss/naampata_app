import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useWizardStore } from '../../../stores/wizardStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PLATFORMS = ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube', 'TikTok'];

export default function Step13OnlinePresence() {
  const { formData, updateFormData } = useWizardStore();
  const [platform, setPlatform] = useState('Facebook');
  const [url, setUrl] = useState('');

  const addLink = () => {
    if (url.trim()) {
      const links = formData.socialLinks || [];
      updateFormData({ socialLinks: [...links, { platform, url }] });
      setUrl('');
    }
  };

  const removeLink = (index: number) => {
    const links = [...(formData.socialLinks || [])];
    links.splice(index, 1);
    updateFormData({ socialLinks: links });
  };

  return (
    <ScrollView className="flex-1">
      <Text className="text-2xl font-bold text-primary mb-2">Online Presence</Text>
      <Text className="text-textSecondary mb-6">Add links to your social media profiles.</Text>

      <View className="flex-row flex-wrap mb-4">
        {PLATFORMS.map((p) => (
          <TouchableOpacity 
            key={p} 
            onPress={() => setPlatform(p)}
            className={`mr-2 mb-2 px-4 py-2 rounded-full border ${platform === p ? 'bg-primary border-primary' : 'bg-white border-border'}`}
          >
            <Text className={platform === p ? 'text-white' : 'text-textPrimary'}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="flex-row items-center mb-6">
        <TextInput 
          className="flex-1 bg-white border border-border rounded-xl px-4 py-3 text-textPrimary mr-2"
          placeholder={`${platform} URL`}
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={addLink} className="bg-accent p-3 rounded-xl items-center justify-center">
          <Icon name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {formData.socialLinks?.map((link, index) => (
        <View key={index} className="flex-row items-center justify-between bg-white p-4 rounded-xl mb-2 border border-border shadow-sm">
          <View>
            <Text className="font-bold text-primary">{link.platform}</Text>
            <Text className="text-textSecondary">{link.url}</Text>
          </View>
          <TouchableOpacity onPress={() => removeLink(index)}>
            <Icon name="delete" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}
