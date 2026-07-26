import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function CommentsScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['vendorComments'],
    queryFn: () => api.comments.getVendorComments(),
  });

  const replyMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      api.comments.replyToComment(commentId, content),
    onSuccess: () => {
      Alert.alert('Sent', 'Reply posted!');
      setReplyTo(null);
      setReplyContent('');
      queryClient.invalidateQueries({ queryKey: ['vendorComments'] });
    },
    onError: (error: any) => Alert.alert('Error', error.response?.data?.message || 'Failed to reply.'),
  });

  const deleteReplyMutation = useMutation({
    mutationFn: (replyId: string) => api.comments.deleteReply(replyId),
    onSuccess: () => {
      Alert.alert('Deleted', 'Reply has been deleted.');
      queryClient.invalidateQueries({ queryKey: ['vendorComments'] });
    },
    onError: () => Alert.alert('Error', 'Failed to delete reply.'),
  });

  const comments = data?.data || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleReply = (commentId: string) => {
    if (!replyContent.trim()) return;
    replyMutation.mutate({ commentId, content: replyContent.trim() });
  };

  const handleDeleteReply = (replyId: string) => {
    Alert.alert('Delete Reply', 'Are you sure you want to delete this reply?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteReplyMutation.mutate(replyId) },
    ]);
  };

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-back" size={24} color="#112D4E" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-[#112D4E]">Customer Comments</Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-6"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7A30" />}
      >
        {isLoading ? (
          <ActivityIndicator color="#FF7A30" className="my-10" />
        ) : comments.length > 0 ? (
          comments.map((comment: any) => (
            <View key={comment.id} className="bg-white rounded-2xl p-4 mb-4 border border-slate-100 shadow-sm">
              <View className="flex-row items-center mb-2">
                <View className="w-10 h-10 bg-slate-200 rounded-full items-center justify-center mr-3">
                  <Text className="font-bold text-slate-600">{(comment.user?.fullName || comment.user?.name || comment.authorName || 'U').charAt(0)}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-slate-800">{comment.user?.fullName || comment.user?.name || comment.authorName || 'User'}</Text>
                  <Text className="text-slate-400 text-xs">
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                  </Text>
                </View>
              </View>
              <Text className="text-slate-700 mb-3">{comment.content || comment.text}</Text>

              {comment.replies && comment.replies.length > 0 && (
                <View className="bg-slate-50 rounded-xl p-3 mb-3 ml-6">
                  {comment.replies.map((reply: any) => (
                    <TouchableOpacity
                      key={reply.id}
                      className="mb-2 last:mb-0"
                      onLongPress={() => handleDeleteReply(reply.id)}
                    >
                      <View className="flex-row justify-between items-start">
                        <Text className="text-xs font-bold text-[#112D4E]">You replied:</Text>
                        <TouchableOpacity onPress={() => handleDeleteReply(reply.id)}>
                          <Icon name="delete-outline" size={14} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                      <Text className="text-slate-600 text-sm">{reply.content || reply.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {replyTo === comment.id ? (
                <View className="ml-6 mt-2">
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mb-2"
                    placeholder="Write a reply..."
                    placeholderTextColor="#94A3B8"
                    value={replyContent}
                    onChangeText={setReplyContent}
                    multiline
                  />
                  <View className="flex-row">
                    <TouchableOpacity
                      className="bg-[#FF7A30] px-4 py-2 rounded-lg mr-2"
                      onPress={() => handleReply(comment.id)}
                      disabled={replyMutation.isPending}
                    >
                      {replyMutation.isPending ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <Text className="text-white font-bold text-xs">Reply</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-slate-100 px-4 py-2 rounded-lg"
                      onPress={() => { setReplyTo(null); setReplyContent(''); }}
                    >
                      <Text className="text-slate-600 font-bold text-xs">Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  className="ml-6 flex-row items-center"
                  onPress={() => setReplyTo(comment.id)}
                >
                  <Icon name="reply" size={16} color="#FF7A30" />
                  <Text className="text-[#FF7A30] font-bold text-xs ml-1">Reply</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <View className="items-center justify-center py-20">
            <Icon name="comment" size={64} color="#E2E8F0" />
            <Text className="text-xl font-bold text-slate-800 mt-4 mb-2">No comments yet</Text>
            <Text className="text-slate-500 text-center px-8">Customer comments on your listings will appear here.</Text>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
