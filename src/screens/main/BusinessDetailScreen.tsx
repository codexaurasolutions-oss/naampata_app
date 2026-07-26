import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Linking, ActivityIndicator, TextInput, Alert, Share, RefreshControl, Modal, FlatList, Dimensions, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop';

function getBusinessOpenStatus(businessHours: any[]): { isOpen: boolean; text: string } {
  if (!Array.isArray(businessHours) || businessHours.length === 0) return { isOpen: false, text: '' };
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = dayNames[now.getDay()];
  const todayHours = businessHours.find((h: any) => h.dayOfWeek?.toLowerCase() === today);
  if (!todayHours || !todayHours.isOpen) return { isOpen: false, text: 'Closed today' };
  const openTime = todayHours.openTime || todayHours.open;
  const closeTime = todayHours.closeTime || todayHours.close;
  if (!openTime || !closeTime) return { isOpen: false, text: '' };
  const [openH, openM] = openTime.split(':').map(Number);
  const [closeH, closeM] = closeTime.split(':').map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  const isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  return { isOpen, text: isOpen ? 'Open Now' : 'Closed' };
}

const SOCIAL_ICONS: Record<string, { icon: string; color: string }> = {
  facebook: { icon: 'facebook', color: '#1877F2' },
  instagram: { icon: 'camera-alt', color: '#E4405F' },
  twitter: { icon: 'tag', color: '#1DA1F2' },
  linkedin: { icon: 'work', color: '#0A66C2' },
  youtube: { icon: 'play-circle-filled', color: '#FF0000' },
  whatsapp: { icon: 'chat', color: '#25D366' },
};

export default function BusinessDetailScreen({ route, navigation }: any) {
  const { id, slug } = route.params;
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'qa' | 'offers' | 'faqs'>('about');
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaAnswer, setQaAnswer] = useState('');
  const [answerTo, setAnswerTo] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [refreshing, setRefreshing] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [enquiryVisible, setEnquiryVisible] = useState(false);
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryEmail, setEnquiryEmail] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [replyReviewId, setReplyReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['businessDetail', slug || id],
    queryFn: () => slug ? api.listings.getBySlug(slug) : api.listings.getById(id),
    enabled: !!(slug || id),
  });

  const { data: followData } = useQuery({ queryKey: ['followCheck', id], queryFn: () => api.follows.checkFollowing(id), enabled: isAuthenticated && !!id });
  const { data: followerCountData } = useQuery({ queryKey: ['followerCount', id], queryFn: () => api.follows.getFollowerCount(id), enabled: !!id });
  const { data: reviewsData } = useQuery({ queryKey: ['businessReviews', id], queryFn: () => api.reviews.getByBusiness(id), enabled: !!id });
  const { data: qaData } = useQuery({ queryKey: ['businessQA', id], queryFn: () => api.qa.getByBusiness(id), enabled: !!id && activeTab === 'qa' });
  const { data: offersData } = useQuery({ queryKey: ['businessOffers', id], queryFn: () => api.offers.getByBusiness(id), enabled: !!id && activeTab === 'offers' });
  const { data: similarData } = useQuery({ queryKey: ['similarBusinesses', id], queryFn: () => api.listings.getSimilar(id), enabled: !!id });

  const followMutation = useMutation({
    mutationFn: () => followData?.isFollowing ? api.follows.unfollow(id) : api.follows.follow(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['followCheck', id] }); queryClient.invalidateQueries({ queryKey: ['followerCount', id] }); },
  });

  const askQuestionMutation = useMutation({
    mutationFn: (question: string) => api.qa.askQuestion({ businessId: id, question }),
    onSuccess: () => { Alert.alert('Posted', 'Your question has been submitted for moderation.'); setQaQuestion(''); queryClient.invalidateQueries({ queryKey: ['businessQA', id] }); },
    onError: () => Alert.alert('Error', 'Failed to post question.'),
  });

  const postAnswerMutation = useMutation({
    mutationFn: ({ questionId, answer }: { questionId: string; answer: string }) => api.qa.postAnswer({ questionId, answer }),
    onSuccess: () => { Alert.alert('Posted', 'Your answer has been submitted.'); setQaAnswer(''); setAnswerTo(null); queryClient.invalidateQueries({ queryKey: ['businessQA', id] }); },
  });

  const createReviewMutation = useMutation({
    mutationFn: (data: any) => api.reviews.create(data),
    onSuccess: () => { Alert.alert('Success', 'Review submitted!'); setReviewComment(''); setReviewRating(5); queryClient.invalidateQueries({ queryKey: ['businessReviews', id] }); },
    onError: () => Alert.alert('Error', 'Failed to submit review.'),
  });

  const replyReviewMutation = useMutation({
    mutationFn: ({ reviewId, content }: { reviewId: string; content: string }) => api.reviews.postReply(reviewId, content),
    onSuccess: () => { Alert.alert('Success', 'Reply posted!'); setReplyReviewId(null); setReplyText(''); queryClient.invalidateQueries({ queryKey: ['businessReviews', id] }); },
  });

  const enquiryMutation = useMutation({
    mutationFn: (data: any) => api.leads.create(data),
    onSuccess: () => { Alert.alert('Sent', 'Your enquiry has been sent to the business.'); setEnquiryVisible(false); setEnquiryName(''); setEnquiryEmail(''); setEnquiryPhone(''); setEnquiryMessage(''); },
    onError: () => Alert.alert('Error', 'Failed to send enquiry.'),
  });

  const business = data || {};
  const reviews = reviewsData?.data || reviewsData?.reviews || (Array.isArray(reviewsData) ? reviewsData : []);
  const qa = qaData?.data || qaData?.questions || (Array.isArray(qaData) ? qaData : []);
  const offers = offersData?.data || offersData?.offers || (Array.isArray(offersData) ? offersData : []);
  const similar = similarData?.data || similarData?.businesses || (Array.isArray(similarData) ? similarData : []);
  const isFollowing = followData?.isFollowing || false;
  const followerCount = followerCountData?.count || business.followersCount || 0;

  const onRefresh = async () => { setRefreshing(true); await refetch(); setRefreshing(false); };

  const handleShare = async () => {
    const name = business.title || business.name || 'this business';
    try { await Share.share({ message: `Check out ${name} on NAAMPATA!\nhttps://naampata.com/business/${business.slug || business.id}` }); } catch (e) {}
  };

  const handleWhatsApp = () => { const phone = business.whatsapp || business.phone; if (phone) Linking.openURL(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`); };

  const handleDirections = () => {
    if (business.latitude && business.longitude) {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`);
    } else if (business.address) {
      const addr = typeof business.address === 'string' ? business.address : `${business.address.street || ''}, ${business.address.city || ''}`;
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`);
    }
  };

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to use this feature.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Auth', { screen: 'Login' }) },
      ]);
      return;
    }
    action();
  };

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color="#FF7A30" /></View>;
  }

  const coverImage = business.coverImageUrl || business.coverImage || FALLBACK_IMG;
  const galleryImages: string[] = [];
  if (coverImage) galleryImages.push(coverImage);
  if (business.images && Array.isArray(business.images)) {
    business.images.forEach((img: any) => {
      const url = typeof img === 'string' ? img : img.url || img.imageUrl;
      if (url && !galleryImages.includes(url)) galleryImages.push(url);
    });
  }
  if (business.gallery && Array.isArray(business.gallery)) {
    business.gallery.forEach((img: any) => {
      const url = typeof img === 'string' ? img : img.url;
      if (url && !galleryImages.includes(url)) galleryImages.push(url);
    });
  }

  const businessName = business.title || business.name || 'Business Name';
  const categoryName = business.category?.name || business.suggestedCategoryName || '';
  const rating = business.averageRating || business.rating || '0.0';
  const reviewCount = business.totalReviews || reviews.length || 0;
  const description = business.description || business.shortDescription || 'No description provided.';
  const logoUrl = business.logoUrl || business.logo || null;
  const contactPhone = business.phone || business.contactPhone || business.vendor?.businessPhone || '';
  const additionalPhones: { label: string; phone: string }[] = [];
  if (business.additionalPhones && Array.isArray(business.additionalPhones)) {
    business.additionalPhones.forEach((p: any) => {
      if (p.phone) additionalPhones.push({ label: p.label || p.name || 'Contact', phone: p.phone });
    });
  }
  const lat = parseFloat(business.latitude) || null;
  const lng = parseFloat(business.longitude) || null;

  const hoursArray = Array.isArray(business.businessHours) ? business.businessHours : [];
  const hoursObj: any = {};
  hoursArray.forEach((h: any) => { if (h.dayOfWeek) hoursObj[h.dayOfWeek] = h; });
  const hasHours = Object.keys(hoursObj).length > 0;

  const socialLinks = Array.isArray(business.socialLinks) ? business.socialLinks.reduce((acc: any, link: any) => {
    if (link && link.platform && link.url) acc[link.platform] = link.url;
    return acc;
  }, {}) : (typeof business.socialLinks === 'object' && business.socialLinks ? business.socialLinks : {});

  const isVerified = business.isVerified || business.verified || false;
  const isRecommended = business.isRecommended || business.recommended || false;
  const isOpen = business.isOpen || business.status === 'active';
  const isVendorOnline = business.vendor?.isOnline || business.vendor?.lastSeenAt;

  return (
    <View style={s.container}>
      <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7A30" />}>
        {business.status === 'pending' && (
          <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="schedule" size={18} color="#D97706" />
            <Text style={{ color: '#92400E', fontWeight: '600', fontSize: 13 }}>Pending Approval — This listing is under review.</Text>
          </View>
        )}

        <View style={{ height: 260, backgroundColor: '#E2E8F0' }}>
          <Image source={{ uri: coverImage }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          <TouchableOpacity style={[s.overlayBtn, { left: 16, top: Platform.OS === 'ios' ? 56 : 48 }]} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={[s.overlayBtn, { right: 16, top: Platform.OS === 'ios' ? 56 : 48 }]} onPress={handleShare}>
            <Icon name="share" size={20} color="#FFF" />
          </TouchableOpacity>
          {galleryImages.length > 1 && (
            <TouchableOpacity style={[s.overlayBtn, { right: 16, bottom: 16, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 6 }]} onPress={() => { setGalleryIndex(0); setGalleryVisible(true); }}>
              <Icon name="photo-library" size={18} color="#FFF" />
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>{galleryImages.length} photos</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={s.infoSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={s.businessTitle}>{businessName}</Text>
              {categoryName ? <Text style={s.categoryText}>{categoryName}</Text> : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
                {isVerified && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 4 }}>
                    <Icon name="verified" size={14} color="#3B82F6" />
                    <Text style={{ color: '#3B82F6', fontWeight: '700', fontSize: 11 }}>Verified</Text>
                  </View>
                )}
                {isRecommended && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 4 }}>
                    <Icon name="emoji-events" size={14} color="#FF7A30" />
                    <Text style={{ color: '#FF7A30', fontWeight: '700', fontSize: 11 }}>Recommended</Text>
                  </View>
                )}
              </View>
            </View>
            {logoUrl ? (
              <View style={{ width: 56, height: 56, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#F1F5F9', overflow: 'hidden' }}>
                <Image source={{ uri: logoUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </View>
            ) : null}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
            <Icon name="star" size={20} color="#F59E0B" />
            <Text style={{ fontWeight: '700', color: '#1E293B', fontSize: 16 }}>{Number(rating).toFixed(1)}</Text>
            <Text style={{ color: '#94A3B8', fontSize: 14 }}>({reviewCount} reviews)</Text>
            <View style={{ width: 4, height: 4, backgroundColor: '#CBD5E1', borderRadius: 2 }} />
            {(() => { const st = getBusinessOpenStatus(business.businessHours); return st.text ? <Text style={{ color: st.isOpen ? '#22C55E' : '#EF4444', fontWeight: '700', fontSize: 14 }}>{st.text}</Text> : null; })()}
            {isVendorOnline !== undefined && (
              <>
                <View style={{ width: 4, height: 4, backgroundColor: '#CBD5E1', borderRadius: 2 }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: business.vendor?.isOnline ? '#22C55E' : '#EF4444' }} />
                  <Text style={{ fontSize: 12, fontWeight: '600', color: business.vendor?.isOnline ? '#22C55E' : '#EF4444' }}>{business.vendor?.isOnline ? 'Online' : 'Offline'}</Text>
                </View>
              </>
            )}
          </View>
          {followerCount > 0 && <Text style={{ color: '#94A3B8', fontSize: 12, marginBottom: 12 }}>{followerCount} followers</Text>}

          <View style={s.actionRow}>
            <TouchableOpacity style={s.actionBtn} onPress={() => requireAuth(() => { if (contactPhone) Linking.openURL(`tel:${contactPhone}`); })}>
              <View style={[s.actionIconWrap, { backgroundColor: '#112D4E10' }]}><Icon name="phone" size={22} color="#112D4E" /></View>
              <Text style={[s.actionLabel, { color: '#112D4E' }]}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={() => requireAuth(() => handleWhatsApp())}>
              <View style={[s.actionIconWrap, { backgroundColor: '#25D36610' }]}><Icon name="chat" size={22} color="#25D366" /></View>
              <Text style={[s.actionLabel, { color: '#25D366' }]}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={() => requireAuth(() => handleDirections())}>
              <View style={[s.actionIconWrap, { backgroundColor: '#FF7A3010' }]}><Icon name="directions" size={22} color="#FF7A30" /></View>
              <Text style={[s.actionLabel, { color: '#FF7A30' }]}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={() => requireAuth(() => setEnquiryVisible(true))}>
              <View style={[s.actionIconWrap, { backgroundColor: '#3B82F610' }]}><Icon name="mail" size={22} color="#3B82F6" /></View>
              <Text style={[s.actionLabel, { color: '#3B82F6' }]}>Enquire</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={() => requireAuth(() => {
              if (business.vendor?.id) {
                navigation.navigate('Chat', { vendorId: business.vendor.id, businessName });
              } else {
                Alert.alert('Chat', 'Chat is not available for this business.');
              }
            })}>
              <View style={[s.actionIconWrap, { backgroundColor: '#8B5CF610' }]}><Icon name="forum" size={22} color="#8B5CF6" /></View>
              <Text style={[s.actionLabel, { color: '#8B5CF6' }]}>Chat</Text>
            </TouchableOpacity>
          </View>

          <View style={s.tabRow}>
            {(['about', 'reviews', 'qa', 'offers', 'faqs'] as const).map((tab) => (
              <TouchableOpacity key={tab} style={[s.tabBtn, activeTab === tab && s.tabBtnActive]} onPress={() => setActiveTab(tab)}>
                <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                  {tab === 'about' ? 'About' : tab === 'reviews' ? 'Reviews' : tab === 'qa' ? 'Q&A' : tab === 'faqs' ? 'FAQs' : 'Offers'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'about' && (
            <>
              <Text style={s.sectionTitle}>About Us</Text>
              <Text style={s.sectionText}>{description}</Text>

              {hasHours && (
                <>
                  <Text style={s.sectionTitle}>Business Hours</Text>
                  <View style={s.card}>
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                      const h = hoursObj[day];
                      const isToday = day === ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
                      return (
                        <View key={day} style={[s.hoursRow, isToday && { backgroundColor: '#FFF7ED' }]}>
                          <Text style={[s.hoursDay, isToday && { color: '#FF7A30', fontWeight: '800' }]}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                          <Text style={[s.hoursTime, !h?.isOpen && { color: '#EF4444' }]}>
                            {h?.isOpen ? `${h.openTime || h.open || ''} - ${h.closeTime || h.close || ''}` : 'Closed'}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </>
              )}

              {business.facilities && business.facilities.length > 0 && (
                <>
                  <Text style={s.sectionTitle}>Amenities</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24, gap: 8 }}>
                    {business.facilities.map((amenity: any, idx: number) => (
                      <View key={idx} style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Icon name="check-circle" size={16} color="#22C55E" />
                        <Text style={{ color: '#334155', fontSize: 13, fontWeight: '600' }}>{typeof amenity === 'string' ? amenity : amenity.name}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {business.paymentMethods && business.paymentMethods.length > 0 && (
                <>
                  <Text style={s.sectionTitle}>Payment Methods</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24, gap: 8 }}>
                    {business.paymentMethods.map((method: string, idx: number) => (
                      <View key={idx} style={{ backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Icon name="payment" size={16} color="#3B82F6" />
                        <Text style={{ color: '#1E40AF', fontSize: 13, fontWeight: '600' }}>{method}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {contactPhone && (
                <>
                  <Text style={s.sectionTitle}>Phone Numbers</Text>
                  <View style={s.card}>
                    <TouchableOpacity style={[s.hoursRow, { alignItems: 'center' }]} onPress={() => requireAuth(() => Linking.openURL(`tel:${contactPhone}`))}>
                      <Text style={s.hoursDay}>Primary</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ color: '#112D4E', fontWeight: '700' }}>{contactPhone}</Text>
                        <Icon name="phone" size={16} color="#FF7A30" />
                      </View>
                    </TouchableOpacity>
                    {additionalPhones.map((p, idx) => (
                      <TouchableOpacity key={idx} style={[s.hoursRow, idx === additionalPhones.length - 1 && { borderBottomWidth: 0 }]} onPress={() => requireAuth(() => Linking.openURL(`tel:${p.phone}`))}>
                        <Text style={s.hoursDay}>{p.label}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={{ color: '#112D4E', fontWeight: '700' }}>{p.phone}</Text>
                          <Icon name="phone" size={16} color="#FF7A30" />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <Text style={s.sectionTitle}>Location</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                <Icon name="location-on" size={24} color="#94A3B8" />
                <Text style={{ color: '#64748B', marginLeft: 8, flex: 1, lineHeight: 20 }}>
                  {business.address || 'No address provided.'}
                  {business.city ? `, ${business.city}` : ''}{business.state ? `, ${business.state}` : ''}{business.country ? `, ${business.country}` : ''}
                </Text>
              </View>

              {lat && lng && (
                <TouchableOpacity style={s.mapBtn} onPress={() => requireAuth(() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`))}>
                  <Icon name="map" size={20} color="#FFF" />
                  <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 15, marginLeft: 8 }}>Open in Google Maps</Text>
                </TouchableOpacity>
              )}

              {Object.keys(socialLinks).length > 0 && (
                <>
                  <Text style={s.sectionTitle}>Social Media</Text>
                  <View style={{ flexDirection: 'row', marginBottom: 24, gap: 12 }}>
                    {Object.entries(socialLinks).map(([platform, url]: [string, any]) => {
                      const social = SOCIAL_ICONS[platform] || { icon: 'link', color: '#64748B' };
                      return (
                        <TouchableOpacity key={platform} style={[s.socialIcon, { backgroundColor: social.color + '15' }]} onPress={() => url && Linking.openURL(url)}>
                          <Icon name={social.icon} size={22} color={social.color} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}
            </>
          )}

          {activeTab === 'reviews' && (
            <>
              {isAuthenticated ? (
                <View style={s.card}>
                  <Text style={{ fontWeight: '800', color: '#112D4E', fontSize: 16, marginBottom: 12 }}>Write a Review</Text>
                  <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                        <Icon name={star <= reviewRating ? 'star' : 'star-border'} size={32} color="#F59E0B" />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput style={s.textArea} placeholder="Share your experience..." placeholderTextColor="#94A3B8" value={reviewComment} onChangeText={setReviewComment} multiline />
                  <TouchableOpacity style={s.primaryBtn} onPress={() => { if (!reviewComment.trim()) return Alert.alert('Error', 'Please write a review.'); createReviewMutation.mutate({ businessId: id, rating: reviewRating, comment: reviewComment }); }}>
                    <Text style={s.primaryBtnText}>Submit Review</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={s.authPrompt} onPress={() => Alert.alert('Login Required', 'Please login to write a review.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Login', onPress: () => navigation.navigate('Auth', { screen: 'Login' }) }])}>
                  <Icon name="edit" size={20} color="#FF7A30" />
                  <Text style={{ color: '#FF7A30', fontWeight: '700', marginLeft: 8 }}>Write a Review</Text>
                </TouchableOpacity>
              )}
              {reviews.map((review: any) => (
                <View key={review.id} style={s.card}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ width: 40, height: 40, backgroundColor: '#F1F5F9', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      {review.user?.avatarUrl ? <Image source={{ uri: review.user.avatarUrl }} style={{ width: 40, height: 40, borderRadius: 20 }} /> : <Icon name="person" size={20} color="#94A3B8" />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', color: '#1E293B', fontSize: 14 }}>{review.user?.fullName || review.user?.firstName || 'User'}</Text>
                      <View style={{ flexDirection: 'row' }}>{[1, 2, 3, 4, 5].map((st) => <Icon key={st} name={st <= (review.rating || 0) ? 'star' : 'star-border'} size={14} color="#F59E0B" />)}</View>
                    </View>
                    <Text style={{ color: '#94A3B8', fontSize: 11 }}>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</Text>
                  </View>
                  <Text style={{ color: '#475569', lineHeight: 20 }}>{review.comment || review.text}</Text>
                  {review.vendorResponse && (
                    <View style={{ backgroundColor: '#FFF7ED', borderRadius: 12, padding: 12, marginTop: 12, marginLeft: 24, borderLeftWidth: 3, borderLeftColor: '#FF7A30' }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#FF7A30', marginBottom: 4 }}>Owner Response:</Text>
                      <Text style={{ color: '#475569', fontSize: 13 }}>{review.vendorResponse}</Text>
                    </View>
                  )}
                  {review.replies && review.replies.length > 0 && (
                    <View style={{ marginTop: 12, marginLeft: 24 }}>
                      {review.replies.map((reply: any) => (
                        <View key={reply.id} style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, marginBottom: 6 }}>
                          <Text style={{ color: '#475569', fontSize: 13 }}>{reply.content}</Text>
                          <Text style={{ color: '#94A3B8', fontSize: 10, marginTop: 4 }}>— {reply.user?.fullName || 'User'}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {isAuthenticated && (
                    replyReviewId === review.id ? (
                      <View style={{ marginTop: 8, marginLeft: 24 }}>
                        <TextInput style={[s.textArea, { minHeight: 60 }]} placeholder="Write your reply..." placeholderTextColor="#94A3B8" value={replyText} onChangeText={setReplyText} />
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <TouchableOpacity style={[s.primaryBtn, { flex: 0, paddingHorizontal: 16 }]} onPress={() => { if (replyText.trim()) replyReviewMutation.mutate({ reviewId: review.id, content: replyText }); }}>
                            <Text style={s.primaryBtnText}>Reply</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[s.secondaryBtn, { flex: 0, paddingHorizontal: 16 }]} onPress={() => { setReplyReviewId(null); setReplyText(''); }}>
                            <Text style={s.secondaryBtnText}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity style={{ marginTop: 8, marginLeft: 24 }} onPress={() => { setReplyReviewId(review.id); setReplyText(''); }}>
                        <Text style={{ color: '#FF7A30', fontWeight: '700', fontSize: 12 }}>Reply</Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              ))}
              {reviews.length === 0 && <Text style={{ color: '#94A3B8', textAlign: 'center', paddingVertical: 32 }}>No reviews yet. Be the first to review!</Text>}
            </>
          )}

          {activeTab === 'qa' && (
            <>
              {isAuthenticated ? (
                <View style={s.card}>
                  <Text style={{ fontWeight: '800', color: '#112D4E', fontSize: 16, marginBottom: 12 }}>Ask a Question</Text>
                  <TextInput style={s.textInput} placeholder="What would you like to know?" placeholderTextColor="#94A3B8" value={qaQuestion} onChangeText={setQaQuestion} />
                  <TouchableOpacity style={s.primaryBtn} onPress={() => { if (qaQuestion.trim()) askQuestionMutation.mutate(qaQuestion); }}>
                    <Text style={s.primaryBtnText}>Ask Question</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={s.authPrompt} onPress={() => Alert.alert('Login Required', 'Please login to ask a question.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Login', onPress: () => navigation.navigate('Auth', { screen: 'Login' }) }])}>
                  <Icon name="question-answer" size={20} color="#FF7A30" />
                  <Text style={{ color: '#FF7A30', fontWeight: '700', marginLeft: 8 }}>Ask a Question</Text>
                </TouchableOpacity>
              )}
              {qa.map((item: any) => (
                <View key={item.id} style={s.card}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                    <Icon name="help-outline" size={20} color="#3B82F6" />
                    <Text style={{ fontWeight: '700', color: '#1E293B', flex: 1 }}>{item.question}</Text>
                  </View>
                  <Text style={{ color: '#94A3B8', fontSize: 11, marginBottom: 8 }}>Asked by {item.user?.fullName || 'User'} · {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</Text>
                  {item.answers && item.answers.length > 0 && (
                    <View style={{ marginLeft: 28, gap: 8 }}>
                      {item.answers.map((ans: any) => (
                        <View key={ans.id} style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12 }}>
                          <Text style={{ color: '#475569' }}>{ans.answer}</Text>
                          <Text style={{ color: '#94A3B8', fontSize: 10, marginTop: 4 }}>— {ans.user?.fullName || 'User'}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {isAuthenticated && answerTo === item.id ? (
                    <View style={{ marginLeft: 28, marginTop: 8 }}>
                      <TextInput style={s.textInput} placeholder="Write your answer..." placeholderTextColor="#94A3B8" value={qaAnswer} onChangeText={setQaAnswer} />
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity style={[s.primaryBtn, { flex: 0, paddingHorizontal: 16 }]} onPress={() => postAnswerMutation.mutate({ questionId: item.id, answer: qaAnswer })}>
                          <Text style={s.primaryBtnText}>Post Answer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[s.secondaryBtn, { flex: 0, paddingHorizontal: 16 }]} onPress={() => { setAnswerTo(null); setQaAnswer(''); }}>
                          <Text style={s.secondaryBtnText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : isAuthenticated ? (
                    <TouchableOpacity style={{ marginLeft: 28, marginTop: 8 }} onPress={() => setAnswerTo(item.id)}>
                      <Text style={{ color: '#FF7A30', fontWeight: '700', fontSize: 12 }}>Answer this question</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))}
              {qa.length === 0 && <Text style={{ color: '#94A3B8', textAlign: 'center', paddingVertical: 32 }}>No questions yet. Ask the first one!</Text>}
            </>
          )}

          {activeTab === 'offers' && (
            <>
              {offers.length > 0 ? offers.map((offer: any) => (
                <View key={offer.id} style={s.card}>
                  {(offer.imageUrl || offer.bannerUrl) && <Image source={{ uri: offer.imageUrl || offer.bannerUrl }} style={{ width: '100%', height: 140, borderRadius: 14, marginBottom: 12, backgroundColor: '#F1F5F9' }} />}
                  {offer.badge && <View style={{ backgroundColor: '#FF7A30', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8 }}><Text style={{ color: '#FFF', fontWeight: '800', fontSize: 11 }}>{offer.badge}</Text></View>}
                  <Text style={{ fontWeight: '800', color: '#112D4E', fontSize: 18 }}>{offer.title}</Text>
                  <Text style={{ color: '#64748B', fontSize: 14, marginTop: 6, lineHeight: 20 }} numberOfLines={3}>{offer.description}</Text>
                  {offer.endDate && <Text style={{ color: '#FF7A30', fontWeight: '700', fontSize: 12, marginTop: 8 }}>Valid until {new Date(offer.endDate).toLocaleDateString()}</Text>}
                  <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
                    <TouchableOpacity style={[s.primaryBtn, { flex: 1 }]} onPress={() => requireAuth(() => { if (contactPhone) Linking.openURL(`tel:${contactPhone}`); })}>
                      <Text style={s.primaryBtnText}>Enquire Now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.secondaryBtn, { flex: 1 }]} onPress={() => requireAuth(() => { if (contactPhone) Linking.openURL(`tel:${contactPhone}`); })}>
                      <Text style={s.secondaryBtnText}>Call to Claim</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )) : (
                <Text style={{ color: '#94A3B8', textAlign: 'center', paddingVertical: 32 }}>No offers available right now.</Text>
              )}
            </>
          )}

          {activeTab === 'faqs' && (
            <>
              {business.faqs && business.faqs.length > 0 ? business.faqs.map((faq: any, idx: number) => (
                <View key={idx} style={s.card}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                    <Icon name="help-outline" size={20} color="#FF7A30" />
                    <Text style={{ fontWeight: '800', color: '#112D4E', flex: 1 }}>{faq.question}</Text>
                  </View>
                  <Text style={{ color: '#64748B', fontSize: 14, marginTop: 8, marginLeft: 28, lineHeight: 20 }}>{faq.answer}</Text>
                </View>
              )) : (
                <Text style={{ color: '#94A3B8', textAlign: 'center', paddingVertical: 32 }}>No FAQs available for this business.</Text>
              )}
            </>
          )}
        </View>

        {similar.length > 0 && (
          <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#112D4E', marginBottom: 16 }}>Similar Businesses</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {similar.slice(0, 5).map((biz: any) => (
                <TouchableOpacity key={biz.id} style={s.similarCard} onPress={() => navigation.push('BusinessDetail', { id: biz.id, slug: biz.slug })}>
                  <Image source={{ uri: biz.coverImageUrl || biz.coverImage || FALLBACK_IMG }} style={{ width: '100%', height: 96, borderRadius: 14, backgroundColor: '#F1F5F9', marginBottom: 8 }} />
                  <Text style={{ fontWeight: '700', color: '#1E293B', fontSize: 13 }} numberOfLines={1}>{biz.title || biz.name}</Text>
                  <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 2 }}>{biz.category?.name || ''}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
                    <Icon name="star" size={12} color="#F59E0B" />
                    <Text style={{ color: '#475569', fontSize: 11, fontWeight: '600' }}>{Number(biz.averageRating || biz.rating || 0).toFixed(1)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={s.bottomBar}>
        <TouchableOpacity style={s.followBtn} onPress={() => requireAuth(() => followMutation.mutate())}>
          <Icon name={isFollowing ? 'favorite' : 'favorite-border'} size={24} color={isFollowing ? '#FF7A30' : '#64748B'} />
        </TouchableOpacity>
        <TouchableOpacity style={s.followBtn} onPress={() => requireAuth(() => {
          const name = business.title || business.name || 'this business';
          Share.share({ message: `Check out ${name} on NAAMPATA!\nhttps://naampata.com/business/${business.slug || business.id}` });
        })}>
          <Icon name="bookmark-border" size={24} color="#64748B" />
        </TouchableOpacity>
        <TouchableOpacity style={s.contactBtn} onPress={() => requireAuth(() => { if (contactPhone) Linking.openURL(`tel:${contactPhone}`); })}>
          <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 17 }}>Contact Now</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={galleryVisible} animationType="slide" transparent onRequestClose={() => setGalleryVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' }}>
          <TouchableOpacity style={{ position: 'absolute', top: Platform.OS === 'ios' ? 56 : 40, right: 16, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }} onPress={() => setGalleryVisible(false)}>
            <Icon name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <FlatList
            data={galleryImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={galleryIndex}
            getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
            onMomentumScrollEnd={(e) => setGalleryIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH))}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => (
              <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.7, justifyContent: 'center', alignItems: 'center' }}>
                <Image source={{ uri: item }} style={{ width: SCREEN_WIDTH - 32, height: SCREEN_HEIGHT * 0.65 }} resizeMode="contain" />
              </View>
            )}
          />
          <View style={{ position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 }}>
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>{galleryIndex + 1} / {galleryImages.length}</Text>
          </View>
        </View>
      </Modal>

      <Modal visible={enquiryVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEnquiryVisible(false)}>
        <View style={{ flex: 1, backgroundColor: '#FDFCFB' }}>
          <View style={{ paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#112D4E' }}>Send Enquiry</Text>
            <TouchableOpacity style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }} onPress={() => setEnquiryVisible(false)}>
              <Icon name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, padding: 20 }}>
            <Text style={{ color: '#64748B', fontSize: 14, marginBottom: 20 }}>Send your enquiry to {businessName}. They will respond as soon as possible.</Text>
            <Text style={s.label}>Your Name *</Text>
            <TextInput style={s.textInput} placeholder="Full name" placeholderTextColor="#94A3B8" value={enquiryName} onChangeText={setEnquiryName} />
            <Text style={s.label}>Email *</Text>
            <TextInput style={s.textInput} placeholder="Email address" placeholderTextColor="#94A3B8" value={enquiryEmail} onChangeText={setEnquiryEmail} keyboardType="email-address" />
            <Text style={s.label}>Phone *</Text>
            <TextInput style={s.textInput} placeholder="Phone number" placeholderTextColor="#94A3B8" value={enquiryPhone} onChangeText={setEnquiryPhone} keyboardType="phone-pad" />
            <Text style={s.label}>Message *</Text>
            <TextInput style={[s.textArea, { minHeight: 120 }]} placeholder="Tell them what you need..." placeholderTextColor="#94A3B8" value={enquiryMessage} onChangeText={setEnquiryMessage} multiline textAlignVertical="top" />
            <TouchableOpacity style={[s.primaryBtn, { marginBottom: 40 }]} onPress={() => {
              if (!enquiryName.trim() || !enquiryEmail.trim() || !enquiryMessage.trim()) return Alert.alert('Error', 'Please fill all required fields.');
              enquiryMutation.mutate({ businessId: id, name: enquiryName, email: enquiryEmail, phone: enquiryPhone, message: enquiryMessage, type: 'enquiry' });
            }}>
              <Text style={s.primaryBtnText}>Send Enquiry</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  overlayBtn: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  infoSection: { backgroundColor: '#F8FAFC', marginTop: -24, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  businessTitle: { fontSize: 26, fontWeight: '900', color: '#112D4E', marginBottom: 4 },
  categoryText: { color: '#FF7A30', fontWeight: '600', fontSize: 15 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 20 },
  actionBtn: { alignItems: 'center', flex: 1 },
  actionIconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  actionLabel: { fontSize: 11, fontWeight: '700' },
  tabRow: { flexDirection: 'row', marginBottom: 20 },
  tabBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginRight: 8, borderWidth: 1, backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  tabBtnActive: { backgroundColor: '#112D4E', borderColor: '#112D4E' },
  tabText: { fontWeight: '700', fontSize: 13, color: '#64748B' },
  tabTextActive: { color: '#FFFFFF' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#112D4E', marginBottom: 12, marginTop: 8 },
  sectionText: { color: '#64748B', fontSize: 15, lineHeight: 24, marginBottom: 24 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 12 },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  hoursDay: { fontWeight: '600', color: '#334155', fontSize: 14 },
  hoursTime: { color: '#64748B', fontSize: 14 },
  mapBtn: { backgroundColor: '#FF7A30', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 24, flexDirection: 'row', justifyContent: 'center' },
  socialIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  textInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: '#1E293B', fontWeight: '600', fontSize: 15, marginBottom: 12 },
  textArea: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: '#1E293B', fontSize: 15, marginBottom: 12, minHeight: 80, textAlignVertical: 'top' },
  label: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 6 },
  primaryBtn: { backgroundColor: '#FF7A30', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 12 },
  primaryBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  secondaryBtn: { backgroundColor: '#FFFFFF', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  secondaryBtnText: { color: '#475569', fontWeight: '700', fontSize: 15 },
  authPrompt: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  bottomBar: { padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center' },
  followBtn: { width: 48, height: 48, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  contactBtn: { flex: 1, backgroundColor: '#FF7A30', height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  similarCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 12, marginRight: 12, borderWidth: 1, borderColor: '#F1F5F9', width: 180 },
});
