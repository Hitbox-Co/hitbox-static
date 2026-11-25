import { router, useIsFocused } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Check, ChevronDown, ChevronUp, Search, SearchX, ShoppingBag, SlidersHorizontal, User, X } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDiscoverCreators } from "../api/getDiscoverCreators";
import { useDiscoverProducts } from "../api/getDiscoverProducts";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { DiscoverCategory, DiscoverCreatorItem, DiscoverProductItem, DiscoverSection } from "../types/discover";
import { DISCOVER_PLACEHOLDER_IMAGE, formatDiscoverPrice, formatRewardPoints } from "../utils/format";
import { addRecentTerm, clearRecentSearches, useRecentTerms } from "../utils/recentSearches";

/** The "Search for" choices (Figma 722-267). Artists and Creators are the same list. */
type Scope = "all" | "products" | "artists" | "creators";
const SCOPES: { id: Scope; label: string }[] = [
    { id: "all", label: "All" },
    { id: "products", label: "Products" },
    { id: "artists", label: "Artists" },
    { id: "creators", label: "Creators" },
];
/** What the dropdown button says for each choice. */
const SCOPE_BUTTON: Record<Scope, string> = {
    all: "All types",
    products: "Products",
    artists: "Artists",
    creators: "Creators",
};

const CATEGORIES: { id: DiscoverCategory; label: string }[] = [
    { id: "cards", label: "Cards" },
    { id: "figures", label: "Figures" },
    { id: "apparel", label: "Apparel" },
    { id: "posters", label: "Posters" },
    { id: "digital", label: "Digital" },
    { id: "other", label: "Other" },
];

/**
 * The stored `Drop.category` values each tab covers — the same lists the
 * backend uses for `?category=`. Needed to match more than one category on the
 * phone, since the endpoint takes only one.
 */
const STORAGE_BY_TAB: Record<DiscoverCategory, string[]> = {
    cards: ["TRADING_CARD", "CARD_PACK"],
    figures: ["FIGURE"],
    apparel: ["APPAREL", "JERSEY", "ACCESSORY"],
    posters: ["POSTER"],
    digital: ["DIGITAL_ASSET"],
    other: ["BOOK", "AUTOGRAPH", "GAME_BOX", "OTHER"],
};

/** The orderings `GET /discover/products` offers (`?section=`). "Relevance" is Trending. */
const SORTS: { id: DiscoverSection; label: string }[] = [
    { id: "trending", label: "Relevance" },
    { id: "new_releases", label: "New releases" },
    { id: "featured", label: "Featured" },
];

/** Range fields are kept as the text typed; "" means no limit on that side. */
interface Filters {
    categories: DiscoverCategory[];
    priceMin: string;
    priceMax: string;
    pointsMin: string;
    pointsMax: string;
    sort: DiscoverSection;
    /** Artists only: profile countries to match. Empty = any country. */
    countries: string[];
}
const NO_FILTERS: Filters = {
    categories: [],
    priceMin: "",
    priceMax: "",
    pointsMin: "",
    pointsMax: "",
    sort: "trending",
    countries: [],
};

/** The countries offered for artists (Figma 722-3xx lists the first four, then "Show all countries"). */
const COUNTRIES = [
    "Japan",
    "United States",
    "United Kingdom",
    "South Korea",
    "Australia",
    "Brazil",
    "Canada",
    "China",
    "France",
    "Germany",
    "India",
    "Indonesia",
    "Italy",
    "Mexico",
    "Netherlands",
    "Philippines",
    "Singapore",
    "Spain",
    "Sweden",
    "Thailand",
];

const toNum = (s: string): number | null => {
    const clean = s.replace(/[^0-9.]/g, "");
    if (clean === "") return null;
    const n = Number(clean);
    return Number.isFinite(n) ? n : null;
};
const within = (value: number, min: number | null, max: number | null) =>
    (min === null || value >= min) && (max === null || value <= max);

/** "$0–$200", "$200+" or "Up to $200"; the points version adds "pts". */
function rangeLabel(min: number | null, max: number | null, money: boolean): string {
    const fmt = (n: number) => (money ? `$${n.toLocaleString("en-US")}` : n.toLocaleString("en-US"));
    const unit = money ? "" : " pts";
    if (min !== null && max !== null) return `${fmt(min)}–${fmt(max)}${unit}`;
    if (min !== null) return `${fmt(min)}+${unit}`;
    return `Up to ${fmt(max ?? 0)}${unit}`;
}

/** Creators shown with nothing typed (Figma shows two). */
const IDLE_CREATORS = 3;

/**
 * Search — Figma 722-246 (HitBox · Search) and 722-288 (Filters).
 *
 * The "Search for" dropdown narrows to All / Products / Artists / Creators.
 * Products: `GET /discover/products?search=&category=&section=`. The endpoint
 * takes ONE category and has no price or points filters, so more than one
 * category, and any price or points range, are applied on the phone to the
 * first 50 matches. Creators: `GET /discover/creators`, matched by name on the
 * phone (no search parameter); "Artists" and "Creators" are the same people.
 * Recent searches are the words searched this session (no backend history).
 */
export default function SearchScreen() {
    const isFocused = useIsFocused();
    const [query, setQuery] = useState("");
    const debounced = useDebouncedValue(query.trim());
    const [scope, setScope] = useState<Scope>("all");
    const [scopeOpen, setScopeOpen] = useState(false);
    const [filters, setFilters] = useState<Filters>(NO_FILTERS);
    const [page, setPage] = useState(false);
    const terms = useRecentTerms();

    const searching = debounced.length > 0;
    const showProducts = scope === "all" || scope === "products";
    const showCreators = scope === "all" || scope === "artists" || scope === "creators";
    const productsOnly = scope === "products";

    const priceMin = toNum(filters.priceMin);
    const priceMax = toNum(filters.priceMax);
    const pointsMin = toNum(filters.pointsMin);
    const pointsMax = toNum(filters.pointsMax);
    const priceActive = priceMin !== null || priceMax !== null;
    const pointsActive = pointsMin !== null || pointsMax !== null;
    const manyCategories = filters.categories.length > 1;
    const phoneFiltering = priceActive || pointsActive || manyCategories;

    const products = useDiscoverProducts(
        {
            search: searching ? debounced : undefined,
            category: filters.categories.length === 1 ? filters.categories[0] : undefined,
            section: filters.sort,
            limit: phoneFiltering ? 50 : searching || productsOnly ? 20 : 6,
        },
        { enabled: showProducts },
    );
    const creators = useDiscoverCreators({ limit: 50 }, { enabled: showCreators });

    const wantedStorage = filters.categories.flatMap((c) => STORAGE_BY_TAB[c]);
    const productItems = (products.data?.data ?? []).filter(
        (p) =>
            (!manyCategories || wantedStorage.includes((p.category ?? "").toUpperCase())) &&
            within(Number(p.price?.amount ?? 0), priceMin, priceMax) &&
            within(p.rewardPoints ?? 0, pointsMin, pointsMax),
    );
    const needle = debounced.toLowerCase();
    const allCreators = creators.data?.data ?? [];
    // The API does not send a country yet. Until it does, a country filter cannot
    // narrow anything, and hiding everyone would be wrong — so it is left off and
    // the screen says so.
    const locationKnown = allCreators.some((c) => !!c.country);
    const countryFilter = filters.countries.length > 0;
    const wantedCountries = filters.countries.map((c) => c.toLowerCase());
    const creatorItems = allCreators
        .filter((c) => !searching || c.name.toLowerCase().includes(needle))
        .filter((c) => !(countryFilter && locationKnown) || wantedCountries.includes((c.country ?? "").toLowerCase()))
        .slice(0, searching || !showProducts ? 10 : IDLE_CREATORS);

    const remember = () => {
        if (searching) addRecentTerm(debounced);
    };

    const openProduct = (item: DiscoverProductItem) => {
        remember();
        // Discover's own copy of the detail route keeps the Discover tab selected.
        router.push({ pathname: "/discover/[productId]", params: { productId: item.id } });
    };

    const openCreator = (creator: DiscoverCreatorItem) => {
        remember();
        router.push({ pathname: "/artists/[artistId]", params: { artistId: creator.id } } as never);
    };

    const activeChips: { key: string; label: string; clear: () => void }[] = [];
    for (const c of filters.categories) {
        activeChips.push({
            key: `cat-${c}`,
            label: CATEGORIES.find((x) => x.id === c)?.label ?? c,
            clear: () => setFilters((f) => ({ ...f, categories: f.categories.filter((x) => x !== c) })),
        });
    }
    for (const country of filters.countries) {
        activeChips.push({
            key: `country-${country}`,
            label: country,
            clear: () => setFilters((f) => ({ ...f, countries: f.countries.filter((x) => x !== country) })),
        });
    }
    if (priceActive)
        activeChips.push({
            key: "price",
            label: rangeLabel(priceMin, priceMax, true),
            clear: () => setFilters((f) => ({ ...f, priceMin: "", priceMax: "" })),
        });
    if (pointsActive)
        activeChips.push({
            key: "pts",
            label: rangeLabel(pointsMin, pointsMax, false),
            clear: () => setFilters((f) => ({ ...f, pointsMin: "", pointsMax: "" })),
        });
    if (filters.sort !== "trending")
        activeChips.push({
            key: "sort",
            label: SORTS.find((s) => s.id === filters.sort)?.label ?? filters.sort,
            clear: () => setFilters((f) => ({ ...f, sort: "trending" })),
        });
    const filterCount = activeChips.length;

    const nothingFound =
        searching &&
        !products.isLoading &&
        !products.isError &&
        productItems.length === 0 &&
        !creators.isLoading &&
        creatorItems.length === 0;

    const productsHeading = productsOnly || filterCount > 0
        ? `${productItems.length} ${productItems.length === 1 ? "product" : "products"}`
        : searching
            ? "Products"
            : "Products for you";

    return (
        <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-white">
            {isFocused && <StatusBar style="dark" />}

            <Header onBack={() => router.back()} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                // Room under the footer line for the floating tab bar.
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 128, gap: 20 }}
            >
                {/* Title, field, scope + filters */}
                <View className="gap-[14px]">
                    <Text className="font-orbitron text-[24px] text-[#111827]">Search</Text>

                    <View className="h-[46px] flex-row items-center gap-[10px] rounded border border-[#bfdbfe] bg-[#eff6ff] px-[14px]">
                        <Search size={18} color="#2563eb" />
                        <TextInput
                            autoFocus
                            value={query}
                            onChangeText={setQuery}
                            onSubmitEditing={() => addRecentTerm(query)}
                            placeholder="Search products, artists, creators"
                            placeholderTextColor="#6b7280"
                            returnKeyType="search"
                            autoCapitalize="none"
                            autoCorrect={false}
                            className="h-full flex-1 font-syne text-[13px] text-[#111827]"
                        />
                        {query.length > 0 && (
                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityLabel="Clear search"
                                hitSlop={10}
                                onPress={() => setQuery("")}
                            >
                                <X size={16} color="#6b7280" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View className="flex-row gap-[10px]">
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityState={{ expanded: scopeOpen }}
                            accessibilityLabel={`Search for: ${SCOPE_BUTTON[scope]}`}
                            activeOpacity={0.8}
                            onPress={() => setScopeOpen((o) => !o)}
                            className="h-[44px] flex-1 flex-row items-center justify-between rounded border border-[#dbeafe] bg-white px-3"
                        >
                            <Text className="font-syne-bold text-[13px] text-[#111827]">{SCOPE_BUTTON[scope]}</Text>
                            {scopeOpen ? <ChevronUp size={18} color="#111827" /> : <ChevronDown size={18} color="#111827" />}
                        </TouchableOpacity>
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Filters"
                            activeOpacity={0.8}
                            onPress={() => setPage(true)}
                            className={`h-[44px] flex-row items-center gap-2 rounded border px-[14px] ${filterCount > 0 ? "border-[#2563eb] bg-[#eff6ff]" : "border-[#dbeafe] bg-white"}`}
                        >
                            <SlidersHorizontal size={16} color={filterCount > 0 ? "#2563eb" : "#111827"} />
                            <Text className={`font-syne-bold text-[13px] ${filterCount > 0 ? "text-[#2563eb]" : "text-[#111827]"}`}>
                                {filterCount > 0 ? "Filters (" : "Filters"}
                                {filterCount > 0 && <Text className="font-dm-bold">{filterCount}</Text>}
                                {filterCount > 0 ? ")" : ""}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {scopeOpen && (
                        <View className="gap-[10px] rounded border border-[#dbeafe] bg-[#f6f9fc] p-3">
                            <Text className="font-syne-bold text-[10px] tracking-[0.6px] text-[#6b7280]">SEARCH FOR</Text>
                            <ScopeChips
                                value={scope}
                                onPick={(s) => {
                                    setScope(s);
                                    setScopeOpen(false);
                                }}
                            />
                        </View>
                    )}

                    {filterCount > 0 && (
                        <View className="flex-row flex-wrap gap-2">
                            {activeChips.map((c) => (
                                <TouchableOpacity
                                    key={c.key}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Remove filter ${c.label}`}
                                    activeOpacity={0.8}
                                    onPress={c.clear}
                                    className="h-[34px] flex-row items-center gap-1 rounded bg-[#eff6ff] px-[10px]"
                                >
                                    <Text className="font-syne-bold text-[12px] text-[#2563eb]">{c.label}</Text>
                                    <X size={11} color="#2563eb" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Recent searches — words searched this session */}
                {!searching && terms.length > 0 && (
                    <View className="gap-3">
                        <View className="flex-row items-center justify-between">
                            <Text className="font-orbitron text-[17px] text-[#111827]">Recent searches</Text>
                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityLabel="Clear recent searches"
                                hitSlop={8}
                                onPress={clearRecentSearches}
                            >
                                <Text className="font-syne-semibold text-[11px] text-[#2563eb]">Clear</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="flex-row flex-wrap gap-2">
                            {terms.map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Search ${t}`}
                                    activeOpacity={0.8}
                                    onPress={() => setQuery(t)}
                                    className="h-[34px] justify-center rounded bg-[#f3f4f6] px-[10px]"
                                >
                                    <Text className="font-syne text-[12px] text-[#4b5563]">{t}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {nothingFound ? (
                    <View className="mt-6 items-center px-8">
                        <SearchX size={32} color="#9ca3af" />
                        <Text className="mt-3 text-center font-syne text-sm text-[#6b7280]">
                            {`Nothing matches “${debounced}”.`}
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Products */}
                        {showProducts && (
                            <View className="gap-3">
                                <Text className="font-orbitron text-[17px] text-[#111827]">{productsHeading}</Text>

                                {products.isLoading && (
                                    <View className="items-center py-6">
                                        <ActivityIndicator size="small" color="#2563eb" />
                                    </View>
                                )}

                                {products.isError && !products.isLoading && (
                                    <View className="items-center gap-3 py-4">
                                        <Text className="text-center font-syne text-sm text-[#6b7280]">
                                            Couldn&apos;t load products. Check your connection.
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => products.refetch()}
                                            className="rounded-[30px] bg-[#111827] px-5 py-2"
                                        >
                                            <Text className="font-syne-bold text-[13px] text-white">Retry</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {!products.isLoading && !products.isError && productItems.length === 0 && (
                                    <Text className="font-syne text-[12px] text-[#6b7280]">
                                        {searching || filterCount > 0 ? "No products match." : "No products yet."}
                                    </Text>
                                )}

                                {productItems.map((item) => (
                                    <ProductRow key={item.id} item={item} onPress={() => openProduct(item)} />
                                ))}
                            </View>
                        )}

                        {/* Creators */}
                        {showCreators && (creatorItems.length > 0 || creators.isLoading) && (
                            <View className="gap-3">
                                <Text className="font-orbitron text-[17px] text-[#111827]">
                                    {scope === "artists" ? "Artists" : searching || !showProducts ? "Creators" : "Discover creators"}
                                </Text>
                                {countryFilter && !locationKnown && (
                                    <Text className="font-syne text-[11px] leading-[16px] text-[#6b7280]">
                                        Artist locations aren&apos;t on file yet, so the country filter can&apos;t narrow this list.
                                    </Text>
                                )}
                                {creators.isLoading && (
                                    <View className="items-center py-6">
                                        <ActivityIndicator size="small" color="#2563eb" />
                                    </View>
                                )}
                                {creatorItems.map((c) => (
                                    <CreatorRow key={c.id} creator={c} onPress={() => openCreator(c)} />
                                ))}
                            </View>
                        )}
                    </>
                )}

                {filterCount > 0 && (
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Clear all filters"
                        hitSlop={8}
                        onPress={() => setFilters(NO_FILTERS)}
                        className="self-start"
                    >
                        <Text className="font-syne-bold text-[13px] text-[#2563eb]">Clear all filters</Text>
                    </TouchableOpacity>
                )}

                <Text className="font-syne text-[12px] text-[#6b7280]">One search for every discovery.</Text>
            </ScrollView>

            <FiltersPage
                visible={page}
                scope={scope}
                value={filters}
                onApply={(nextScope, nextFilters) => {
                    setScope(nextScope);
                    setFilters(nextFilters);
                    setPage(false);
                }}
                onClose={() => setPage(false)}
            />
        </SafeAreaView>
    );
}

/** Back · brand · bag — shared by Search and the Filters page. */
function Header({ onBack }: { onBack: () => void }) {
    return (
        <View className="h-14 flex-row items-center justify-between border-b border-[#dbeafe] px-5">
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Back"
                onPress={onBack}
                className="size-9 items-center justify-center rounded bg-[#eff6ff]"
            >
                <ArrowLeft size={18} color="#111827" />
            </TouchableOpacity>
            <View className="flex-row items-center gap-[7px]">
                <Image
                    source={require("@/assets/images/HitBoxLogo-dark.png")}
                    resizeMode="contain"
                    style={{ width: 22, height: 22 }}
                />
                <Text className="font-orbitron text-[15px] text-black">HitBox</Text>
            </View>
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Open cart"
                onPress={() => router.push("/cart" as never)}
                className="size-9 items-center justify-center"
            >
                <ShoppingBag size={21} color="#111827" />
            </TouchableOpacity>
        </View>
    );
}

function ScopeChips({ value, onPick }: { value: Scope; onPick: (s: Scope) => void }) {
    return (
        <View className="flex-row flex-wrap gap-2">
            {SCOPES.map((s) => {
                const active = s.id === value;
                return (
                    <TouchableOpacity
                        key={s.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        activeOpacity={0.8}
                        onPress={() => onPick(s.id)}
                        className={`h-[34px] justify-center rounded px-3 ${active ? "bg-[#eff6ff]" : "bg-[#f3f4f6]"}`}
                    >
                        <Text className={`text-[12px] ${active ? "font-syne-bold text-[#2563eb]" : "font-syne text-[#6b7280]"}`}>
                            {s.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

function ProductRow({ item, onPress }: { item: DiscoverProductItem; onPress: () => void }) {
    const price = formatDiscoverPrice(item.price);
    const points = formatRewardPoints(item.rewardPoints);
    const line = [price, points].filter(Boolean).join(" · ");
    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={item.name}
            activeOpacity={0.85}
            onPress={onPress}
            className="flex-row items-center gap-3 rounded border border-[#dbeafe] bg-white p-3"
        >
            <Image
                source={{ uri: item.imageUrl ?? DISCOVER_PLACEHOLDER_IMAGE }}
                resizeMode="cover"
                style={{ width: 72, height: 72, borderRadius: 4, backgroundColor: "#f3f4f6" }}
            />
            <View className="flex-1 gap-[5px]">
                <Text numberOfLines={2} className="font-orbitron text-[14px] leading-[18px] text-[#111827]">
                    {item.name}
                </Text>
                {item.artist?.name ? (
                    <Text numberOfLines={1} className="font-syne text-[11px] text-[#6b7280]">{item.artist.name}</Text>
                ) : null}
                {line ? <Text className="font-syne-bold text-[12px] text-[#2563eb]">{line}</Text> : null}
            </View>
        </TouchableOpacity>
    );
}

function CreatorRow({ creator, onPress }: { creator: DiscoverCreatorItem; onPress: () => void }) {
    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`View ${creator.name}`}
            activeOpacity={0.85}
            onPress={onPress}
            className="flex-row items-center gap-3 rounded border border-[#dbeafe] bg-white p-3"
        >
            {creator.avatarUrl ? (
                <Image
                    source={{ uri: creator.avatarUrl }}
                    resizeMode="cover"
                    style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#eff6ff" }}
                />
            ) : (
                <View className="size-12 items-center justify-center rounded-full bg-[#eff6ff]">
                    <User size={20} color="#2563eb" />
                </View>
            )}
            <View className="flex-1 gap-[3px]">
                <Text numberOfLines={1} className="font-orbitron text-[14px] text-[#111827]">{creator.name}</Text>
                <Text className="font-syne text-[11px] text-[#6b7280]">
                    {"Creator · "}
                    <Text className="font-dm">{creator.dropCount}</Text>
                    {creator.dropCount === 1 ? " drop" : " drops"}
                </Text>
            </View>
            <Text className="font-syne-bold text-[12px] text-[#2563eb]">View</Text>
        </TouchableOpacity>
    );
}

/**
 * The Filters page (Figma 722-288): Search for, Category checkboxes, Price and
 * Hit Points ranges, Sort by, then Reset all / Apply filters. Choices are a
 * draft until Apply; the back arrow and × discard them.
 */
function FiltersPage({
    visible,
    scope,
    value,
    onApply,
    onClose,
}: {
    visible: boolean;
    scope: Scope;
    value: Filters;
    onApply: (scope: Scope, filters: Filters) => void;
    onClose: () => void;
}) {
    const [draft, setDraft] = useState<Filters>(value);
    const [draftScope, setDraftScope] = useState<Scope>(scope);
    const [sortOpen, setSortOpen] = useState(false);

    // Start from what is applied each time the page opens.
    React.useEffect(() => {
        if (visible) {
            setDraft(value);
            setDraftScope(scope);
            setSortOpen(false);
        }
    }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

    const set = <K extends keyof Filters>(key: K, next: Filters[K]) => setDraft((d) => ({ ...d, [key]: next }));
    const toggleCategory = (id: DiscoverCategory) =>
        set("categories", draft.categories.includes(id) ? draft.categories.filter((c) => c !== id) : [...draft.categories, id]);

    const selected =
        draft.countries.length +
        draft.categories.length +
        (toNum(draft.priceMin) !== null || toNum(draft.priceMax) !== null ? 1 : 0) +
        (toNum(draft.pointsMin) !== null || toNum(draft.pointsMax) !== null ? 1 : 0) +
        (draft.sort !== "trending" ? 1 : 0);

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <SafeAreaView edges={["top", "left", "right", "bottom"]} className="flex-1 bg-white">
                <Header onBack={onClose} />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, gap: 22 }}
                >
                    <View className="flex-row items-center justify-between">
                        <Text className="font-orbitron text-[24px] text-[#111827]">Filters</Text>
                        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close filters" hitSlop={10} onPress={onClose}>
                            <X size={22} color="#111827" />
                        </TouchableOpacity>
                    </View>

                    <View className="gap-3">
                        <Text className="font-syne-bold text-[13px] text-[#111827]">Search for</Text>
                        <ScopeChips value={draftScope} onPick={setDraftScope} />
                    </View>

                    {draftScope === "artists" ? (
                        <CountrySection selected={draft.countries} onChange={(next) => set("countries", next)} />
                    ) : draftScope === "creators" ? null : (
                    <>
                    <View className="gap-3">
                        <Text className="font-orbitron text-[17px] text-[#111827]">Category</Text>
                        <View className="flex-row flex-wrap gap-[10px]">
                            {CATEGORIES.map((c) => {
                                const on = draft.categories.includes(c.id);
                                return (
                                    <TouchableOpacity
                                        key={c.id}
                                        accessibilityRole="checkbox"
                                        accessibilityState={{ checked: on }}
                                        activeOpacity={0.8}
                                        onPress={() => toggleCategory(c.id)}
                                        className={`h-[52px] flex-row items-center gap-3 rounded border px-3 ${on ? "border-[#2563eb] bg-[#eff6ff]" : "border-[#dbeafe] bg-white"}`}
                                        style={{ width: "48.5%" }}
                                    >
                                        <View className={`size-5 items-center justify-center rounded-[3px] border ${on ? "border-[#2563eb] bg-[#2563eb]" : "border-[#9ca3af] bg-white"}`}>
                                            {on && <Check size={14} color="#fff" strokeWidth={3} />}
                                        </View>
                                        <Text className={`text-[13px] text-[#111827] ${on ? "font-syne-bold" : "font-syne"}`}>{c.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <View className="gap-3">
                        <Text className="font-orbitron text-[17px] text-[#111827]">Price range</Text>
                        <View className="flex-row gap-3">
                            <RangeField label="Minimum" value={draft.priceMin} onChange={(v) => set("priceMin", v)} placeholder="0" prefix="$" />
                            <RangeField label="Maximum" value={draft.priceMax} onChange={(v) => set("priceMax", v)} placeholder="Any" prefix="$" />
                        </View>
                    </View>

                    <View className="gap-3">
                        <Text className="font-orbitron text-[17px] text-[#111827]">Hit Points range</Text>
                        <View className="flex-row gap-3">
                            <RangeField label="Minimum" value={draft.pointsMin} onChange={(v) => set("pointsMin", v)} placeholder="0" suffix="pts" />
                            <RangeField label="Maximum" value={draft.pointsMax} onChange={(v) => set("pointsMax", v)} placeholder="Any" suffix="pts" />
                        </View>
                        <Text className="font-syne text-[11px] text-[#6b7280]">Filter by the points shown on each product.</Text>
                    </View>

                    <View className="gap-3">
                        <Text className="font-orbitron text-[17px] text-[#111827]">Sort by</Text>
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityState={{ expanded: sortOpen }}
                            activeOpacity={0.8}
                            onPress={() => setSortOpen((o) => !o)}
                            className="h-[46px] flex-row items-center justify-between rounded border border-[#dbeafe] bg-white px-3"
                        >
                            <Text className="font-syne text-[13px] text-[#111827]">
                                {SORTS.find((s) => s.id === draft.sort)?.label}
                            </Text>
                            {sortOpen ? <ChevronUp size={18} color="#111827" /> : <ChevronDown size={18} color="#111827" />}
                        </TouchableOpacity>
                        {sortOpen && (
                            <View className="rounded border border-[#dbeafe] bg-white">
                                {SORTS.map((o, i) => {
                                    const on = draft.sort === o.id;
                                    return (
                                        <TouchableOpacity
                                            key={o.id}
                                            accessibilityRole="radio"
                                            accessibilityState={{ selected: on }}
                                            activeOpacity={0.8}
                                            onPress={() => {
                                                set("sort", o.id);
                                                setSortOpen(false);
                                            }}
                                            className={`h-[46px] flex-row items-center justify-between px-3 ${i > 0 ? "border-t border-[#dbeafe]" : ""}`}
                                        >
                                            <Text className={`text-[13px] text-[#111827] ${on ? "font-syne-bold" : "font-syne"}`}>{o.label}</Text>
                                            {on && <Check size={16} color="#2563eb" strokeWidth={3} />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                    </>
                    )}
                </ScrollView>

                <View className="gap-3 border-t border-[#dbeafe] px-5 pb-2 pt-3">
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            accessibilityRole="button"
                            activeOpacity={0.85}
                            onPress={() => {
                                setDraft(NO_FILTERS);
                                setDraftScope("all");
                            }}
                            className="h-[48px] flex-1 items-center justify-center rounded border border-[#dbeafe] bg-white"
                        >
                            <Text className="font-syne-bold text-[13px] text-[#111827]">Reset all</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            accessibilityRole="button"
                            activeOpacity={0.85}
                            onPress={() => onApply(draftScope, draft)}
                            className="h-[48px] flex-1 items-center justify-center rounded bg-[#0a0a0a]"
                        >
                            <Text className="font-syne-bold text-[13px] text-white">Apply filters</Text>
                        </TouchableOpacity>
                    </View>
                    <Text className="font-syne text-[11px] text-[#6b7280]">
                        <Text className="font-dm">{selected}</Text>
                        {selected === 1 ? " filter selected" : " filters selected"}
                    </Text>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

/** One min/max box: a small label above a bordered number field with a $ or pts mark. */
function RangeField({
    label,
    value,
    onChange,
    placeholder,
    prefix,
    suffix,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    prefix?: string;
    suffix?: string;
}) {
    return (
        <View className="min-w-0 flex-1 gap-[6px]">
            <Text className="font-syne text-[11px] text-[#6b7280]">{label}</Text>
            <View className="h-[46px] flex-row items-center gap-1 rounded border border-[#dbeafe] bg-white px-3">
                {prefix ? <Text className="font-dm-semibold text-[14px] text-[#111827]">{prefix}</Text> : null}
                <TextInput
                    accessibilityLabel={label}
                    value={value}
                    onChangeText={(t) => onChange(t.replace(/[^0-9.]/g, ""))}
                    placeholder={placeholder}
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    style={{ minWidth: 0 }}
                    className="h-full flex-1 font-dm-semibold text-[14px] text-[#111827]"
                />
                {suffix ? <Text className="font-syne text-[13px] text-[#6b7280]">{suffix}</Text> : null}
            </View>
        </View>
    );
}

/**
 * Artists' Country / region (Figma 722-3xx): a country search, checkboxes with
 * "Any country" on top, "Show all countries", then an optional city. There is
 * no city data, so the city box only shows what it would do.
 */
function CountrySection({ selected, onChange }: { selected: string[]; onChange: (next: string[]) => void }) {
    const [query, setQuery] = useState("");
    const [showAll, setShowAll] = useState(false);
    const q = query.trim().toLowerCase();
    const pool = q ? COUNTRIES.filter((c) => c.toLowerCase().includes(q)) : showAll ? COUNTRIES : COUNTRIES.slice(0, 4);
    const toggle = (country: string) =>
        onChange(selected.includes(country) ? selected.filter((c) => c !== country) : [...selected, country]);
    const anyCountry = selected.length === 0;

    const Row = ({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) => (
        <TouchableOpacity
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
            activeOpacity={0.8}
            onPress={onPress}
            className={`h-[48px] flex-row items-center gap-3 rounded border px-3 ${on ? "border-[#2563eb] bg-[#eff6ff]" : "border-[#dbeafe] bg-white"}`}
        >
            <View className={`size-5 items-center justify-center rounded-[3px] border ${on ? "border-[#2563eb] bg-[#2563eb]" : "border-[#9ca3af] bg-white"}`}>
                {on && <Check size={14} color="#fff" strokeWidth={3} />}
            </View>
            <Text className={`text-[13px] text-[#111827] ${on ? "font-syne-bold" : "font-syne"}`}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <>
            <View className="gap-3">
                <View className="gap-1">
                    <Text className="font-orbitron text-[17px] text-[#111827]">Country / region</Text>
                    <Text className="font-syne text-[12px] text-[#6b7280]">Find artists by their profile location.</Text>
                </View>

                <View className="h-[46px] flex-row items-center gap-[10px] rounded border border-[#dbeafe] bg-white px-3">
                    <Search size={16} color="#2563eb" />
                    <TextInput
                        accessibilityLabel="Search countries"
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search countries"
                        placeholderTextColor="#9ca3af"
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{ minWidth: 0 }}
                        className="h-full flex-1 font-syne text-[13px] text-[#111827]"
                    />
                </View>

                <View className="gap-2">
                    {!q && <Row label="Any country" on={anyCountry} onPress={() => onChange([])} />}
                    {pool.map((c) => (
                        <Row key={c} label={c} on={selected.includes(c)} onPress={() => toggle(c)} />
                    ))}
                    {pool.length === 0 && <Text className="font-syne text-[12px] text-[#6b7280]">No country matches.</Text>}
                </View>

                {!q && !showAll && (
                    <TouchableOpacity accessibilityRole="button" hitSlop={8} onPress={() => setShowAll(true)} className="self-start">
                        <Text className="font-syne-bold text-[12px] text-[#2563eb]">Show all countries</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View className="gap-3">
                <Text className="font-orbitron text-[17px] text-[#111827]">City (optional)</Text>
                <View
                    accessibilityState={{ disabled: true }}
                    className="h-[46px] flex-row items-center justify-between rounded border border-[#dbeafe] bg-[#f6f9fc] px-3"
                >
                    <Text className="font-syne text-[13px] text-[#6b7280]">
                        {selected.length === 1 ? `Any city in ${selected[0]}` : "Any city"}
                    </Text>
                    <ChevronDown size={18} color="#9ca3af" />
                </View>
                <Text className="font-syne text-[11px] text-[#6b7280]">City filtering needs artist locations, which aren&apos;t available yet.</Text>
            </View>
        </>
    );
}
