import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { useSocket } from '../../providers/SocketProvider';

export default function ChatScreen({ route, navigation }: any) {
  const { conversationId, title } = route.params;
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  const { socket, isConnected, sendMessage, markAsRead, joinConversation, leaveConversation } = useSocket();
  
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  // Fetch initial messages
  const { data: initialData, isLoading } = useQuery({
    queryKey: ['chatMessages', conversationId],
    queryFn: (): Promise<any> => api.chat.getMessages(conversationId),
  });

  useEffect(() => {
    if (initialData) {
      setMessages(initialData?.data || initialData || []);
    }
  }, [initialData]);

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => api.chat.sendMessage(conversationId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', conversationId] });
    }
  });

  const markReadMutation = useMutation({
    mutationFn: () => api.chat.markAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatConversations'] });
    }
  });

  // Join conversation room on mount
  useEffect(() => {
    if (isConnected && socket) {
      joinConversation(conversationId);
      markReadMutation.mutate();
    }
    return () => {
      if (isConnected) leaveConversation(conversationId);
    };
  }, [isConnected, conversationId]);

  // Listen for new messages via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: any) => {
      console.log('[ChatScreen] New message received:', message);
      if (message.conversationId === conversationId) {
        setMessages(prev => [...prev, message]);
      }
    };

    const handleConversationUpdated = (data: any) => {
      console.log('[ChatScreen] Conversation updated:', data);
      queryClient.invalidateQueries({ queryKey: ['chatConversations'] });
    };

    socket.on('new_message', handleNewMessage);
    socket.on('conversation_updated', handleConversationUpdated);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('conversation_updated', handleConversationUpdated);
    };
  }, [socket, conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;
    const content = inputText.trim();
    setInputText('');
    
    // Optimistic update
    const tempMessage = {
      id: `temp_${Date.now()}`,
      content,
      senderId: user?.id,
      sender: { id: user?.id, fullName: user?.fullName, avatar: user?.avatar },
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    setMessages(prev => [...prev, tempMessage]);

    // Send via socket for real-time
    sendMessage(conversationId, content);
    
    // Also send via REST for persistence
    sendMessageMutation.mutate(content);
  }, [inputText, conversationId, user, sendMessage, sendMessageMutation]);

  const handleSendPress = () => {
    handleSend();
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-[#FDFCFB]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View className="bg-white pt-14 pb-4 px-4 flex-row items-center justify-between shadow-sm z-10 border-b border-slate-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Icon name="arrow-back" size={24} color="#112D4E" />
          </TouchableOpacity>
          <View>
            <Text className="text-lg font-bold text-[#112D4E]">{title || 'Chat'}</Text>
            <Text className="text-xs text-green-500 font-medium">
              {isConnected ? 'Online' : 'Connecting...'}
            </Text>
          </View>
        </View>
        <TouchableOpacity>
          <Icon name="more-vert" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Messages Area */}
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-4"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {isLoading && messages.length === 0 ? (
          <ActivityIndicator color="#FF7A30" className="mt-10" />
        ) : (
          <View className="py-4">
            {messages.map((msg: any, index: number) => {
              const isMine = msg.senderId === user?.id;
              return (
                <View 
                  key={msg.id || index}
                  className={`max-w-[80%] mb-4 ${isMine ? 'self-end' : 'self-start'}`}
                >
                  <View 
                    className={`p-4 rounded-3xl ${isMine ? 'bg-[#FF7A30] rounded-br-sm' : 'bg-white border border-slate-100 rounded-bl-sm shadow-sm'}`}
                  >
                    <Text className={`text-base ${isMine ? 'text-white' : 'text-slate-800'}`}>
                      {msg.content}
                    </Text>
                  </View>
                  <Text className={`text-[10px] text-slate-400 mt-1 ${isMine ? 'self-end' : 'self-start'}`}>
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </Text>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View className="bg-white px-4 py-3 border-t border-slate-100 flex-row items-end pb-8">
        <TouchableOpacity className="w-10 h-10 items-center justify-center mr-2 mb-1">
          <Icon name="attach-file" size={24} color="#94A3B8" />
        </TouchableOpacity>
        
        <View className="flex-1 bg-slate-50 rounded-3xl border border-slate-200 px-4 pt-3 pb-3 min-h-[44px] max-h-[120px]">
          <TextInput 
            className="flex-1 text-slate-900 text-base"
            placeholder="Type a message..."
            placeholderTextColor="#94A3B8"
            multiline
            value={inputText}
            onChangeText={setInputText}
          />
        </View>

        <TouchableOpacity 
          className={`w-12 h-12 rounded-full items-center justify-center ml-3 mb-0 ${inputText.trim() ? 'bg-[#3B82F6]' : 'bg-slate-200'}`}
          onPress={handleSendPress}
          disabled={!inputText.trim()}
        >
          <Icon name="send" size={20} color="#FFF" className="ml-1" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}