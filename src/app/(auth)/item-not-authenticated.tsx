import {
    AlertOctagon,
    AlertTriangle,
    Headphones,
    Layers,
    Lightbulb,
    RefreshCw,
    Smartphone,
    WifiOff
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { View as MotiView } from 'moti';
import React from 'react';
import {
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ItemNotAuthenticated() {
    // Set when we arrive here from a failed NFC tag lookup.
    const { tagId } = useLocalSearchParams<{ tagId?: string }>();

    const onTryAgain = () => {
        if (tagId) router.replace(`/claim/${tagId}` as never);
        else router.back();
    };

    return (
        <SafeAreaView className={`flex-1 bg-[#050507]`}>
            <StatusBar className="light-content" />
            <ScrollView
                className={`px-5 pt-3 pb-10`}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    className="items-center my-2"
                >
                    <Text className="text-white text-3xl font-black tracking-widest uppercase">
                        HIT<Text className="text-primary">B★X</Text>
                    </Text>

                </MotiView>

                <View className="bg-background px-4 pt-5">
                
                    {/* Validation Status Heading */}
                    <MotiView
                        from={{ opacity: 0, translateY: 15 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 600, delay: 150 }}
                        className="items-center mb-6 px-2"
                    >
                        {/* Glow behind the icon wrapper */}
                        <View className="bg-destructive-20 p-5 rounded-full mb-3.5 border border-destructive-40">
                            <AlertTriangle color="#FF3B30" size={60} />
                        </View>

                        <Text className="text-3xl font-black text-white tracking-tight mb-2">
                           Item Validation <Text className="text-destructive font-black">Failed</Text>
                        </Text>

                        <Text className="text-[14px] text-neutral-400 text-center font-medium leading-5 px-6 max-w-sm">
                            We couldn't validate this product because the{' '}
                            <Text className="text-neutral-200 font-semibold">NFC tag</Text> could not be read safely.
                        </Text>

                        {tagId ? (
                            <View className="mt-4 bg-[#0F0F13] border border-[#1F1F24] rounded-xl px-4 py-2.5">
                                <Text className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">Scanned tag</Text>
                                <Text className="text-neutral-200 text-sm font-bold tracking-wide">{tagId}</Text>
                            </View>
                        ) : null}
                    </MotiView>
                </View>

                {/* Main Error Box */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 600, delay: 200 }}
                    className={`bg-[#0F0F13] border border-[#1F1F24] rounded-xl p-4 mb-4`}
                >
                    <View className={`flex-row items-start`}>
                        <WifiOff color="#FF3B30" size={28} />
                        <View className={`flex-1 ml-4`}>
                            <Text className={`text-base font-bold text-white mb-1`}>Unable to Read NFC Tag</Text>
                            <Text className={`text-sm color-[#A1A1AA] leading-4.5`}>
                                We were unable to read or detect a valid NFC tag.
                            </Text>
                        </View>
                    </View>
                </MotiView>

                {/* Possible Reasons Container */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 600, delay: 300 }}
                    className={`bg-[#0F0F13] border border-[#1F1F24] rounded-xl px-4 pt-4 pb-1 mb-4`}
                >
                    <Text className={`text-[15px] font-bold text-white mb-4`}>Possible Reasons</Text>

                    {/* Reason 1 */}
                    <View className={`flex-row items-start mb-4`}>
                        <View className={`w-8 items-center mt-0.5`}>
                            <Smartphone color="#FF3B30" size={20} />
                        </View>
                        <View className={`flex-1 ml-2.5 border-b border-[#1A1A22] pb-3`}>
                            <Text className={`text-sm font-semibold text-[#E4E4E7] mb-1`}>NFC is turned off</Text>
                            <Text className={`text-[13px] color-[#71717A] leading-4`}>Please enable NFC in your device settings.</Text>
                        </View>
                    </View>

                    {/* Reason 2 */}
                    <View className={`flex-row items-start mb-4`}>
                        <View className={`w-8 items-center mt-0.5`}>
                            <AlertOctagon color="#FF3B30" size={20} />
                        </View>
                        <View className={`flex-1 ml-2.5 border-b border-[#1A1A22] pb-3`}>
                            <Text className={`text-sm font-semibold text-[#E4E4E7] mb-1`}>Tag is damaged or not working</Text>
                            <Text className={`text-[13px] color-[#71717A] leading-4`}>The NFC tag may be damaged or not functioning.</Text>
                        </View>
                    </View>

                    {/* Reason 3 */}
                    <View className={`flex-row items-start mb-4`}>
                        <View className={`w-8 items-center mt-0.5`}>
                            <Smartphone color="#FF3B30" size={20} />
                        </View>
                        <View className={`flex-1 ml-2.5 border-b border-[#1A1A22] pb-3`}>
                            <Text className={`text-sm font-semibold text-[#E4E4E7] mb-1`}>Phone moved too quickly</Text>
                            <Text className={`text-[13px] color-[#71717A] leading-4`}>Try holding your phone closer to the tag and keep it steady.</Text>
                        </View>
                    </View>

                    {/* Reason 4 */}
                    <View className={`flex-row items-start mb-4`}>
                        <View className={`w-8 items-center mt-0.5`}>
                            <Layers color="#FF3B30" size={20} />
                        </View>
                        <View className={`flex-1 ml-2.5 pb-2`}>
                            <Text className={`text-sm font-semibold text-[#E4E4E7] mb-1`}>Unsupported or invalid tag</Text>
                            <Text className={`text-[13px] color-[#71717A] leading-4`}>This tag may not be supported by HitBox.</Text>
                        </View>
                    </View>
                </MotiView>

                {/* Pro-Tip Box */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 600, delay: 400 }}
                    className={`bg-[#0F0F13] border border-[#1F1F24] rounded-xl p-4 flex-row items-center mb-6`}
                >
                    <Lightbulb color="#FF3B30" size={20} />
                    <Text className={`flex-1 ml-3.5 text-sm color-[#E4E4E7] leading-4.5`}>
                        Make sure the NFC tag is near the top back of your phone and try again.
                    </Text>
                </MotiView>


            </ScrollView>

            {/* Action Buttons */}
            <MotiView
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 500, delay: 500 }}
                className='mx-4'
            >
                <TouchableOpacity
                    className={`bg-[#E52B2B] rounded-xl h-14 flex-row gap-2 items-center justify-center mb-3 shadow-lg`}
                    activeOpacity={0.8}
                    onPress={onTryAgain}
                >
                    <RefreshCw color="#FFF" size={18} />
                    <Text className={`text-white text-base font-bold`}>Try Again</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className={`bg-transparent border gap-2 border-destructive rounded-xl h-14 flex-row items-center justify-center`}
                    activeOpacity={0.8}
                    onPress={() => router.replace('/(tabs)/discover' as never)}
                >
                    <Headphones color="#FF3B30" size={18} />
                    <Text className={`text-destructive text-base font-bold`}>Get Help</Text>
                </TouchableOpacity>
            </MotiView>
        </SafeAreaView>
    );
}