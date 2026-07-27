import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function LeadDetailsScreen({ route, navigation }: any) {
  const { lead } = route.params || {};
  const queryClient = useQueryClient();
  const [noteInput, setNoteInput] = useState('');
  const [replyInput, setReplyInput] = useState('');
  const [showReply, setShowReply] = useState(false);

  const { data: notesData, isLoading: loadingNotes } = useQuery({
    queryKey: ['leadNotes', lead?.id],
    queryFn: () => api.leads.getNotes(lead.id),
    enabled: !!lead?.id,
  });

  const addNoteMutation = useMutation({
    mutationFn: (content: string) => api.leads.addNote(lead.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadNotes', lead.id] });
      setNoteInput('');
    },
    onError: () => Alert.alert('Error', 'Failed to add note.'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => api.leads.updateStatus(lead.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorLeads'] });
      queryClient.invalidateQueries({ queryKey: ['vendorLeadStats'] });
    },
    onError: () => Alert.alert('Error', 'Failed to update status.'),
  });

  const replyMutation = useMutation({
    mutationFn: (message: string) => api.leads.reply(lead.id, message),
    onSuccess: () => {
      Alert.alert('Sent', 'Your reply has been sent!');
      setShowReply(false);
      setReplyInput('');
      queryClient.invalidateQueries({ queryKey: ['vendorLeads'] });
    },
    onError: () => Alert.alert('Error', 'Failed to send reply.'),
  });

  if (!lead) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="error-outline" size={48} color="#94A3B8" />
        <Text style={{ color: '#64748B', marginTop: 12, fontSize: 16 }}>Lead not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#FF7A30', fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const notes = notesData || [];

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#FDFCFB]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="bg-[#112D4E] pt-14 pb-4 px-4 flex-row items-center justify-between shadow-sm z-10">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white ml-4">Lead Details</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Chat', { conversationId: `lead_${lead.id}`, title: lead.name || lead.customerName })}>
          <Icon name="chat" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-6 relative overflow-hidden">
          <View className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[100px] -z-10" />

          <View className="flex-row items-center mb-6">
            <View className="w-16 h-16 bg-[#112D4E] rounded-full items-center justify-center shadow-lg">
              <Text className="text-white text-2xl font-black">{lead.name ? lead.name.charAt(0).toUpperCase() : 'U'}</Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xl font-black text-slate-900">{lead.name || lead.customerName || 'Anonymous User'}</Text>
              <Text className="text-slate-500 font-medium">Received {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Unknown date'}</Text>
            </View>
            <View className={`px-3 py-1 rounded-full ${lead.status === 'new' ? 'bg-blue-100' : lead.status === 'contacted' ? 'bg-yellow-100' : lead.status === 'converted' ? 'bg-green-100' : 'bg-slate-100'}`}>
              <Text className={`text-xs font-bold capitalize ${lead.status === 'new' ? 'text-blue-600' : lead.status === 'contacted' ? 'text-yellow-600' : lead.status === 'converted' ? 'text-green-600' : 'text-slate-600'}`}>
                {lead.status || 'new'}
              </Text>
            </View>
          </View>

          <View className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
            <Text className="text-slate-800 font-medium italic leading-relaxed">
              "{lead.message || 'I am interested in your services and would like a quote.'}"
            </Text>
          </View>

          <View className="flex-row flex-wrap mb-2">
            <View className="flex-row items-center mr-6 mb-3">
              <Icon name="mail" size={18} color="#94A3B8" />
              <Text className="text-slate-600 font-medium ml-2">{lead.email || 'No email provided'}</Text>
            </View>
            <View className="flex-row items-center mb-3">
              <Icon name="phone" size={18} color="#94A3B8" />
              <Text className="text-slate-600 font-medium ml-2">{lead.phone || 'No phone provided'}</Text>
            </View>
          </View>

          <Text className="font-bold text-slate-700 mt-4 mb-2">Update Pipeline Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
            {['new', 'contacted', 'converted', 'lost'].map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => updateStatusMutation.mutate(status)}
                className={`px-4 py-2 rounded-full mr-2 border ${lead.status === status ? 'bg-[#FF7A30] border-[#FF7A30]' : 'bg-white border-slate-200'}`}
              >
                <Text className={`font-bold capitalize ${lead.status === status ? 'text-white' : 'text-slate-600'}`}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {showReply ? (
            <View className="bg-slate-50 rounded-2xl border border-slate-200 p-3">
              <TextInput
                className="min-h-[60px] text-slate-800 mb-2"
                placeholder="Type your reply..."
                placeholderTextColor="#94A3B8"
                multiline
                value={replyInput}
                onChangeText={setReplyInput}
                autoFocus
              />
              <View className="flex-row justify-end">
                <TouchableOpacity
                  className="bg-slate-200 px-4 py-2 rounded-lg mr-2"
                  onPress={() => { setShowReply(false); setReplyInput(''); }}
                >
                  <Text className="text-slate-600 font-bold text-xs">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`px-4 py-2 rounded-lg ${replyInput.trim() ? 'bg-[#FF7A30]' : 'bg-slate-300'}`}
                  onPress={() => {
                    if (replyInput.trim()) replyMutation.mutate(replyInput.trim());
                  }}
                  disabled={!replyInput.trim() || replyMutation.isPending}
                >
                  {replyMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text className="text-white font-bold text-xs">Send Reply</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              className="bg-[#112D4E] py-3 rounded-xl items-center flex-row justify-center"
              onPress={() => setShowReply(true)}
            >
              <Icon name="reply" size={18} color="#FFF" />
              <Text className="text-white font-bold ml-2">Reply to Lead</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <Icon name="event-note" size={24} color="#112D4E" />
            <Text className="text-xl font-bold text-[#112D4E] ml-2">Private CRM Notes</Text>
          </View>
          <Text className="text-slate-500 text-sm mb-4">Add private internal notes about this customer. The customer will not see these.</Text>

          <View className="bg-white rounded-2xl border border-slate-200 p-3 mb-6 shadow-sm flex-row items-end">
            <TextInput
              className="flex-1 min-h-[60px] text-slate-800"
              placeholder="E.g. Called them at 2pm, they are highly interested..."
              placeholderTextColor="#94A3B8"
              multiline
              value={noteInput}
              onChangeText={setNoteInput}
            />
            <TouchableOpacity
              className={`w-10 h-10 rounded-full items-center justify-center ml-2 mb-1 ${noteInput.trim() ? 'bg-[#3B82F6]' : 'bg-slate-200'}`}
              onPress={() => {
                if (noteInput.trim()) addNoteMutation.mutate(noteInput.trim());
              }}
              disabled={!noteInput.trim() || addNoteMutation.isPending}
            >
              {addNoteMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Icon name="add" size={24} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>

          {loadingNotes ? (
            <ActivityIndicator color="#FF7A30" />
          ) : notes.length === 0 ? (
            <View className="items-center py-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
              <Icon name="note-add" size={32} color="#CBD5E1" className="mb-2" />
              <Text className="text-slate-400 font-medium">No notes added yet.</Text>
            </View>
          ) : (
            notes.map((note: any, index: number) => (
              <View key={note.id || index} className="bg-[#FFF8F1] p-4 rounded-2xl mb-3 border border-orange-100">
                <View className="flex-row justify-between mb-2">
                  <Text className="font-bold text-slate-800 text-xs">Internal Note</Text>
                  <Text className="text-slate-400 text-xs">{note.createdAt ? new Date(note.createdAt).toLocaleString() : 'Just now'}</Text>
                </View>
                <Text className="text-slate-700 leading-relaxed">{note.content}</Text>
              </View>
            ))
          )}
        </View>
        <View className="h-10" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
