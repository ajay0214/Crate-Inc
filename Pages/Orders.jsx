import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Menu,
  ShoppingCart,
  ChevronRight,
  Truck,
  Package,
  Clock,
  DollarSign,
  SlidersHorizontal,
} from 'lucide-react-native';
import CustomBottomTab from './CustomBottomTab';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Mock Data ──────────────────────────────────────────────────────────────
const ORDERS = [
  {
    id: 'BVCX90',
    status: 'Order Sent',
    placedOn: 'Jun 5, 2026 at 2:35 PM',
    delivery: 'Jun 6, 2026',
    total: '$142.50',
  },
  {
    id: 'BVCX89',
    status: 'Delivered',
    placedOn: 'Jun 3, 2026 at 10:12 AM',
    delivery: 'Jun 4, 2026',
    total: '$287.40',
  },
  {
    id: 'BVCX88',
    status: 'Delivered',
    placedOn: 'May 31, 2026 at 9:08 AM',
    delivery: 'Jun 1, 2026',
    total: '$156.80',
  },
  {
    id: 'BVCX87',
    status: 'Order Sent',
    placedOn: 'May 29, 2026 at 3:40 PM',
    delivery: 'May 30, 2026',
    total: '$160.90',
  },
  {
    id: 'BVCX86',
    status: 'Delivered',
    placedOn: 'May 27, 2026 at 11:15 AM',
    delivery: 'May 28, 2026',
    total: '$246.00',
  },
];

// Status badge colors
function getStatusStyle(status) {
  switch (status) {
    case 'Order Sent':
      return { bg: '#dcfce7', text: '#16a34a' };
    case 'Delivered':
      return { bg: '#fff7ed', text: '#ea580c' };
    case 'Cancelled':
      return { bg: '#fef2f2', text: '#dc2626' };
    default:
      return { bg: '#f3f4f6', text: '#6b7280' };
  }
}

// ─── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ iconBg, icon, value, label }) {
  return (
    <View style={s.statCard}>
      <View style={s.statRow}>
        <View style={[s.statIconWrap, { backgroundColor: iconBg }]}>
          {icon}
        </View>

        <View style={s.statContent}>
          <Text style={s.statValue}>{value}</Text>

          <Text style={s.statLabel}>{label}</Text>
        </View>
      </View>
    </View>
  );
}
// ─── Order Card ─────────────────────────────────────────────────────────────
function OrderCard({ order, onPress }) {
  const badge = getStatusStyle(order.status);
  return (
    <TouchableOpacity style={s.orderCard} onPress={onPress} activeOpacity={0.8}>
      {/* Top row: order # + badge + chevron */}
      <View style={s.orderCardTop}>
        <View style={s.orderCardTopLeft}>
          <Text style={s.orderNum}>Order #{order.id}</Text>
          <View style={[s.statusBadge, { backgroundColor: badge.bg }]}>
            <Text style={[s.statusBadgeTxt, { color: badge.text }]}>
              {order.status}
            </Text>
          </View>
        </View>
        <ChevronRight size={18} color="#9CA3AF" />
      </View>

      {/* Placed on */}
      <Text style={s.orderDate}>Placed on {order.placedOn}</Text>

      {/* Divider */}
      <View style={s.orderDivider} />

      {/* Delivery + Total */}
      <View style={s.orderFooter}>
        <View style={s.orderFooterCol}>
          <Text style={s.orderFooterLabel}>Delivery</Text>
          <Text style={s.orderFooterValue}>{order.delivery}</Text>
        </View>
        <View style={s.orderFooterCol}>
          <Text style={s.orderFooterLabel}>Total</Text>
          <Text style={s.orderFooterValue}>{order.total}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────
export default function MyOrders({ navigation }) {
  const [activeTab, setActiveTab] = useState('All Orders');
  const [activeBottomTab, setActiveBottomTab] = useState('Home');

  const tabs = ['All Orders', 'Upcoming', 'Past'];

  const filteredOrders = ORDERS.filter(order => {
    if (activeTab === 'All Orders') return true;
    if (activeTab === 'Upcoming') return order.status === 'Order Sent';
    if (activeTab === 'Past') return order.status === 'Delivered';
    return true;
  });

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* ── Header ── */}
        <View style={s.header}>
          <TouchableOpacity style={s.menuBtn} activeOpacity={0.7}>
            <Menu size={22} color="#111827" />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>My Orders</Text>
            <Text style={s.headerSub}>View and manage your orders</Text>
          </View>
          <View style={s.headerRight}>
            <View style={s.avatar}>
              <Text style={s.avatarTxt}>AV</Text>
            </View>
            <TouchableOpacity style={s.cartWrap} activeOpacity={0.8}>
              <ShoppingCart size={22} color="#2e86de" />
              <View style={s.cartBadge}>
                <Text style={s.cartBadgeTxt}>16</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
        >
          {/* ── Stat Cards Grid ── */}
          <View style={s.statsGrid}>
            <StatCard
              iconBg="#dcfce7"
              icon={<Truck size={22} color="#16a34a" />}
              value="5"
              label="Total Orders"
            />
            <StatCard
              iconBg="#ede9fe"
              icon={<Package size={22} color="#7c3aed" />}
              value="2"
              label="Orders Delivered"
            />
            <StatCard
              iconBg="#ffedd5"
              icon={<Clock size={22} color="#ea580c" />}
              value="2"
              label="Upcoming Orders"
            />
            <StatCard
              iconBg="#dbeafe"
              icon={<DollarSign size={22} color="#2563eb" />}
              value="$747.60"
              label="Total Spend"
            />
          </View>

          {/* ── Recent Orders Section ── */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Recent Orders</Text>
            <Text style={s.sectionSub}>
              Filter by status, order type, or sort direction.
            </Text>

            {/* Tab Row */}
            <View style={s.tabRow}>
              {tabs.map(tab => {
                const isActive = activeTab === tab;
                // "Past" tab gets orange text when inactive
                const isPast = tab === 'Past';
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[
                      s.tab,
                      isActive
                        ? s.tabActive
                        : isPast
                        ? s.tabPast
                        : s.tabInactive,
                    ]}
                    onPress={() => setActiveTab(tab)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        s.tabTxt,
                        isActive
                          ? s.tabTxtActive
                          : isPast
                          ? s.tabTxtPast
                          : s.tabTxtInactive,
                      ]}
                    >
                      {tab}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Order Type filter chip */}
            <TouchableOpacity style={s.filterChip} activeOpacity={0.8}>
              <SlidersHorizontal size={15} color="#374151" />
              <Text style={s.filterChipTxt}> Order Type</Text>
            </TouchableOpacity>

            {/* Order Cards */}
            <View style={s.orderList}>
              {filteredOrders.map(order => (
                <OrderCard key={order.id} order={order} onPress={() => {}} />
              ))}
            </View>
          </View>
        </ScrollView>

        <CustomBottomTab
          activeTab={activeBottomTab}
          onTabPress={tab => {
            setActiveBottomTab(tab);
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
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },

  // Header
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,

    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f4',
  },
  menuBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  headerSub: { fontSize: 11.5, color: '#9CA3AF', marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { fontSize: 12, fontWeight: '700', color: '#374151' },
  cartWrap: { position: 'relative', padding: 2 },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: '#2e86de',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeTxt: { color: '#fff', fontSize: 10, fontWeight: '700' },

  scroll: { paddingBottom: 32 },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  statCard: {
    width: (SCREEN_W - 40) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statContent: {
    marginLeft: 10,
    flex: 1,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 24,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },

  // Section
  section: { paddingHorizontal: 14, paddingTop: 12 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSub: { fontSize: 12.5, color: '#2e86de', marginBottom: 16 },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  tab: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 22,
  },
  tabActive: {
    backgroundColor: '#2e86de',
  },
  tabInactive: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tabPast: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tabTxt: { fontSize: 13, fontWeight: '600' },
  tabTxtActive: { color: '#fff' },
  tabTxtInactive: { color: '#374151' },
  tabTxtPast: { color: '#ea580c' },

  // Filter chip
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  filterChipTxt: { fontSize: 13, fontWeight: '600', color: '#374151' },

  // Order list
  orderList: { gap: 12 },

  // Order card
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f2f4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  orderCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  orderCardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderNum: { fontSize: 14, fontWeight: '700', color: '#111827' },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusBadgeTxt: { fontSize: 11, fontWeight: '700' },
  orderDate: { fontSize: 12, color: '#9CA3AF', marginBottom: 12 },
  orderDivider: { height: 1, backgroundColor: '#f3f4f6', marginBottom: 12 },
  orderFooter: { flexDirection: 'row', gap: 32 },
  orderFooterCol: {},
  orderFooterLabel: { fontSize: 11.5, color: '#9CA3AF', marginBottom: 3 },
  orderFooterValue: { fontSize: 14, fontWeight: '700', color: '#111827' },
});
