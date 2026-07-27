import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

export default function WriteReviewScreen({ route, navigation }: any) {
  const { businessId, businessName } = route.params || {};
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const submitReviewMutation = useMutation({
    mutationFn: (data: any) => api.reviews.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessDetail', businessId] });
      Alert.alert('Success', 'Your review has been published!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit review. Have you already reviewed this business?');
    }
  });

  if (!businessId) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="error-outline" size={48} color="#94A3B8" />
        <Text style={{ color: '#64748B', marginTop: 12, fontSize: 16 }}>Business not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#FF7A30', fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSubmit = () => {
    if (!isAuthenticated) {
      Alert.alert('Authentication Required', 'Please log in to leave a review.');
      navigation.navigate('Auth', { screen: 'Login' });
      return;
    }
    if (rating === 0) {
      Alert.alert('Required', 'Please select a star rating.');
      return;
    }
    if (comment.trim().length < 10) {
      Alert.alert('Required', 'Please write a review of at least 10 characters.');
      return;
    }

    submitReviewMutation.mutate({
      businessId,
      rating,
      comment: comment.trim(),
    });
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-[#FDFCFB]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="bg-white pt-14 pb-4 px-4 flex-row items-center border-b border-slate-100 shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#112D4E" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#112D4E] ml-4">Write a Review</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-8" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-black text-[#112D4E] text-center mb-2">{businessName}</Text>
        <Text className="text-slate-500 text-center mb-10">Share your experience with the community</Text>

        <View className="items-center mb-10">
          <Text className="font-bold text-slate-800 mb-4 text-lg">Tap to Rate</Text>
          <View className="flex-row">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} className="px-1">
                <Icon 
                  name={star <= rating ? "star" : "star-outline"} 
                  size={48} 
                  color={star <= rating ? "#FBBF24" : "#CBD5E1"} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm mb-8">
          <Text className="font-bold text-slate-700 mb-2">Your Review</Text>
          <TextInput
            className="text-slate-800 text-base h-32"
            placeholder="What was good? What could be better? Share the details..."
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
          />
        </View>

        <TouchableOpacity 
          className={`py-4 rounded-xl items-center flex-row justify-center ${rating > 0 && comment.trim().length >= 10 ? 'bg-[#FF7A30]' : 'bg-slate-200'}`}
          onPress={handleSubmit}
          disabled={submitReviewMutation.isPending || rating === 0 || comment.trim().length < 10}
        >
          {submitReviewMutation.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text className={`font-bold text-lg ${rating > 0 && comment.trim().length >= 10 ? 'text-white' : 'text-slate-400'}`}>
              Publish Review
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
