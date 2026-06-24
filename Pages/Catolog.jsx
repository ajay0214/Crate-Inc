import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
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
  Animated,
  Dimensions,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
} from 'lucide-react-native';

import DATA from '../Components/data.json';
import CustomBottomTab from './CustomBottomTab';

const SCREEN_WIDTH = Dimensions.get('window').width;

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
      <View style={calStyles.row}>
        {DAY_LABELS.map((d, i) => (
          <View key={i} style={calStyles.cell}>
            <Text style={calStyles.dayLabel}>{d}</Text>
          </View>
        ))}
      </View>
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

// ─── Inline Cart Panel ─────────────────────────────────────────────────────
function InlineCartPanel({
  visible,
  onClose,
  cartItems,
  setCartItems,
  allProducts,
}) {
  const cartProductList = allProducts.filter(p => (cartItems[p.id] || 0) > 0);
  const totalCount = Object.values(cartItems).reduce((a, b) => a + b, 0);
  const total = cartProductList.reduce(
    (sum, p) => sum + p.price * (cartItems[p.id] || 0),
    0,
  );

  const incCartQty = id => {
    setCartItems(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  };

  const decCartQty = id => {
    const current = cartItems[id] || 0;
    if (current <= 1) {
      setCartItems(c => {
        const n = { ...c };
        delete n[id];
        return n;
      });
    } else {
      setCartItems(c => ({ ...c, [id]: current - 1 }));
    }
  };

  const removeItem = id => {
    setCartItems(c => {
      const n = { ...c };
      delete n[id];
      return n;
    });
  };

  if (!visible) return null;

  return (
    <View style={cartPanelStyles.container}>
      {/* Backdrop — tapping closes the panel */}
      <TouchableOpacity
        style={cartPanelStyles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Panel sheet */}
      <View style={cartPanelStyles.sheet}>
        {/* ── Header ── */}
        <View style={cartPanelStyles.header}>
          <Text style={cartPanelStyles.title}>
            Your Cart{' '}
            <Text style={cartPanelStyles.countTxt}>({totalCount} items)</Text>
          </Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={22} color="#1a1a1a" />
          </TouchableOpacity>
        </View>

        {/* ── Items ── */}
        {cartProductList.length === 0 ? (
          <View style={cartPanelStyles.empty}>
            <ShoppingCart size={48} color="#ccc" />
            <Text style={cartPanelStyles.emptyTxt}>Your cart is empty</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {cartProductList.map(product => {
              const qty = cartItems[product.id] || 0;
              const lineTotal = product.price * qty;
              return (
                <View key={product.id} style={cartPanelStyles.itemRow}>
                  {/* Product image */}
                  <Image
                    source={{ uri: getProductImage(product) }}
                    style={cartPanelStyles.itemImg}
                    resizeMode="cover"
                  />

                  {/* Middle: name + sku/price + qty stepper */}
                  <View style={cartPanelStyles.itemMid}>
                    <Text style={cartPanelStyles.itemName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={cartPanelStyles.itemMeta}>
                      SKU-{product.id} · ${product.price.toFixed(2)} /{' '}
                      {product.unit}
                    </Text>
                    {/* qty stepper: − qty + */}
                    <View style={cartPanelStyles.stepperRow}>
                      <TouchableOpacity
                        style={cartPanelStyles.stepBtn}
                        onPress={() => decCartQty(product.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={cartPanelStyles.stepBtnTxt}>−</Text>
                      </TouchableOpacity>
                      <Text style={cartPanelStyles.stepVal}>{qty}</Text>
                      <TouchableOpacity
                        style={cartPanelStyles.stepBtn}
                        onPress={() => incCartQty(product.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={cartPanelStyles.stepBtnTxt}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Right: delete icon + line total */}
                  <View style={cartPanelStyles.itemRight}>
                    <TouchableOpacity
                      onPress={() => removeItem(product.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash2 size={18} color="red" />
                    </TouchableOpacity>
                    <Text style={cartPanelStyles.lineTotal}>
                      ${lineTotal.toFixed(2)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* ── Footer ── */}
        <View style={cartPanelStyles.footer}>
          <View style={cartPanelStyles.totalRow}>
            <Text style={cartPanelStyles.totalLabel}>Total</Text>
            <Text style={cartPanelStyles.totalValue}>${total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={cartPanelStyles.checkoutBtn}
            activeOpacity={0.85}
          >
            <Text style={cartPanelStyles.checkoutTxt}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const cartPanelStyles = StyleSheet.create({
  // Absolutely positioned overlay filling the whole screen
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    minHeight: '95%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  countTxt: { fontSize: 16, fontWeight: '400', color: '#555' },
  empty: { alignItems: 'center', paddingVertical: 56 },
  emptyTxt: { fontSize: 14, color: '#aaa', marginTop: 14 },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    paddingHorizontal: 16,
    marginBottom: 10,
    borderRadius: 25,
  },
  itemImg: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
  },
  itemMid: { flex: 1 },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  itemMeta: { fontSize: 11, color: '#888', marginBottom: 10 },

  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 7,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    height: 32,
  },
  stepBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  stepBtnTxt: { fontSize: 20, color: '#1a1a1a', lineHeight: 24 },
  stepVal: {
    minWidth: 32,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e0e0e0',
    lineHeight: 30,
    paddingHorizontal: 6,
  },

  itemRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingVertical: 2,
    marginLeft: 10,
  },
  lineTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 4,
  },

  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  checkoutBtn: {
    backgroundColor: '#2e86de',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkoutTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

// ─── Filter Modal ──────────────────────────────────────────────────────────
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

  React.useEffect(() => {
    if (visible) {
      setLocalCat(category);
      setLocalSub(subcategory);
      setLocalSort(sortBy);
      setCatOpen(false);
      setSubOpen(false);
      setSortOpen(false);
    }
  }, [visible]);

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
    setCatOpen(false);
    setSubOpen(false);
    setSortOpen(false);
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

          {/* Search bar */}

          {/* Filters label */}
          <View style={fStyles.filterLabelRow}>
            <SlidersHorizontal size={18} color="#111827" />
            <Text style={fStyles.filterLabelTxt}>Filters</Text>
          </View>

          {/* Category + Subcategory */}
          <View style={fStyles.dropRow}>
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
                <Text style={fStyles.chevron}>{catOpen ? '▴' : '▾'}</Text>
              </TouchableOpacity>
              {catOpen && (
                <View style={fStyles.inlineDropdown}>
                  <ScrollView
                    style={{ maxHeight: 180 }}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                  >
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
                <Text style={fStyles.chevron}>{subOpen ? '▴' : '▾'}</Text>
              </TouchableOpacity>
              {subOpen && (
                <View style={fStyles.inlineDropdown}>
                  <ScrollView
                    style={{ maxHeight: 180 }}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                  >
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

          {/* Sort by */}
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
                <Text style={fStyles.selectTxt}>{getSortLabel(localSort)}</Text>
                <Text style={fStyles.chevron}>{sortOpen ? '▴' : '▾'}</Text>
              </TouchableOpacity>
              {sortOpen && (
                <View style={fStyles.inlineDropdown}>
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
                          localSort === opt.value && fStyles.dropItemTxtActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <View style={fStyles.filtersChip}>
              <SlidersHorizontal size={16} color="#111827" />
              <Text style={fStyles.filtersChipTxt}> Filters</Text>
            </View>
          </View>

          <TouchableOpacity style={fStyles.clearRow} onPress={handleClear}>
            <Text style={fStyles.clearTxt}>↺ Clear all</Text>
          </TouchableOpacity>

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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: 20,
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
    paddingVertical: 6,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, fontSize: 13, color: '#1a1a1a' },
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
  filterLabelTxt: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
    marginLeft: 8,
  },
  dropRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
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
  inlineDropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
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
  },
  filtersChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
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

// ─── Product Card ──────────────────────────────────────────────────────────
function ProductCard({
  product,
  qty,
  onIncrement,
  onDecrement,
  onAddToCart,
  isFav,
  onToggleFav,
  isInCart,
}) {
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.imgWrap}>
        <Image
          source={{ uri: getProductImage(product) }}
          style={cardStyles.img}
          resizeMode="cover"
        />
        <TouchableOpacity style={cardStyles.favBtn} onPress={onToggleFav}>
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
        <TouchableOpacity
          style={[cardStyles.addBtn, isInCart && cardStyles.addBtnAdded]}
          onPress={!isInCart ? onAddToCart : undefined}
          activeOpacity={isInCart ? 1 : 0.85}
        >
          <ShoppingCart size={18} color={isInCart ? '#666' : '#fff'} />
          <Text style={[cardStyles.addTxt, isInCart && cardStyles.addTxtAdded]}>
            {isInCart ? ' Added to Cart' : ' Add to Cart'}
          </Text>
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
  addBtnAdded: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  addTxt: { color: '#fff', fontSize: 12.5, fontWeight: '700' },
  addTxtAdded: { color: '#666' },
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
  const [deliveryDate, setDeliveryDate] = useState(new Date(2026, 5, 12));
  const [showCalendar, setShowCalendar] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [activeTab, setActiveTab] = useState('Cart');

  const [category, setCategory] = useState('All');
  const [subcategory, setSubcategory] = useState('All');
  const [sortBy, setSortBy] = useState('name-az');

  const [quantities, setQuantities] = useState({});
  const [favorites, setFavorites] = useState({});
  const [cartItems, setCartItems] = useState({});

  const [showGuideModal, setShowGuideModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderGuides, setOrderGuides] = useState([]);

  const formatDate = d =>
    `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  const cutoffDate = `8:00 AM ${
    deliveryDate.getMonth() + 1
  }/${deliveryDate.getDate()}`;

  const loadOrderGuides = async () => {
    try {
      const data = await AsyncStorage.getItem('ORDER_GUIDES');

      if (data) {
        setOrderGuides(JSON.parse(data));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const AddToGuideModal = () => (
    <Modal
      visible={showGuideModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowGuideModal(false)}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 16,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
              }}
            >
              Add to Order Guide
            </Text>

            <TouchableOpacity onPress={() => setShowGuideModal(false)}>
              <X size={20} />
            </TouchableOpacity>
          </View>

          <Text
            style={{
              color: '#666',
              marginBottom: 16,
            }}
          >
            Select a guide and group.
          </Text>

          <Text
            style={{
              fontWeight: '700',
              marginBottom: 16,
            }}
          >
            {selectedProduct?.name}
          </Text>

          <ScrollView>
            {orderGuides.map(guide => (
              <View
                key={guide.id}
                style={{
                  borderWidth: 1,
                  borderColor: '#eee',
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    padding: 12,
                    fontWeight: '700',
                  }}
                >
                  {guide.name}
                </Text>

                {guide.groups.map(group => (
                  <TouchableOpacity
                    key={group.id}
                    style={{
                      padding: 12,
                      borderTopWidth: 1,
                      borderTopColor: '#f0f0f0',
                    }}
                    onPress={() =>
                      addProductToGroup(guide.id, group.id, selectedProduct)
                    }
                  >
                    <Text>{group.name}</Text>

                    <Text
                      style={{
                        color: '#999',
                        fontSize: 12,
                      }}
                    >
                      {group.items.length} item(s)
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const addProductToGroup = async (guideId, groupId, product) => {
    const data = await AsyncStorage.getItem('ORDER_GUIDES');

    if (!data) return;

    const guides = JSON.parse(data);

    const updated = guides.map(guide => {
      if (guide.id !== guideId) return guide;

      return {
        ...guide,
        groups: guide.groups.map(group => {
          if (group.id !== groupId) return group;

          const alreadyExists = group.items.find(
            item => item.id === product.id,
          );

          if (alreadyExists) {
            return group;
          }

          return {
            ...group,
            items: [
              ...group.items,
              {
                ...product,
                quantity: 1,
              },
            ],
          };
        }),
        updatedAt: new Date().toISOString(),
      };
    });

    await AsyncStorage.setItem('ORDER_GUIDES', JSON.stringify(updated));

    await loadOrderGuides();

    setShowGuideModal(false);

    setShowGuideModal(false);
  };

  useEffect(() => {
    loadOrderGuides();
  }, []);

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
  const incQty = id => {
    setQuantities(q => ({ ...q, [id]: (q[id] || 1) + 1 }));
    setCartItems(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  };
  const decQty = id => {
    setQuantities(q => ({ ...q, [id]: Math.max(1, (q[id] || 1) - 1) }));
    setCartItems(c => ({ ...c, [id]: Math.max(0, (c[id] || 0) - 1) }));
  };
  const addToCart = id =>
    setCartItems(c => ({ ...c, [id]: (c[id] || 0) + getQty(id) }));
  const toggleFav = id => setFavorites(f => ({ ...f, [id]: !f[id] }));

  const rows = [];
  for (let i = 0; i < filteredProducts.length; i += 2) {
    rows.push(filteredProducts.slice(i, i + 2));
  }

  return (
    // Use position: 'relative' on the outer wrapper so the panel overlay can position itself absolutely within it
    <View style={{ flex: 1 }}>
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
            {/* Cart icon — opens inline cart panel */}
            <TouchableOpacity
              style={styles.cartWrap}
              onPress={() => setShowCart(true)}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ShoppingCart size={22} color="#2e86de" />
              {totalCartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeTxt}>{totalCartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
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
                  onSelect={date => setDeliveryDate(date)}
                  onClose={() => setShowCalendar(false)}
                />
              )}

              {/* Show Filters button */}
              <View style={styles.searchFilterRow}>
                <View style={styles.searchContainer}>
                  <Search size={16} color="#777" />

                  <TextInput
                    placeholder="Search products..."
                    placeholderTextColor="#777"
                    style={styles.searchInput}
                  />
                </View>

                <TouchableOpacity
                  style={styles.filterContainer}
                  onPress={() => setShowFilters(true)}
                  activeOpacity={0.8}
                >
                  <SlidersHorizontal size={20} color="#fff" />
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
                  onToggleFav={() => {
                    setSelectedProduct(product);
                    loadOrderGuides();
                    setShowGuideModal(true);
                  }}
                  isInCart={
                    !!(cartItems[product.id] && cartItems[product.id] > 0)
                  }
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

        <AddToGuideModal />

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
              case 'Orders':
                navigation.navigate('Orders');
                break;
            }
          }}
        />
      </SafeAreaView>

      {/* ── Inline Cart Panel — rendered OUTSIDE SafeAreaView so it covers everything ── */}
      <InlineCartPanel
        visible={showCart}
        onClose={() => setShowCart(false)}
        cartItems={cartItems}
        setCartItems={setCartItems}
        allProducts={ALL_PRODUCTS}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  headerSub: { fontSize: 11.5, color: '#888', marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { fontSize: 12, fontWeight: '700', color: '#555' },
  cartWrap: { position: 'relative', padding: 2 },
  cartBadge: {
    position: 'absolute',
    top: -6,
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
  infoRow: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoBox: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  infoLabel: { fontSize: 11, color: '#666', fontWeight: '500' },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 1,
  },
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
  showFiltersTxt: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  countRow: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  countTxt: { fontSize: 12, color: '#666' },
  grid: { paddingBottom: 16 },
  gridRow: { flexDirection: 'row', paddingHorizontal: 10, marginTop: 12 },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },

  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#3680cba2',
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 48,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#111827',
  },

  filterContainer: {
    width: 46,
    height: 46,
    marginLeft: 10,
    borderRadius: 14,
    backgroundColor: '#2e86de',
    borderWidth: 1.5,
    borderColor: '#2e86de',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
});
