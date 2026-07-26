import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Linking, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ContactScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert('Sent', 'Your message has been sent. We will get back to you shortly.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1500);
  };

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-back" size={24} color="#112D4E" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-[#112D4E]">Contact Us</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View className="bg-[#112D4E] rounded-3xl p-6 mb-8">
          <Text className="text-white font-bold text-xl mb-2">Get in Touch</Text>
          <Text className="text-blue-200 text-sm">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</Text>
        </View>

        <View className="mb-6">
          <Text className="font-bold text-slate-700 mb-2">Name *</Text>
          <TextInput
            className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900"
            placeholder="Your name"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View className="mb-6">
          <Text className="font-bold text-slate-700 mb-2">Email *</Text>
          <TextInput
            className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900"
            placeholder="Your email"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View className="mb-6">
          <Text className="font-bold text-slate-700 mb-2">Subject</Text>
          <TextInput
            className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900"
            placeholder="What's this about?"
            placeholderTextColor="#94A3B8"
            value={subject}
            onChangeText={setSubject}
          />
        </View>

        <View className="mb-6">
          <Text className="font-bold text-slate-700 mb-2">Message *</Text>
          <TextInput
            className="bg-white border border-slate-200 rounded-2xl p-4 h-40 text-slate-900"
            placeholder="Your message..."
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
            value={message}
            onChangeText={setMessage}
          />
        </View>

        <TouchableOpacity
          className={`py-4 rounded-xl items-center mb-8 ${name.trim() && email.trim() && message.trim() ? 'bg-[#FF7A30]' : 'bg-slate-200'}`}
          onPress={handleSubmit}
          disabled={!name.trim() || !email.trim() || !message.trim() || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text className="text-white font-bold text-lg">Send Message</Text>
          )}
        </TouchableOpacity>

        <View className="mb-8">
          <Text className="text-xl font-bold text-[#112D4E] mb-4">Other Ways to Reach Us</Text>
          <View className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <TouchableOpacity className="flex-row items-center mb-4" onPress={() => Linking.openURL('mailto:support@naampata.com')}>
              <View className="w-10 h-10 bg-[#FF7A30]/10 rounded-full items-center justify-center mr-3">
                <Icon name="email" size={20} color="#FF7A30" />
              </View>
              <Text className="text-slate-700 font-medium">support@naampata.com</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center mb-4" onPress={() => Linking.openURL('tel:+1234567890')}>
              <View className="w-10 h-10 bg-[#FF7A30]/10 rounded-full items-center justify-center mr-3">
                <Icon name="phone" size={20} color="#FF7A30" />
              </View>
              <Text className="text-slate-700 font-medium">+1 (234) 567-890</Text>
            </TouchableOpacity>
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-[#FF7A30]/10 rounded-full items-center justify-center mr-3">
                <Icon name="location-on" size={20} color="#FF7A30" />
              </View>
              <Text className="text-slate-700 font-medium">Lagos, Nigeria</Text>
            </View>
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-xl font-bold text-[#112D4E] mb-4">Connect With Us</Text>
          <View className="flex-row justify-center">
            {[
              { icon: 'facebook', url: 'https://facebook.com/naampata' },
              { icon: 'camera-alt', url: 'https://instagram.com/naampata' },
              { icon: 'tag', url: 'https://twitter.com/naampata' },
            ].map((social, idx) => (
              <TouchableOpacity
                key={idx}
                className="w-14 h-14 bg-white rounded-full items-center justify-center border border-slate-100 shadow-sm mr-4"
                onPress={() => Linking.openURL(social.url)}
              >
                <Icon name={social.icon} size={24} color="#112D4E" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
