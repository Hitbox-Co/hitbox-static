import { Check, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { categoryChipLabel } from "@/features/profile/api/getOwnedCategories";

export type SheetSort = "latest" | "oldest" | "name";
export type SheetShow = "all" | "PUBLIC" | "PRIVATE";
export type SheetValues = { category: string; show: SheetShow; sort: SheetSort };

const SHOWS: { id: SheetShow; label: string }[] = [
  { id: "all", label: "All items" },
  { id: "PUBLIC", label: "Public" },
  { id: "PRIVATE", label: "Private" },
];
const SORTS: { id: SheetSort; label: string }[] = [
  { id: "latest", label: "Recently updated" },
  { id: "oldest", label: "Oldest first" },
  { id: "name", label: "Name: A–Z" },
];

export const DEFAULT_SHEET_VALUES: SheetValues = { category: "all", show: "all", sort: "latest" };

/**
 * "Filter collections" bottom sheet (Figma 518-285): Format, a second filter and
 * Sort by, then "Show results" / "Reset filters". Choices are held as a draft and
 * only applied by Show — closing the sheet discards them. The Figma's "Set
 * completion" needs per-collection progress the API doesn't give, so that row is
 * Public/Private (the one per-item state we do have).
 */
export default function FilterSheet({
  visible,
  values,
  categories,
  onApply,
  onClose,
}: {
  visible: boolean;
  values: SheetValues;
  /** Category ids to offer, without "all". */
  categories: string[];
  onApply: (next: SheetValues) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<SheetValues>(values);

  // Start from what is applied each time the sheet opens.
  useEffect(() => {
    if (visible) setDraft(values);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable accessibilityLabel="Close filters" onPress={onClose} className="absolute inset-0 bg-black/40" />
        <SafeAreaView edges={["bottom"]} className="max-h-[88%] rounded-t-[14px] bg-white">
          <View className="items-center pt-3">
            <View className="h-1 w-10 rounded-full bg-[#dbeafe]" />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 8, gap: 22 }}>
            <View className="flex-row items-center justify-between">
              <Text className="font-orbitron text-[22px] text-[#111827]">Filter collections</Text>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close" hitSlop={10} onPress={onClose}>
                <X size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            <Group title="Format">
              <View className="flex-row flex-wrap gap-2">
                {["all", ...categories].map((c) => (
                  <Chip
                    key={c}
                    label={c === "all" ? "All" : categoryChipLabel(c)}
                    active={draft.category === c}
                    onPress={() => setDraft((d) => ({ ...d, category: c }))}
                  />
                ))}
              </View>
            </Group>

            <Group title="Visibility">
              <View className="flex-row flex-wrap gap-2">
                {SHOWS.map((o) => (
                  <Chip key={o.id} label={o.label} active={draft.show === o.id} onPress={() => setDraft((d) => ({ ...d, show: o.id }))} />
                ))}
              </View>
            </Group>

            <Group title="Sort by">
              <View>
                {SORTS.map((o, i) => {
                  const on = draft.sort === o.id;
                  return (
                    <TouchableOpacity
                      key={o.id}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: on }}
                      activeOpacity={0.8}
                      onPress={() => setDraft((d) => ({ ...d, sort: o.id }))}
                      className={`h-[52px] flex-row items-center justify-between ${i > 0 ? "border-t border-[#dbeafe]" : ""}`}
                    >
                      <Text className={`text-[14px] ${on ? "font-syne-bold text-[#111827]" : "font-syne text-[#111827]"}`}>{o.label}</Text>
                      <View className={`h-5 w-5 items-center justify-center rounded ${on ? "bg-black" : "bg-[#eff6ff]"}`}>
                        {on && <Check size={14} color="#fff" strokeWidth={3} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Group>

            <Text className="font-syne text-[11px] text-[#6b7280]">Missing items stay in My Collections only.</Text>
          </ScrollView>

          <View className="gap-[10px] px-5 pb-2 pt-1">
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.85}
              onPress={() => onApply(draft)}
              className="h-[46px] justify-center rounded bg-black px-4"
            >
              <Text className="font-syne-bold text-[14px] text-white">Show results</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.85}
              onPress={() => {
                setDraft(DEFAULT_SHEET_VALUES);
                onApply(DEFAULT_SHEET_VALUES);
              }}
              className="h-[46px] justify-center rounded border border-[#111827] bg-[#f3f6fb] px-4"
            >
              <Text className="font-syne-bold text-[14px] text-[#111827]">Reset filters</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="font-syne-bold text-[15px] text-[#111827]">{title}</Text>
      {children}
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      activeOpacity={0.8}
      onPress={onPress}
      className={`h-10 justify-center rounded px-[18px] ${active ? "bg-black" : "bg-[#f3f6fb]"}`}
    >
      <Text className={`text-[12px] ${active ? "font-syne-bold text-white" : "font-syne-semibold text-[#6b7280]"}`}>{label}</Text>
    </TouchableOpacity>
  );
}
