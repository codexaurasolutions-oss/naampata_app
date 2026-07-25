import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

export default function DeleteAccountScreen({ navigation }: any) {
  const [confirmationText, setConfirmationText] = useState('');
  const { logout } = useAuthStore();

  const deleteMutation = useMutation({
    mutationFn: () => api.users.deleteAccount(),
    onSuccess: async () => {
      Alert.alert(
        "Account Deleted", 
        "Your account has been permanently deleted.",
        [{ text: "OK", onPress: async () => {
           await logout();
        }}]
      );
    },
    onError: (err: any) => {
      Alert.alert("Error", err.response?.data?.message || "Failed to delete account. Please try again or contact support.");
    }
  });

  const handleDelete = () => {
    if (confirmationText !== 'DELETE') {
      Alert.alert("Validation Error", "Please type DELETE to confirm.");
      return;
    }
    
    Alert.alert(
      "Final Warning",
      "This action cannot be undone. All your data, reviews, and listings will be permanently erased. Are you absolutely sure?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes, Delete Everything", style: "destructive", onPress: () => deleteMutation.mutate() }
      ]
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-back" size={24} color="#112D4E" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-[#112D4E]">Delete Account</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-8">
        <View className="w-16 h-16 bg-red-50 rounded-2xl items-center justify-center mb-6 border border-red-100">
          <Icon name="warning" size={32} color="#EF4444" />
        </View>

        <Text className="text-3xl font-black text-slate-900 mb-2">We're sorry to see you go.</Text>
        <Text className="text-slate-500 font-medium leading-relaxed mb-8">
          Deleting your account is permanent. It will erase all your personal data, saved items, reviews, and listings associated with Naampata.
        </Text>

        <View className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-8">
          <View className="flex-row items-center mb-3">
            <Icon name="error-outline" size={20} color="#DC2626" />
            <Text className="text-red-700 font-bold ml-2">What will be deleted?</Text>
          </View>
          <View className="pl-7 space-y-2">
            <Text className="text-red-600/80 text-xs font-medium">• Your profile and personal information</Text>
            <Text className="text-red-600/80 text-xs font-medium">• Any businesses you have listed</Text>
            <Text className="text-red-600/80 text-xs font-medium">• All your published reviews</Text>
            <Text className="text-red-600/80 text-xs font-medium">• Your saved businesses and favorites</Text>
            <Text className="text-red-600/80 text-xs font-medium mt-2">This action is completely irreversible.</Text>
          </View>
        </View>

        <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">
          To confirm, type <Text className="text-red-500 font-black">DELETE</Text> below:
        </Text>
        <TextInput 
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 h-14 text-slate-900 font-bold mb-8"
          placeholder="Type DELETE"
          placeholderTextColor="#94A3B8"
          value={confirmationText}
          onChangeText={setConfirmationText}
          autoCapitalize="characters"
        />

        <TouchableOpacity 
          className={`h-14 rounded-xl items-center justify-center shadow-sm ${confirmationText === 'DELETE' ? 'bg-red-600 shadow-red-500/30' : 'bg-slate-300'}`}
          onPress={handleDelete}
          disabled={deleteMutation.isPending || confirmationText !== 'DELETE'}
        >
          {deleteMutation.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text className="text-white font-bold text-lg">Permanently Delete Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          className="mt-6 items-center"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-slate-500 font-bold text-sm">Cancel and go back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
