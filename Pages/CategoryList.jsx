

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Animated,
    Dimensions,
    Image,
    FlatList,
    ScrollView,
    Platform, ImageBackground
} from 'react-native';

import CustomBottomTab from './CustomBottomTab';


const { width } = Dimensions.get('window');
const COL_W = (width - 48) / 2;   // 2-col category card
const PRODUCT_CARD_W = width * 0.44;       // horizontal product card

// ─── Colors ───────────────────────────────────────────────────────────────────
const C = {
    amber: '#F5A623',
    amberDark: '#D4881A',
    amberLight: '#FFF0D6',
    amberSoft: '#FEF3E2',
    orange: '#FF6B35',
    cream: '#FFF8EF',
    creamDeep: '#F5ECD9',
    white: '#FFFFFF',
    textDark: '#1C1C1E',
    textMid: '#3C3C43',
    textMuted: '#8E8E93',
    border: '#F0E6D6',
    navy: '#1A1A2E',
    success: '#34C759',
    green: '#1E8A3C',
    danger: '#FF3B30',
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
    { id: '1', name: 'Baked Good', count: 42, image: require('../Assets/Grocery.png'), bg: '#FFF3E0', border: '#FFD180' },

    { id: '2', name: 'Beef', count: 87, image: require('../Assets/Grocery.png'), bg: '#FFF0F0', border: '#FFCDD2' },
    { id: '3', name: 'Beverages', count: 65, image: require('../Assets/Grocery.png'), bg: '#E8F5FD', border: '#B3E5FC' },
    { id: '4', name: 'Canned Goods', count: 34, image: require('../Assets/Grocery.png'), bg: '#F0F8F0', border: '#C8E6C9' },
    { id: '5', name: 'Chicken', count: 61, image: require('../Assets/Grocery.png'), bg: '#FFF5E6', border: '#FFD180' },
    { id: '6', name: 'Dairy', count: 58, image: require('../Assets/Grocery.png'), bg: '#F8F0FF', border: '#E1BEE7' },
    { id: '7', name: 'Deli Meats', count: 76, image: require('../Assets/Grocery.png'), bg: '#FFF0F0', border: '#FFCDD2' },
    { id: '8', name: 'Dry Goods', count: 29, image: require('../Assets/Grocery.png'), bg: '#FFFBF0', border: '#FFE082' },
    { id: '9', name: 'Eggs', count: 53, image: require('../Assets/Grocery.png'), bg: '#FFFDE7', border: '#FFF176' },
    { id: '10', name: 'French Fries', count: 77, image: require('../Assets/Grocery.png'), bg: '#FFF8E1', border: '#FFECB3' },
    { id: '11', name: 'Lamb & Veal', count: 47, image: require('../Assets/Grocery.png'), bg: '#F3E5F5', border: '#CE93D8' },
    { id: '12', name: 'Lard & Oils', count: 63, image: require('../Assets/Grocery.png'), bg: '#F1F8E9', border: '#C5E1A5' },
    { id: '13', name: 'Soups', count: 69, image: require('../Assets/Grocery.png'), bg: '#FFF3E0', border: '#FFCC80' },
    { id: '14', name: 'Specialty Meats', count: 44, image: require('../Assets/Grocery.png'), bg: '#FCE4EC', border: '#F48FB1' },
    { id: '15', name: 'Spices & Sauces', count: 79, image: require('../Assets/Grocery.png'), bg: '#FFF0F0', border: '#FFCDD2' },
    { id: '16', name: 'Tortillas', count: 32, image: require('../Assets/Grocery.png'), bg: '#FFF8E1', border: '#FFE082' },
    { id: '17', name: 'Turkey', count: 58, image: require('../Assets/Grocery.png'), bg: '#FFF5E6', border: '#FFD180' },
    { id: '18', name: 'Seafood', count: 51, image: require('../Assets/Grocery.png'), bg: '#E8F4FD', border: '#90CAF9' },
];

const PRODUCTS = [
    { id: '1', name: 'Fresh Chicken', weight: '1 kg', price: 189, originalPrice: 225, discount: 15, image: require('../Assets/Grocery.png'), bg: '#FFF5E6', tag: 'Best Seller' },
    { id: '2', name: 'Beef Boneless', weight: '500 g', price: 329, originalPrice: 411, discount: 20, image: require('../Assets/Grocery.png'), bg: '#FFF0F0', tag: 'Premium' },
    { id: '3', name: 'Farm Eggs', weight: '12 pcs', price: 89, originalPrice: 105, discount: 10, image: require('../Assets/Grocery.png'), bg: '#FFFBF0', tag: 'Farm Fresh' },
    { id: '4', name: 'Salmon Fillet', weight: '300 g', price: 449, originalPrice: 520, discount: 14, image: require('../Assets/Grocery.png'), bg: '#E8F4FD', tag: 'New' },
    { id: '5', name: 'Mutton Chops', weight: '500 g', price: 520, originalPrice: 610, discount: 15, image: require('../Assets/Grocery.png'), bg: '#FFF5E6', tag: 'Popular' },
    { id: '6', name: 'Greek Yogurt', weight: '400 g', price: 119, originalPrice: 145, discount: 18, image: require('../Assets/Grocery.png'), bg: '#F8F0FF', tag: 'Healthy' },
    { id: '7', name: 'Tiger Prawns', weight: '250 g', price: 380, originalPrice: 440, discount: 14, image: require('../Assets/Grocery.png'), bg: '#FFF3E0', tag: 'Fresh' },
    { id: '8', name: 'Goat Cheese', weight: '200 g', price: 220, originalPrice: 260, discount: 15, image: require('../Assets/Grocery.png'), bg: '#F8F0FF', tag: 'Artisan' },
];

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ cartCount }) {
    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <View style={styles.logoRing}>
                    <Image source={require('../Assets/logo.png')} style={styles.logoImg} resizeMode="contain" />
                </View>
                <View>
                    <Text style={styles.logoName}>AlohaMart</Text>
                    <Text style={styles.logoSub}>Fresh • Fast • Trusted</Text>
                </View>
            </View>
            <View style={styles.headerRight}>
                <TouchableOpacity style={styles.iconBtn} activeOpacity={0.75}>
                    <Image source={require('../Assets/bell.png')} style={styles.iconImg} resizeMode="contain" />
                    <View style={styles.notifDot} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.iconBtn, styles.cartIconBtn]} activeOpacity={0.75}>
                    <Image source={require('../Assets/cart.png')} style={styles.iconImg} resizeMode="contain" />
                    {cartCount > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{cartCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
function Breadcrumb({ onBack }) {
    return (
        <View style={styles.breadcrumb}>
            <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.breadcrumbItem}>
                <Text style={styles.breadcrumbLink}>Home</Text>
            </TouchableOpacity>
            <Text style={styles.breadcrumbSep}>›</Text>
            <Text style={styles.breadcrumbActive}>All Categories</Text>
        </View>
    );
}

// ─── Category Card ────────────────────────────────────────────────────────────
function CategoryCard({ item, index, onPress }) {
    const slideAnim = useRef(new Animated.Value(20)).current;
    const opacAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0, duration: 320,
                delay: index * 45,
                useNativeDriver: true,
            }),
            Animated.timing(opacAnim, {
                toValue: 1, duration: 320,
                delay: index * 45,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const pressIn = () => Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
    const pressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

    return (
        <Animated.View style={[
            styles.categoryCard,
            { opacity: opacAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
        ]}>
            <TouchableOpacity
                activeOpacity={1}
                onPressIn={pressIn}
                onPressOut={pressOut}
                onPress={() => onPress && onPress(item)}
                style={styles.categoryCardInner}
            >
                {/* Thumbnail */}
                <ImageBackground
                    source={item.image}
                    style={styles.catThumb}
                    imageStyle={styles.catThumbImage}
                >
                </ImageBackground>

                {/* Text */}
                <View style={styles.catInfo}>
                    <Text style={styles.catName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.catCount}>{item.count}+ items</Text>
                </View>

                {/* Arrow */}
                <View style={styles.catArrowCircle}>
                    <Text style={styles.catArrow}>›</Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── Product Card (Horizontal scroll) ────────────────────────────────────────
function ProductCard({ item, index }) {
    const [qty, setQty] = useState(0);
    const slideAnim = useRef(new Animated.Value(40)).current;
    const opacAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 0, duration: 380, delay: index * 80, useNativeDriver: true }),
            Animated.timing(opacAnim, { toValue: 1, duration: 380, delay: index * 80, useNativeDriver: true }),
        ]).start();
    }, []);

    const pressIn = () => Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
    const pressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

    const savings = item.originalPrice - item.price;

    return (
        <Animated.View style={[
            styles.productCard,
            { opacity: opacAnim, transform: [{ translateX: slideAnim }, { scale: scaleAnim }] },
        ]}>
            <TouchableOpacity activeOpacity={1} onPressIn={pressIn} onPressOut={pressOut}>
                {/* Discount badge */}
                <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{item.discount}%{'\n'}OFF</Text>
                </View>



                {/* Image area */}
                <ImageBackground
                    source={item.image}
                    style={styles.productImageArea}
                    imageStyle={styles.productBackgroundImage}
                >
                    <View style={styles.tagPill}>
                        <Text style={styles.tagPillText}>{item.tag}</Text>
                    </View>
                </ImageBackground>

                {/* Info */}
                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.productWeight}>{item.weight}</Text>

                    <View style={styles.priceRow}>
                        <Text style={styles.priceNow}>₹{item.price}</Text>
                        <Text style={styles.priceOld}>₹{item.originalPrice}</Text>
                    </View>



                    {qty === 0 ? (
                        <TouchableOpacity style={styles.addBtn} onPress={() => setQty(1)} activeOpacity={0.85}>
                            <Text style={styles.addBtnText}>Add to Cart  +</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.qtyRow}>
                            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.max(0, q - 1))} activeOpacity={0.8}>
                                <Text style={styles.qtyBtnText}>−</Text>
                            </TouchableOpacity>
                            <View style={styles.qtyDisplay}>
                                <Text style={styles.qtyText}>{qty}</Text>
                            </View>
                            <TouchableOpacity style={[styles.qtyBtn, styles.qtyBtnPlus]} onPress={() => setQty(q => q + 1)} activeOpacity={0.8}>
                                <Text style={[styles.qtyBtnText, { color: C.white }]}>+</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── Recommended Section ──────────────────────────────────────────────────────
function RecommendedSection() {
    const flatRef = useRef(null);
    const currentIndex = useRef(0);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(true);

    const scrollTo = (dir) => {
        const nextIdx = Math.max(0, Math.min(PRODUCTS.length - 1, currentIndex.current + dir));
        currentIndex.current = nextIdx;
        flatRef.current?.scrollToIndex({ index: nextIdx, animated: true, viewPosition: 0 });
        setCanLeft(nextIdx > 0);
        setCanRight(nextIdx < PRODUCTS.length - 1);
    };

    const renderProduct = useCallback(({ item, index }) => (
        <ProductCard item={item} index={index} />
    ), []);

    return (
        <View style={styles.recommendSection}>
            {/* Section header with nav arrows */}
            <View style={styles.recommendHeader}>
                <View>
                    <Text style={styles.recommendTitle}>Recommended for you</Text>
                    <Text style={styles.recommendSub}>Based on your preferences</Text>
                </View>
                <View style={styles.navArrowsRow}>
                    <TouchableOpacity
                        style={[styles.navArrowBtn, !canLeft && styles.navArrowBtnDisabled]}
                        onPress={() => scrollTo(-1)}
                        activeOpacity={canLeft ? 0.75 : 1}
                    >
                        <Text style={[styles.navArrowText, !canLeft && styles.navArrowTextDisabled]}>‹</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.navArrowBtn, !canRight && styles.navArrowBtnDisabled]}
                        onPress={() => scrollTo(1)}
                        activeOpacity={canRight ? 0.75 : 1}
                    >
                        <Text style={[styles.navArrowText, !canRight && styles.navArrowTextDisabled]}>›</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                ref={flatRef}
                data={PRODUCTS}
                renderItem={renderProduct}
                keyExtractor={item => `rec-${item.id}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productList}
                onScrollToIndexFailed={() => { }}
                snapToInterval={PRODUCT_CARD_W + 12}
                decelerationRate="fast"
            />
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CategoryList({ navigation }) {
    const [search, setSearch] = useState('');
    const [cartCount, setCartCount] = useState(3);
    const [activeTab, setActiveTab] = useState('Category');


    const filtered = search.trim()
        ? CATEGORIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
        : CATEGORIES;

    // Pair categories into rows of 2
    const rows = [];
    for (let i = 0; i < filtered.length; i += 2) {
        rows.push(filtered.slice(i, i + 2));
    }

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor={C.white} />

            {/* Header */}
            <Header cartCount={cartCount} />

            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                    paddingBottom: 80,
                }}
            >
                {/* Breadcrumb */}
                <Breadcrumb onBack={() => navigation?.goBack()} />

                {/* Page title */}


                {/* Category search */}
                <View style={styles.catSearchBar}>
                    <Image
                        source={require('../Assets/search.png')}
                        style={styles.catSearchIcon}
                        resizeMode="contain"
                    />
                    <TextInput
                        style={styles.catSearchInput}
                        placeholder="Search categories..."
                        placeholderTextColor={C.textMuted}
                        value={search}
                        onChangeText={setSearch}
                        returnKeyType="search"
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')} style={styles.catSearchClear}>
                            <Text style={styles.catSearchClearText}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Results count */}
                {search.trim() !== '' && (
                    <Text style={styles.resultsText}>
                        {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
                    </Text>
                )}

                {/* Category grid — 2 columns */}
                <View style={styles.categoryGrid}>
                    {rows.map((row, rowIdx) => (
                        <View key={rowIdx} style={styles.categoryRow}>
                            {row.map((item, colIdx) => (
                                <CategoryCard
                                    key={item.id}
                                    item={item}
                                    index={rowIdx * 2 + colIdx}
                                    onPress={(cat) => navigation?.navigate('CategoryDetail', { category: cat })}
                                />
                            ))}
                            {/* Placeholder if odd */}
                            {row.length === 1 && <View style={styles.categoryCardPlaceholder} />}
                        </View>
                    ))}
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Recommended for you */}
                <RecommendedSection />

                <View style={{ height: 40 }} />
            </ScrollView>


            <CustomBottomTab
                activeTab={activeTab}
                cartCount={cartCount}
                onTabPress={(tab) => {
                    setActiveTab(tab);

                    switch (tab) {
                        case 'Home':
                            navigation.navigate('Dashboard');
                            break;

                        case 'Category':
                            navigation.navigate('CategoryList');
                            break;

                        case 'Cart':
                            navigation.navigate('CartScreen');
                            break;



                        case 'Profile':
                            navigation.navigate('Profile');
                            break;
                    }
                }}
            />
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: C.white,
    },
    scroll: {
        flex: 1,
        backgroundColor: C.cream,
    },

    // ── Header ──────────────────────────────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: C.white,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 4,
        marginTop: 40
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logoRing: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: C.amberSoft,
        borderWidth: 2,
        borderColor: C.amberLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoImg: {
        width: 28,
        height: 28,
    },
    catImage: {
        width: 42,
        height: 42,
    },
    productBackgroundImage: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },

    productImageArea: {
        height: 120,
        justifyContent: 'flex-end',
    },
    logoName: {
        fontSize: 16,
        fontWeight: '800',
        color: C.textDark,
        letterSpacing: 0.4,
    },
    logoSub: {
        fontSize: 10,
        color: C.amber,
        fontWeight: '600',
        letterSpacing: 0.6,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 8,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: C.creamDeep,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    cartIconBtn: {
        backgroundColor: C.amberSoft,
        borderWidth: 1.5,
        borderColor: C.amberLight,
    },
    iconImg: {
        width: 20,
        height: 20,
        tintColor: C.textDark,
    },
    notifDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: C.danger,
        borderWidth: 1.5,
        borderColor: C.white,
    },
    cartBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        minWidth: 17,
        height: 17,
        borderRadius: 9,
        backgroundColor: C.orange,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: C.white,
        paddingHorizontal: 3,
    },
    cartBadgeText: {
        fontSize: 9,
        color: C.white,
        fontWeight: '900',
    },

    // ── Breadcrumb ───────────────────────────────────────────────────────────
    breadcrumb: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 4,
        gap: 6,
    },
    breadcrumbItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    breadcrumbLink: {
        fontSize: 13,
        color: C.amber,
        fontWeight: '600',
    },
    breadcrumbSep: {
        fontSize: 15,
        color: C.textMuted,
        fontWeight: '400',
    },
    breadcrumbActive: {
        fontSize: 13,
        color: C.textMuted,
        fontWeight: '500',
    },

    // ── Page Header ──────────────────────────────────────────────────────────
    pageHeader: {
        paddingHorizontal: 16,

        paddingBottom: 16,
    },
    pageTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: C.textDark,
        letterSpacing: 0.2,
        marginBottom: 5,
    },
    pageSubtitle: {
        fontSize: 13,
        color: C.textMuted,
        lineHeight: 19,
        fontWeight: '400',
    },

    // ── Category Search ──────────────────────────────────────────────────────
    catSearchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 6,
        backgroundColor: C.white,
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 48,
        borderWidth: 1.5,
        borderColor: C.border,
        shadowColor: '#B8762A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    catSearchIcon: {
        width: 18,
        height: 18,
        tintColor: C.textMuted,
        marginRight: 10,
    },
    catSearchInput: {
        flex: 1,
        fontSize: 14,
        color: C.textDark,
    },
    catSearchClear: {
        padding: 4,
    },
    catSearchClearText: {
        fontSize: 14,
        color: C.textMuted,
        fontWeight: '600',
    },
    resultsText: {
        fontSize: 12,
        color: C.textMuted,
        paddingHorizontal: 18,
        marginBottom: 8,
        fontStyle: 'italic',
    },

    // ── Category Grid ────────────────────────────────────────────────────────
    categoryGrid: {
        paddingHorizontal: 16,
        paddingTop: 12,
        gap: 10,
    },
    categoryRow: {
        flexDirection: 'row',
        gap: 10,
    },
    categoryCardPlaceholder: {
        width: COL_W,
    },
    categoryCard: {
        width: COL_W,
        backgroundColor: C.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: C.border,
        shadowColor: '#B8762A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    categoryCardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        gap: 10,
    },
    catThumb: {
        width: 52,
        height: 52,
        borderRadius: 12,
        overflow: 'hidden',
    },
    catThumbImage: {
        borderRadius: 12,
    },
    catEmoji: {
        fontSize: 26,
    },
    catInfo: {
        flex: 1,
    },
    catName: {
        fontSize: 13,
        fontWeight: '700',
        color: C.textDark,
        marginBottom: 3,
    },
    catCount: {
        fontSize: 11,
        color: C.textMuted,
        fontWeight: '500',
    },
    catArrowCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: C.amberLight,
        flexShrink: 0,
    },
    catArrow: {
        fontSize: 16,
        color: C.textMuted,
        fontWeight: '800',
        lineHeight: 20,
    },

    // ── Divider ──────────────────────────────────────────────────────────────
    divider: {
        height: 8,
        backgroundColor: C.creamDeep,
        marginTop: 24,
    },

    // ── Recommended Section ──────────────────────────────────────────────────
    recommendSection: {
        paddingTop: 20,
    },
    recommendHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    recommendTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: C.textDark,
        letterSpacing: 0.2,
    },
    recommendSub: {
        fontSize: 12,
        color: C.textMuted,
        marginTop: 2,
    },
    navArrowsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    navArrowBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: C.amberSoft,
        borderWidth: 1.5,
        borderColor: C.amberLight,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: C.amber,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 4,
        elevation: 3,
    },
    navArrowBtnDisabled: {
        backgroundColor: C.creamDeep,
        borderColor: C.border,
        shadowOpacity: 0,
        elevation: 0,
    },
    navArrowText: {
        fontSize: 22,
        color: C.amberDark,
        fontWeight: '800',
        lineHeight: 26,
    },
    navArrowTextDisabled: {
        color: C.textMuted,
    },
    productList: {
        paddingLeft: 16,
        paddingRight: 10,
        paddingBottom: 8,
    },

    // ── Product Card ─────────────────────────────────────────────────────────
    productCard: {
        width: PRODUCT_CARD_W,
        backgroundColor: C.white,
        borderRadius: 20,
        marginRight: 12,
        overflow: 'hidden',
        shadowColor: '#B8762A',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.11,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: C.border,
    },
    discountBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 10,
        backgroundColor: C.orange,
        borderRadius: 10,
        paddingHorizontal: 7,
        paddingVertical: 4,
        alignItems: 'center',
    },
    discountText: {
        fontSize: 9,
        color: C.white,
        fontWeight: '900',
        textAlign: 'center',
        lineHeight: 12,
    },
    wishlistBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: C.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 4,
        elevation: 3,
    },
    wishlistIcon: {
        fontSize: 14,
        color: C.danger,
        fontWeight: '700',
    },
    productImageArea: {
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    productEmoji: {
        fontSize: 56,
    },
    tagPill: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(255,255,255,0.90)',
        borderRadius: 8,
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: C.amberLight,
    },
    tagPillText: {
        fontSize: 9,
        color: C.amberDark,
        fontWeight: '800',
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '700',
        color: C.textDark,
        marginBottom: 2,
    },
    productWeight: {
        fontSize: 11,
        color: C.textMuted,
        fontWeight: '500',
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
        marginBottom: 6,
    },
    priceNow: {
        fontSize: 17,
        fontWeight: '900',
        color: C.textDark,
    },
    priceOld: {
        fontSize: 12,
        color: C.textMuted,
        textDecorationLine: 'line-through',
    },
    savingsPill: {
        backgroundColor: '#EEF8F1',
        borderRadius: 7,
        paddingHorizontal: 7,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#C3E6CB',
    },
    savingsText: {
        fontSize: 10,
        color: C.green,
        fontWeight: '700',
    },
    addBtn: {
        backgroundColor: C.amber,
        borderRadius: 11,
        paddingVertical: 10,
        alignItems: 'center',
        shadowColor: C.amber,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 5,
    },
    addBtnText: {
        fontSize: 12,
        color: C.white,
        fontWeight: '800',
        letterSpacing: 0.2,
    },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 11,
        borderWidth: 1.5,
        borderColor: C.amberLight,
        overflow: 'hidden',
        height: 38,
    },
    qtyBtn: {
        width: 38,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.amberSoft,
    },
    qtyBtnPlus: {
        backgroundColor: C.amber,
    },
    qtyBtnText: {
        fontSize: 18,
        fontWeight: '700',
        color: C.amberDark,
        lineHeight: 22,
    },
    qtyDisplay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyText: {
        fontSize: 15,
        fontWeight: '800',
        color: C.textDark,
    },
});
