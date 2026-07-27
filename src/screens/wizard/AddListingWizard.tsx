import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useWizardStore } from '../../stores/wizardStore';
import { api } from '../../services/api';
import Step01NameTagline from './steps/Step01NameTagline';
import Step02BusinessType from './steps/Step02BusinessType';
import Step03BusinessNature from './steps/Step03BusinessNature';
import Step04OperationalStructure from './steps/Step04OperationalStructure';
import Step05Category from './steps/Step05Category';
import Step06TargetMarket from './steps/Step06TargetMarket';
import Step07Address from './steps/Step07Address';
import Step08Map from './steps/Step08Map';
import Step09Contact from './steps/Step09Contact';
import Step10Hours from './steps/Step10Hours';
import Step11Description from './steps/Step11Description';
import Step12Experience from './steps/Step12Experience';
import Step13OnlinePresence from './steps/Step13OnlinePresence';
import Step14Amenities from './steps/Step14Amenities';
import Step15IndustrySubType from './steps/Step15IndustrySubType';
import Step16Keywords from './steps/Step16Keywords';
import Step17FAQs from './steps/Step17FAQs';
import Step18Expansion from './steps/Step18Expansion';
import Step19Media from './steps/Step19Media';
import Step20ReviewSubmit from './steps/Step20ReviewSubmit';

const TOTAL_STEPS = 20;

export default function AddListingWizard({ navigation }: any) {
  const { currentStep, nextStep, prevStep, formData, resetWizard } = useWizardStore();
  const [submitting, setSubmitting] = useState(false);

  const buildBusinessHoursPayload = (hours: Record<string, { isOpen: boolean; openTime: string; closeTime: string }>) => {
    const result: any[] = [];
    for (const [day, data] of Object.entries(hours)) {
      result.push({
        day,
        isOpen: data.isOpen,
        openTime: data.isOpen ? data.openTime : undefined,
        closeTime: data.isOpen ? data.closeTime : undefined,
      });
    }
    return result;
  };

  const COUNTRY_PHONE_CODES: Record<string, string> = {
    'pakistan': '+92', 'pk': '+92',
    'india': '+91', 'in': '+91',
    'united states': '+1', 'us': '+1', 'usa': '+1',
    'united kingdom': '+44', 'uk': '+44', 'gb': '+44',
    'uae': '+971', 'united arab emirates': '+971', 'ae': '+971',
    'saudi arabia': '+966', 'sa': '+966',
    'canada': '+1', 'ca': '+1',
    'australia': '+61', 'au': '+61',
    'china': '+86', 'cn': '+86',
    'japan': '+81', 'jp': '+81',
    'germany': '+49', 'de': '+49',
    'france': '+33', 'fr': '+33',
    'turkey': '+90', 'tr': '+90',
    'bangladesh': '+880', 'bd': '+880',
    'malaysia': '+60', 'my': '+60',
    'singapore': '+65', 'sg': '+65',
    'qatar': '+974', 'qa': '+974',
    'kuwait': '+965', 'kw': '+965',
    'oman': '+968', 'om': '+968',
    'bahrain': '+973', 'bh': '+973',
  };

  const toE164 = (phoneCode: string, phone: string) => {
    const cleaned = phone.replace(/[^\d]/g, '');
    const code = phoneCode.replace(/[^\d]/g, '');
    return `+${code}${cleaned}`;
  };

  const getPhoneCode = () => {
    const country = (formData.address.country || '').toLowerCase().trim();
    return COUNTRY_PHONE_CODES[country] || '+92';
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const phoneCode = getPhoneCode();
      const phone = formData.contact.phone ? toE164(phoneCode, formData.contact.phone) : '';
      const whatsapp = formData.contact.whatsapp ? toE164(phoneCode, formData.contact.whatsapp) : undefined;

      const submissionData: any = {
        title: formData.name.trim(),
        businessTagline: formData.tagline.trim() || undefined,
        categoryId: formData.categoryId || undefined,
        description: formData.description.full?.trim() || formData.description.short?.trim() || undefined,
        shortDescription: formData.description.short?.trim() || undefined,
        phone: phone || undefined,
        whatsapp,
        website: formData.contact.website?.trim() || undefined,
        address: formData.address.street?.trim() || undefined,
        city: formData.address.city?.trim() || undefined,
        state: formData.address.state?.trim() || undefined,
        country: formData.address.country?.trim() || undefined,
        pincode: formData.address.pincode?.trim() || undefined,
        latitude: formData.location?.lat || undefined,
        longitude: formData.location?.lng || undefined,
        logoUrl: formData.media.logoUrl?.trim() || undefined,
        coverImageUrl: formData.media.coverUrl?.trim() || undefined,
        images: formData.media.gallery?.length ? formData.media.gallery : undefined,
        yearEstablished: formData.experience.yearEstablished
          ? parseInt(formData.experience.yearEstablished, 10)
          : undefined,
        employeeCount: formData.experience.employeeCount || undefined,
        businessHours: buildBusinessHoursPayload(formData.businessHours),
        searchKeywords: formData.keywords?.length ? formData.keywords.slice(0, 10) : undefined,
        metaKeywords: formData.keywords?.length ? formData.keywords.slice(0, 10).join(', ') : undefined,
        faqs: formData.faqs?.length ? formData.faqs.slice(0, 10) : undefined,
        businessType: formData.businessTypes?.length ? formData.businessTypes : undefined,
        coreBusinessNature: formData.natureOfBusiness ? [formData.natureOfBusiness] : undefined,
        operationalStructure: formData.operationalStructure?.length ? formData.operationalStructure : undefined,
        targetMarket: formData.targetMarket?.length ? formData.targetMarket : undefined,
        industrySubType: formData.industrySubType?.length ? formData.industrySubType : undefined,
        socialLinks: formData.socialLinks?.length ? formData.socialLinks : undefined,
        locationAccess: formData.amenities?.filter(a => ['Wheelchair Accessible', 'Elevator Access', 'Parking Available'].includes(a)) || undefined,
        facilities: formData.amenities?.filter(a => ['WiFi', 'Air Conditioning', 'Restroom'].includes(a)) || undefined,
        paymentMethods: formData.amenities?.filter(a => ['Cash', 'Credit Card', 'Debit Card', 'Mobile Payment'].includes(a)) || undefined,
        franchiseOpportunities: formData.expansion.franchiseAvailable || undefined,
        lookingForDealers: formData.expansion.dealerInquiries || undefined,
        isImporterExporter: formData.expansion.importerExporter || undefined,
        landmark: (formData as any).landmark?.trim() || undefined,
        businessEmail: (formData as any).businessEmail?.trim() || undefined,
        legalConsentAccepted: true,
        legalConsentAcceptedAt: new Date().toISOString(),
        legalConsentTerms: true,
        legalConsentPrivacy: true,
        legalConsentModeration: true,
        legalConsentAccuracy: true,
        legalConsentPublicLocation: true,
      };

      await api.listings.create(submissionData);

      Alert.alert(
        'Success!',
        'Your business listing has been submitted for review.',
        [
          {
            text: 'OK',
            onPress: () => {
              resetWizard();
              navigation.goBack();
            },
          },
        ]
      );
    } catch (err: any) {
      console.error('[AddListing] Submit error:', err);
      Alert.alert('Error', err.message || 'Failed to submit listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step01NameTagline />;
      case 2: return <Step02BusinessType />;
      case 3: return <Step03BusinessNature />;
      case 4: return <Step04OperationalStructure />;
      case 5: return <Step05Category />;
      case 6: return <Step06TargetMarket />;
      case 7: return <Step07Address />;
      case 8: return <Step08Map />;
      case 9: return <Step09Contact />;
      case 10: return <Step10Hours />;
      case 11: return <Step11Description />;
      case 12: return <Step12Experience />;
      case 13: return <Step13OnlinePresence />;
      case 14: return <Step14Amenities />;
      case 15: return <Step15IndustrySubType />;
      case 16: return <Step16Keywords />;
      case 17: return <Step17FAQs />;
      case 18: return <Step18Expansion />;
      case 19: return <Step19Media />;
      case 20: return <Step20ReviewSubmit />;
      default:
        return <View className="flex-1 items-center justify-center"><Text>Step {currentStep} under construction</Text></View>;
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="px-4 py-4 bg-white border-b border-border">
        <View className="flex-row justify-between mb-2">
          <Text className="text-textSecondary font-semibold text-xs">Step {currentStep} of {TOTAL_STEPS}</Text>
          <Text className="text-primary font-bold text-xs">{Math.round((currentStep / TOTAL_STEPS) * 100)}%</Text>
        </View>
        <View className="h-2 bg-border rounded-full overflow-hidden">
          <View 
            className="h-full bg-accent" 
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }} 
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {renderStep()}
      </ScrollView>

      <View className="p-4 bg-white border-t border-border flex-row justify-between items-center">
        {currentStep > 1 ? (
          <TouchableOpacity 
            className="px-6 py-3 border border-border rounded-xl"
            onPress={prevStep}
            disabled={submitting}
          >
            <Text className="text-textPrimary font-semibold">Back</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            className="px-6 py-3 border border-border rounded-xl"
            onPress={() => navigation.goBack()}
            disabled={submitting}
          >
            <Text className="text-textPrimary font-semibold">Cancel</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          className={`px-8 py-3 rounded-xl flex-row items-center gap-2 ${submitting ? 'bg-primary/60' : 'bg-primary'}`}
          onPress={() => {
            if (currentStep < TOTAL_STEPS) {
              nextStep();
            } else {
              handleSubmit();
            }
          }}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : null}
          <Text className="text-white font-semibold">
            {submitting ? 'Submitting...' : currentStep === TOTAL_STEPS ? 'Submit Listing' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
