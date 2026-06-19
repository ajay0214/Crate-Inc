import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Dimensions, Image
} from 'react-native';
import CustomBottomTab from './CustomBottomTab';


const { width } = Dimensions.get('window');

// ─── Color Tokens ─────────────────────────────────────────────────────────────
const C = {
    blue: '#1A6FDB',
    blueLight: '#E8F0FB',
    white: '#FFFFFF',
    pageBg: '#F0F4FA',
    heroBg: '#D9E6F7',
    textDark: '#0D1117',
    textMid: '#3C3C43',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    greenBg: '#E6F4EA',
    greenText: '#1A7A3C',
    greenBorder: '#A3D9B1',
    orangeBg: '#FFF3E0',
    orangeText: '#C46A00',
    orangeBorder: '#FFCA80',
    avatarBg: '#CBD5E1',
    cartBadge: '#1A6FDB',
};

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ navigation }) {
    return (
        <View style={styles.header}>
            {/* Sidebar toggle — two lines */}
            <TouchableOpacity style={styles.menuBtn}>
                <View style={styles.menuLine} />
                <View style={[styles.menuLine, { width: 14 }]} />
            </TouchableOpacity>

            {/* Title block */}
            <View style={styles.headerTitle}>
                <Text style={styles.headerTitleText}>Overview</Text>
                <Text style={styles.headerSubtitle}>Track orders and business operations</Text>
            </View>

            {/* Right: Avatar + Cart */}
            <View style={styles.headerRight}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>AV</Text>
                </View>
                <View style={styles.cartWrap}>
                    <Image source={require('../Assets/carts.png')} style={styles.cartIcon} />
                    <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>0</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

// ─── Hero Card ────────────────────────────────────────────────────────────────
function HeroCard() {
    return (
        <View style={styles.heroCard}>
            <Text style={styles.heroGreeting}>Welcome back,</Text>
            <View style={styles.heroNameRow}>
                <Text style={styles.heroName}>Crate Inc.</Text>
                <Text style={styles.heroEmoji}>👋</Text>
            </View>
            <Text style={styles.heroSub}>Here's what's happening with your account today.</Text>

            {/* Primary CTA */}
            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.88}>
                <Image source={require('../Assets/carts.png')} style={styles.primaryBtnIcon} />

                <Text style={styles.primaryBtnText}>Start Order Guide</Text>
            </TouchableOpacity>

            {/* Secondary buttons */}
            <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.88}>
                <Image source={require('../Assets/book.png')} style={styles.secondaryBtnIcon} />

                <Text style={styles.secondaryBtnText}>Browse Catalog</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.88}>
                <Text style={styles.secondaryBtnIcon}>📅</Text>
                <Text style={styles.secondaryBtnText}>View Orders</Text>
            </TouchableOpacity>
        </View>
    );
}

// ─── Recent Orders Header Card ────────────────────────────────────────────────
function RecentOrdersHeader({ onViewAll }) {
    return (
        <View style={styles.recentHeaderCard}>
            {/* Left: icon + title + subtitle */}
            <View style={styles.recentHeaderLeft}>
                <View style={styles.recentIconWrap}>
                    <Text style={styles.recentIcon}>📦</Text>
                </View>
                <View>
                    <Text style={styles.recentTitle}>Recent Orders</Text>
                    <Text style={styles.recentSubtitle}>View and manage your recent orders</Text>
                </View>
            </View>

            {/* Divider inside card */}
            <View style={styles.recentDivider} />

            {/* View Orders link row */}
            <TouchableOpacity style={styles.viewOrdersRow} onPress={onViewAll} activeOpacity={0.7}>
                <Text style={styles.viewOrdersText}>View Orders</Text>
                <Text style={styles.viewOrdersChevron}> ›</Text>
            </TouchableOpacity>
        </View>
    );
}

// ─── Order Item Card ──────────────────────────────────────────────────────────
function OrderCard({ orderId, status, items, amount }) {
    const isDelivered = status === 'Delivered';

    return (
        <TouchableOpacity style={styles.orderCard} activeOpacity={0.85}>
            {/* Truck icon in green circle */}
            <View style={styles.orderIconWrap}>
                <Text style={styles.orderIcon}>🚚</Text>
            </View>

            {/* Order details */}
            <View style={styles.orderDetails}>
                <View style={styles.orderTopRow}>
                    <Text style={styles.orderId}>{orderId}</Text>
                    <View style={[
                        styles.badge,
                        isDelivered ? styles.badgeDelivered : styles.badgeOrderSent,
                    ]}>
                        <Text style={[
                            styles.badgeText,
                            isDelivered ? styles.badgeDeliveredText : styles.badgeOrderSentText,
                        ]}>
                            {status}
                        </Text>
                    </View>
                </View>
                <Text style={styles.orderMeta}>{items} - App/Web - {amount}</Text>
            </View>

            {/* Chevron */}
            <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DashboardScreen({ navigation }) {
    const orders = [
        { id: 'Order #BVCX90', status: 'Order Sent', items: '2 items', amount: '$142.50' },
        { id: 'Order #BVCX89', status: 'Delivered', items: '2 items', amount: '$287.40' },
        { id: 'Order #BVCX88', status: 'Delivered', items: '2 items', amount: '$287.40' },
        { id: 'Order #BVCX87', status: 'Delivered', items: '2 items', amount: '$287.40' },
        { id: 'Order #BVCX84', status: 'Delivered', items: '2 items', amount: '$287.40' },
        { id: 'Order #BVCX83', status: 'Delivered', items: '2 items', amount: '$287.40' },
    ];

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor={C.pageBg} />

            <Header navigation={navigation} />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: 120 }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Hero ── */}
                <HeroCard />

                {/* ── Recent Orders header card ── */}
                <RecentOrdersHeader onViewAll={() => { }} />

                {/* ── Each order as its own card ── */}
                {orders.map((o) => (
                    <OrderCard
                        key={o.id}
                        orderId={o.id}
                        status={o.status}
                        items={o.items}
                        amount={o.amount}
                    />
                ))}

            </ScrollView>

            <CustomBottomTab
                activeTab='Home'
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
        backgroundColor: C.pageBg,
    },

    // ── Header ──
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: C.pageBg,
        gap: 10,
        marginTop: 20
    },
    menuBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        gap: 5,
    },
    menuLine: {
        height: 2,
        width: 20,
        backgroundColor: C.textDark,
        borderRadius: 2,
    },
    headerTitle: {
        flex: 1,
    },
    headerTitleText: {
        fontSize: 16,
        fontWeight: '700',
        color: C.textDark,
    },
    headerSubtitle: {
        fontSize: 12,
        color: C.textMuted,
        marginTop: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: C.avatarBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 13,
        fontWeight: '700',
        color: C.textMid,
    },
    cartWrap: {
        position: 'relative',
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartIcon: {
        width: 23,
        height: 23,
    },
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: C.cartBadge,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        color: C.white,
    },

    // ── Scroll ──
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 14,
        paddingBottom: 36,
        gap: 10,
    },

    // ── Hero Card ──
    heroCard: {
        backgroundColor: C.heroBg,
        borderRadius: 18,
        padding: 18,
        gap: 10,
        marginBottom: 4,
    },
    heroGreeting: {
        fontSize: 16,
        fontWeight: '500',
        color: C.textDark,
    },
    heroNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    heroName: {
        fontSize: 26,
        fontWeight: '800',
        color: C.textDark,
        letterSpacing: -0.5,
    },
    heroEmoji: {
        fontSize: 24,
    },
    heroSub: {
        fontSize: 13,
        color: C.textMuted,
        lineHeight: 19,
        marginBottom: 4,
    },

    // ── Hero Buttons ──
    primaryBtn: {
        backgroundColor: C.blue,
        borderRadius: 12,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 4,
    },
    primaryBtnIcon: {
        width: 26,
        height: 26,
        tintColor: '#fff'
    },
    primaryBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: C.white,
    },
    secondaryBtn: {
        backgroundColor: C.white,
        borderRadius: 12,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 10,
    },
    secondaryBtnIcon: {
        width: 24,
        height: 24,
        tintColor: C.textDark
    },
    secondaryBtnText: {
        fontSize: 14,
        fontWeight: '500',
        color: C.textDark,
    },

    // ── Recent Orders Header Card ──
    recentHeaderCard: {
        backgroundColor: C.white,
        borderRadius: 16,
        paddingTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    recentHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingBottom: 14,
    },
    recentIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: C.blueLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recentIcon: {
        fontSize: 18,
    },
    recentTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: C.textDark,
    },
    recentSubtitle: {
        fontSize: 12,
        color: C.textMuted,
        marginTop: 2,
    },
    recentDivider: {
        height: 1,
        backgroundColor: C.border,
        marginHorizontal: 0,
    },
    viewOrdersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
    },
    viewOrdersText: {
        fontSize: 14,
        fontWeight: '600',
        color: C.textDark,
    },
    viewOrdersChevron: {
        fontSize: 16,
        fontWeight: '600',
        color: C.textDark,
    },

    // ── Order Card (each order = own card) ──
    orderCard: {
        backgroundColor: C.white,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    orderIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: C.greenBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    orderIcon: {
        fontSize: 18,
    },
    orderDetails: {
        flex: 1,
        gap: 4,
    },
    orderTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    orderId: {
        fontSize: 14,
        fontWeight: '700',
        color: C.textDark,
    },
    orderMeta: {
        fontSize: 12,
        color: C.textMuted,
    },
    chevron: {
        fontSize: 20,
        color: C.textMuted,
    },

    // ── Badges ──
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    badgeOrderSent: {
        backgroundColor: C.greenBg,
        borderColor: C.greenBorder,
    },
    badgeOrderSentText: {
        color: C.greenText,
    },
    badgeDelivered: {
        backgroundColor: C.orangeBg,
        borderColor: C.orangeBorder,
    },
    badgeDeliveredText: {
        color: C.orangeText,
    },
});