import { Eye, EyeOff } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SecuritySection({ triggerSuccess }: { triggerSuccess: (msg: string) => void }) {
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
    const [is2FAEnabled, setIs2FAEnabled] = useState(true);
    const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);

    // Form states - Security
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdatePassword = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Please fill in all password fields.');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match.');
            return;
        }
        // Mock password update
        triggerSuccess('Password successfully updated!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <MotiView
            key="security"
            from={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'timing', duration: 200 }}
            className="gap-5"
        >
            <Text className="font-orbitron text-[13px] text-[#111827] px-1">
                Password Settings
            </Text>

            <View className="bg-white border border-[#dbeafe] rounded p-[14px] gap-4">
                {/* Current password */}
                <View className="gap-2">
                    <Text className="font-syne-semibold text-[12px] text-[#6b7280]">Current Password</Text>
                    <View className="flex-row items-center bg-white border border-[#dbeafe] rounded-[10px] px-[14px]">
                        <TextInput
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry={!showPass.current}
                            placeholder="••••••••"
                            placeholderTextColor="#9ca3af"
                            className="flex-1 py-[13px] font-syne text-[14px] text-[#111827]"
                        />
                        <TouchableOpacity onPress={() => setShowPass(s => ({ ...s, current: !s.current }))}>
                            {showPass.current ? <EyeOff size={16} color="#9ca3af" /> : <Eye size={16} color="#9ca3af" />}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* New password */}
                <View className="gap-2">
                    <Text className="font-syne-semibold text-[12px] text-[#6b7280]">New Password</Text>
                    <View className="flex-row items-center bg-white border border-[#dbeafe] rounded-[10px] px-[14px]">
                        <TextInput
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry={!showPass.new}
                            placeholder="••••••••"
                            placeholderTextColor="#9ca3af"
                            className="flex-1 py-[13px] font-syne text-[14px] text-[#111827]"
                        />
                        <TouchableOpacity onPress={() => setShowPass(s => ({ ...s, new: !s.new }))}>
                            {showPass.new ? <EyeOff size={16} color="#9ca3af" /> : <Eye size={16} color="#9ca3af" />}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Confirm password */}
                <View className="gap-2">
                    <Text className="font-syne-semibold text-[12px] text-[#6b7280]">Confirm New Password</Text>
                    <View className="flex-row items-center bg-white border border-[#dbeafe] rounded-[10px] px-[14px]">
                        <TextInput
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showPass.confirm}
                            placeholder="••••••••"
                            placeholderTextColor="#9ca3af"
                            className="flex-1 py-[13px] font-syne text-[14px] text-[#111827]"
                        />
                        <TouchableOpacity onPress={() => setShowPass(s => ({ ...s, confirm: !s.confirm }))}>
                            {showPass.confirm ? <EyeOff size={16} color="#9ca3af" /> : <Eye size={16} color="#9ca3af" />}
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleUpdatePassword}
                    activeOpacity={0.8}
                    className="bg-black rounded-[30px] h-[52px] items-center justify-center mt-2"
                >
                    <Text className="font-syne-bold text-[14px] text-white">Update Password</Text>
                </TouchableOpacity>
            </View>

            <Text className="font-orbitron text-[13px] text-[#111827] mt-2 px-1">
                Security Options
            </Text>

            <View className="bg-white border border-[#dbeafe] rounded overflow-hidden">
                {/* 2FA Toggle */}
                <View className="flex-row items-center justify-between p-4 border-b border-[#dbeafe]">
                    <View className="flex-1 pr-4">
                        <Text className="font-syne-bold text-[14px] text-[#111827]">Two-Factor Authentication</Text>
                        <Text className="font-syne text-[12px] text-[#6b7280]">Verify purchases and account access via code</Text>
                    </View>
                    <Switch
                        value={is2FAEnabled}
                        onValueChange={setIs2FAEnabled}
                        trackColor={{ false: "#dbeafe", true: "#2563eb" }}
                        thumbColor={is2FAEnabled ? "#ffffff" : "#ffffff"}
                    />
                </View>

                {/* Biometrics Toggle */}
                <View className="flex-row items-center justify-between p-4">
                    <View className="flex-1 pr-4">
                        <Text className="font-syne-bold text-[14px] text-[#111827]">Face ID / Biometric Lock</Text>
                        <Text className="font-syne text-[12px] text-[#6b7280]">Require biometrics to access app options</Text>
                    </View>
                    <Switch
                        value={isBiometricsEnabled}
                        onValueChange={setIsBiometricsEnabled}
                        trackColor={{ false: "#dbeafe", true: "#2563eb" }}
                        thumbColor={isBiometricsEnabled ? "#ffffff" : "#ffffff"}
                    />
                </View>
            </View>
        </MotiView>
    )
}