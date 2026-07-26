import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function CategoriesScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCount, setShowCount] = useState(20);
  const { data, isLoading } = useQuery({ queryKey: ['categories'], queryFn: () => api.categories.getAll() });

  const allCategories = data?.data || data?.categories || (Array.isArray(data) ? data : []);
  const filtered = searchQuery.trim()
    ? allCategories.filter((cat: any) => (cat.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : allCategories;
  const visibleCategories = filtered.slice(0, showCount);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
          <Icon name="arrow-back" size={24} color="#112D4E" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>All Categories</Text>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
          <Text style={s.heroTitle}>Explore Services</Text>
          <Text style={s.heroSubtitle}>Find the best local experts in every category.</Text>

          <View style={s.searchBox}>
            <Icon name="search" size={20} color="#94A3B8" />
            <TextInput
              style={s.searchInput}
              placeholder="Search categories..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="cancel" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#FF7A30" style={{ marginVertical: 40 }} />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, justifyContent: 'space-between' }}>
            {visibleCategories.map((cat: any) => (
              <TouchableOpacity
                key={cat.id}
                style={s.categoryCard}
                onPress={() => navigation.navigate('Search', { initialQuery: '', category: cat.slug || cat.id })}
              >
                <View style={s.categoryIconWrap}>
                  <Icon name={cat.icon || 'category'} size={28} color="#3B82F6" />
          </View>
          {filtered.length > showCount && (
            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
              <TouchableOpacity
                style={{ backgroundColor: '#F8FAFC', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' }}
                onPress={() => setShowCount(prev => prev + 20)}
              >
                <Text style={{ fontWeight: '700', color: '#FF7A30', fontSize: 14 }}>Load More ({filtered.length - showCount} remaining)</Text>
              </TouchableOpacity>
            </View>
          )}
                <Text style={s.categoryName} numberOfLines={2}>{cat.name}</Text>
                {cat.description ? (
                  <Text style={s.categoryDesc} numberOfLines={2}>{cat.description}</Text>
                ) : null}
                <Text style={s.categoryCount}>{cat.businessCount || cat.businessesCount || 0} listing{(cat.businessCount || cat.businessesCount || 0) !== 1 ? 's' : ''}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFCFB' },
  header: { backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'ios' ? 56 : 48, paddingBottom: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#112D4E' },
  scroll: { flex: 1 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#112D4E', marginBottom: 8 },
  heroSubtitle: { color: '#64748B', fontWeight: '500', fontSize: 15, marginBottom: 20 },
  searchBox: { backgroundColor: '#F8FAFC', flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 24 },
  searchInput: { flex: 1, marginLeft: 10, height: 22, color: '#1E293B', fontWeight: '600', fontSize: 15 },
  categoryCard: { width: '48%', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 22, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 16, alignItems: 'center', minHeight: 160, justifyContent: 'center' },
  categoryIconWrap: { width: 56, height: 56, backgroundColor: '#EFF6FF', borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  categoryName: { fontWeight: '800', color: '#1E293B', fontSize: 15, textAlign: 'center', marginBottom: 4 },
  categoryDesc: { color: '#94A3B8', fontSize: 11, textAlign: 'center', marginBottom: 6, lineHeight: 16 },
  categoryCount: { color: '#FF7A30', fontSize: 12, fontWeight: '700' },
});
