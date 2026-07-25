import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useWizardStore } from '../../../stores/wizardStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Step08Map() {
  const { formData, updateFormData } = useWizardStore();

  const handleDragEnd = (e: any) => {
    updateFormData({ location: e.nativeEvent.coordinate });
  };

  return (
    <View className="flex-1">
      <Text className="text-2xl font-bold text-primary mb-2">Pin Location</Text>
      <Text className="text-textSecondary mb-6">Drag the pin to your exact business location.</Text>

      <View className="flex-1 rounded-xl overflow-hidden border border-border mb-4" style={{ minHeight: 300 }}>
        <MapView
          className="flex-1"
          initialRegion={{
            latitude: formData.location.lat,
            longitude: formData.location.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker 
            draggable
            coordinate={{ latitude: formData.location.lat, longitude: formData.location.lng }}
            onDragEnd={handleDragEnd}
          />
        </MapView>
      </View>
      
      <TouchableOpacity className="flex-row items-center justify-center bg-accent/10 py-3 rounded-xl border border-accent">
        <Icon name="my-location" size={20} color="#FF7A30" />
        <Text className="text-accent font-semibold ml-2">Use Current Location</Text>
      </TouchableOpacity>
    </View>
  );
}
