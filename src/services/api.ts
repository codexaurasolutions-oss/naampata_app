import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'https://local-business-listing-directory-production.up.railway.app/api/v1';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      try {
        const { useAuthStore } = require('../stores/authStore');
        useAuthStore.getState().logout();
      } catch (e) {}
    }
    return Promise.reject(error);
  }
);

export const api = {
  get: <T>(endpoint: string) => axiosInstance.get<T>(endpoint).then(res => res.data),
  post: <T>(endpoint: string, body?: any) => axiosInstance.post<T>(endpoint, body).then(res => res.data),
  patch: <T>(endpoint: string, body?: any) => axiosInstance.patch<T>(endpoint, body).then(res => res.data),
  delete: <T>(endpoint: string) => axiosInstance.delete<T>(endpoint).then(res => res.data),

  auth: {
    login: (credentials: any) => api.post<any>('/auth/login', credentials),
    register: (userData: any) => api.post<any>('/auth/register', userData),
    verifyEmail: (email: string, otp: string) => api.post<any>('/auth/verify-email', { email, otp }),
    resendOtp: (email: string) => api.post<any>('/auth/resend-otp', { email }),
    forgotPassword: (email: string) => api.post<any>('/auth/forgot-password', { email }),
    resetPassword: (email: string, code: string, newPassword: string) => api.post<any>('/auth/reset-password', { email, code, newPassword }),
    googleLogin: (data: any) => api.post<any>('/auth/google', data),
    me: () => api.get<any>('/auth/me'),
    logout: () => api.post<any>('/auth/logout'),
  },

  users: {
    getProfile: () => api.get<any>('/users/profile'),
    updateProfile: (data: any) => api.patch<any>('/users/profile', data),
    updateAvatar: (avatarUrl: string) => api.patch<any>('/users/profile/avatar', { avatarUrl }),
    changePassword: (data: any) => api.patch<any>('/users/password', data),
    getFavorites: () => api.get<any>('/users/favorites'),
    addFavorite: (businessId: string) => api.post<any>(`/users/favorites/${businessId}`),
    removeFavorite: (businessId: string) => api.delete<any>(`/users/favorites/${businessId}`),
    getSavedOffers: () => api.get<any>('/users/saved-offers-events'),
    saveOffer: (offerEventId: string) => api.post<any>(`/users/saved-offers-events/${offerEventId}`),
    removeSavedOffer: (offerEventId: string) => api.delete<any>(`/users/saved-offers-events/${offerEventId}`),
    getNotifications: (params: any = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.get<any>(`/users/notifications?${query}`);
    },
    markNotificationRead: (id: string) => api.patch<any>(`/users/notifications/${id}/read`),
    deleteAccount: () => api.delete<any>('/users/profile'),
    cancelDeletion: () => api.post<any>('/users/profile/cancel-deletion'),
    updateNotificationSettings: (data: any) => api.patch<any>('/users/profile/notification-settings', data),
    updateDeviceToken: (token: string) => api.patch<any>('/users/profile/device-token', { deviceToken: token }),
  },

  categories: {
    getAll: () => api.get<any>('/categories'),
    getPopular: (limit = 8) => api.get<any>(`/categories/popular?limit=${limit}`),
    getBySlug: (slug: string) => api.get<any>(`/categories/slug/${slug}`),
    getById: (id: string) => api.get<any>(`/categories/${id}`),
    getTree: () => api.get<any>('/categories/tree'),
    suggest: (title: string, description: string) => api.get<any>(`/categories/suggest?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`),
  },

  cities: {
    getAll: (country?: string) => api.get<any>(country ? `/cities?country=${encodeURIComponent(country)}` : '/cities'),
    getPopular: () => api.get<any>('/cities/popular'),
    getCountries: () => api.get<any>('/cities/countries'),
    getBySlug: (slug: string) => api.get<any>(`/cities/slug/${slug}`),
  },

  listings: {
    create: (data: any) => api.post<any>('/businesses', data),
    search: (params: any) => {
      const query = new URLSearchParams(params).toString();
      return api.get<any>(`/businesses/search?${query}`);
    },
    getSuggestions: (query: string) => api.get<any>(`/businesses/search/suggestions?q=${encodeURIComponent(query)}`),
    getFeatured: (page = 1, limit = 12) => api.get<any>(`/businesses/search?featuredOnly=true&page=${page}&limit=${limit}`),
    getBySlug: (slug: string) => api.get<any>(`/businesses/slug/${slug}`),
    getById: (id: string) => api.get<any>(`/businesses/${id}`),
    update: (id: string, data: any) => api.patch<any>(`/businesses/${id}`, data),
    delete: (id: string) => api.delete<any>(`/businesses/${id}`),
    getMyListings: (params: any = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.get<any>(`/businesses/owner/my-listings?${query}`);
    },
    getSimilar: (idOrSlug: string) => api.get<any>(`/businesses/${idOrSlug}/similar`),
    updateImage: (id: string, data: any) => api.patch<any>(`/businesses/${id}/image`, data),
    getAlbums: (id: string) => api.get<any>(`/businesses/${id}/albums`),
    createAlbum: (id: string, data: any) => api.post<any>(`/businesses/${id}/albums`, data),
  },

  reviews: {
    findAll: (params: any = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.get<any>(`/reviews?${query}`);
    },
    getByBusiness: (idOrSlug: string) => api.get<any>(`/reviews/business/${idOrSlug}`),
    getStats: (idOrSlug: string) => api.get<any>(`/reviews/business/${idOrSlug}/stats`),
    getByVendor: () => api.get<any>('/reviews/vendor/all'),
    create: (data: any) => api.post<any>('/reviews', data),
    respond: (reviewId: string, response: string) => api.post<any>(`/reviews/${reviewId}/response`, { response }),
    deleteResponse: (reviewId: string) => api.delete<any>(`/reviews/${reviewId}/response`),
    markHelpful: (reviewId: string) => api.post<any>(`/reviews/${reviewId}/helpful`),
    removeHelpful: (reviewId: string) => api.delete<any>(`/reviews/${reviewId}/helpful`),
    getReplies: (reviewId: string) => api.get<any>(`/reviews/${reviewId}/replies`),
    postReply: (reviewId: string, content: string) => api.post<any>(`/reviews/${reviewId}/replies`, { content }),
  },

  leads: {
    getForVendor: (params: any = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.get<any>(`/leads/vendor?${query}`);
    },
    getMyEnquiries: () => api.get<any>('/leads/my-enquiries'),
    getStats: () => api.get<any>('/leads/vendor/stats'),
    getById: (id: string) => api.get<any>(`/leads/${id}`),
    updateStatus: (id: string, status: string) => api.patch<any>(`/leads/${id}/status`, { status }),
    reply: (id: string, message: string) => api.patch<any>(`/leads/${id}/reply`, { message }),
    markRead: (id: string) => api.patch<any>(`/leads/${id}/read`),
    create: (data: any) => api.post<any>('/leads', data),
    getNotes: (id: string) => api.get<any>(`/leads/${id}/notes`),
    addNote: (id: string, content: string) => api.post<any>(`/leads/${id}/notes`, { content }),
  },

  chat: {
    getOrCreateConversation: (data: any) => api.post<any>('/chat/conversations', data),
    getUserConversations: () => api.get<any>('/chat/conversations/user'),
    getVendorConversations: () => api.get<any>('/chat/conversations/vendor'),
    getMessages: (conversationId: string) => api.get<any>(`/chat/conversations/${conversationId}/messages`),
    sendMessage: (conversationId: string, content: string) => api.post<any>(`/chat/conversations/${conversationId}/messages`, { content }),
    markAsRead: (conversationId: string) => api.post<any>(`/chat/conversations/${conversationId}/mark-as-read`),
    getUnreadCount: () => api.get<any>('/chat/unread-count'),
    getNotes: (conversationId: string) => api.get<any>(`/chat/conversations/${conversationId}/notes`),
    addNote: (conversationId: string, content: string) => api.post<any>(`/chat/conversations/${conversationId}/notes`, { content }),
  },

  subscriptions: {
    getPlans: () => api.get<any>('/subscriptions/plans'),
    getPricingPlans: (type?: string) => api.get<any>(`/subscriptions/pricing/plans${type ? `?type=${type}` : ''}`),
    getActive: () => api.get<any>('/subscriptions/active'),
    getMyInvoices: () => api.get<any>('/subscriptions/my-invoices'),
    createCheckout: (planId: string) => api.post<any>('/subscriptions/checkout', { planId }),
    createPricingCheckout: (planId: string) => api.post<any>('/subscriptions/pricing/checkout', { planId }),
    changePlan: (planId: string) => api.post<any>('/subscriptions/change', { planId }),
    verifyPayment: (sessionId: string) => api.post<any>('/subscriptions/verify', { sessionId }),
  },

  offers: {
    searchPublic: (params: any = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.get<any>(`/offers/public/search?${query}`);
    },
    getVendorOffers: () => api.get<any>('/offers/vendor'),
    create: (data: any) => api.post<any>('/offers', data),
    update: (id: string, data: any) => api.patch<any>(`/offers/${id}`, data),
    publish: (id: string) => api.post<any>(`/offers/${id}/publish`),
    delete: (id: string) => api.delete<any>(`/offers/${id}`),
    getByBusiness: (businessId: string) => api.get<any>(`/offers/business/${businessId}/offers`),
    getById: (id: string) => api.get<any>(`/offers/public/${id}`),
  },

  deals: {
    searchPublic: (params: any = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.get<any>(`/deals/public/search?${query}`);
    },
    getVendorDeals: () => api.get<any>('/deals/vendor'),
    create: (data: any) => api.post<any>('/deals', data),
    update: (id: string, data: any) => api.patch<any>(`/deals/${id}`, data),
    publish: (id: string) => api.post<any>(`/deals/${id}/publish`),
    delete: (id: string) => api.delete<any>(`/deals/${id}`),
    getByBusiness: (businessId: string) => api.get<any>(`/deals/business/${businessId}/deals`),
    getById: (id: string) => api.get<any>(`/deals/public/${id}`),
  },

  events: {
    searchPublic: (params: any = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.get<any>(`/events/public/search?${query}`);
    },
    getVendorEvents: () => api.get<any>('/events/vendor'),
    create: (data: any) => api.post<any>('/events', data),
    update: (id: string, data: any) => api.patch<any>(`/events/${id}`, data),
    publish: (id: string) => api.post<any>(`/events/${id}/publish`),
    delete: (id: string) => api.delete<any>(`/events/${id}`),
    getByBusiness: (businessId: string) => api.get<any>(`/events/business/${businessId}/events`),
    getById: (id: string) => api.get<any>(`/events/public/${id}`),
  },

  qa: {
    askQuestion: (data: any) => api.post<any>('/qa/questions', data),
    postAnswer: (data: any) => api.post<any>('/qa/answers', data),
    getByBusiness: (businessId: string) => api.get<any>(`/qa/business/${businessId}`),
  },

  comments: {
    getByBusiness: (businessId: string) => api.get<any>(`/business/${businessId}/comments`),
    getVendorComments: () => api.get<any>('/vendor/comments'),
    create: (data: any) => api.post<any>('/comments', data),
    replyToComment: (commentId: string, content: string) => api.post<any>(`/vendor/comments/${commentId}/reply`, { content }),
    updateReply: (replyId: string, content: string) => api.patch<any>(`/vendor/comments/reply/${replyId}`, { content }),
    deleteReply: (replyId: string) => api.delete<any>(`/vendor/comments/reply/${replyId}`),
  },

  broadcasts: {
    create: (data: any) => api.post<any>('/broadcasts', data),
    getMyLeads: () => api.get<any>('/broadcasts/my-leads'),
    getVendorInbox: () => api.get<any>('/broadcasts/vendor/inbox'),
    getVendorStats: () => api.get<any>('/broadcasts/vendor/stats'),
    respond: (id: string, data: any) => api.post<any>(`/broadcasts/${id}/respond`, data),
    getResponses: (id: string) => api.get<any>(`/broadcasts/${id}/responses`),
  },

  follows: {
    follow: (businessId: string) => api.post<any>(`/follows/${businessId}`),
    unfollow: (businessId: string) => api.delete<any>(`/follows/${businessId}`),
    getMyFollows: () => api.get<any>('/follows/my'),
    getFollowerCount: (businessId: string) => api.get<any>(`/follows/${businessId}/count`),
    checkFollowing: (businessId: string) => api.get<any>(`/follows/${businessId}/check`),
  },

  expertQuote: {
    create: (data: any) => api.post<any>('/expert-quote', data),
    getAll: () => api.get<any>('/expert-quote'),
    getById: (id: string) => api.get<any>(`/expert-quote/${id}`),
  },

  notifications: {
    getAll: () => api.get<any>('/notifications'),
    markRead: (id: string) => api.patch<any>(`/notifications/${id}/read`),
    markAllRead: () => api.patch<any>('/notifications/read-all'),
    delete: (id: string) => api.delete<any>(`/notifications/${id}`),
  },

  affiliate: {
    join: () => api.post<any>('/affiliate/join'),
    getStats: () => api.get<any>('/affiliate/stats'),
    getReferrals: () => api.get<any>('/affiliate/referrals'),
    getPayouts: () => api.get<any>('/affiliate/payouts'),
    requestPayout: (data: any) => api.post<any>('/affiliate/payouts', data),
    applyReferral: (code: string) => api.post<any>('/affiliate/apply-referral', { code }),
    trackClick: (code: string) => api.post<any>('/affiliate/track-click', { code }),
  },

  demand: {
    logSearch: (data: any) => api.post<any>('/demand/log', data),
    getNearby: (lat: number, lng: number) => api.get<any>(`/demand/nearby?lat=${lat}&lng=${lng}`),
  },

  vendors: {
    getPublicProfile: (id: string) => api.get<any>(`/vendors/${id}/public`),
    getDashboardStats: () => api.get<any>('/vendors/dashboard-stats'),
    becomeVendor: (data: any) => api.post<any>('/vendors/become-vendor', data),
    updateProfile: (data: any) => api.patch<any>('/vendors/profile', data),
  },

  promotions: {
    getVisibilityRate: () => api.get<any>('/promotions/visibility-rate'),
    calculatePrice: (data: any) => api.post<any>('/promotions/calculate', data),
    getPricingRules: () => api.get<any>('/promotions/pricing-rules'),
  },

  location: {
    autocomplete: (query: string) => api.get<any>(`/location/places/autocomplete?query=${encodeURIComponent(query)}`),
    resolve: (placeId: string) => api.post<any>('/location/places/resolve', { placeId }),
  },

  cloudinary: {
    getSignature: () => api.post<any>('/cloudinary/sign'),
  },

  businessSetup: {
    getQuestions: () => api.get<any>('/business-setup/questions'),
    getStatus: () => api.get<any>('/business-setup/status'),
    saveAnswers: (data: any) => api.post<any>('/business-setup/answers', data),
  },

  addressConfig: {
    getCountries: () => api.get<any>('/address-config/countries'),
    getConfig: (countryCode: string) => api.get<any>(`/address-config/${countryCode}`),
    validatePostalCode: (countryCode: string, postalCode: string) => api.get<any>(`/address-config/${countryCode}/validate-postal-code?postalCode=${encodeURIComponent(postalCode)}`),
  },

  health: {
    check: () => api.get<any>('/health'),
  },
};
