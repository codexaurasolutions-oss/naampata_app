import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useWizardStore } from '../../../stores/wizardStore';
import { api } from '../../../services/api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'react-native-image-picker';

export default function Step19Media() {
  const { formData, updateFormData } = useWizardStore();
  const [uploading, setUploading] = useState(false);

  const uploadToCloudinary = async (uri: string): Promise<string | null> => {
    try {
      const { data: signData } = await api.cloudinary.getSignature();
      const { signature, timestamp, apiKey, folder, uploadPreset, cloudName } = signData;

      const fd = new FormData();
      fd.append('file', { uri, type: 'image/jpeg', name: 'photo.jpg' } as any);
      fd.append('api_key', apiKey);
      fd.append('timestamp', timestamp.toString());
      fd.append('signature', signature);
      fd.append('folder', folder || 'naampata/listings');
      if (uploadPreset) fd.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: fd,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const result = await res.json();
      return result.secure_url || null;
    } catch (e) {
      console.error('[Cloudinary] Upload failed:', e);
      return null;
    }
  };

  const pickImage = (type: 'logo' | 'cover' | 'gallery') => {
    const options: ImagePicker.CameraOptions = {
      mediaType: 'photo',
      quality: 0.8 as any,
      maxWidth: 1200,
      maxHeight: 1200,
      includeBase64: false,
      ...(type === 'gallery' ? { selectionLimit: 10 - (formData.media.gallery?.length || 0) } : { selectionLimit: 1 }),
    };

    ImagePicker.launchImageLibrary(options, async (response) => {
      if (response.didCancel || response.errorCode) return;
      if (!response.assets?.length) return;

      setUploading(true);
      try {
        if (type === 'gallery') {
          const urls: string[] = [];
          for (const asset of response.assets) {
            if (asset.uri) {
              const url = await uploadToCloudinary(asset.uri);
              if (url) urls.push(url);
            }
          }
          const currentGallery = formData.media.gallery || [];
          updateFormData({ media: { ...formData.media, gallery: [...currentGallery, ...urls].slice(0, 10) } });
        } else {
          const asset = response.assets[0];
          if (!asset.uri) return;
          const url = await uploadToCloudinary(asset.uri);
          if (url) {
            if (type === 'logo') {
              updateFormData({ media: { ...formData.media, logoUrl: url } });
            } else {
              updateFormData({ media: { ...formData.media, coverUrl: url } });
            }
          }
        }
      } catch (e) {
        Alert.alert('Error', 'Failed to upload image.');
      } finally {
        setUploading(false);
      }
    });
  };

  const removeGalleryImage = (index: number) => {
    const updated = [...(formData.media.gallery || [])];
    updated.splice(index, 1);
    updateFormData({ media: { ...formData.media, gallery: updated } });
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>Media & Branding</Text>
      <Text style={s.subtitle}>Upload photos to make your listing stand out.</Text>

      {uploading && (
        <View style={s.uploadOverlay}>
          <ActivityIndicator size="large" color="#FF7A30" />
          <Text style={s.uploadText}>Uploading...</Text>
        </View>
      )}

      <View style={s.row}>
        <View style={s.halfCard}>
          <Text style={s.label}>Logo</Text>
          <TouchableOpacity style={s.imageBox} onPress={() => pickImage('logo')}>
            {formData.media.logoUrl ? (
              <Image source={{ uri: formData.media.logoUrl }} style={s.previewImage} />
            ) : (
              <>
                <Icon name="add-a-photo" size={32} color="#94A3B8" />
                <Text style={s.uploadLabel}>Upload Logo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        <View style={s.halfCard}>
          <Text style={s.label}>Cover Photo</Text>
          <TouchableOpacity style={s.imageBox} onPress={() => pickImage('cover')}>
            {formData.media.coverUrl ? (
              <Image source={{ uri: formData.media.coverUrl }} style={s.previewImage} />
            ) : (
              <>
                <Icon name="add-photo-alternate" size={32} color="#94A3B8" />
                <Text style={s.uploadLabel}>Upload Cover</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Text style={s.label}>Photo Gallery ({(formData.media.gallery?.length || 0)}/10)</Text>
      <View style={s.galleryGrid}>
        {(formData.media.gallery || []).map((url: string, idx: number) => (
          <View key={idx} style={s.galleryItem}>
            <Image source={{ uri: url }} style={s.galleryImage} />
            <TouchableOpacity style={s.removeBtn} onPress={() => removeGalleryImage(idx)}>
              <Icon name="close" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        ))}
        {(formData.media.gallery?.length || 0) < 10 && (
          <TouchableOpacity style={s.galleryAdd} onPress={() => pickImage('gallery')}>
            <Icon name="add" size={28} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: '800', color: '#112D4E', marginBottom: 4 },
  subtitle: { color: '#64748B', marginBottom: 20, lineHeight: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  halfCard: { width: '48%' },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
  imageBox: { height: 130, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', borderRadius: 14 },
  uploadLabel: { color: '#94A3B8', fontSize: 11, marginTop: 4 },
  uploadOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.85)', zIndex: 10, alignItems: 'center', justifyContent: 'center' },
  uploadText: { color: '#FF7A30', fontWeight: '700', marginTop: 8 },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  galleryItem: { width: 80, height: 80, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  galleryImage: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  galleryAdd: { width: 80, height: 80, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
});
