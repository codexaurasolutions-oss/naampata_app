import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useWizardStore } from '../../../stores/wizardStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Step17FAQs() {
  const { formData, updateFormData } = useWizardStore();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const addFAQ = () => {
    if (question.trim() && answer.trim()) {
      const currentFaqs = formData.faqs || [];
      updateFormData({ faqs: [...currentFaqs, { question, answer }] });
      setQuestion('');
      setAnswer('');
    }
  };

  const removeFAQ = (index: number) => {
    const currentFaqs = [...(formData.faqs || [])];
    currentFaqs.splice(index, 1);
    updateFormData({ faqs: currentFaqs });
  };

  return (
    <ScrollView className="flex-1">
      <Text className="text-2xl font-bold text-primary mb-2">FAQs</Text>
      <Text className="text-textSecondary mb-6">Anticipate customer questions and provide answers.</Text>

      <View className="bg-white p-4 rounded-xl border border-border mb-6 shadow-sm">
        <Text className="text-textPrimary font-semibold mb-2">Question</Text>
        <TextInput 
          className="bg-background border border-border rounded-xl px-4 py-3 mb-4 text-textPrimary"
          placeholder="e.g. Do you offer free delivery?"
          value={question}
          onChangeText={setQuestion}
        />
        <Text className="text-textPrimary font-semibold mb-2">Answer</Text>
        <TextInput 
          className="bg-background border border-border rounded-xl px-4 py-3 mb-4 text-textPrimary h-24"
          placeholder="e.g. Yes, on orders above $50."
          multiline
          textAlignVertical="top"
          value={answer}
          onChangeText={setAnswer}
        />
        <TouchableOpacity 
          onPress={addFAQ} 
          className="bg-accent py-3 rounded-xl items-center flex-row justify-center"
        >
          <Icon name="add" size={20} color="#FFF" />
          <Text className="text-white font-semibold ml-2">Add FAQ</Text>
        </TouchableOpacity>
      </View>

      {formData.faqs?.map((faq, index) => (
        <View key={index} className="bg-white p-4 rounded-xl mb-3 border border-border shadow-sm flex-row">
          <View className="flex-1 pr-4">
            <Text className="font-bold text-primary mb-1">Q: {faq.question}</Text>
            <Text className="text-textSecondary">A: {faq.answer}</Text>
          </View>
          <TouchableOpacity onPress={() => removeFAQ(index)} className="justify-center">
            <Icon name="delete" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}
