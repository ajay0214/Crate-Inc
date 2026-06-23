import React, { useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  Image,
  FlatList,
  StatusBar,
  Platform,
} from 'react-native';

import {
  Menu,
  ShoppingCart,
  Star,
  X,
  Plus,
  ChevronLeft,
  ChevronDown,
  ShoppingBasket,
  Pencil,
  Trash2,
  Download,
  GripVertical,
  MoreVertical,
  ChevronRight,
  Calendar,
  Clock3,
  SlidersHorizontal,
  Search,
  Mic,
} from 'lucide-react-native';

import DATA from '../Components/data.json';
import CustomBottomTab from './CustomBottomTab';

// ─── Unsplash fallback images by category ─────────────────────────────────
const FALLBACK_IMAGES = {
  'Baked Goods':
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
  Bacon:
    'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=400&q=80',
  Dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
  Produce:
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
  Beverages:
    'https://images.unsplash.com/photo-1534353473418-4cfa0c177765?w=400&q=80',
};
const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80';

function getProductImage(product) {
  // Real project: product.image is a local path like "/images/products/..."
  // For demo: use unsplash fallback by category
  return FALLBACK_IMAGES[product.category] || DEFAULT_FALLBACK;
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function getAllProducts() {
  const all = [];
  DATA.forEach(cat => {
    cat.subcategories.forEach(sub => {
      sub.products.forEach(p => all.push(p));
    });
  });
  return all;
}

const ALL_PRODUCTS = getAllProducts();
const CATEGORIES = ['All', ...DATA.map(c => c.name)];

function getSubcategories(categoryName) {
  if (categoryName === 'All') return ['All'];
  const cat = DATA.find(c => c.name === categoryName);
  return cat ? ['All', ...cat.subcategories.map(s => s.name)] : ['All'];
}

// ─── Calendar ──────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function InlineCalendar({ selectedDate, onSelect, onClose }) {
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else setViewMonth(m => m + 1);
  };

  const today = new Date();
  const isSelected = d =>
    d &&
    selectedDate.getDate() === d &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getFullYear() === viewYear;
  const isToday = d =>
    d &&
    today.getDate() === d &&
    today.getMonth() === viewMonth &&
    today.getFullYear() === viewYear;

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <View style={calStyles.container}>
      {/* Nav row */}
      <View style={calStyles.navRow}>
        <TouchableOpacity onPress={prevMonth} style={calStyles.navBtn}>
          <Text style={calStyles.navTxt}>Prev</Text>
        </TouchableOpacity>
        <Text style={calStyles.monthTitle}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={calStyles.navBtn}>
          <Text style={calStyles.navTxt}>Next</Text>
        </TouchableOpacity>
      </View>
      {/* Day labels */}
      <View style={calStyles.row}>
        {DAY_LABELS.map((d, i) => (
          <View key={i} style={calStyles.cell}>
            <Text style={calStyles.dayLabel}>{d}</Text>
          </View>
        ))}
      </View>
      {/* Date rows */}
      {weeks.map((week, wi) => (
        <View key={wi} style={calStyles.row}>
          {week.map((d, di) => {
            const sel = isSelected(d);
            const tod = isToday(d) && !sel;
            return (
              <TouchableOpacity
                key={di}
                style={[
                  calStyles.cell,
                  sel && calStyles.cellSel,
                  tod && calStyles.cellToday,
                ]}
                onPress={() => {
                  if (d) {
                    onSelect(new Date(viewYear, viewMonth, d));
                    onClose();
                  }
                }}
                disabled={!d}
                activeOpacity={d ? 0.7 : 1}
              >
                <Text
                  style={[
                    calStyles.dayNum,
                    sel && calStyles.dayNumSel,
                    tod && calStyles.dayNumToday,
                  ]}
                >
                  {d || ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const calStyles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  navBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  navTxt: { fontSize: 14, color: '#1a1a1a', fontWeight: '500' },
  monthTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  row: { flexDirection: 'row' },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
  },
  cellSel: { backgroundColor: '#3b82f6', borderRadius: 22 },
  cellToday: { borderWidth: 1.5, borderColor: '#3b82f6', borderRadius: 22 },
  dayLabel: { fontSize: 12, fontWeight: '700', color: '#888' },
  dayNum: { fontSize: 13, color: '#1a1a1a' },
  dayNumSel: { color: '#fff', fontWeight: '700' },
  dayNumToday: { color: '#3b82f6', fontWeight: '700' },
});

// ─── Filter Modal ──────────────────────────────────────────────────────────
// Matches image 3: search bar at top, Filters label row, Category + Subcategory dropdowns,
// Sort by dropdown + Filters chip, Clear all link
function FilterModal({
  visible,
  onClose,
  category,
  setCategory,
  subcategory,
  setSubcategory,
  sortBy,
  setSortBy,
}) {
  const subcats = getSubcategories(category);
  const [localCat, setLocalCat] = useState(category);
  const [localSub, setLocalSub] = useState(subcategory);
  const [localSort, setLocalSort] = useState(sortBy);
  const [catOpen, setCatOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const localSubcats = getSubcategories(localCat);

  const sortOptions = [
    { value: 'name-az', label: 'Name A-Z' },
    { value: 'name-za', label: 'Name Z-A' },
    { value: 'price-asc', label: 'Price Low-High' },
    { value: 'price-desc', label: 'Price High-Low' },
  ];

  const handleApply = () => {
    setCategory(localCat);
    setSubcategory(localSub);
    setSortBy(localSort);
    onClose();
  };

  const handleClear = () => {
    setLocalCat('All');
    setLocalSub('All');
    setLocalSort('name-az');
  };

  const getSortLabel = val =>
    sortOptions.find(o => o.value === val)?.label || 'Name A-Z';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={fStyles.overlay}>
        <TouchableOpacity
          style={fStyles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={fStyles.box}>
          {/* Header */}
          <View style={fStyles.header}>
            <Text style={fStyles.title}>Catalog Filters</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={fStyles.closeX}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Search bar */}
            <View style={fStyles.searchBar}>
              <View style={fStyles.searchIcon}>
                <Search size={18} color="#9CA3AF" />
              </View>
              <TextInput
                style={fStyles.searchInput}
                placeholder="Search products by name, keyword"
                placeholderTextColor="#aaa"
              />
              <View style={fStyles.micBtn}>
                <Mic size={17} color="#FFFFFF" />
              </View>
            </View>

            {/* Filters label row */}
            <View style={fStyles.filterLabelRow}>
              <SlidersHorizontal size={18} color="#111827" />
              <Text style={fStyles.filterLabelTxt}>Filters</Text>
            </View>

            {/* Category + Subcategory row */}
            <View style={fStyles.dropRow}>
              {/* Category */}
              <View style={fStyles.dropCol}>
                <Text style={fStyles.dropLabel}>Category</Text>
                <TouchableOpacity
                  style={fStyles.selectBox}
                  onPress={() => {
                    setCatOpen(v => !v);
                    setSubOpen(false);
                    setSortOpen(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={fStyles.selectTxt} numberOfLines={1}>
                    {localCat}
                  </Text>
                  <Text style={fStyles.chevron}>▾</Text>
                </TouchableOpacity>
                {catOpen && (
                  <View style={fStyles.dropdown}>
                    <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled>
                      {CATEGORIES.map(c => (
                        <TouchableOpacity
                          key={c}
                          style={[
                            fStyles.dropItem,
                            localCat === c && fStyles.dropItemActive,
                          ]}
                          onPress={() => {
                            setLocalCat(c);
                            setLocalSub('All');
                            setCatOpen(false);
                          }}
                        >
                          <Text
                            style={[
                              fStyles.dropItemTxt,
                              localCat === c && fStyles.dropItemTxtActive,
                            ]}
                          >
                            {c}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Subcategory */}
              <View style={fStyles.dropCol}>
                <Text style={fStyles.dropLabel}>Subcategory</Text>
                <TouchableOpacity
                  style={fStyles.selectBox}
                  onPress={() => {
                    setSubOpen(v => !v);
                    setCatOpen(false);
                    setSortOpen(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={fStyles.selectTxt} numberOfLines={1}>
                    {localSub}
                  </Text>
                  <Text style={fStyles.chevron}>▾</Text>
                </TouchableOpacity>
                {subOpen && (
                  <View style={fStyles.dropdown}>
                    <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled>
                      {localSubcats.map(s => (
                        <TouchableOpacity
                          key={s}
                          style={[
                            fStyles.dropItem,
                            localSub === s && fStyles.dropItemActive,
                          ]}
                          onPress={() => {
                            setLocalSub(s);
                            setSubOpen(false);
                          }}
                        >
                          <Text
                            style={[
                              fStyles.dropItemTxt,
                              localSub === s && fStyles.dropItemTxtActive,
                            ]}
                          >
                            {s}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            {/* Sort by row */}
            <View style={fStyles.sortRow}>
              <View style={{ flex: 1 }}>
                <Text style={fStyles.dropLabel}>Sort by</Text>
                <TouchableOpacity
                  style={fStyles.selectBox}
                  onPress={() => {
                    setSortOpen(v => !v);
                    setCatOpen(false);
                    setSubOpen(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={fStyles.selectTxt}>
                    {getSortLabel(localSort)}
                  </Text>
                  <Text style={fStyles.chevron}>▾</Text>
                </TouchableOpacity>
                {sortOpen && (
                  <View style={fStyles.dropdown}>
                    {sortOptions.map(opt => (
                      <TouchableOpacity
                        key={opt.value}
                        style={[
                          fStyles.dropItem,
                          localSort === opt.value && fStyles.dropItemActive,
                        ]}
                        onPress={() => {
                          setLocalSort(opt.value);
                          setSortOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            fStyles.dropItemTxt,
                            localSort === opt.value &&
                              fStyles.dropItemTxtActive,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              {/* Filters chip */}
              <View style={fStyles.filtersChip}>
                <SlidersHorizontal size={16} color="#111827" />
                <Text style={fStyles.filtersChipTxt}> Filters</Text>
              </View>
            </View>

            {/* Clear all */}
            <TouchableOpacity style={fStyles.clearRow} onPress={handleClear}>
              <Text style={fStyles.clearTxt}>↺ Clear all</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Apply button */}
          <TouchableOpacity style={fStyles.applyBtn} onPress={handleApply}>
            <Text style={fStyles.applyTxt}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const fStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-start' },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  box: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: 20,
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  closeX: { fontSize: 18, color: '#555', padding: 4 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2e86de',
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, fontSize: 13, color: '#1a1a1a' },
  micBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 14,
  },
  filterIcon: { fontSize: 14, color: '#555', marginRight: 6 },
  filterLabelTxt: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
    marginLeft: 15,
  },
  dropRow: { flexDirection: 'row', gap: 12, marginBottom: 14, zIndex: 30 },
  dropCol: { flex: 1 },
  dropLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#2e86de',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: '#fff',
  },
  selectTxt: { fontSize: 13, color: '#1a1a1a', flex: 1 },
  chevron: { fontSize: 12, color: '#666', marginLeft: 4 },
  dropdown: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 8,
  },
  dropItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  dropItemActive: { backgroundColor: '#eff6ff' },
  dropItemTxt: { fontSize: 13, color: '#1a1a1a' },
  dropItemTxtActive: { color: '#3b82f6', fontWeight: '600' },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginBottom: 16,
    zIndex: 20,
  },
  filtersChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 0,
    alignSelf: 'flex-end',
  },
  filtersChipTxt: { fontSize: 13, color: '#1a1a1a' },
  clearRow: { alignItems: 'center', paddingVertical: 10 },
  clearTxt: { fontSize: 14, color: '#888' },
  applyBtn: {
    backgroundColor: '#2e86de',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  applyTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

// ─── Bottom Tab Bar ────────────────────────────────────────────────────────

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    paddingBottom: Platform.OS === 'ios' ? 16 : 6,
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  tabIcon: { fontSize: 20, opacity: 0.45 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 10, color: '#aaa', fontWeight: '500' },
  tabLabelActive: { color: '#3b82f6', fontWeight: '600' },
});

// ─── Product Card ──────────────────────────────────────────────────────────
function ProductCard({
  product,
  qty,
  onIncrement,
  onDecrement,
  onAddToCart,
  isFav,
  onToggleFav,
}) {
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.imgWrap}>
        <Image
          source={{ uri: getProductImage(product) }}
          style={cardStyles.img}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={cardStyles.favBtn}
          onPress={onToggleFav}
          activeOpacity={0.8}
        >
          <Text style={cardStyles.favIcon}>{isFav ? '★' : '☆'}</Text>
        </TouchableOpacity>
      </View>
      <View style={cardStyles.body}>
        <Text style={cardStyles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={cardStyles.cat}>{product.category}</Text>
        <Text style={cardStyles.pack}>Pack Size: 1 {product.unit}</Text>
        <Text style={cardStyles.price}>
          ${product.price.toFixed(2)} / {product.unit}
        </Text>
        {/* Qty stepper */}
        <View style={cardStyles.qtyRow}>
          <TouchableOpacity
            style={cardStyles.qtyBtn}
            onPress={onDecrement}
            activeOpacity={0.7}
          >
            <Text style={cardStyles.qtyBtnTxt}>-</Text>
          </TouchableOpacity>
          <View style={cardStyles.qtyValWrap}>
            <Text style={cardStyles.qtyVal}>{qty}</Text>
          </View>
          <TouchableOpacity
            style={cardStyles.qtyBtn}
            onPress={onIncrement}
            activeOpacity={0.7}
          >
            <Text style={cardStyles.qtyBtnTxt}>+</Text>
          </TouchableOpacity>
        </View>
        {/* Add to Cart */}
        <TouchableOpacity
          style={cardStyles.addBtn}
          onPress={onAddToCart}
          activeOpacity={0.85}
        >
          <ShoppingCart size={18} color="#fff" />

          <Text style={cardStyles.addTxt}> Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  imgWrap: { position: 'relative' },
  img: { width: '100%', height: 128 },
  favBtn: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favIcon: { fontSize: 15, color: '#0c6437', marginTop: -5 },
  body: { padding: 9 },
  name: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  cat: { fontSize: 11, color: '#888', marginBottom: 1 },
  pack: { fontSize: 11, color: '#888', marginBottom: 5 },
  price: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  qtyRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
    height: 34,
  },
  qtyBtn: {
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  qtyBtnTxt: { fontSize: 18, color: '#1a1a1a', lineHeight: 22 },
  qtyValWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e0e0e0',
  },
  qtyVal: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    borderRadius: 7,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartIcon: { fontSize: 12 },
  addTxt: { color: '#fff', fontSize: 12.5, fontWeight: '700' },
});

// ─── SVG-like icons using Text ─────────────────────────────────────────────
function HamburgerIcon() {
  return (
    <View style={{ gap: 4, justifyContent: 'center' }}>
      <View
        style={{
          width: 20,
          height: 2,
          backgroundColor: '#1a1a1a',
          borderRadius: 1,
        }}
      />
      <View
        style={{
          width: 20,
          height: 2,
          backgroundColor: '#1a1a1a',
          borderRadius: 1,
        }}
      />
      <View
        style={{
          width: 20,
          height: 2,
          backgroundColor: '#1a1a1a',
          borderRadius: 1,
        }}
      />
    </View>
  );
}

// ─── Main Catalog Screen ───────────────────────────────────────────────────
export default function Catalog({ navigation }) {
  const [deliveryDate, setDeliveryDate] = useState(new Date(2026, 5, 12)); // Jun 12 2026
  const [showCalendar, setShowCalendar] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('Cart');

  // Filter state
  const [category, setCategory] = useState('All');
  const [subcategory, setSubcategory] = useState('All');
  const [sortBy, setSortBy] = useState('name-az');

  // Per-product state
  const [quantities, setQuantities] = useState({});
  const [favorites, setFavorites] = useState({});
  const [cartItems, setCartItems] = useState({});

  const formatDate = d =>
    `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  const cutoffDate = `8:00 AM ${
    deliveryDate.getMonth() + 1
  }/${deliveryDate.getDate()}`;
  const totalCartCount = Object.values(cartItems).reduce((a, b) => a + b, 0);

  const filteredProducts = useMemo(() => {
    let list = ALL_PRODUCTS.filter(p => {
      if (category !== 'All' && p.category !== category) return false;
      if (subcategory !== 'All' && p.subcategory !== subcategory) return false;
      return true;
    });
    switch (sortBy) {
      case 'name-az':
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-za':
        list = [...list].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
    }
    return list;
  }, [category, subcategory, sortBy]);

  const getQty = id => quantities[id] || 1;
  const incQty = id => setQuantities(q => ({ ...q, [id]: (q[id] || 1) + 1 }));
  const decQty = id =>
    setQuantities(q => ({ ...q, [id]: Math.max(1, (q[id] || 1) - 1) }));
  const addToCart = id =>
    setCartItems(c => ({ ...c, [id]: (c[id] || 0) + getQty(id) }));
  const toggleFav = id => setFavorites(f => ({ ...f, [id]: !f[id] }));

  // Pair into rows of 2
  const rows = [];
  for (let i = 0; i < filteredProducts.length; i += 2) {
    rows.push(filteredProducts.slice(i, i + 2));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <HamburgerIcon />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.headerTitle}>Catalog</Text>
            <Text style={styles.headerSub}>Browse product catalog</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>AV</Text>
          </View>
          <View style={styles.cartWrap}>
            <ShoppingCart size={20} color="#2e86de" />
            {totalCartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeTxt}>{totalCartCount}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ── Scrollable content ── */}
      <FlatList
        data={rows}
        keyExtractor={(_, i) => String(i)}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={() => (
          <View>
            {/* Delivery Date / Cutoff row */}
            <View style={styles.infoRow}>
              <TouchableOpacity
                style={styles.infoBox}
                onPress={() => setShowCalendar(v => !v)}
                activeOpacity={0.8}
              >
                <Calendar size={19} color="#2e86de" />
                <View style={{ marginLeft: 6 }}>
                  <Text style={styles.infoLabel}>Delivery Date</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(deliveryDate)}
                  </Text>
                </View>
              </TouchableOpacity>
              <View
                style={[
                  styles.infoBox,
                  {
                    borderLeftWidth: 1,
                    borderLeftColor: '#f0f0f0',
                    paddingLeft: 16,
                  },
                ]}
              >
                <Clock3 size={18} color="#2e86de" />
                <View style={{ marginLeft: 6 }}>
                  <Text style={styles.infoLabel}>Cutoff Time</Text>
                  <Text style={styles.infoValue}>{cutoffDate}</Text>
                </View>
              </View>
            </View>

            {/* Inline Calendar */}
            {showCalendar && (
              <InlineCalendar
                selectedDate={deliveryDate}
                onSelect={date => {
                  setDeliveryDate(date);
                }}
                onClose={() => setShowCalendar(false)}
              />
            )}

            {/* Show Filters button */}
            <View style={styles.filterBtnRow}>
              <TouchableOpacity
                style={styles.showFiltersBtn}
                onPress={() => setShowFilters(true)}
                activeOpacity={0.8}
              >
                <SlidersHorizontal size={18} color="#111827" />
                <Text style={styles.showFiltersTxt}> Show Filters</Text>
              </TouchableOpacity>
            </View>

            {/* Product count */}
            <View style={styles.countRow}>
              <Text style={styles.countTxt}>
                Showing 1 to {Math.min(20, filteredProducts.length)} of{' '}
                {filteredProducts.length} products
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.grid}
        renderItem={({ item: row }) => (
          <View style={styles.gridRow}>
            {row.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                qty={getQty(product.id)}
                onIncrement={() => incQty(product.id)}
                onDecrement={() => decQty(product.id)}
                onAddToCart={() => addToCart(product.id)}
                isFav={!!favorites[product.id]}
                onToggleFav={() => toggleFav(product.id)}
              />
            ))}
            {row.length === 1 && (
              <View style={{ flex: 1, marginHorizontal: 5 }} />
            )}
          </View>
        )}
      />

      {/* ── Filter Modal ── */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        category={category}
        setCategory={setCategory}
        subcategory={subcategory}
        setSubcategory={setSubcategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <CustomBottomTab
        activeTab="Cart"
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

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5' },

  // Header
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginTop: 20,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  headerSub: { fontSize: 11.5, color: '#888', marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { fontSize: 12, fontWeight: '700', color: '#555' },
  cartWrap: { position: 'relative' },
  cartEmoji: { width: 22, height: 22, tintColor: '#2e86de' },
  cartBadge: {
    position: 'absolute',
    top: -13,
    right: -10,
    backgroundColor: '#2e86de',
    borderRadius: 10,
    minWidth: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeTxt: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // Info row
  infoRow: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoBox: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  infoBlueIcon: { fontSize: 18 },
  infoLabel: { fontSize: 11, color: '#666', fontWeight: '500' },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 1,
  },

  // Show Filters
  filterBtnRow: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  showFiltersBtn: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  filterBtnIcon: { fontSize: 14, color: '#555' },
  showFiltersTxt: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },

  // Count
  countRow: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  countTxt: { fontSize: 12, color: '#666' },

  // Grid
  grid: { paddingBottom: 16 },
  gridRow: { flexDirection: 'row', paddingHorizontal: 10, marginTop: 12 },
});
