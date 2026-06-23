import React, { useRef, useState, useEffect } from 'react';
import {
  SafeAreaView,
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
import {
  Menu,
  ShoppingCart,
  ChevronRight,
  ArrowRight,
  BookOpen,
  ShoppingBag,
  ClipboardList,
  MessageSquare,
  Package,
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
    status: 'Delivered',
    date: 'Apr 22, 2024',
    items: 18,
    amount: '$210.00',
    image:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&q=80',
  },
  {
    id: '10172',
    status: 'Delivered',
    date: 'Apr 10, 2024',
    items: 31,
    amount: '$415.75',
    image:
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=200&q=80',
  },
];

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

        <TouchableOpacity style={styles.slideButton} activeOpacity={0.85}>
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

  /* ---------- Quick Order Guides section ---------- */
  const QuickOrderGuides = () => (
    <View style={styles.card}>
      {/* Section header row */}
      <View style={styles.sectionHeaderRow}>
        <View style={[styles.sectionIconWrap, { backgroundColor: '#D1FAE5' }]}>
          <BookOpen size={18} color="#059669" />
        </View>

        <View style={styles.sectionHeaderTextWrap}>
          <Text style={styles.sectionTitle}>Quick Order Guides</Text>
          <Text style={styles.sectionSubtitle}>
            Select guides to add their products
          </Text>
        </View>

        <TouchableOpacity style={styles.chevronButton} activeOpacity={0.7}>
          <ChevronRight size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Empty state */}
      <View style={styles.emptyStateWrap}>
        <View style={styles.emptyIconCircle}>
          <BookOpen size={26} color="#2564eb75" />
        </View>
        <Text style={styles.emptyTitle}>No Order Guides Yet</Text>
        <Text style={styles.emptySubtitle}>
          Create a reusable guide for{'\n'}products you order regularly.
        </Text>
      </View>

      {/* Bottom action row */}
      <View style={styles.guideActionRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            borderColor: 'black',
            borderWidth: 1,
            borderColor: '#16A34A',
            borderRadius: 20,
            backgroundColor: '#16A34A',
          }}
        >
          <Text style={styles.selectAllText}>Select all</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addToCartButton} activeOpacity={0.85}>
          <ShoppingCart size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.addToCartText}>Add to cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /* ---------- Recent Orders section — NEW CARD STYLE ---------- */
  const RecentOrders = () => (
    <View style={styles.recentOrdersSection}>
      {/* Section title row */}
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

      {/* Order cards */}
      {recentOrders.map((order, index) => (
        <TouchableOpacity
          key={order.id}
          style={[
            styles.orderCard,
            index < recentOrders.length - 1 && styles.orderCardBorder,
          ]}
          activeOpacity={0.7}
        >
          {/* Thumbnail */}
          <Image
            source={{ uri: order.image }}
            style={styles.orderThumb}
            resizeMode="cover"
          />

          {/* Middle info */}
          <View style={styles.orderCardInfo}>
            <View style={styles.orderCardTopRow}>
              <Text style={styles.orderCardId}>Order #{order.id}</Text>
              <View style={styles.deliveredBadge}>
                <Text style={styles.deliveredBadgeText}>{order.status}</Text>
              </View>
            </View>
            <Text style={styles.orderCardMeta}>
              {order.date} · {order.items} Items
            </Text>
          </View>

          {/* Right: price + chevron */}
          <View style={styles.orderCardRight}>
            <Text style={styles.orderCardAmount}>{order.amount}</Text>
            <ChevronRight size={16} color="#9CA3AF" />
          </View>
        </TouchableOpacity>
      ))}
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
        <QuickOrderGuides />
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
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F4',
    marginTop: 18,
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

  /* Hero slider */
  heroCard: {
    marginHorizontal: H_PADDING,
    marginTop: 16,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    borderWidth: 1,
    borderColor: '#F1F2F4',
    overflow: 'hidden',
    paddingBottom: 14,
  },
  slide: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  slideTextWrap: {
    flex: 1,
    paddingLeft: 18,
    paddingRight: 8,
  },
  slideEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  slideTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 26,
    marginBottom: 8,
  },
  slideSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 18,
  },
  slideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#2e86de',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  slideButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  slideImage: {
    width: '42%',
    height: 165,
    borderRadius: 14,
    marginRight: 14,
  },
  dotsWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  dotActive: {
    width: 18,
    backgroundColor: '#2e86de',
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'black',
  },

  /* Quick actions grid */
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: H_PADDING,
    marginTop: 16,
  },
  actionCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F2F4',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  actionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  /* Generic card / section header */
  card: {
    marginHorizontal: H_PADDING,
    marginTop: 4,
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F2F4',
    borderRadius: 18,
    padding: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionHeaderTextWrap: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  chevronButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Quick Order Guides – empty state */
  emptyStateWrap: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 19,
  },

  /* Quick Order Guides – bottom action row */
  guideActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F2F4',
    paddingTop: 14,
    marginTop: 4,
  },
  selectAllText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2564eb75',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  /* ── Recent Orders — NEW CARD STYLE ─────────────────────── */
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
  viewAllLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2e86de',
  },

  /* Individual order card row */
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
  deliveredBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  deliveredBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
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
