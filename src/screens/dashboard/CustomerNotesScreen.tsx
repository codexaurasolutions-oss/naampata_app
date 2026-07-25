import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function CustomerNotesScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  const { data: convosData, isLoading: loadingConvos, refetch } = useQuery({
    queryKey: ['vendorConversations'],
    queryFn: () => api.chat.getVendorConversations(),
  });

  const conversations = convosData?.data || [];

  const { data: notesData, isLoading: loadingNotes } = useQuery({
    queryKey: ['conversationNotes', selectedConversation],
    queryFn: () => api.chat.getNotes(selectedConversation!),
    enabled: !!selectedConversation,
  });

  const addNoteMutation = useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      api.chat.addNote(conversationId, content),
    onSuccess: () => {
      Alert.alert('Saved', 'Note added!');
      setNoteContent('');
      setShowAddNote(false);
      queryClient.invalidateQueries({ queryKey: ['conversationNotes', selectedConversation] });
    },
    onError: (error: any) => Alert.alert('Error', error.response?.data?.message || 'Failed to add note.'),
  });

  const notes = notesData?.data || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAddNote = () => {
    if (!selectedConversation || !noteContent.trim()) return;
    addNoteMutation.mutate({ conversationId: selectedConversation, content: noteContent.trim() });
  };

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-back" size={24} color="#112D4E" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-[#112D4E]">Customer Notes</Text>
      </View>

      <View className="flex-1 flex-row">
        <View className={`bg-white border-r border-slate-100 ${selectedConversation ? 'w-0' : 'w-full'}`}>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7A30" />}
          >
            {loadingConvos ? (
              <ActivityIndicator color="#FF7A30" className="my-10" />
            ) : conversations.length > 0 ? (
              conversations.map((conv: any) => {
                const otherUser = conv.participants?.find((p: any) => p.role !== 'vendor') || conv.participants?.[0];
                return (
                  <TouchableOpacity
                    key={conv.id}
                    className={`p-4 border-b border-slate-50 flex-row items-center ${selectedConversation === conv.id ? 'bg-orange-50' : ''}`}
                    onPress={() => setSelectedConversation(conv.id)}
                  >
                    <View className="w-12 h-12 bg-slate-200 rounded-full items-center justify-center mr-3">
                      <Icon name="person" size={20} color="#94A3B8" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-slate-800">{otherUser?.fullName || 'Customer'}</Text>
                      <Text className="text-slate-400 text-xs" numberOfLines={1}>{conv.lastMessage || 'No messages yet'}</Text>
                    </View>
                    <Icon name="chevron-right" size={20} color="#CBD5E1" />
                  </TouchableOpacity>
                );
              })
            ) : (
              <View className="items-center justify-center py-20">
                <Icon name="chat" size={64} color="#E2E8F0" />
                <Text className="text-slate-400 mt-4 text-center px-4">No conversations yet.</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {selectedConversation && (
          <View className="flex-1 bg-[#FDFCFB]">
            <View className="bg-white p-3 border-b border-slate-100 flex-row items-center">
              <TouchableOpacity onPress={() => setSelectedConversation(null)} className="mr-3">
                <Icon name="arrow-back" size={20} color="#112D4E" />
              </TouchableOpacity>
              <Text className="font-bold text-[#112D4E] flex-1">Notes</Text>
              <TouchableOpacity
                className="bg-[#FF7A30] w-8 h-8 rounded-full items-center justify-center"
                onPress={() => setShowAddNote(true)}
              >
                <Icon name="add" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {showAddNote && (
              <View className="bg-white p-4 border-b border-slate-100">
                <TextInput
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mb-2"
                  placeholder="Write a private note..."
                  placeholderTextColor="#94A3B8"
                  value={noteContent}
                  onChangeText={setNoteContent}
                  multiline
                />
                <View className="flex-row">
                  <TouchableOpacity
                    className="bg-[#FF7A30] px-4 py-2 rounded-lg mr-2"
                    onPress={handleAddNote}
                    disabled={addNoteMutation.isPending}
                  >
                    {addNoteMutation.isPending ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <Text className="text-white font-bold text-xs">Save Note</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-slate-100 px-4 py-2 rounded-lg"
                    onPress={() => { setShowAddNote(false); setNoteContent(''); }}
                  >
                    <Text className="text-slate-600 font-bold text-xs">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
              {loadingNotes ? (
                <ActivityIndicator color="#FF7A30" className="my-10" />
              ) : notes.length > 0 ? (
                notes.map((note: any) => (
                  <View key={note.id} className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 shadow-sm">
                    <Text className="text-slate-700">{note.content}</Text>
                    <Text className="text-slate-400 text-xs mt-2">
                      {note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}
                    </Text>
                  </View>
                ))
              ) : (
                <View className="items-center justify-center py-10">
                  <Icon name="note" size={48} color="#E2E8F0" />
                  <Text className="text-slate-400 mt-2">No notes yet for this customer.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}
