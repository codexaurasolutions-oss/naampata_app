import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function AboutScreen({ navigation }: any) {
  const features = [
    { icon: 'search', title: 'Smart Search', description: 'Find businesses by category, location, and ratings instantly.' },
    { icon: 'local-offer', title: 'Deals & Offers', description: 'Discover exclusive deals and promotions from local businesses.' },
    { icon: 'star', title: 'Reviews & Ratings', description: 'Read authentic reviews and share your experiences.' },
    { icon: 'event', title: 'Local Events', description: 'Stay updated on events happening in your community.' },
    { icon: 'notifications', title: 'Broadcast', description: 'Broadcast your needs and get responses from businesses instantly.' },
    { icon: 'storefront', title: 'Business Profiles', description: 'Create and manage your business profile with ease.' },
  ];

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-back" size={24} color="#112D4E" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-[#112D4E]">About NAAMPATA</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        <View className="bg-[#112D4E] rounded-3xl p-8 mb-8 items-center">
          <View className="w-20 h-20 bg-white/10 rounded-3xl items-center justify-center mb-4">
            <Icon name="business" size={40} color="#FF7A30" />
          </View>
          <Text className="text-white font-black text-3xl mb-2">NAAMPATA</Text>
          <Text className="text-blue-200 text-center font-medium">The Local Business Directory</Text>
        </View>

        <View className="mb-8">
          <Text className="text-2xl font-black text-[#112D4E] mb-4">Our Mission</Text>
          <Text className="text-slate-600 leading-relaxed text-base">
            NAAMPATA connects local businesses with their communities. We believe every business deserves to be discovered, and every customer deserves to find the best services in their neighborhood.
          </Text>
        </View>

        <View className="mb-8">
          <Text className="text-2xl font-black text-[#112D4E] mb-4">What We Offer</Text>
          {features.map((feature, idx) => (
            <View key={idx} className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 shadow-sm flex-row items-center">
              <View className="w-12 h-12 bg-[#FF7A30]/10 rounded-xl items-center justify-center mr-4">
                <Icon name={feature.icon} size={24} color="#FF7A30" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-[#112D4E] mb-1">{feature.title}</Text>
                <Text className="text-slate-500 text-sm">{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="mb-8">
          <Text className="text-2xl font-black text-[#112D4E] mb-4">Contact Us</Text>
          <View className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <TouchableOpacity className="flex-row items-center mb-4" onPress={() => Linking.openURL('mailto:support@naampata.com')}>
              <Icon name="email" size={20} color="#FF7A30" />
              <Text className="text-slate-700 font-medium ml-3">support@naampata.com</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center mb-4" onPress={() => Linking.openURL('tel:+1234567890')}>
              <Icon name="phone" size={20} color="#FF7A30" />
              <Text className="text-slate-700 font-medium ml-3">+1 (234) 567-890</Text>
            </TouchableOpacity>
            <View className="flex-row items-center">
              <Icon name="location-on" size={20} color="#FF7A30" />
              <Text className="text-slate-700 font-medium ml-3">Lagos, Nigeria</Text>
            </View>
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-2xl font-black text-[#112D4E] mb-4">Follow Us</Text>
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

        <Text className="text-slate-400 text-center text-xs mb-8">Version 1.0.0</Text>
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
