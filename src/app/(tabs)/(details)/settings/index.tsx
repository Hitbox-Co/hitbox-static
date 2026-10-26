import SettingsScreen from '@/features/settings/screens/SettingsScreen';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function Settings() {
    const { tab } = useLocalSearchParams<{ tab?: 'personal' | 'security' | 'notifications' }>();

    return <SettingsScreen initialTab={tab} />;
}
