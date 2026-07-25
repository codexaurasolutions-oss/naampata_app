import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Linking, ActivityIndicator, TextInput, Alert, Share, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

export default function BusinessDetailScreen({ route, navigation }: any) {
  const { id, slug } = route.params;
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'qa' | 'offers'>('about');
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaAnswer, setQaAnswer] = useState('');
  const [answerTo, setAnswerTo] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['businessDetail', slug || id],
    queryFn: () => api.listings.getBySlug(slug || id),
    enabled: !!(slug || id),
  });

  const { data: followData } = useQuery({
    queryKey: ['followCheck', id],
    queryFn: () => api.follows.checkFollowing(id),
    enabled: isAuthenticated && !!id,
  });

  const { data: followerCountData } = useQuery({
    queryKey: ['followerCount', id],
    queryFn: () => api.follows.getFollowerCount(id),
    enabled: !!id,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['businessReviews', id],
    queryFn: () => api.reviews.getByBusiness(id),
    enabled: !!id,
  });

  const { data: qaData } = useQuery({
    queryKey: ['businessQA', id],
    queryFn: () => api.qa.getByBusiness(id),
    enabled: !!id && activeTab === 'qa',
  });

  const { data: offersData } = useQuery({
    queryKey: ['businessOffers', id],
    queryFn: () => api.offers.getByBusiness(id),
    enabled: !!id && activeTab === 'offers',
  });

  const { data: similarData } = useQuery({
    queryKey: ['similarBusinesses', id],
    queryFn: () => api.listings.getSimilar(id),
    enabled: !!id,
  });

  const followMutation = useMutation({
    mutationFn: () => followData?.data?.isFollowing ? api.follows.unfollow(id) : api.follows.follow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followCheck', id] });
      queryClient.invalidateQueries({ queryKey: ['followerCount', id] });
    },
  });

  const askQuestionMutation = useMutation({
    mutationFn: (question: string) => api.qa.askQuestion({ businessId: id, question }),
    onSuccess: () => {
      Alert.alert('Posted', 'Your question has been submitted for moderation.');
      setQaQuestion('');
      queryClient.invalidateQueries({ queryKey: ['businessQA', id] });
    },
    onError: () => Alert.alert('Error', 'Failed to post question.'),
  });

  const postAnswerMutation = useMutation({
    mutationFn: ({ questionId, answer }: { questionId: string; answer: string }) =>
      api.qa.postAnswer({ questionId, answer }),
    onSuccess: () => {
      Alert.alert('Posted', 'Your answer has been submitted.');
      setQaAnswer('');
      setAnswerTo(null);
      queryClient.invalidateQueries({ queryKey: ['businessQA', id] });
    },
  });

  const saveFavoriteMutation = useMutation({
    mutationFn: () => api.users.addFavorite(id),
    onSuccess: () => Alert.alert('Saved', 'Business saved to favorites!'),
    onError: () => Alert.alert('Error', 'Failed to save.'),
  });

  const createReviewMutation = useMutation({
    mutationFn: (data: any) => api.reviews.create(data),
    onSuccess: () => {
      Alert.alert('Success', 'Review submitted!');
      setReviewComment('');
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ['businessReviews', id] });
    },
    onError: () => Alert.alert('Error', 'Failed to submit review.'),
  });

  const business = data?.data || {};
  const reviews = reviewsData?.data || [];
  const qa = qaData?.data || [];
  const offers = offersData?.data || [];
  const similar = similarData?.data || [];
  const isFollowing = followData?.data?.isFollowing || false;
  const followerCount = followerCountData?.data?.count || 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${business.name} on NAAMPATA!\nhttps://naampata.com/business/${business.slug || business.id}`,
      });
    } catch (e) {}
  };

  const handleWhatsApp = () => {
    const phone = business.whatsapp || business.contactPhone;
    if (phone) Linking.openURL(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`);
  };

  const handleDirections = () => {
    if (business.latitude && business.longitude) {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`);
    } else if (business.address) {
      const addr = typeof business.address === 'string' ? business.address : `${business.address.street || ''}, ${business.address.city || ''}`;
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F8FAFC] items-center justify-center">
        <ActivityIndicator size="large" color="#FF7A30" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7A30" />}
      >
        <View className="h-64 bg-slate-200">
          <Image
            source={{ uri: business.coverImage || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop' }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <TouchableOpacity
            className="absolute top-12 left-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            className="absolute top-12 right-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center"
            onPress={handleShare}
          >
            <Icon name="share" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View className="px-4 py-6 -mt-6 bg-[#F8FAFC] rounded-t-3xl">
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1 pr-4">
              <Text className="text-3xl font-bold text-[#112D4E]">{business.name || 'Business Name'}</Text>
              <Text className="text-[#FF7A30] font-medium mt-1">{business.category?.name || 'Category'}</Text>
              {followerCount > 0 && (
                <Text className="text-slate-400 text-xs mt-1">{followerCount} followers</Text>
              )}
            </View>
            <View className="w-16 h-16 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <Image source={{ uri: business.logo }} className="w-full h-full" resizeMode="contain" />
            </View>
          </View>

          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Icon name="star" size={20} color="#F59E0B" />
              <Text className="font-bold text-slate-900 ml-1 text-base">{business.rating || '0.0'}</Text>
              <Text className="text-slate-400 ml-1">({reviews.length} reviews)</Text>
              <View className="w-1 h-1 bg-slate-300 rounded-full mx-3" />
              <Text className="text-green-500 font-bold">Open Now</Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-6 border-y border-slate-200 py-4">
            {[
              { icon: 'phone', color: '#112D4E', bgColor: '#112D4E/10', label: 'Call', action: () => Linking.openURL(`tel:${business.contactPhone || business.phone}`) },
              { icon: 'chat', color: '#25D366', bgColor: '#25D366/10', label: 'WhatsApp', action: handleWhatsApp },
              { icon: 'directions', color: '#FF7A30', bgColor: '#FF7A30/10', label: 'Directions', action: handleDirections },
              { icon: 'share', color: '#64748B', bgColor: '#F1F5F9', label: 'Share', action: handleShare },
            ].map((item, idx) => (
              <TouchableOpacity key={idx} className="items-center flex-1" onPress={item.action}>
                <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: item.bgColor }}>
                  <Icon name={item.icon} size={22} color={item.color} />
                </View>
                <Text className="font-semibold text-xs" style={{ color: item.color }}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row mb-6">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl items-center mr-2 border ${activeTab === 'about' ? 'bg-[#112D4E] border-[#112D4E]' : 'bg-white border-slate-200'}`}
              onPress={() => setActiveTab('about')}
            >
              <Text className={`font-bold text-sm ${activeTab === 'about' ? 'text-white' : 'text-slate-600'}`}>About</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl items-center mr-2 border ${activeTab === 'reviews' ? 'bg-[#112D4E] border-[#112D4E]' : 'bg-white border-slate-200'}`}
              onPress={() => setActiveTab('reviews')}
            >
              <Text className={`font-bold text-sm ${activeTab === 'reviews' ? 'text-white' : 'text-slate-600'}`}>Reviews</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl items-center mr-2 border ${activeTab === 'qa' ? 'bg-[#112D4E] border-[#112D4E]' : 'bg-white border-slate-200'}`}
              onPress={() => setActiveTab('qa')}
            >
              <Text className={`font-bold text-sm ${activeTab === 'qa' ? 'text-white' : 'text-slate-600'}`}>Q&A</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl items-center border ${activeTab === 'offers' ? 'bg-[#112D4E] border-[#112D4E]' : 'bg-white border-slate-200'}`}
              onPress={() => setActiveTab('offers')}
            >
              <Text className={`font-bold text-sm ${activeTab === 'offers' ? 'text-white' : 'text-slate-600'}`}>Offers</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'about' && (
            <>
              <Text className="text-xl font-bold text-[#112D4E] mb-3">About Us</Text>
              <Text className="text-slate-500 leading-6 mb-6">{business.description || 'No description provided.'}</Text>

              {business.businessHours && Object.keys(business.businessHours).length > 0 && (
                <>
                  <Text className="text-xl font-bold text-[#112D4E] mb-3">Business Hours</Text>
                  <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-6">
                    {Object.entries(business.businessHours).map(([day, hours]: [string, any]) => (
                      <View key={day} className="flex-row justify-between py-2 border-b border-slate-50 last:border-0">
                        <Text className="font-medium text-slate-700 capitalize">{day}</Text>
                        <Text className="text-slate-500">{hours?.isOpen ? `${hours.open} - ${hours.close}` : 'Closed'}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {business.amenities && business.amenities.length > 0 && (
                <>
                  <Text className="text-xl font-bold text-[#112D4E] mb-3">Amenities</Text>
                  <View className="flex-row flex-wrap mb-6">
                    {business.amenities.map((amenity: any, idx: number) => (
                      <View key={idx} className="bg-slate-100 px-3 py-2 rounded-lg mr-2 mb-2">
                        <Text className="text-slate-600 text-sm font-medium">{typeof amenity === 'string' ? amenity : amenity.name}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              <Text className="text-xl font-bold text-[#112D4E] mb-3">Location</Text>
              <View className="flex-row items-start mb-6">
                <Icon name="location-on" size={24} color="#94A3B8" />
                <Text className="text-slate-500 ml-2 flex-1">
                  {business.address
                    ? typeof business.address === 'string'
                      ? business.address
                      : `${business.address.street || ''}, ${business.address.city || ''}, ${business.address.state || ''}`
                    : 'No address provided.'}
                </Text>
              </View>

              {business.socialLinks && Object.keys(business.socialLinks).length > 0 && (
                <>
                  <Text className="text-xl font-bold text-[#112D4E] mb-3">Social Media</Text>
                  <View className="flex-row mb-6">
                    {Object.entries(business.socialLinks).map(([platform, url]: [string, any]) => (
                      <TouchableOpacity
                        key={platform}
                        className="bg-slate-100 w-12 h-12 rounded-full items-center justify-center mr-3"
                        onPress={() => Linking.openURL(url)}
                      >
                        <Icon name={platform === 'facebook' ? 'facebook' : platform === 'instagram' ? 'camera-alt' : platform === 'twitter' ? 'tag' : 'link'} size={20} color="#64748B" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </>
          )}

          {activeTab === 'reviews' && (
            <>
              {isAuthenticated && (
                <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-4">
                  <Text className="font-bold text-[#112D4E] mb-2">Write a Review</Text>
                  <View className="flex-row mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                        <Icon name={star <= reviewRating ? 'star' : 'star-border'} size={28} color="#F59E0B" />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mb-2"
                    placeholder="Share your experience..."
                    placeholderTextColor="#94A3B8"
                    value={reviewComment}
                    onChangeText={setReviewComment}
                    multiline
                  />
                  <TouchableOpacity
                    className="bg-[#FF7A30] py-3 rounded-xl items-center"
                    onPress={() => {
                      if (!reviewComment.trim()) return Alert.alert('Error', 'Please write a review.');
                      createReviewMutation.mutate({ businessId: id, rating: reviewRating, comment: reviewComment });
                    }}
                  >
                    <Text className="text-white font-bold">Submit Review</Text>
                  </TouchableOpacity>
                </View>
              )}
              {reviews.map((review: any) => (
                <View key={review.id} className="bg-white rounded-2xl p-4 border border-slate-100 mb-3">
                  <View className="flex-row items-center mb-2">
                    <View className="w-10 h-10 bg-slate-200 rounded-full items-center justify-center mr-3">
                      <Icon name="person" size={20} color="#94A3B8" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-slate-800">{review.user?.fullName || 'User'}</Text>
                      <View className="flex-row">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Icon key={s} name={s <= (review.rating || 0) ? 'star' : 'star-border'} size={14} color="#F59E0B" />
                        ))}
                      </View>
                    </View>
                    <Text className="text-slate-400 text-xs">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</Text>
                  </View>
                  <Text className="text-slate-600">{review.comment || review.text}</Text>
                  {review.vendorResponse && (
                    <View className="bg-orange-50 rounded-xl p-3 mt-3 ml-6">
                      <Text className="text-xs font-bold text-[#FF7A30] mb-1">Owner Response:</Text>
                      <Text className="text-slate-600 text-sm">{review.vendorResponse}</Text>
                    </View>
                  )}
                </View>
              ))}
              {reviews.length === 0 && (
                <Text className="text-slate-400 text-center py-8">No reviews yet. Be the first to review!</Text>
              )}
            </>
          )}

          {activeTab === 'qa' && (
            <>
              {isAuthenticated && (
                <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-4">
                  <Text className="font-bold text-[#112D4E] mb-2">Ask a Question</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mb-2"
                    placeholder="What would you like to know?"
                    placeholderTextColor="#94A3B8"
                    value={qaQuestion}
                    onChangeText={setQaQuestion}
                  />
                  <TouchableOpacity
                    className="bg-[#FF7A30] py-3 rounded-xl items-center"
                    onPress={() => {
                      if (!qaQuestion.trim()) return;
                      askQuestionMutation.mutate(qaQuestion);
                    }}
                  >
                    <Text className="text-white font-bold">Ask Question</Text>
                  </TouchableOpacity>
                </View>
              )}
              {qa.map((item: any) => (
                <View key={item.id} className="bg-white rounded-2xl p-4 border border-slate-100 mb-3">
                  <View className="flex-row items-start mb-2">
                    <Icon name="question-answer" size={20} color="#3B82F6" />
                    <Text className="font-bold text-slate-800 ml-2 flex-1">{item.question}</Text>
                  </View>
                  <Text className="text-slate-400 text-xs mb-2">Asked by {item.user?.fullName || 'User'} · {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</Text>

                  {item.answers && item.answers.length > 0 && (
                    <View className="ml-6 mb-2">
                      {item.answers.map((ans: any) => (
                        <View key={ans.id} className="bg-slate-50 rounded-xl p-3 mb-2">
                          <Text className="text-slate-700">{ans.answer}</Text>
                          <Text className="text-slate-400 text-xs mt-1">— {ans.user?.fullName || 'User'} · {ans.createdAt ? new Date(ans.createdAt).toLocaleDateString() : ''}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {isAuthenticated && answerTo === item.id ? (
                    <View className="ml-6 mt-2">
                      <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mb-2"
                        placeholder="Write your answer..."
                        placeholderTextColor="#94A3B8"
                        value={qaAnswer}
                        onChangeText={setQaAnswer}
                      />
                      <View className="flex-row">
                        <TouchableOpacity
                          className="bg-[#FF7A30] px-4 py-2 rounded-lg mr-2"
                          onPress={() => postAnswerMutation.mutate({ questionId: item.id, answer: qaAnswer })}
                        >
                          <Text className="text-white font-bold text-xs">Post Answer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-slate-100 px-4 py-2 rounded-lg" onPress={() => { setAnswerTo(null); setQaAnswer(''); }}>
                          <Text className="text-slate-600 font-bold text-xs">Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : isAuthenticated ? (
                    <TouchableOpacity className="ml-6 mt-1" onPress={() => setAnswerTo(item.id)}>
                      <Text className="text-[#FF7A30] font-bold text-xs">Answer this question</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))}
              {qa.length === 0 && (
                <Text className="text-slate-400 text-center py-8">No questions yet. Ask the first one!</Text>
              )}
            </>
          )}

          {activeTab === 'offers' && (
            <>
              {offers.length > 0 ? offers.map((offer: any) => (
                <View key={offer.id} className="bg-white rounded-2xl p-4 border border-slate-100 mb-3">
                  {offer.imageUrl && <Image source={{ uri: offer.imageUrl }} className="w-full h-32 rounded-xl mb-3 bg-slate-200" />}
                  <Text className="font-bold text-[#112D4E] text-lg">{offer.title}</Text>
                  <Text className="text-slate-500 text-sm mt-1" numberOfLines={2}>{offer.description}</Text>
                  {offer.endDate && (
                    <Text className="text-[#FF7A30] text-xs font-bold mt-2">Ends {new Date(offer.endDate).toLocaleDateString()}</Text>
                  )}
                </View>
              )) : (
                <Text className="text-slate-400 text-center py-8">No offers available right now.</Text>
              )}
            </>
          )}
        </View>

        {similar.length > 0 && (
          <View className="px-4 py-6">
            <Text className="text-xl font-bold text-[#112D4E] mb-4">Similar Businesses</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {similar.slice(0, 5).map((biz: any) => (
                <TouchableOpacity
                  key={biz.id}
                  className="bg-white rounded-2xl p-3 mr-3 border border-slate-100 shadow-sm w-48"
                  onPress={() => navigation.push('BusinessDetail', { id: biz.id, slug: biz.slug })}
                >
                  <Image source={{ uri: biz.coverImage || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=200&auto=format&fit=crop' }} className="w-full h-24 rounded-xl bg-slate-200 mb-2" />
                  <Text className="font-bold text-slate-800" numberOfLines={1}>{biz.name}</Text>
                  <Text className="text-slate-400 text-xs">{biz.category?.name || ''}</Text>
                  <View className="flex-row items-center mt-1">
                    <Icon name="star" size={12} color="#F59E0B" />
                    <Text className="text-slate-600 text-xs ml-1">{Number(biz.rating || 0).toFixed(1)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View className="h-6" />
      </ScrollView>

      <View className="p-4 bg-white border-t border-slate-200 flex-row items-center justify-between">
        <TouchableOpacity
          className="w-12 h-12 bg-[#F8FAFC] border border-slate-200 rounded-xl items-center justify-center mr-3"
          onPress={() => {
            if (!isAuthenticated) return navigation.navigate('Auth', { screen: 'Login' });
            followMutation.mutate();
          }}
        >
          <Icon name={isFollowing ? 'favorite' : 'favorite-border'} size={24} color={isFollowing ? '#FF7A30' : '#64748B'} />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-12 h-12 bg-[#F8FAFC] border border-slate-200 rounded-xl items-center justify-center mr-3"
          onPress={() => {
            if (!isAuthenticated) return navigation.navigate('Auth', { screen: 'Login' });
            saveFavoriteMutation.mutate();
          }}
        >
          <Icon name="bookmark-border" size={24} color="#64748B" />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-[#FF7A30] h-12 rounded-xl items-center justify-center"
          onPress={() => Linking.openURL(`tel:${business.contactPhone || business.phone}`)}
        >
          <Text className="text-white font-bold text-lg">Contact Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
