import React, { useRef, useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Menu,
  ShoppingCart,
  ChevronRight,
  ArrowRight,
  Package,
  CheckCircle,
  Send,
  XCircle,
  DollarSign,
  TrendingUp,
} from 'lucide-react-native';
import CustomBottomTab from './CustomBottomTab';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PADDING = 16;
const SLIDE_WIDTH = SCREEN_WIDTH - H_PADDING * 2;
const AUTO_SLIDE_INTERVAL = 4000;

const heroSlides = [
  {
    id: '1',
    eyebrow: 'BUNDLE AND SAVE',
    title: 'Fresh produce and proteins, one great price',
    subtitle: 'Build a better kitchen with our weekly fresh-food bundle.',
    buttonText: 'Explore the bundle',
    image:
      'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=900&q=80',
  },
  {
    id: '2',
    eyebrow: 'BUNDLE AND SAVE',
    title: 'Stock your pantry, save every week',
    subtitle: 'Build a better kitchen with our weekly fresh-food bundle.',
    buttonText: 'Explore the bundle',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=80',
  },
  {
    id: '3',
    eyebrow: 'BUNDLE AND SAVE',
    title: 'Protein and produce, bundled better',
    subtitle: 'Build a better kitchen with our weekly fresh-food bundle.',
    buttonText: 'Explore the bundle',
    image:
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=900&q=80',
  },
];

/* recentOrders — mixed statuses so dashboard stats are meaningful */
const recentOrders = [
  {
    id: '10234',
    status: 'Delivered',
    date: 'May 8, 2024',
    items: 24,
    amount: '$320.50',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  },
  {
    id: '10198',
    status: 'Sent',
    date: 'Apr 22, 2024',
    items: 18,
    amount: '$210.00',
    image:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&q=80',
  },
  {
    id: '10172',
    status: 'Cancelled',
    date: 'Apr 10, 2024',
    items: 31,
    amount: '$415.75',
    image:
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=200&q=80',
  },
  {
    id: '10155',
    status: 'Delivered',
    date: 'Apr 1, 2024',
    items: 15,
    amount: '$180.00',
    image:
      'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=200&q=80',
  },
];

/* ── helpers ── */
const parseDollar = str => parseFloat(str.replace('$', ''));

const getStatusBadge = status => {
  switch (status) {
    case 'Delivered':
      return { bg: '#D1FAE5', text: '#059669' };
    case 'Sent':
      return { bg: '#EFF6FF', text: '#2e86de' };
    case 'Cancelled':
      return { bg: '#FEE2E2', text: '#ee5253' };
    default:
      return { bg: '#F3F4F6', text: '#6B7280' };
  }
};

/* ================================================================== */
/*  SCREEN COMPONENT                                                    */
/* ================================================================== */

export default function DashboardScreen({ navigation }) {
  /* ---------- Header ---------- */
  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
        <Menu size={22} color="#111827" />
      </TouchableOpacity>

      <View style={styles.headerTitleWrap}>
        <Text style={styles.headerTitle}>Overview</Text>
        <Text style={styles.headerSubtitle}>
          Track orders and business operations
        </Text>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.avatar} activeOpacity={0.7}>
          <Text style={styles.avatarText}>AV</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cartButton} activeOpacity={0.7}>
          <ShoppingCart size={20} color="#2e86de" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>0</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  /* ---------- Hero auto slider ---------- */
  const flatListRef = useRef(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const [activeTab, setActiveTab] = useState('Home');

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeIndexRef.current + 1) % heroSlides.length;
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * SLIDE_WIDTH,
        animated: true,
      });
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  const onSlideMomentumEnd = e => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SLIDE_WIDTH);
    activeIndexRef.current = index;
    setActiveIndex(index);
  };

  const renderSlide = ({ item }) => (
    <View style={[styles.slide, { width: SLIDE_WIDTH }]}>
      <View style={styles.slideTextWrap}>
        <Text style={styles.slideEyebrow}>{item.eyebrow}</Text>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>

        <TouchableOpacity
          style={styles.slideButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Catolog')}
        >
          <Text style={styles.slideButtonText}>{item.buttonText}</Text>
          <ArrowRight size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>

      <Image
        source={{ uri: item.image }}
        style={styles.slideImage}
        resizeMode="cover"
      />
    </View>
  );

  const HeroSlider = () => (
    <View style={styles.heroCard}>
      <FlatList
        ref={flatListRef}
        data={heroSlides}
        keyExtractor={item => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        snapToInterval={SLIDE_WIDTH}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onSlideMomentumEnd}
        bounces={false}
      />

      <View style={styles.dotsWrap}>
        {heroSlides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );

  /* ---------- Order Overview Dashboard — derived from recentOrders ---------- */
  const OrderOverview = () => {
    const totalOrders = recentOrders.length;
    const deliveredCount = recentOrders.filter(
      o => o.status === 'Delivered',
    ).length;
    const sentCount = recentOrders.filter(o => o.status === 'Sent').length;
    const cancelledCount = recentOrders.filter(
      o => o.status === 'Cancelled',
    ).length;

    const totalRevenue = recentOrders.reduce(
      (s, o) => s + parseDollar(o.amount),
      0,
    );
    const deliveredRev = recentOrders
      .filter(o => o.status === 'Delivered')
      .reduce((s, o) => s + parseDollar(o.amount), 0);
    const sentRev = recentOrders
      .filter(o => o.status === 'Sent')
      .reduce((s, o) => s + parseDollar(o.amount), 0);
    const cancelledRev = recentOrders
      .filter(o => o.status === 'Cancelled')
      .reduce((s, o) => s + parseDollar(o.amount), 0);

    const pct = v => (totalRevenue > 0 ? v / totalRevenue : 0);

    const stats = [
      {
        label: 'Total Orders',
        value: String(totalOrders),
        sub: 'All time',
        icon: <Package size={16} color="#2e86de" />,
        iconBg: '#EFF6FF',
      },
      {
        label: 'Delivered',
        value: String(deliveredCount),
        sub: 'Successfully',
        icon: <CheckCircle size={16} color="#16A34A" />,
        iconBg: '#D1FAE5',
      },
      {
        label: 'Order Sent',
        value: String(sentCount),
        sub: 'In transit',
        icon: <Send size={16} color="#D97706" />,
        iconBg: '#FEF3C7',
      },
      {
        label: 'Cancelled',
        value: String(cancelledCount),
        sub: 'This month',
        icon: <XCircle size={16} color="#EF4444" />,
        iconBg: '#FEE2E2',
      },
    ];

    const revenueBreakdown = [
      {
        label: 'Delivered',
        amount: `$${deliveredRev.toFixed(2)}`,
        pct: pct(deliveredRev),
        color: '#16A34A',
        trackColor: '#D1FAE5',
      },
      {
        label: 'In Transit',
        amount: `$${sentRev.toFixed(2)}`,
        pct: pct(sentRev),
        color: '#2e86de',
        trackColor: '#EFF6FF',
      },
      {
        label: 'Cancelled',
        amount: `$${cancelledRev.toFixed(2)}`,
        pct: pct(cancelledRev),
        color: '#EF4444',
        trackColor: '#FEE2E2',
      },
    ];

    return (
      <View style={styles.overviewContainer}>
        {/* Section header */}
        <View style={styles.overviewHeader}>
          <View
            style={[styles.overviewIconBox, { backgroundColor: '#EFF6FF' }]}
          >
            <TrendingUp size={18} color="#2e86de" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.overviewTitle}>Order Overview</Text>
            <Text style={styles.overviewSubtitle}>This month's summary</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Orders')}
          >
            <Text style={styles.viewAllLink}>View all</Text>
          </TouchableOpacity>
        </View>

        {/* 4 stat cards grid */}
        <View style={styles.statsGrid}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 20,
                }}
              >
                <View
                  style={[styles.statIconWrap, { backgroundColor: s.iconBg }]}
                >
                  {s.icon}
                </View>
                <View>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                  <Text style={styles.statSub}>{s.sub}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Revenue breakdown */}
        <View style={styles.revenueCard}>
          <View style={styles.revTopRow}>
            <View style={[styles.revIconBox, { backgroundColor: '#F0FDF4' }]}>
              <DollarSign size={15} color="#16A34A" />
            </View>
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.revLabel}>Total Revenue</Text>
              <Text style={styles.revValue}>${totalRevenue.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {revenueBreakdown.map((r, i) => (
            <View key={i} style={styles.barRow}>
              <Text style={styles.barLabel}>{r.label}</Text>
              <View
                style={[styles.barTrack, { backgroundColor: r.trackColor }]}
              >
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.round(r.pct * 100)}%`,
                      backgroundColor: r.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barAmount, { color: r.color }]}>
                {r.amount}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  /* ---------- Recent Orders section ---------- */
  const RecentOrders = () => (
    <View style={styles.recentOrdersSection}>
      <View style={styles.recentOrdersTopRow}>
        <View style={styles.recentOrdersTitleLeft}>
          <View
            style={[styles.recentOrdersIconBox, { backgroundColor: '#EFF6FF' }]}
          >
            <Package size={18} color="#2e86de" />
          </View>
          <Text style={styles.recentOrdersTitle}>Recent Orders</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.viewAllLink}>View all</Text>
        </TouchableOpacity>
      </View>

      {recentOrders.map((order, index) => {
        const badge = getStatusBadge(order.status);
        return (
          <TouchableOpacity
            key={order.id}
            style={[
              styles.orderCard,
              index < recentOrders.length - 1 && styles.orderCardBorder,
            ]}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: order.image }}
              style={styles.orderThumb}
              resizeMode="cover"
            />

            <View style={styles.orderCardInfo}>
              <View style={styles.orderCardTopRow}>
                <Text style={styles.orderCardId}>Order #{order.id}</Text>
                <View
                  style={[styles.statusBadge, { backgroundColor: badge.bg }]}
                >
                  <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                    {order.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.orderCardMeta}>
                {order.date} · {order.items} Items
              </Text>
            </View>

            <View style={styles.orderCardRight}>
              <Text style={styles.orderCardAmount}>{order.amount}</Text>
              <ChevronRight size={16} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  /* ---------- Full screen ---------- */
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header />

      <ScrollView
        contentContainerStyle={{
          ...styles.scrollContent,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <HeroSlider />
        <OrderOverview />
        <RecentOrders />
      </ScrollView>
      <CustomBottomTab
        activeTab="Home"
        onTabPress={tab => {
          setActiveTab(tab);

          switch (tab) {
            case 'Home':
              navigation.navigate('Dashboard');
              break;

            case 'Category':
              navigation.navigate('OrderGuide');
              break;

            case 'Cart':
              navigation.navigate('Catolog');
              break;

            case 'Orders':
              navigation.navigate('Orders');
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

/* ================================================================== */
/*  STYLES                                                              */
/* ================================================================== */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 32,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: H_PADDING,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F4',
  },
  menuButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: '#9CA3AF',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  cartButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2e86de',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* ── Hero slider (reduced height) ──────────────────────────── */
  heroCard: {
    marginHorizontal: H_PADDING,
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: '#ecf0f1',
    borderWidth: 1,
    borderColor: '#F1F2F4',
    overflow: 'hidden',
    paddingBottom: 10,
  },
  slide: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  slideTextWrap: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 6,
  },
  slideEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  slideTitle: {
    fontSize: 13 /* was 15 */,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
    marginBottom: 5,
  },
  slideSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 16,
  },
  slideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#2e86de',
    paddingVertical: 7 /* was 10 */,
    paddingHorizontal: 13,
    borderRadius: 20,
  },
  slideButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
  },
  slideImage: {
    width: '40%',
    height: 130 /* was 165 */,
    borderRadius: 12,
    marginRight: 12,
  },
  dotsWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  dot: {
    height: 5,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  dotActive: {
    width: 16,
    backgroundColor: '#2e86de',
  },
  dotInactive: {
    width: 5,
    backgroundColor: 'black',
  },

  /* ── Order Overview Dashboard ───────────────────────────────── */
  overviewContainer: {
    marginHorizontal: H_PADDING,
    marginTop: 14,
    marginBottom: 4,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  overviewIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  overviewSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2e86de',
  },

  /* 2×2 stat grid — reduced */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  statCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F2F4',
    borderRadius: 14,
    padding: 10 /* was 14 */,
    paddingTop: -5,
  },
  statIconWrap: {
    width: 28 /* was 34 */,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',

    marginTop: '20',
  },
  statValue: {
    fontSize: 18 /* was 26 */,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  statSub: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 1,
  },

  /* Revenue breakdown card — reduced */
  revenueCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F2F4',
    borderRadius: 14,
    padding: 13 /* was 16 */,
  },
  revTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  revIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  revValue: {
    fontSize: 19 /* was 22 */,
    fontWeight: '700',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F2F4',
    marginBottom: 10,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 11,
    color: '#6B7280',
    width: 64,
  },
  barTrack: {
    flex: 1,
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barAmount: {
    fontSize: 11,
    fontWeight: '700',
    width: 62,
    textAlign: 'right',
  },

  /* ── Recent Orders ─────────────────────────────────────────── */
  recentOrdersSection: {
    marginHorizontal: H_PADDING,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F2F4',
    borderRadius: 18,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  recentOrdersTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  recentOrdersTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recentOrdersIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentOrdersTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  orderCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F4',
  },
  orderThumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  orderCardInfo: {
    flex: 1,
  },
  orderCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  orderCardId: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  orderCardMeta: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  orderCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  orderCardAmount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
});
