
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    FlatList,
    TextInput,
    Image,
    Animated,
    Platform,
    Alert,
    Dimensions,
} from 'react-native';

import CustomBottomTab from './CustomBottomTab';

const { width } = Dimensions.get('window');

// ─── Colors ───────────────────────────────────────────────────────────────────
const C = {
    primary: '#FF7043',
    amber: '#F5A623',
    amberDark: '#D4881A',
    amberLight: '#FFF0D6',
    amberSoft: '#FEF3E2',
    cream: '#FFF8F0',
    creamDeep: '#F5ECD9',
    white: '#FFFFFF',
    textDark: '#1C1C1E',
    textMid: '#3C3C43',
    textMuted: '#8E8E93',
    border: '#F0E6D6',
    danger: '#FF3B30',
    success: '#4CAF50',
    successLight: '#E8F5E9',
    successDark: '#1E8A3C',
    navy: '#1A1A2E',
    navyMid: '#2C2C4A',
};

// ─── Valid Coupon Codes ───────────────────────────────────────────────────────
const VALID_COUPONS = {
    SAVE50: 50,
    FRESH100: 100,
    ALOHA20: 20,
};

// ─── Default Items (replace / merge with your real cart state) ────────────────
const DEFAULT_ITEMS = [
    {
        id: '1',
        name: 'Fresh Chicken',
        weight: '1 kg',
        price: 189,
        originalPrice: 225,
        discount: 15,
        tag: 'Best Seller',
        bg: '#FFF5E6',
        qty: 9,
        image: require('../Assets/Grocery.png'),
    },
    {
        id: '2',
        name: 'Lamb Chops',
        weight: '500 g',
        price: 520,
        originalPrice: 610,
        discount: 15,
        tag: 'Premium',
        bg: '#FFF0F0',
        qty: 3,
        image: require('../Assets/Grocery.png'),
    },
    {
        id: '3',
        name: 'Soy Nuggets',
        weight: '960 g',
        price: 115,
        originalPrice: 138,
        discount: 17,
        tag: 'Farm Fresh',
        bg: '#F0F8F0',
        qty: 2,
        image: require('../Assets/Grocery.png'),
    },
    {
        id: '4',
        name: 'Farm Eggs',
        weight: '12 pcs',
        price: 89,
        originalPrice: 105,
        discount: 10,
        tag: 'Organic',
        bg: '#FFFBF0',
        qty: 1,
        image: require('../Assets/Grocery.png'),
    },
];

// ─── Free Delivery Bar ────────────────────────────────────────────────────────
const FREE_DELIVERY_MIN = 500;

function FreeDeliveryBar({ paidTotal }) {
    const progress = Math.min(1, paidTotal / FREE_DELIVERY_MIN);
    const amountLeft = Math.max(0, FREE_DELIVERY_MIN - paidTotal);
    const widthAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(widthAnim, {
            toValue: progress,
            duration: 600,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    if (amountLeft === 0) {
        return (
            <View style={[styles.freeDelBar, { borderColor: '#A5D6A7', backgroundColor: C.successLight }]}>
                <Text style={styles.freeDelEmoji}>🎉</Text>
                <Text style={[styles.freeDelText, { color: C.successDark }]}>
                    You unlocked FREE delivery!
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.freeDelBar}>
            <Text style={styles.freeDelEmoji}>🚚</Text>
            <View style={{ flex: 1 }}>
                <Text style={styles.freeDelText}>
                    Add{' '}
                    <Text style={styles.freeDelHighlight}>₹{amountLeft}</Text>
                    {' '}more for FREE delivery
                </Text>
                <View style={styles.progressTrack}>
                    <Animated.View
                        style={[
                            styles.progressFill,
                            {
                                width: widthAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', '100%'],
                                }),
                            },
                        ]}
                    />
                </View>
            </View>
            <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
        </View>
    );
}

// ─── Cart Item Row ────────────────────────────────────────────────────────────
function CartItemRow({ item, index, onUpdateQty, onRemove }) {
    const slideAnim = useRef(new Animated.Value(40)).current;
    const opacAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0, duration: 360,
                delay: index * 70,
                useNativeDriver: true,
            }),
            Animated.timing(opacAnim, {
                toValue: 1, duration: 360,
                delay: index * 70,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleDelete = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, { toValue: 0.85, duration: 160, useNativeDriver: true }),
            Animated.timing(opacAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]).start(() => onRemove(item.id));
    };

    const itemTotal = item.price * item.qty;
    const savings = (item.originalPrice - item.price) * item.qty;

    return (
        <Animated.View
            style={[
                styles.cartItem,
                {
                    opacity: opacAnim,
                    transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
                },
            ]}
        >
            {/* Image */}
            <View style={[styles.itemImgBox, { backgroundColor: item.bg || C.amberSoft }]}>
                <Image source={item.image} style={styles.itemImg} resizeMode="cover" />
            </View>

            {/* Details */}
            <View style={styles.itemBody}>
                {/* Top row — name + delete */}
                <View style={styles.itemTopRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                        <View style={styles.itemMetaRow}>
                            <Text style={styles.itemWeight}>{item.weight}</Text>
                            {item.tag ? (
                                <View style={styles.itemTagPill}>
                                    <Text style={styles.itemTagText}>{item.tag}</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={handleDelete}
                        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.deleteIcon}>🗑</Text>
                    </TouchableOpacity>
                </View>

                {/* Bottom row — price + qty */}
                <View style={styles.itemBottomRow}>
                    <View>
                        <Text style={styles.itemTotal}>₹{itemTotal}</Text>
                        <Text style={styles.itemUnit}>₹{item.price} / unit</Text>
                        {savings > 0 && (
                            <Text style={styles.itemSaving}>Save ₹{savings}</Text>
                        )}
                    </View>

                    {/* Qty controls */}
                    <View style={styles.qtyWrap}>
                        <TouchableOpacity
                            style={styles.qtyMinus}
                            onPress={() => onUpdateQty(item.id, item.qty - 1)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.qtyMinusText}>−</Text>
                        </TouchableOpacity>
                        <View style={styles.qtyNumBox}>
                            <Text style={styles.qtyNum}>{item.qty}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.qtyPlus}
                            onPress={() => onUpdateQty(item.id, item.qty + 1)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.qtyPlusText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyCart({ onShop }) {
    const bounceAnim = useRef(new Animated.Value(0.7)).current;
    const opacAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(bounceAnim, { toValue: 1, tension: 45, friction: 6, useNativeDriver: true }),
            Animated.timing(opacAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <Animated.View style={[styles.emptyWrap, { opacity: opacAnim }]}>
            <Animated.Text
                style={[styles.emptyEmoji, { transform: [{ scale: bounceAnim }] }]}
            >
                🛒
            </Animated.Text>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySub}>
                Looks like you haven't added anything yet.{'\n'}Start exploring fresh groceries!
            </Text>
            <TouchableOpacity style={styles.shopNowBtn} onPress={onShop} activeOpacity={0.85}>
                <Text style={styles.shopNowText}>Start Shopping  →</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── Coupon Section ───────────────────────────────────────────────────────────
function CouponSection({ couponCode, setCouponCode, couponApplied, couponDiscount, onApply, onRemove }) {
    return (
        <View style={styles.couponCard}>
            {couponApplied ? (
                <View style={styles.couponAppliedRow}>
                    <Text style={{ fontSize: 22 }}>🎟️</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.couponAppliedCode}>{couponCode.toUpperCase()}</Text>
                        <Text style={styles.couponAppliedSave}>Saving ₹{couponDiscount} on this order</Text>
                    </View>
                    <TouchableOpacity style={styles.couponRemoveBtn} onPress={onRemove} activeOpacity={0.8}>
                        <Text style={styles.couponRemoveText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.couponInputRow}>
                    <Text style={{ fontSize: 20 }}>🏷️</Text>
                    <TextInput
                        style={styles.couponInput}
                        placeholder="Enter coupon code"
                        placeholderTextColor={C.textMuted}
                        value={couponCode}
                        onChangeText={setCouponCode}
                        autoCapitalize="characters"
                        returnKeyType="done"
                        onSubmitEditing={onApply}
                    />
                    <TouchableOpacity
                        style={[styles.applyBtn, !couponCode.trim() && styles.applyBtnOff]}
                        onPress={onApply}
                        disabled={!couponCode.trim()}
                        activeOpacity={0.85}
                    >
                        <Text style={[styles.applyBtnText, !couponCode.trim() && { color: C.textMuted }]}>
                            Apply
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

// ─── Bill Summary ─────────────────────────────────────────────────────────────
function BillSummary({ subtotal, discount, deliveryFee, couponDiscount, finalTotal }) {
    const rows = [
        {
            label: 'Subtotal (MRP)',
            value: `₹${subtotal}`,
            valueColor: C.textDark,
        },
        {
            label: 'Product Discount',
            value: `− ₹${discount}`,
            valueColor: C.successDark,
        },
        {
            label: 'Delivery Charges',
            value: deliveryFee === 0 ? 'FREE 🎉' : `₹${deliveryFee}`,
            valueColor: deliveryFee === 0 ? C.successDark : C.textDark,
        },
        {
            label: 'Coupon Savings',
            value: couponDiscount > 0 ? `− ₹${couponDiscount}` : '—',
            valueColor: couponDiscount > 0 ? C.successDark : C.textMuted,
        },
    ];

    const totalSavings = discount + couponDiscount + (deliveryFee === 0 ? 40 : 0);

    return (
        <View style={styles.billCard}>
            {/* Title */}
            <View style={styles.billTitleRow}>
                <Text style={styles.billTitleEmoji}>🧾</Text>
                <Text style={styles.billTitle}>Bill Summary</Text>
            </View>

            {/* Rows */}
            {rows.map((row, i) => (
                <View key={i} style={styles.billRow}>
                    <Text style={styles.billLabel}>{row.label}</Text>
                    <Text style={[styles.billValue, { color: row.valueColor }]}>{row.value}</Text>
                </View>
            ))}

            {/* Divider */}
            <View style={styles.billDivider} />

            {/* Total */}
            <View style={styles.billTotalRow}>
                <View>
                    <Text style={styles.billTotalLabel}>Total Payable</Text>
                    {totalSavings > 0 && (
                        <Text style={styles.billTotalSaving}>🎉 You save ₹{totalSavings} on this order!</Text>
                    )}
                </View>
                <Text style={styles.billTotalValue}>₹{finalTotal}</Text>
            </View>
        </View>
    );
}

// ─── Bottom Tab Bar ───────────────────────────────────────────────────────────

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CartScreen({ navigation, route }) {
    // ── State ──
    // If you use a global CartContext, replace this with useCart() instead.
    const [items, setItems] = useState(
        route?.params?.initialItems ?? DEFAULT_ITEMS
    );
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponApplied, setCouponApplied] = useState(false);

    const [activeTab, setActiveTab] = useState('Cart');


    // ── Calculations ──
    const subtotal = items.reduce((s, i) => s + i.originalPrice * i.qty, 0);
    const discount = items.reduce((s, i) => s + (i.originalPrice - i.price) * i.qty, 0);
    const paidTotal = subtotal - discount;
    const deliveryFee = paidTotal >= FREE_DELIVERY_MIN ? 0 : 40;
    const cartTotal = paidTotal + deliveryFee;
    const finalTotal = cartTotal - couponDiscount;
    const cartCount = items.reduce((s, i) => s + i.qty, 0);

    // ── Handlers ──
    const handleUpdateQty = useCallback((id, qty) => {
        if (qty <= 0) {
            setItems((prev) => prev.filter((i) => i.id !== id));
        } else {
            setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
        }
    }, []);

    const handleRemove = useCallback((id) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    }, []);

    const handleClearAll = () => {
        Alert.alert('Clear Cart', 'Remove all items?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Clear All',
                style: 'destructive',
                onPress: () => {
                    setItems([]);
                    setCouponCode('');
                    setCouponDiscount(0);
                    setCouponApplied(false);
                },
            },
        ]);
    };

    const handleApplyCoupon = () => {
        const code = couponCode.trim().toUpperCase();
        if (VALID_COUPONS[code]) {
            setCouponDiscount(VALID_COUPONS[code]);
            setCouponApplied(true);
        } else {
            Alert.alert('Invalid Coupon', 'Try: SAVE50, FRESH100, or ALOHA20');
        }
    };

    const handleRemoveCoupon = () => {
        setCouponCode('');
        setCouponDiscount(0);
        setCouponApplied(false);
    };

    const handleTabPress = (tab) => {
        switch (tab) {
            case 'Home': navigation.navigate('Dashboard'); break;
            case 'Category': navigation.navigate('CategoryList'); break;
            case 'Cart':
                navigation.navigate('CartScreen');
                break;
            case 'Profile': navigation.navigate('Profile'); break;
        }
    };

    // ── Render item ──
    const renderItem = useCallback(({ item, index }) => (
        <CartItemRow
            item={item}
            index={index}
            onUpdateQty={handleUpdateQty}
            onRemove={handleRemove}
        />
    ), [handleUpdateQty, handleRemove]);

    // ── Footer (bill + coupon + CTA) ──
    const ListFooter = (
        <View style={styles.footerBlock}>
            {/* Coupon */}
            <CouponSection
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                couponApplied={couponApplied}
                couponDiscount={couponDiscount}
                onApply={handleApplyCoupon}
                onRemove={handleRemoveCoupon}
            />

            {/* Bill Summary */}
            <BillSummary
                subtotal={subtotal}
                discount={discount}
                deliveryFee={deliveryFee}
                couponDiscount={couponDiscount}
                finalTotal={finalTotal}
            />

            {/* Checkout Button */}
            <TouchableOpacity
                style={styles.checkoutBtn}
                activeOpacity={0.88}
                onPress={() => Alert.alert('Proceeding to Checkout', `Total: ₹${finalTotal}`)}
            >
                <View>
                    <Text style={styles.checkoutTotal}>₹{finalTotal}</Text>
                    <Text style={styles.checkoutSub}>
                        {cartCount} item{cartCount !== 1 ? 's' : ''}
                        {couponDiscount > 0 ? '  ·  Coupon applied ✓' : ''}
                    </Text>
                </View>
                <View style={styles.checkoutRight}>
                    <Text style={styles.checkoutLabel}>Proceed to Checkout</Text>
                    <Text style={styles.checkoutArrow}>→</Text>
                </View>
            </TouchableOpacity>

            <View style={{ height: 110 }} />
        </View>
    );

    // ── Header ──
    const headerAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(headerAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    }, []);

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor={C.white} />

            {/* Header */}
            <Animated.View style={[styles.header, { opacity: headerAnim }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.backArrow}>‹</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Your Cart</Text>
                    {cartCount > 0 && (
                        <View style={styles.headerBadge}>
                            <Text style={styles.headerBadgeText}>{cartCount} Items</Text>
                        </View>
                    )}
                </View>
                {items.length > 0 && (
                    <TouchableOpacity onPress={handleClearAll} activeOpacity={0.7}>
                        <Text style={styles.clearAllText}>Clear All</Text>
                    </TouchableOpacity>
                )}
            </Animated.View>

            {/* Empty State */}
            {items.length === 0 ? (
                <EmptyCart onShop={() => navigation.navigate('Dashboard')} />
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        <FreeDeliveryBar paidTotal={paidTotal} />
                    }
                    ListFooterComponent={ListFooter}
                />
            )}

            {/* Bottom Tab Bar */}

            <CustomBottomTab
                activeTab='Cart'
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
        backgroundColor: C.cream,
    },

    // ── Header ────────────────────────────────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 13,
        backgroundColor: C.white,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 5,
        marginTop: Platform.OS === 'android' ? 30 : 0,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: C.amberSoft,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: C.amberLight,
    },
    backArrow: {
        fontSize: 26,
        color: C.primary,
        fontWeight: '700',
        lineHeight: 30,
        marginTop: -2,
    },
    headerTitle: {
        fontSize: 19,
        fontWeight: '900',
        color: C.textDark,
        letterSpacing: 0.2,
    },
    headerBadge: {
        backgroundColor: C.primary,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    headerBadgeText: {
        fontSize: 11,
        color: C.white,
        fontWeight: '800',
    },
    clearAllText: {
        fontSize: 13,
        color: C.danger,
        fontWeight: '700',
    },

    // ── List ──────────────────────────────────────────────────────────────────
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 14,
    },

    // ── Free Delivery Bar ─────────────────────────────────────────────────────
    freeDelBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: C.white,
        borderRadius: 14,
        padding: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#C8E6C9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    freeDelEmoji: {
        fontSize: 20,
    },
    freeDelText: {
        fontSize: 12,
        color: C.textMid,
        fontWeight: '600',
        marginBottom: 6,
    },
    freeDelHighlight: {
        color: C.successDark,
        fontWeight: '900',
    },
    progressTrack: {
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: C.success,
        borderRadius: 3,
    },
    progressPct: {
        fontSize: 11,
        fontWeight: '900',
        color: C.successDark,
        minWidth: 32,
        textAlign: 'right',
    },

    // ── Cart Item ─────────────────────────────────────────────────────────────
    cartItem: {
        flexDirection: 'row',
        backgroundColor: C.white,
        borderRadius: 20,
        padding: 13,
        marginBottom: 11,
        borderWidth: 1,
        borderColor: C.border,
        shadowColor: '#B8762A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
        gap: 12,
    },
    itemImgBox: {
        width: 76,
        height: 76,
        borderRadius: 15,
        overflow: 'hidden',
        flexShrink: 0,
    },
    itemImg: {
        width: '100%',
        height: '100%',
    },
    itemBody: {
        flex: 1,
        justifyContent: 'space-between',
    },
    itemTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '800',
        color: C.textDark,
        marginBottom: 4,
        flex: 1,
    },
    itemMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    itemWeight: {
        fontSize: 11,
        color: C.textMuted,
        fontWeight: '600',
    },
    itemTagPill: {
        backgroundColor: C.amberSoft,
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: C.amberLight,
    },
    itemTagText: {
        fontSize: 9,
        color: C.amberDark,
        fontWeight: '800',
    },
    deleteBtn: {
        width: 30,
        height: 30,
        borderRadius: 9,
        backgroundColor: '#FFF0EE',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        flexShrink: 0,
    },
    deleteIcon: {
        fontSize: 14,
    },
    itemBottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemTotal: {
        fontSize: 16,
        fontWeight: '900',
        color: C.textDark,
    },
    itemUnit: {
        fontSize: 10,
        color: C.textMuted,
        fontWeight: '500',
        marginTop: 1,
    },
    itemSaving: {
        fontSize: 10,
        color: C.successDark,
        fontWeight: '800',
        marginTop: 2,
    },

    // ── Qty Controls ──────────────────────────────────────────────────────────
    qtyWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 11,
        borderWidth: 1.5,
        borderColor: C.amberLight,
        overflow: 'hidden',
        height: 36,
    },
    qtyMinus: {
        width: 36,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.amberSoft,
    },
    qtyMinusText: {
        fontSize: 19,
        fontWeight: '800',
        color: C.amberDark,
        lineHeight: 23,
    },
    qtyNumBox: {
        width: 34,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyNum: {
        fontSize: 15,
        fontWeight: '900',
        color: C.textDark,
    },
    qtyPlus: {
        width: 36,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.amber,
    },
    qtyPlusText: {
        fontSize: 19,
        fontWeight: '800',
        color: C.white,
        lineHeight: 23,
    },

    // ── Footer Block ──────────────────────────────────────────────────────────
    footerBlock: {
        gap: 12,
        marginTop: 6,
    },

    // ── Coupon ────────────────────────────────────────────────────────────────
    couponCard: {
        backgroundColor: C.white,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: C.amber,
        borderStyle: 'dashed',
        padding: 13,
        shadowColor: C.amber,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    couponInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    couponInput: {
        flex: 1,
        fontSize: 14,
        color: C.textDark,
        fontWeight: '700',
        height: 38,
        letterSpacing: 1,
    },
    applyBtn: {
        backgroundColor: C.amber,
        borderRadius: 11,
        paddingHorizontal: 18,
        paddingVertical: 9,
        shadowColor: C.amber,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    applyBtnOff: {
        backgroundColor: C.creamDeep,
        shadowOpacity: 0,
        elevation: 0,
    },
    applyBtnText: {
        fontSize: 13,
        color: C.white,
        fontWeight: '800',
    },
    couponAppliedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    couponAppliedCode: {
        fontSize: 14,
        fontWeight: '900',
        color: C.textDark,
        letterSpacing: 1,
    },
    couponAppliedSave: {
        fontSize: 12,
        color: C.successDark,
        fontWeight: '700',
        marginTop: 2,
    },
    couponRemoveBtn: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 9,
        borderWidth: 1.5,
        borderColor: C.danger,
    },
    couponRemoveText: {
        fontSize: 12,
        color: C.danger,
        fontWeight: '700',
    },

    // ── Bill Summary ──────────────────────────────────────────────────────────
    billCard: {
        backgroundColor: C.white,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: C.border,
        shadowColor: '#B8762A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 4,
    },
    billTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    billTitleEmoji: {
        fontSize: 18,
    },
    billTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: C.textDark,
        letterSpacing: 0.2,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 11,
    },
    billLabel: {
        fontSize: 13,
        color: C.textMuted,
        fontWeight: '600',
    },
    billValue: {
        fontSize: 13,
        fontWeight: '700',
    },
    billDivider: {
        height: 1,
        backgroundColor: C.border,
        marginVertical: 12,
    },
    billTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    billTotalLabel: {
        fontSize: 15,
        fontWeight: '900',
        color: C.textDark,
    },
    billTotalSaving: {
        fontSize: 11,
        color: C.successDark,
        fontWeight: '700',
        marginTop: 3,
    },
    billTotalValue: {
        fontSize: 22,
        fontWeight: '900',
        color: C.primary,
    },

    // ── Checkout CTA ──────────────────────────────────────────────────────────
    checkoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: C.navy,
        borderRadius: 18,
        paddingHorizontal: 20,
        paddingVertical: 17,
        shadowColor: C.navy,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 14,
        elevation: 9,
    },
    checkoutTotal: {
        fontSize: 20,
        fontWeight: '900',
        color: C.amber,
    },
    checkoutSub: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '500',
        marginTop: 3,
    },
    checkoutRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    checkoutLabel: {
        fontSize: 14,
        color: C.white,
        fontWeight: '800',
    },
    checkoutArrow: {
        fontSize: 18,
        color: C.amber,
        fontWeight: '700',
    },

    // ── Empty Cart ────────────────────────────────────────────────────────────
    emptyWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingBottom: 120,
    },
    emptyEmoji: {
        fontSize: 80,
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: C.textDark,
        marginBottom: 10,
        textAlign: 'center',
    },
    emptySub: {
        fontSize: 14,
        color: C.textMuted,
        textAlign: 'center',
        lineHeight: 21,
        fontWeight: '500',
        marginBottom: 28,
    },
    shopNowBtn: {
        backgroundColor: C.primary,
        borderRadius: 16,
        paddingHorizontal: 34,
        paddingVertical: 15,
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 7,
    },
    shopNowText: {
        fontSize: 15,
        color: C.white,
        fontWeight: '900',
        letterSpacing: 0.3,
    },

    // ── Bottom Tab Bar ────────────────────────────────────────────────────────
    tabBar: {
        flexDirection: 'row',
        backgroundColor: C.white,
        paddingBottom: Platform.OS === 'ios' ? 22 : 10,
        paddingTop: 10,
        paddingHorizontal: 8,
        borderTopWidth: 1,
        borderTopColor: C.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 14,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 3,
        paddingTop: 6,
        position: 'relative',
    },
    tabActiveBar: {
        position: 'absolute',
        top: -10,
        width: 28,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: C.primary,
    },
    tabIconWrap: {
        position: 'relative',
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabEmoji: {
        fontSize: 20,
        opacity: 0.4,
    },
    tabEmojiActive: {
        opacity: 1,
    },
    tabBadge: {
        position: 'absolute',
        top: -5,
        right: -8,
        minWidth: 17,
        height: 17,
        borderRadius: 9,
        backgroundColor: C.danger,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: C.white,
        paddingHorizontal: 3,
    },
    tabBadgeText: {
        fontSize: 9,
        color: C.white,
        fontWeight: '900',
        lineHeight: 11,
    },
    tabLabel: {
        fontSize: 10,
        color: C.textMuted,
        fontWeight: '600',
    },
    tabLabelActive: {
        color: C.primary,
        fontWeight: '800',
    },
});