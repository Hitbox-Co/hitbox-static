import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'

/** The Figma's NFC "waves" glyph, drawn at 32×32. */
export function NfcWaves({ size = 32, color = '#fff' }: { size?: number; color?: string }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <Path
                d="M8 11.0934C8.85225 12.5883 9.30044 14.2795 9.30044 16.0004C9.30044 17.7213 8.85225 19.4125 8 20.9075M12.6132 8.27933C13.9452 10.6344 14.6453 13.2942 14.6453 15.9999C14.6453 18.7057 13.9452 21.3655 12.6132 23.7206M17.2133 5.4653C19.0501 8.67174 20.0175 12.3024 20.0198 15.9977C20.0222 19.693 19.0593 23.3249 17.2267 26.5337M21.8265 2.6656C24.1463 6.72674 25.3664 11.3229 25.3664 16C25.3664 20.6771 24.1463 25.2733 21.8265 29.3344"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
            />
        </Svg>
    )
}

const RINGS = [
    { size: 196, opacity: 0.55, color: '#dbeafe', width: 1 },
    { size: 162, opacity: 0.7, color: '#bfdbfe', width: 1 },
    { size: 126, opacity: 0.8, color: '#93c5fd', width: 1 },
    { size: 90, opacity: 0.8, color: '#2563eb', width: 2 },
] as const

/**
 * The scanning graphic from the Figma: four concentric rings, the blue NFC
 * button and a short arc that sweeps round it. The rings breathe outward while
 * `active`; everything holds still when there is nothing to wait for (signed
 * out, NFC off), so it does not promise a tap that cannot happen.
 */
export function NfcScanGraphic({ active = true }: { active?: boolean }) {
    return (
        <View style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center' }}>
            {RINGS.map((ring, i) => (
                <MotiView
                    key={ring.size}
                    from={{ scale: 1 }}
                    animate={{ scale: active ? 1.06 : 1 }}
                    transition={{
                        type: 'timing',
                        duration: 1400,
                        delay: i * 180,
                        loop: active,
                        repeatReverse: true,
                    }}
                    style={{
                        position: 'absolute',
                        width: ring.size,
                        height: ring.size,
                        borderRadius: ring.size / 2,
                        borderWidth: ring.width,
                        borderColor: ring.color,
                        opacity: ring.opacity,
                    }}
                />
            ))}

            {/* Sweeping arc: a ring with only one quarter coloured, rotating. */}
            <MotiView
                from={{ rotate: '0deg' }}
                animate={{ rotate: active ? '360deg' : '0deg' }}
                transition={{ type: 'timing', duration: 2200, loop: active, repeatReverse: false }}
                style={{
                    position: 'absolute',
                    width: 90,
                    height: 90,
                    borderRadius: 45,
                    borderWidth: 3,
                    borderColor: 'transparent',
                    borderTopColor: '#3b82f6',
                    borderRightColor: 'rgba(59,130,246,0.35)',
                    opacity: 0.9,
                }}
            />

            <LinearGradient
                colors={['#3b82f6', '#2563eb']}
                start={{ x: 0.85, y: 0.15 }}
                end={{ x: 0.15, y: 0.85 }}
                style={{
                    width: 68,
                    height: 68,
                    borderRadius: 34,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#3b82f6',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.3,
                    shadowRadius: 9,
                    elevation: 6,
                }}
            >
                <NfcWaves />
            </LinearGradient>
        </View>
    )
}

/**
 * Claim / Verify buttons — the same pill shape as the sign-up buttons. The
 * selected action is the filled blue pill; the other is outlined. Pressing
 * either picks it, and the screen decides what else that press does (e.g.
 * submit a pasted link).
 */
export function ActionPillButton({
    label,
    selected,
    onPress,
    icon,
    disabled,
}: {
    label: string
    selected: boolean
    onPress: () => void
    icon?: React.ReactNode
    disabled?: boolean
}) {
    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected, disabled: !!disabled }}
            activeOpacity={0.85}
            disabled={disabled}
            onPress={onPress}
            className={`h-12 flex-1 flex-row items-center justify-center gap-2 rounded-[30px] border ${
                selected ? 'border-[#2563eb] bg-[#2563eb]' : 'border-[#2563eb] bg-white'
            }`}
            style={{ opacity: disabled ? 0.5 : 1 }}
        >
            <Text className={`font-syne-bold text-[13px] ${selected ? 'text-white' : 'text-[#111827]'}`}>{label}</Text>
            {icon}
        </TouchableOpacity>
    )
}
