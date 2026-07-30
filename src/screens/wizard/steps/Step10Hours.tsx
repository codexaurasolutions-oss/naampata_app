import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import { useWizardStore } from '../../../stores/wizardStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 || 12;
  const ampm = i < 12 ? 'AM' : 'PM';
  return Array.from({ length: 4 }, (_, q) => `${h}:${q === 0 ? '00' : q === 1 ? '15' : q === 2 ? '30' : '45'} ${ampm}`);
}).flat();

export default function Step10Hours() {
  const { formData, updateFormData } = useWizardStore();
  const [timePicker, setTimePicker] = useState<{ day: string; field: 'openTime' | 'closeTime' } | null>(null);

  const toggleDay = (day: string) => {
    updateFormData({
      businessHours: {
        ...formData.businessHours,
        [day]: {
          ...formData.businessHours[day],
          isOpen: !(formData.businessHours[day] as any)?.isOpen
        }
      }
    });
  };

  const setTime = (time: string) => {
    if (!timePicker) return;
    updateFormData({
      businessHours: {
        ...formData.businessHours,
        [timePicker.day]: {
          ...formData.businessHours[timePicker.day],
          [timePicker.field]: time,
        }
      }
    });
    setTimePicker(null);
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>Business Hours</Text>
      <Text style={s.subtitle}>When are you open for business?</Text>

      {DAYS.map((day) => {
        const hours = formData.businessHours?.[day];
        const isOpen = hours?.isOpen;

        return (
          <View key={day} style={s.dayCard}>
            <View style={s.dayHeader}>
              <Text style={s.dayName}>{day}</Text>
              <Switch
                value={isOpen}
                onValueChange={() => toggleDay(day)}
                trackColor={{ false: '#E2E8F0', true: '#FF7A30' }}
              />
            </View>

            {isOpen && (
              <View style={s.timeRow}>
                <TouchableOpacity
                  style={s.timeBtn}
                  onPress={() => setTimePicker({ day, field: 'openTime' })}
                >
                  <Icon name="schedule" size={16} color="#94A3B8" />
                  <Text style={s.timeText}>{hours?.openTime || '09:00 AM'}</Text>
                </TouchableOpacity>
                <Text style={s.timeSep}>to</Text>
                <TouchableOpacity
                  style={s.timeBtn}
                  onPress={() => setTimePicker({ day, field: 'closeTime' })}
                >
                  <Icon name="schedule" size={16} color="#94A3B8" />
                  <Text style={s.timeText}>{hours?.closeTime || '05:00 PM'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}

      <Modal visible={!!timePicker} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>
                Select {timePicker?.field === 'openTime' ? 'Opening' : 'Closing'} Time
              </Text>
              <TouchableOpacity onPress={() => setTimePicker(null)}>
                <Icon name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={s.timeList} showsVerticalScrollIndicator={false}>
              {HOURS.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={s.timeOption}
                  onPress={() => setTime(time)}
                >
                  <Text style={s.timeOptionText}>{time}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: '800', color: '#112D4E', marginBottom: 4 },
  subtitle: { color: '#64748B', marginBottom: 20, lineHeight: 20 },
  dayCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dayName: { fontWeight: '700', color: '#1E293B', fontSize: 15 },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  timeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingVertical: 10, backgroundColor: '#F8FAFC', gap: 6 },
  timeText: { color: '#1E293B', fontWeight: '600', fontSize: 14 },
  timeSep: { color: '#94A3B8', marginHorizontal: 12, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%', paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#112D4E' },
  timeList: { paddingHorizontal: 20 },
  timeOption: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  timeOptionText: { fontSize: 16, color: '#334155', fontWeight: '600', textAlign: 'center' },
});
