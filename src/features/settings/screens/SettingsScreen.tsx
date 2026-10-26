import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2
} from 'lucide-react-native';
import { AnimatePresence, MotiView } from 'moti';
import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import MenuSection from '../components/MenuSection';
import NotificationScreen from '../components/NotificationScreen';
import SecuritySection from '../components/SecuritySection';

interface SettingsScreenProps {
  initialTab?: 'menu' | 'personal' | 'security' | 'notifications';
}

export default function SettingsScreen({ initialTab = 'menu' }: SettingsScreenProps) {
  const router = useRouter();

  // Navigation states: 'menu', 'personal', 'security', 'notifications'
  const [activeTab, setActiveTab] = useState<'menu' | 'personal' | 'security' | 'notifications'>(initialTab);

  // Success states
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const triggerSuccess = (message: string) => {
    setSaveSuccess(message);
    setTimeout(() => {
      setSaveSuccess(null);
    }, 3000);
  };


  const goBack = () => {
    if (activeTab === 'menu') {
      router.back();
    } else {
      setActiveTab('menu');
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'personal': return 'Personal Information';
      case 'security': return 'Security Settings';
      case 'notifications': return 'Notification Prefs';
      default: return 'Settings';
    }
  };

  return (
    <SafeAreaView
      // No bottom edge: this route renders inside (tabs), so the tab bar
      // already reserves the safe area below.
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
    >
      {/* Header bar */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-border/20">
        <TouchableOpacity
          onPress={goBack}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full bg-muted justify-center items-center"
        >
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>

        <Text className="text-foreground text-lg font-bold text-center flex-1">
          {getHeaderTitle()}
        </Text>

        {/* Spacer for alignment */}
        <View className="w-10" />
      </View>

      {/* Success banner */}
      {saveSuccess && (
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: -20 }}
          className="mx-4 mt-4 bg-emerald-500/20 border border-emerald-500/30 p-3 rounded-xl flex-row items-center gap-2"
        >
          <CheckCircle2 size={18} color="#10b981" />
          <Text className="text-emerald-400 font-semibold text-sm">{saveSuccess}</Text>
        </MotiView>
      )}

      <ScrollView
        className="flex-1 px-4 mt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <AnimatePresence exitBeforeEnter>

          {/* MAIN MENU */}
          {activeTab === 'menu' && (
            <MenuSection setActiveTab={setActiveTab} />
          )}

          {/* PERSONAL INFORMATION SCREEN */}
          {activeTab === 'personal'
            // Router Chnage 
          }

          {/* SECURITY SCREEN */}
          {activeTab === 'security' && (
            <SecuritySection triggerSuccess={triggerSuccess} />
          )}

          {/* NOTIFICATIONS SCREEN */}
          {activeTab === 'notifications' && (
            <NotificationScreen triggerSuccess={triggerSuccess} />
          )}



        </AnimatePresence>
      </ScrollView>
    </SafeAreaView>
  );
}
