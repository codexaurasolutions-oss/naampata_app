import React from 'react';
import { View, Text, TouchableOpacity, Image, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface BusinessCardProps {
  business: any;
  onPress: () => void;
  onSave?: () => void;
}

export default function BusinessCard({ business, onPress, onSave }: BusinessCardProps) {
  const coverImage = business.coverImageUrl || business.coverImage || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop';
  const logo = business.logoUrl || business.logo || 'https://via.placeholder.com/150';
  const title = business.title || business.name || 'Business Name';
  const rating = business.averageRating || business.rating ? Number(business.averageRating || business.rating).toFixed(1) : '-';
  const reviewsCount = business.totalReviews || business.reviews?.length || business.reviewCount || 0;

  const getIsOpen = (): boolean => {
    if (business.isOpen !== undefined) return business.isOpen;
    const hours = business.businessHours || business.operationalHours;
    if (!hours || typeof hours !== 'object') return false;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    const todayHours = hours[today];
    if (!todayHours || !todayHours.isOpen) return false;
    try {
      const now = new Date();
      const [openH, openM] = todayHours.openTime?.replace(/AM|PM/gi, '').trim().split(':').map(Number) || [];
      const [closeH, closeM] = todayHours.closeTime?.replace(/AM|PM/gi, '').trim().split(':').map(Number) || [];
      if (openH === undefined || closeH === undefined) return false;
      const openMinutes = openH * 60 + (openM || 0);
      const closeMinutes = closeH * 60 + (closeM || 0);
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      return nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
    } catch { return false; }
  };
  const isOpen = getIsOpen();

  let addressText = 'No location specified';
  if (business.city || business.state) {
    addressText = [business.city, business.state].filter(Boolean).join(', ');
  } else if (business.address) {
    if (typeof business.address === 'string') addressText = business.address;
    else addressText = `${business.address.city || ''}, ${business.address.state || ''}`.replace(/^, | , $/g, '');
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="bg-white rounded-[24px] mb-5 shadow-sm border border-slate-100 overflow-hidden"
    >
      <View className="relative h-48 w-full bg-slate-200">
        <Image
          source={{ uri: coverImage }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/20" />
        <View className="absolute top-4 left-4 right-4 flex-row justify-between items-start">
          <View className={`px-3 py-1 rounded-full flex-row items-center border border-white/20 ${isOpen ? 'bg-green-500/90' : 'bg-red-500/90'}`}>
            <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isOpen ? 'bg-white' : 'bg-white'}`} />
            <Text className="text-white font-black text-[10px] uppercase tracking-widest">{isOpen ? 'Open Now' : 'Closed'}</Text>
          </View>
          <TouchableOpacity
            onPress={onSave}
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full items-center justify-center border border-white/30"
          >
            <Icon name="bookmark-border" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View className="absolute -bottom-6 left-4 w-16 h-16 bg-white rounded-2xl p-1 shadow-lg z-10 border border-slate-100">
          <Image source={{ uri: logo }} className="w-full h-full rounded-xl bg-slate-100" resizeMode="cover" />
        </View>
      </View>

      <View className="pt-8 pb-5 px-5">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 pr-3">
            <Text className="text-xl font-black text-slate-900 leading-tight" numberOfLines={1}>
              {title}
            </Text>
            <Text className="text-[#FF7A30] font-bold text-xs mt-1 uppercase tracking-widest">
              {business.category?.name || business.category || 'Service Category'}
            </Text>
          </View>
          <View className="bg-orange-50 px-2.5 py-1 rounded-xl flex-row items-center border border-orange-100 shadow-sm">
            <Icon name="star" size={14} color="#F59E0B" />
            <Text className="text-slate-800 font-bold ml-1 text-sm">{rating}</Text>
          </View>
        </View>

        <View className="flex-row items-center mb-4 mt-2">
          <Icon name="location-pin" size={16} color="#94A3B8" />
          <Text className="text-slate-500 text-sm ml-1 flex-1" numberOfLines={1}>{addressText}</Text>
          <Text className="text-slate-400 text-xs font-medium ml-2 border-l border-slate-200 pl-2">
            {reviewsCount} reviews
          </Text>
        </View>

        <View className="flex-row justify-between items-center border-t border-slate-50 pt-4 mt-1">
          <View className="flex-row">
            {business.facilities?.slice(0, 2).map((feat: string, idx: number) => (
              <View key={idx} className="bg-slate-50 px-3 py-1.5 rounded-lg mr-2 border border-slate-100">
                <Text className="text-slate-500 text-xs font-medium">{feat}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            className="flex-row items-center bg-[#112D4E] px-4 py-2 rounded-xl"
            onPress={(e) => {
              e.stopPropagation();
              const phone = business.vendor?.businessPhone || business.contactPhone;
              if (phone) Linking.openURL(`tel:${phone}`);
            }}
          >
            <Icon name="phone" size={16} color="#FFF" />
            <Text className="text-white font-bold text-xs ml-1">Call</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
