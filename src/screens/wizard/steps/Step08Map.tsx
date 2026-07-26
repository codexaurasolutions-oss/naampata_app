import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Linking, PermissionsAndroid, Platform } from 'react-native';
import { useWizardStore } from '../../../stores/wizardStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

let MapView: any = null;
let Marker: any = null;

const loadMapModule = async () => {
  try {
    const maps = await import('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
    return true;
  } catch (e) {
    console.warn('react-native-maps not available, using OSM fallback');
    return false;
  }
};

export default function Step08Map() {
  const { formData, updateFormData } = useWizardStore();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapAvailable, setMapAvailable] = useState<boolean | null>(null);

  React.useEffect(() => {
    loadMapModule().then((ok) => {
      setMapAvailable(ok);
      setMapLoaded(true);
    });
  }, []);

  const handleDragEnd = (e: any) => {
    updateFormData({ location: e.nativeEvent.coordinate });
  };

  const openInGoogleMaps = () => {
    const { lat, lng } = formData.location;
    const url = `https://www.google.com/maps/search/?api=1&center=${lat},${lng}&zoom=15`;
    Linking.openURL(url).catch(() => {
      const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;
      Linking.openURL(osmUrl);
    });
  };

  const requestGpsPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const handleUseCurrentLocation = async () => {
    const hasPermission = await requestGpsPermission();
    if (!hasPermission) return;
    const geo = (globalThis as any).navigator?.geolocation;
    if (!geo) return;
    geo.getCurrentPosition(
      (position: any) => {
        updateFormData({ location: { lat: position.coords.latitude, lng: position.coords.longitude } });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  if (!mapLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Pin Location</Text>
        <Text style={styles.subtitle}>Drag the pin to your exact business location.</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      </View>
    );
  }

  // OSM fallback if react-native-maps not available
  if (mapAvailable === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Pin Location</Text>
        <Text style={styles.subtitle}>Drag the pin to your exact business location.</Text>

        <View style={styles.osmFallback}>
          <Image
            source={{
              uri: `https://staticmap.openstreetmap.de/staticmap.php?center=${formData.location.lat},${formData.location.lng}&zoom=15&size=600x400&markers=${formData.location.lat},${formData.location.lng},red-pushpin`,
            }}
            style={styles.staticMap}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.mapButton} onPress={openInGoogleMaps}>
            <Icon name="map" size={20} color="#FF7A30" />
            <Text style={styles.mapButtonText}>Open in Maps App</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.gpsButton} onPress={handleUseCurrentLocation}>
          <Icon name="my-location" size={20} color="#FF7A30" />
          <Text style={styles.gpsButtonText}>Use Current Location</Text>
        </TouchableOpacity>

        <Text style={styles.attribution}>© OpenStreetMap contributors</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pin Location</Text>
      <Text style={styles.subtitle}>Drag the pin to your exact business location.</Text>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
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

      <TouchableOpacity style={styles.gpsButton} onPress={handleUseCurrentLocation}>
        <Icon name="my-location" size={20} color="#FF7A30" />
        <Text style={styles.gpsButtonText}>Use Current Location</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A1D29', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  mapContainer: { flex: 1, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB', minHeight: 300 },
  map: { flex: 1 },
  gpsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,122,48,0.1)', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FF7A30', marginTop: 12 },
  gpsButtonText: { color: '#FF7A30', fontWeight: '600', marginLeft: 8 },
  loadingContainer: { flex: 1, minHeight: 300, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12 },
  loadingText: { color: '#6B7280' },
  osmFallback: { flex: 1, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB', minHeight: 300 },
  staticMap: { width: '100%', height: '100%', minHeight: 280 },
  mapButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,122,48,0.1)', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  mapButtonText: { color: '#FF7A30', fontWeight: '600', marginLeft: 8 },
  attribution: { fontSize: 10, color: '#9CA3AF', textAlign: 'center', marginTop: 4 },
});
