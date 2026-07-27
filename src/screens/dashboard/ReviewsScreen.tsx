import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

export default function ReviewsScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['vendorReviews'],
    queryFn: () => api.reviews.getByVendor(),
  });

  const respondMutation = useMutation({
    mutationFn: ({ reviewId, response }: { reviewId: string; response: string }) =>
      api.reviews.respond(reviewId, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorReviews'] });
      setActiveReplyId(null);
      setReplyText({});
    }
  });

  const handleRespond = (reviewId: string) => {
    const response = replyText[reviewId];
    if (response?.trim()) {
      respondMutation.mutate({ reviewId, response: response.trim() });
    }
  };

  const reviews = data || [];

  const avgRating = reviews.length
    ? (reviews.reduce((acc: number, cur: any) => acc + (cur.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0';
  const totalReviews = reviews.length;
  const unreplied = reviews.filter((r: any) => !r.reply).length;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter((r: any) => Math.round(r.rating) === star).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      <View className="bg-[#112D4E] pt-14 pb-8 px-4 rounded-b-[32px] shadow-sm">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/10 rounded-full items-center justify-center mr-4">
              <Icon name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-white">Reviews Manager</Text>
          </View>
        </View>

        <View className="flex-row justify-between bg-white/10 p-5 rounded-2xl border border-white/20">
          <View className="items-center flex-1">
            <Text className="text-3xl font-black text-white">{avgRating}</Text>
            <View className="flex-row items-center mt-1">
              <Icon name="star" size={14} color="#FBBF24" />
              <Text className="text-white/80 text-xs ml-1 font-medium">Avg Rating</Text>
            </View>
          </View>
          <View className="w-[1px] h-full bg-white/20" />
          <View className="items-center flex-1">
            <Text className="text-3xl font-black text-white">{totalReviews}</Text>
            <Text className="text-white/80 text-xs mt-1 font-medium">Total Reviews</Text>
          </View>
          <View className="w-[1px] h-full bg-white/20" />
          <View className="items-center flex-1">
            <Text className="text-3xl font-black text-[#FF7A30]">{unreplied}</Text>
            <Text className="text-white/80 text-xs mt-1 font-medium">Unreplied</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color="#FF7A30" className="mt-10" />
        ) : reviews.length === 0 ? (
          <View className="items-center justify-center py-20 mt-10">
            <View className="w-24 h-24 bg-slate-50 rounded-full items-center justify-center mb-6 border border-slate-100">
              <Icon name="star-outline" size={48} color="#CBD5E1" />
            </View>
            <Text className="text-xl font-bold text-slate-900 mb-2">No reviews yet</Text>
            <Text className="text-slate-500 text-center px-6">
              Encourage your customers to leave a review to boost your ranking!
            </Text>
          </View>
        ) : (
          <>
            <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-6">
              <Text className="font-bold text-[#112D4E] text-lg mb-4">Rating Distribution</Text>
              {ratingDistribution.map(({ star, count, percentage }) => (
                <View key={star} className="flex-row items-center mb-2">
                  <Text className="text-slate-500 text-sm w-8 font-bold">{star}</Text>
                  <Icon name="star" size={14} color="#F59E0B" />
                  <View className="flex-1 h-3 bg-slate-100 rounded-full mx-3 overflow-hidden">
                    <View
                      className="h-full bg-[#FF7A30] rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </View>
                  <Text className="text-slate-400 text-xs w-8 text-right">{count}</Text>
                </View>
              ))}
            </View>

            {reviews.map((review: any, index: number) => (
              <View key={review.id || index} className="bg-white rounded-3xl p-5 mb-4 border border-slate-100 shadow-sm">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                      <Text className="font-black text-blue-500 text-lg">{review.user?.fullName?.charAt(0) || review.user?.name?.charAt(0) || 'U'}</Text>
                    </View>
                    <View className="ml-3">
                      <Text className="font-bold text-[#112D4E] text-base">{review.user?.fullName || review.user?.name || 'Anonymous'}</Text>
                      <Text className="text-slate-400 text-xs">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Just now'}</Text>
                    </View>
                  </View>
                  <View className="flex-row bg-orange-50 px-2 py-1 rounded-full items-center border border-orange-100">
                    <Icon name="star" size={14} color="#FBBF24" />
                    <Text className="font-bold text-orange-600 ml-1 text-xs">{Number(review.rating).toFixed(1)}</Text>
                  </View>
                </View>

                <Text className="text-slate-700 leading-relaxed mb-4">{review.comment || review.content}</Text>

                {review.reply ? (
                  <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100 ml-4 relative">
                    <View className="absolute -left-2 top-4 w-4 h-4 bg-slate-50 border-t border-l border-slate-100 rotate-45" />
                    <Text className="font-bold text-[#112D4E] text-xs mb-1 uppercase tracking-widest">Your Reply</Text>
                    <Text className="text-slate-600 italic">"{review.reply.content || review.reply}"</Text>
                  </View>
                ) : (
                  <View>
                    {activeReplyId === review.id ? (
                      <View className="bg-slate-50 rounded-2xl border border-orange-200 p-3 shadow-sm flex-row items-end">
                        <TextInput
                          className="flex-1 min-h-[60px] text-slate-800"
                          placeholder="Write a public response..."
                          placeholderTextColor="#94A3B8"
                          multiline
                          value={replyText[review.id] || ''}
                          onChangeText={(text) => setReplyText(prev => ({ ...prev, [review.id]: text }))}
                          autoFocus
                        />
                        <TouchableOpacity
                          className={`w-10 h-10 rounded-full items-center justify-center ml-2 mb-1 ${(replyText[review.id] || '').trim() ? 'bg-[#FF7A30]' : 'bg-slate-200'}`}
                          onPress={() => handleRespond(review.id)}
                          disabled={!(replyText[review.id] || '').trim() || respondMutation.isPending}
                        >
                          {respondMutation.isPending ? (
                            <ActivityIndicator size="small" color="#FFF" />
                          ) : (
                            <Icon name="send" size={20} color="#FFF" className="ml-1" />
                          )}
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        className="bg-slate-900 py-3 rounded-xl items-center flex-row justify-center mt-2"
                        onPress={() => setActiveReplyId(review.id)}
                      >
                        <Icon name="reply" size={18} color="#FFF" />
                        <Text className="text-white font-bold ml-2">Public Reply</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ))}
          </>
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
