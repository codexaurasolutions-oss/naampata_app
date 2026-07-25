import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function LeadDetailsScreen({ route, navigation }: any) {
  const { lead } = route.params;
  const queryClient = useQueryClient();
  const [noteInput, setNoteInput] = useState('');

  const { data: notesData, isLoading: loadingNotes } = useQuery({
    queryKey: ['leadNotes', lead.id],
    queryFn: () => api.leads.getNotes(lead.id),
  });

  const addNoteMutation = useMutation({
    mutationFn: (content: string) => api.leads.addNote(lead.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadNotes', lead.id] });
      setNoteInput('');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => api.leads.updateStatus(lead.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorLeads'] });
    }
  });

  const notes = notesData?.data || [];

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-[#FDFCFB]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View className="bg-[#112D4E] pt-14 pb-4 px-4 flex-row items-center justify-between shadow-sm z-10">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white ml-4">Lead Details</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Chat', { conversationId: `lead_${lead.id}`, title: lead.name })}>
          <Icon name="chat" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Customer Card */}
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-6 relative overflow-hidden">
          <View className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[100px] -z-10" />
          
          <View className="flex-row items-center mb-6">
            <View className="w-16 h-16 bg-[#112D4E] rounded-full items-center justify-center shadow-lg">
              <Text className="text-white text-2xl font-black">{lead.name ? lead.name.charAt(0).toUpperCase() : 'U'}</Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xl font-black text-slate-900">{lead.name || 'Anonymous User'}</Text>
              <Text className="text-slate-500 font-medium">Received {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Unknown date'}</Text>
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

          {/* Status Updater */}
          <Text className="font-bold text-slate-700 mt-4 mb-2">Update Pipeline Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
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
        </View>

        {/* Private CRM Notes Section */}
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <Icon name="event-note" size={24} color="#112D4E" />
            <Text className="text-xl font-bold text-[#112D4E] ml-2">Private CRM Notes</Text>
          </View>
          <Text className="text-slate-500 text-sm mb-4">Add private internal notes about this customer. The customer will not see these.</Text>

          {/* Add Note Input */}
          <View className="bg-white rounded-2xl border border-slate-200 p-3 mb-6 shadow-sm flex-row items-end">
            <TextInput
              className="flex-1 min-h-[60px] text-slate-800"
              placeholder="E.g. Called them at 2pm, they are highly interested in the premium package..."
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

          {/* Notes List */}
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
                  <Text className="text-slate-400 text-xs">{note.createdAt || 'Just now'}</Text>
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
