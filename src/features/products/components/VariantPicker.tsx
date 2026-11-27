import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { ProductVariant, ProductVariantOption } from "../types/product";

interface VariantPickerProps {
  /** Active variants only (the screen filters on `isActive`). */
  variants: ProductVariant[];
  /** The variant the current picks resolve to, or null while incomplete. */
  chosenId: string | null;
  onChange: (variantId: string | null) => void;
}

const isColour = (dimension: string) => /^colou?r$/i.test(dimension);

/** One pickable value of a dimension ("M", "Lilac"), de-duplicated across variants. */
interface Choice {
  value: string;
  label: string;
  hexCode: string | null;
}

/**
 * Size chips and colour swatches under the drop image — Figma "Drop detail"
 * (UX-DESIGN 208:6012): square size chips on the left (the picked one has a
 * blue outline), colour swatches to the right in a row that scrolls sideways.
 *
 * A variant is one combination of options (`options[]`: SIZE + COLOR…), so the
 * picker keeps a pick per dimension and reports a variant id only once every
 * dimension is picked and that combination exists. A value with no active
 * variant alongside the other picks is dimmed. Variants that carry no
 * `options` fall back to one chip per variant `label`.
 */
export default function VariantPicker({ variants, chosenId, onChange }: VariantPickerProps) {
  const [picks, setPicks] = useState<Record<string, string>>({});

  // Dimensions in the order the variants list them, each with its distinct values.
  const dimensions: { dimension: string; choices: Choice[] }[] = [];
  for (const v of variants) {
    for (const o of v.options ?? []) {
      let entry = dimensions.find((d) => d.dimension === o.dimension);
      if (!entry) {
        entry = { dimension: o.dimension, choices: [] };
        dimensions.push(entry);
      }
      if (!entry.choices.some((c) => c.value === o.value)) {
        entry.choices.push({ value: o.value, label: o.label || o.value, hexCode: o.hexCode });
      }
    }
  }

  const has = (v: ProductVariant, o: Pick<ProductVariantOption, "dimension" | "value">) =>
    (v.options ?? []).some((x) => x.dimension === o.dimension && x.value === o.value);

  if (dimensions.length === 0) {
    // No per-dimension data: one chip per variant, as a single choice.
    return (
      <View className="flex-row flex-wrap gap-3">
        {variants.map((v) => (
          <Chip
            key={v.id}
            label={v.label}
            active={v.id === chosenId}
            onPress={() => onChange(v.id === chosenId ? null : v.id)}
          />
        ))}
      </View>
    );
  }

  const pick = (dimension: string, value: string) => {
    const next = { ...picks };
    if (next[dimension] === value) delete next[dimension];
    else next[dimension] = value;
    setPicks(next);
    const complete = dimensions.every((d) => next[d.dimension]);
    const match = complete
      ? variants.find((v) => dimensions.every((d) => has(v, { dimension: d.dimension, value: next[d.dimension] })))
      : undefined;
    onChange(match?.id ?? null);
  };

  /** Is there an active variant with this value and every other pick? */
  const available = (dimension: string, value: string) =>
    variants.some(
      (v) =>
        has(v, { dimension, value }) &&
        dimensions.every((d) => d.dimension === dimension || !picks[d.dimension] || has(v, { dimension: d.dimension, value: picks[d.dimension] })),
    );

  const chipDims = dimensions.filter((d) => !isColour(d.dimension));
  const colourDims = dimensions.filter((d) => isColour(d.dimension));

  return (
    <View className="flex-row items-center gap-6">
      {chipDims.length > 0 && (
        <View className="flex-row items-center gap-3">
          {chipDims.flatMap((d) =>
            d.choices.map((c) => (
              <Chip
                key={`${d.dimension}:${c.value}`}
                label={c.label}
                active={picks[d.dimension] === c.value}
                dimmed={!available(d.dimension, c.value)}
                onPress={() => pick(d.dimension, c.value)}
              />
            )),
          )}
        </View>
      )}
      {colourDims.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1 }}
          contentContainerStyle={{ gap: 12, alignItems: "center" }}
        >
          {colourDims.flatMap((d) =>
            d.choices.map((c) => (
              <Swatch
                key={`${d.dimension}:${c.value}`}
                label={c.label}
                hex={c.hexCode}
                active={picks[d.dimension] === c.value}
                dimmed={!available(d.dimension, c.value)}
                onPress={() => pick(d.dimension, c.value)}
              />
            )),
          )}
        </ScrollView>
      )}
    </View>
  );
}

function Chip({
  label,
  active,
  dimmed,
  onPress,
}: {
  label: string;
  active: boolean;
  dimmed?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active, disabled: !!dimmed }}
      activeOpacity={0.8}
      onPress={onPress}
      style={{ opacity: dimmed ? 0.4 : 1 }}
      className={`h-8 min-w-9 items-center justify-center rounded border px-2 ${
        active ? "border-[#2563eb] bg-white" : "border-transparent bg-[#f3f4f6]"
      }`}
    >
      <Text
        className={`text-[12px] ${active ? "font-syne-semibold text-[#2563eb]" : "font-syne-medium text-[#6b7280]"}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Swatch({
  label,
  hex,
  active,
  dimmed,
  onPress,
}: {
  label: string;
  hex: string | null;
  active: boolean;
  dimmed?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Colour ${label}`}
      accessibilityState={{ selected: active, disabled: !!dimmed }}
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        width: 36,
        height: 32,
        padding: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: active ? "#2563eb" : "transparent",
        opacity: dimmed ? 0.4 : 1,
      }}
    >
      <View
        style={{
          flex: 1,
          borderRadius: 4,
          backgroundColor: hex || "#e5e7eb",
          borderWidth: 1,
          borderColor: "rgba(17,24,39,0.08)",
        }}
      />
    </TouchableOpacity>
  );
}
