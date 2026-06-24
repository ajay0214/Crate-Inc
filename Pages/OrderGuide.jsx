import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  TextInput,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  Check,
} from 'lucide-react-native';
import CustomBottomTab from './CustomBottomTab';
import DATA from '../Components/data.json';

const H_PADDING = 16;
const STORAGE_KEY = 'ORDER_GUIDES';

// ─── Flat list of ALL catalog products (for cart image/name lookup) ─────────
function getAllCatalogProducts() {
  const all = [];
  DATA.forEach(cat => {
    cat.subcategories.forEach(sub => {
      sub.products.forEach(p => all.push(p));
    });
  });
  return all;
}
const ALL_CATALOG_PRODUCTS = getAllCatalogProducts();

// ─── Fallback images (same as Catalog) ─────────────────────────────────────
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
  if (product?.image) return product.image;
  return FALLBACK_IMAGES[product?.category] || DEFAULT_FALLBACK;
}

/* ================================================================
   RELATIVE TIME HELPER
================================================================ */
const getRelativeTime = isoString => {
  if (!isoString) return 'just now';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? '' : 's'} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr${diffHr === 1 ? '' : 's'} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
};

/* ================================================================
   CART PANEL (matches Catalog screen cart modal exactly)
================================================================ */
function InlineCartPanel({
  visible,
  onClose,
  cartItems,
  setCartItems,
  allGuideProducts,
}) {
  // Build a merged product map: guide products first, then fall back to catalog products
  // This ensures catalog-added items (which only exist in ALL_CATALOG_PRODUCTS) show images/names
  const productMap = {};
  ALL_CATALOG_PRODUCTS.forEach(p => {
    productMap[p.id] = p;
  });
  allGuideProducts.forEach(p => {
    productMap[p.id] = p;
  }); // guide items override (have quantity etc)

  const cartProductList = Object.keys(cartItems)
    .filter(id => (cartItems[id] || 0) > 0)
    .map(id => productMap[id])
    .filter(Boolean);
  const totalCount = Object.values(cartItems).reduce((a, b) => a + b, 0);
  const total = cartProductList.reduce(
    (sum, p) => sum + (p.price || 0) * (cartItems[p.id] || 0),
    0,
  );

  const incCartQty = id =>
    setCartItems(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
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
  const removeItem = id =>
    setCartItems(c => {
      const n = { ...c };
      delete n[id];
      return n;
    });

  if (!visible) return null;

  return (
    <View style={cartStyles.container}>
      <TouchableOpacity
        style={cartStyles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={cartStyles.sheet}>
        {/* Header */}
        <View style={cartStyles.header}>
          <Text style={cartStyles.title}>
            Your Cart{' '}
            <Text style={cartStyles.countTxt}>({totalCount} items)</Text>
          </Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={22} color="#1a1a1a" />
          </TouchableOpacity>
        </View>

        {/* Items */}
        {cartProductList.length === 0 ? (
          <View style={cartStyles.empty}>
            <ShoppingCart size={48} color="#ccc" />
            <Text style={cartStyles.emptyTxt}>Your cart is empty</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {cartProductList.map(product => {
              const qty = cartItems[product.id] || 0;
              const lineTotal = (product.price || 0) * qty;
              return (
                <View key={product.id} style={cartStyles.itemRow}>
                  <Image
                    source={{ uri: getProductImage(product) }}
                    style={cartStyles.itemImg}
                    resizeMode="cover"
                  />
                  <View style={cartStyles.itemMid}>
                    <Text style={cartStyles.itemName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={cartStyles.itemMeta}>
                      SKU-{product.id} · ${(product.price || 0).toFixed(2)} /{' '}
                      {product.unit}
                    </Text>
                    <View style={cartStyles.stepperRow}>
                      <TouchableOpacity
                        style={cartStyles.stepBtn}
                        onPress={() => decCartQty(product.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={cartStyles.stepBtnTxt}>−</Text>
                      </TouchableOpacity>
                      <Text style={cartStyles.stepVal}>{qty}</Text>
                      <TouchableOpacity
                        style={cartStyles.stepBtn}
                        onPress={() => incCartQty(product.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={cartStyles.stepBtnTxt}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={cartStyles.itemRight}>
                    <TouchableOpacity
                      onPress={() => removeItem(product.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash2 size={18} color="red" />
                    </TouchableOpacity>
                    <Text style={cartStyles.lineTotal}>
                      ${lineTotal.toFixed(2)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Footer */}
        <View style={cartStyles.footer}>
          <View style={cartStyles.totalRow}>
            <Text style={cartStyles.totalLabel}>Total</Text>
            <Text style={cartStyles.totalValue}>${total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={cartStyles.checkoutBtn} activeOpacity={0.85}>
            <Text style={cartStyles.checkoutTxt}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const cartStyles = StyleSheet.create({
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

/* ================================================================
   PRODUCT CARD — matches screenshot exactly
================================================================ */
function ProductCard({
  item,
  onIncrement,
  onDecrement,
  onAddToCart,
  onMenuPress,
  isInCart,
}) {
  const price = item.price || 0;
  const qty = item.quantity || 1;

  return (
    <View style={pcStyles.card}>
      {/* Image */}
      <View style={pcStyles.imgWrap}>
        <Image
          source={{ uri: getProductImage(item) }}
          style={pcStyles.img}
          resizeMode="cover"
        />
        {/* 3-dot menu */}
        <TouchableOpacity
          style={pcStyles.menuBtn}
          activeOpacity={0.7}
          onPress={event => {
            const { pageX, pageY } = event.nativeEvent;

            onMenuPress({
              x: pageX,
              y: pageY,
            });
          }}
        >
          <MoreVertical size={18} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={pcStyles.body}>
        <Text style={pcStyles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={pcStyles.cat}>{item.category}</Text>
        <Text style={pcStyles.pack}>Pack Size: 1 {item.unit}</Text>
        <Text style={pcStyles.price}>
          ${price.toFixed(2)} / {item.unit}
        </Text>

        {/* Qty stepper */}
        <View style={pcStyles.qtyRow}>
          <TouchableOpacity
            style={pcStyles.qtyBtn}
            onPress={onDecrement}
            activeOpacity={0.7}
          >
            <Text style={pcStyles.qtyBtnTxt}>-</Text>
          </TouchableOpacity>
          <View style={pcStyles.qtyValWrap}>
            <Text style={pcStyles.qtyVal}>{qty}</Text>
          </View>
          <TouchableOpacity
            style={pcStyles.qtyBtn}
            onPress={onIncrement}
            activeOpacity={0.7}
          >
            <Text style={pcStyles.qtyBtnTxt}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Add to Cart / Added */}
        <TouchableOpacity
          style={[pcStyles.addBtn, isInCart && pcStyles.addBtnAdded]}
          onPress={!isInCart ? onAddToCart : undefined}
          activeOpacity={isInCart ? 1 : 0.85}
        >
          <ShoppingCart size={15} color={isInCart ? '#666' : '#fff'} />
          <Text style={[pcStyles.addTxt, isInCart && pcStyles.addTxtAdded]}>
            {isInCart ? ' Added' : ' Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const pcStyles = StyleSheet.create({
  card: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  imgWrap: { position: 'relative' },
  img: { width: '100%', height: 120 },
  menuBtn: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 9 },
  name: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 2 },
  cat: { fontSize: 11, color: '#6B7280', marginBottom: 1 },
  pack: { fontSize: 11, color: '#6B7280', marginBottom: 5 },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  qtyRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    height: 36,
  },
  qtyBtn: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  qtyBtnTxt: { fontSize: 20, color: '#1a1a1a', lineHeight: 24 },
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
    backgroundColor: '#2e86de',
    borderRadius: 8,
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

/* ================================================================
   MODALS — outside main component
================================================================ */
const GuideNameModal = ({
  visible,
  title,
  subtitle,
  value,
  onChangeText,
  error,
  onSave,
  onClose,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    statusBarTranslucent
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        <View style={styles.modalHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Text style={styles.modalSubtitle}>{subtitle}</Text>
          </View>
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <X size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <Text style={styles.inputLabel}>Order Guide Name</Text>
        <TextInput
          style={[styles.textInput, error ? styles.textInputError : null]}
          placeholder="Eg: Weekly Seafood Order"
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={onSave}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.85}
          onPress={onSave}
        >
          <Text style={styles.saveButtonText}>Save Order Guide</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          activeOpacity={0.7}
          onPress={onClose}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const GroupNameModal = ({
  visible,
  value,
  onChangeText,
  error,
  onSave,
  onClose,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    statusBarTranslucent
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        <View style={styles.modalHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.modalTitle}>Rename Group</Text>
            <Text style={styles.modalSubtitle}>
              Enter a new name for this group.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <X size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <Text style={styles.inputLabel}>Group Name</Text>
        <TextInput
          style={[styles.textInput, error ? styles.textInputError : null]}
          placeholder="Eg: Seafood"
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={onSave}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.85}
          onPress={onSave}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          activeOpacity={0.7}
          onPress={onClose}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const GroupMenuModal = ({ visible, onRename, onDelete, onClose }) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    statusBarTranslucent
    onRequestClose={onClose}
  >
    <TouchableOpacity
      style={styles.menuOverlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <View style={styles.groupMenuCard}>
        <TouchableOpacity
          style={styles.groupMenuItem}
          activeOpacity={0.7}
          onPress={onRename}
        >
          <Pencil size={15} color="#374151" style={{ marginRight: 10 }} />
          <Text style={styles.groupMenuItemText}>Rename</Text>
        </TouchableOpacity>
        <View style={styles.groupMenuDivider} />
        <TouchableOpacity
          style={styles.groupMenuItem}
          activeOpacity={0.7}
          onPress={onDelete}
        >
          <Trash2 size={15} color="#EF4444" style={{ marginRight: 10 }} />
          <Text style={[styles.groupMenuItemText, { color: '#EF4444' }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </Modal>
);

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function OrderGuideScreen({ navigation }) {
  const [screen, setScreen] = useState('empty');
  const [activeGuideId, setActiveGuideId] = useState(null);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [guides, setGuides] = useState([]);

  const [modalType, setModalType] = useState(null);
  const [modalInput, setModalInput] = useState('');
  const [modalError, setModalError] = useState('');
  const [menuGuideId, setMenuGuideId] = useState(null);
  const [menuGroupId, setMenuGroupId] = useState(null);
  const [deleteGuideId, setDeleteGuideId] = useState(null);

  const [isAllSelected, setIsAllSelected] = useState(false);

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const [showProductMenu, setShowProductMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showMoveGroupModal, setShowMoveGroupModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Category');
  const [, forceUpdate] = useState(0);

  // Cart state — shared across catalog & order guide
  const [cartItems, setCartItems] = useState({});
  const [showCart, setShowCart] = useState(false);

  // Load cart from AsyncStorage so it's shared with Catalog
  const CART_KEY = 'CART_ITEMS';
  const loadCart = async () => {
    try {
      const data = await AsyncStorage.getItem(CART_KEY);
      if (data) setCartItems(JSON.parse(data));
    } catch (e) {}
  };
  const saveCart = async updated => {
    try {
      await AsyncStorage.setItem(CART_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  // Persist cart changes
  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  useEffect(() => {
    const interval = setInterval(() => forceUpdate(prev => prev + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  /* AsyncStorage */
  useEffect(() => {
    loadGuides();
    loadCart();
  }, []);

  const loadGuides = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        setGuides(parsed);
        if (parsed.length > 0) setScreen('list');
      }
    } catch (e) {
      console.error('Failed to load guides:', e);
    }
  };

  const saveGuides = async updatedGuides => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGuides));
    } catch (e) {
      console.error('Failed to save guides:', e);
    }
  };

  /* Helpers */
  const openModal = (type, prefill = '') => {
    setModalType(type);
    setModalInput(prefill);
    setModalError('');
  };
  const closeModal = () => {
    setModalType(null);
    setModalInput('');
    setModalError('');
    setMenuGuideId(null);
    setMenuGroupId(null);
  };
  const handleModalInputChange = useCallback(t => {
    setModalInput(t);
    if (t.trim()) setModalError('');
  }, []);
  const getGuide = id => guides.find(g => g.id === id);
  const getGroup = (guideId, groupId) =>
    getGuide(guideId)?.groups.find(gr => gr.id === groupId);

  /* CRUD: Guide */
  const createGuide = () => {
    if (!modalInput.trim()) {
      setModalError('Please enter a name for your order guide.');
      return;
    }
    const now = new Date().toISOString();
    const newGuide = {
      id: Date.now().toString(),
      name: modalInput.trim(),
      isDefault: guides.length === 0,
      createdAt: now,
      updatedAt: now,
      expanded: false,
      groups: [
        { id: Date.now().toString() + '_g', name: 'Default Group', items: [] },
      ],
    };
    const updated = [...guides, newGuide];
    setGuides(updated);
    saveGuides(updated);
    setActiveGuideId(newGuide.id);
    setActiveGroupId(newGuide.groups[0].id);
    closeModal();
    setScreen('detail');
  };

  const renameGuide = () => {
    if (!modalInput.trim()) {
      setModalError('Please enter a name.');
      return;
    }
    const updated = guides.map(g =>
      g.id === menuGuideId
        ? { ...g, name: modalInput.trim(), updatedAt: new Date().toISOString() }
        : g,
    );
    setGuides(updated);
    saveGuides(updated);
    closeModal();
  };

  const confirmDeleteGuide = () => {
    const updated = guides.filter(g => g.id !== deleteGuideId);
    setGuides(updated);
    saveGuides(updated);
    if (updated.length === 0) setScreen('empty');
    setDeleteGuideId(null);
  };

  const toggleExpand = guideId => {
    const updated = guides.map(g =>
      g.id === guideId ? { ...g, expanded: !g.expanded } : g,
    );
    setGuides(updated);
    saveGuides(updated);
  };

  /* CRUD: Group */
  const addGroup = guideId => {
    const name = `Group ${(getGuide(guideId)?.groups.length || 0) + 1}`;
    const newGroup = { id: Date.now().toString(), name, items: [] };
    const updated = guides.map(g =>
      g.id === guideId
        ? {
            ...g,
            groups: [...g.groups, newGroup],
            updatedAt: new Date().toISOString(),
          }
        : g,
    );
    setGuides(updated);
    saveGuides(updated);
  };

  const renameGroup = () => {
    if (!modalInput.trim()) {
      setModalError('Please enter a name.');
      return;
    }
    const targetGuideId = menuGuideId;
    const targetGroupId = menuGroupId;
    const newName = modalInput.trim();
    const updated = guides.map(g =>
      g.id === targetGuideId
        ? {
            ...g,
            updatedAt: new Date().toISOString(),
            groups: g.groups.map(gr =>
              gr.id === targetGroupId ? { ...gr, name: newName } : gr,
            ),
          }
        : g,
    );
    setGuides(updated);
    saveGuides(updated);
    closeModal();
  };

  const deleteGroup = (guideId, groupId) => {
    const updated = guides.map(g =>
      g.id === guideId
        ? {
            ...g,
            updatedAt: new Date().toISOString(),
            groups: g.groups.filter(gr => gr.id !== groupId),
          }
        : g,
    );
    setGuides(updated);
    saveGuides(updated);
    closeModal();
  };

  /* Item quantity in order guide */
  const updateQuantity = (itemId, type) => {
    const updated = guides.map(guide => ({
      ...guide,
      groups: guide.groups.map(group => ({
        ...group,
        items: group.items.map(item => {
          if (item.id !== itemId) return item;
          return {
            ...item,
            quantity:
              type === 'inc'
                ? item.quantity + 1
                : Math.max(1, item.quantity - 1),
          };
        }),
      })),
    }));
    setGuides(updated);
    saveGuides(updated);
  };

  const deleteProduct = itemId => {
    const updated = guides.map(guide => ({
      ...guide,
      groups: guide.groups.map(group => ({
        ...group,
        items: group.items.filter(item => item.id !== itemId),
      })),
    }));
    setGuides(updated);
    saveGuides(updated);
    setShowProductMenu(false);
  };

  const moveProductsToGroup = targetGroupId => {
    if (!selectedItem) return;
    const updated = guides.map(guide => {
      if (guide.id !== activeGuideId) return guide;
      return {
        ...guide,
        groups: guide.groups.map(group => {
          if (group.id === activeGroupId) {
            return {
              ...group,
              items: group.items.filter(item => item.id !== selectedItem.id),
            };
          }
          if (group.id === targetGroupId) {
            const alreadyExists = group.items.find(
              i => i.id === selectedItem.id,
            );
            if (alreadyExists) return group;
            return { ...group, items: [...group.items, selectedItem] };
          }
          return group;
        }),
      };
    });
    setGuides(updated);
    saveGuides(updated);
    setShowMoveGroupModal(false);
    setShowProductMenu(false);
  };

  const updatePar = (itemId, value) => {
    const updated = guides.map(guide => ({
      ...guide,
      groups: guide.groups.map(group => ({
        ...group,
        items: group.items.map(item =>
          item.id === itemId ? { ...item, par: Number(value) } : item,
        ),
      })),
    }));
    setGuides(updated);
    saveGuides(updated);
  };

  const activeGuide = getGuide(activeGuideId);
  const activeGroup = activeGuide?.groups.find(gr => gr.id === activeGroupId);

  // Collect all products from all guides for cart display
  const allGuideProducts = guides.flatMap(g =>
    g.groups.flatMap(gr => gr.items),
  );

  const totalCartCount = Object.values(cartItems).reduce((a, b) => a + b, 0);

  /* ── Screens ── */
  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
        <Menu size={22} color="#111827" />
      </TouchableOpacity>
      <View style={styles.headerTitleWrap}>
        <Text style={styles.headerTitle}>Order Guide</Text>
        <Text style={styles.headerSubtitle}>
          Build and review guided orders
        </Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.avatar} activeOpacity={0.7}>
          <Text style={styles.avatarText}>AV</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cartButton}
          activeOpacity={0.7}
          onPress={() => setShowCart(true)}
        >
          <ShoppingCart size={20} color="#2e86de" />
          {totalCartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalCartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyScreen = () => (
    <View style={styles.contentWrap}>
      <View style={styles.emptyCard}>
        <View style={styles.starCircle}>
          <Star size={32} color="#2e86de" strokeWidth={1.8} />
        </View>
        <Text style={styles.emptyTitle}>Order Guides</Text>
        <Text style={styles.emptySubtitle}>
          Create and save frequently ordered{'\n'}product lists for faster
          ordering and{'\n'}checkout.
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          activeOpacity={0.85}
          onPress={() => openModal('createGuide')}
        >
          <Plus size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.createButtonText}>Create Order Guide</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const DetailScreen = () => {
    const items = activeGroup?.items || [];
    const rows = [];
    for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));

    return (
      <ScrollView
        contentContainerStyle={styles.detailScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Breadcrumb */}
        <View style={styles.breadcrumbRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setScreen('list')}
            activeOpacity={0.7}
          >
            <ChevronLeft size={18} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.breadcrumbText}>
            {activeGuide?.name}
            <Text style={styles.breadcrumbSep}> / </Text>
            <Text style={styles.breadcrumbActive}>{activeGroup?.name}</Text>
          </Text>
        </View>

        {/* Title row */}
        <View style={styles.detailTitleRow}>
          <Text style={styles.detailTitle}>{activeGroup?.name}</Text>
          <View style={styles.itemsBadge}>
            <Text style={styles.itemsBadgeText}>{items.length} items</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.detailActionRow}>
          <TouchableOpacity
            style={styles.detailActionBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Catolog')}
          >
            <Plus size={15} color="#111827" style={{ marginRight: 4 }} />
            <Text style={styles.detailActionBtnText}>Add Products</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailActionBtn} activeOpacity={0.7}>
            <Plus size={15} color="#111827" style={{ marginRight: 4 }} />
            <Text style={styles.detailActionBtnText}>Add to Quick Order</Text>
          </TouchableOpacity>
        </View>

        {/* Select All button — only when items exist */}
        {items.length > 0 && (
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <TouchableOpacity
              style={styles.selectAllBtn}
              activeOpacity={0.8}
              onPress={() => {
                if (!isAllSelected) {
                  const updatedCart = { ...cartItems };

                  items.forEach(item => {
                    updatedCart[item.id] = item.quantity || 1;
                  });

                  setCartItems(updatedCart);
                  setIsAllSelected(true);
                } else {
                  const updatedCart = { ...cartItems };

                  items.forEach(item => {
                    delete updatedCart[item.id];
                  });

                  setCartItems(updatedCart);
                  setIsAllSelected(false);
                }
              }}
            >
              <ShoppingCart size={15} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.selectAllTxt}>
                {isAllSelected ? `Selected (${items.length})` : 'Select All'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.divider} />

        {/* Product grid */}
        {items.length > 0 ? (
          <View>
            {rows.map((row, ri) => (
              <View key={ri} style={styles.gridRow}>
                {row.map(item => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    onIncrement={() => updateQuantity(item.id, 'inc')}
                    onDecrement={() => updateQuantity(item.id, 'dec')}
                    onAddToCart={() =>
                      setCartItems(c => ({
                        ...c,
                        [item.id]: (c[item.id] || 0) + (item.quantity || 1),
                      }))
                    }
                    isInCart={!!(cartItems[item.id] && cartItems[item.id] > 0)}
                    onMenuPress={position => {
                      setSelectedItem(item);

                      setMenuPosition({
                        top: position.y + 10,
                        left: position.x - 150,
                      });

                      setShowProductMenu(true);
                    }}
                  />
                ))}
                {row.length === 1 && (
                  <View style={{ flex: 1, marginHorizontal: 5 }} />
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.detailEmptyWrap}>
            <View style={styles.basketCircle}>
              <ShoppingBasket size={30} color="#9CA3AF" />
            </View>
            <Text style={styles.detailEmptyTitle}>No products added yet</Text>
            <Text style={styles.detailEmptySubtitle}>
              Add products from the catalog to build{'\n'}this order guide
              group.
            </Text>
            <TouchableOpacity
              style={styles.addProductsBtn}
              onPress={() => navigation.navigate('Catolog')}
            >
              <Plus size={16} color="#fff" />
              <Text style={styles.addProductsBtnText}>Add Products</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  };

  const ListScreen = () => (
    <ScrollView
      contentContainerStyle={styles.listScroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.listHeaderRow}>
        <Text style={styles.listHeaderTitle}>Order Guides</Text>
        <TouchableOpacity
          style={styles.listCreateBtn}
          activeOpacity={0.85}
          onPress={() => openModal('createGuide')}
        >
          <Plus size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.listCreateBtnText}>Create</Text>
        </TouchableOpacity>
      </View>
      {guides.map(guide => (
        <View key={guide.id} style={[styles.guideCard, { marginBottom: 12 }]}>
          <View style={styles.guideCardHeader}>
            <GripVertical
              size={16}
              color="#9CA3AF"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.guideCardName}>{guide.name}</Text>
            {guide.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => toggleExpand(guide.id)}
              style={{ marginLeft: 'auto', padding: 8 }}
              activeOpacity={0.7}
            >
              {guide.expanded ? (
                <ChevronDown size={18} color="#6B7280" />
              ) : (
                <ChevronRight size={18} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.guideCardMeta}>
            {guide.groups.reduce((a, g) => a + g.items.length, 0)} items ·
            Updated {getRelativeTime(guide.updatedAt)}
          </Text>
          {guide.expanded && (
            <>
              <View style={styles.guideCardDivider} />
              {guide.groups.map(group => (
                <View key={group.id} style={styles.groupRow}>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    activeOpacity={0.7}
                    onPress={() => {
                      setActiveGuideId(guide.id);
                      setActiveGroupId(group.id);
                      setScreen('detail');
                    }}
                  >
                    <Text style={styles.groupRowName}>{group.name}</Text>
                  </TouchableOpacity>
                  <Text style={styles.groupRowCount}>{group.items.length}</Text>
                  <TouchableOpacity
                    style={{ marginLeft: 8, padding: 4 }}
                    activeOpacity={0.7}
                    onPress={() => {
                      setMenuGuideId(guide.id);
                      setMenuGroupId(group.id);
                      openModal('groupMenu');
                    }}
                  >
                    <MoreVertical size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addGroupBtn}
                activeOpacity={0.7}
                onPress={() => addGroup(guide.id)}
              >
                <Plus size={15} color="#2e86de" style={{ marginRight: 6 }} />
                <Text style={styles.addGroupBtnText}>Add Group</Text>
              </TouchableOpacity>
              <View style={styles.guideCardDivider} />
              <View style={styles.renameDeleteRow}>
                <TouchableOpacity
                  style={styles.renameBtn}
                  activeOpacity={0.7}
                  onPress={() => {
                    setMenuGuideId(guide.id);
                    openModal('renameGuide', guide.name);
                  }}
                >
                  <Pencil
                    size={14}
                    color="#374151"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.renameBtnText}>Rename</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  activeOpacity={0.7}
                  onPress={() => setDeleteGuideId(guide.id)}
                >
                  <Trash2
                    size={14}
                    color="#EF4444"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.85}>
                <Download
                  size={16}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.downloadBtnText}>Download PAR Sheet</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );

  /* ── Render ── */
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header />

        {screen === 'empty' && <EmptyScreen />}
        {screen === 'detail' && <DetailScreen />}
        {screen === 'list' && <ListScreen />}

        {/* Guide name modals */}
        <GuideNameModal
          visible={modalType === 'createGuide'}
          title="Create Order Guide"
          subtitle="Enter a name for your order guide list."
          value={modalInput}
          onChangeText={handleModalInputChange}
          error={modalError}
          onSave={createGuide}
          onClose={closeModal}
        />
        <GuideNameModal
          visible={modalType === 'renameGuide'}
          title="Rename Order Guide"
          subtitle="Enter a new name for your order guide."
          value={modalInput}
          onChangeText={handleModalInputChange}
          error={modalError}
          onSave={renameGuide}
          onClose={closeModal}
        />
        <GroupNameModal
          visible={modalType === 'renameGroup'}
          value={modalInput}
          onChangeText={handleModalInputChange}
          error={modalError}
          onSave={renameGroup}
          onClose={closeModal}
        />
        <GroupMenuModal
          visible={modalType === 'groupMenu'}
          onRename={() => {
            const grp = getGroup(menuGuideId, menuGroupId);
            setModalType('renameGroup');
            setModalInput(grp?.name || '');
            setModalError('');
          }}
          onDelete={() => deleteGroup(menuGuideId, menuGroupId)}
          onClose={closeModal}
        />

        {/* Delete guide confirmation */}
        <Modal
          visible={deleteGuideId !== null}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setDeleteGuideId(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.deleteModalCard}>
              <View style={styles.deleteIconWrap}>
                <Trash2 size={30} color="#EF4444" />
              </View>
              <Text style={styles.deleteTitle}>Delete Order Guide?</Text>
              <Text style={styles.deleteSubtitle}>
                This action cannot be undone. All groups and products inside
                this guide will be permanently removed.
              </Text>
              <View style={styles.deleteBtnRow}>
                <TouchableOpacity
                  style={styles.cancelDeleteBtn}
                  onPress={() => setDeleteGuideId(null)}
                >
                  <Text style={styles.cancelDeleteBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmDeleteBtn}
                  onPress={confirmDeleteGuide}
                >
                  <Text style={styles.confirmDeleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Product 3-dot context menu */}
        <Modal visible={showProductMenu} transparent animationType="fade">
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
            onPress={() => setShowProductMenu(false)}
          >
            <View
              style={[
                styles.productMenuCard,
                {
                  top: menuPosition.top,
                  left: menuPosition.left,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.productMenuItem}
                onPress={() => {
                  setShowMoveGroupModal(true);
                  setShowProductMenu(false);
                }}
              >
                <Text style={styles.productMenuIcon}>→</Text>
                <Text style={styles.productMenuTxt}>Change group</Text>
              </TouchableOpacity>
              <View style={styles.productMenuDivider} />
              <TouchableOpacity
                style={styles.productMenuItem}
                onPress={() => setShowProductMenu(false)}
              >
                <Pencil size={14} color="#374151" style={{ marginRight: 8 }} />
                <Text style={styles.productMenuTxt}>Edit PAR</Text>
              </TouchableOpacity>
              <View style={styles.productMenuDivider} />
              <TouchableOpacity
                style={styles.productMenuItem}
                onPress={() => selectedItem && deleteProduct(selectedItem.id)}
              >
                <Trash2 size={14} color="#EF4444" style={{ marginRight: 8 }} />
                <Text style={[styles.productMenuTxt, { color: '#EF4444' }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Move to group modal */}
        <Modal visible={showMoveGroupModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Change Group</Text>
                <TouchableOpacity onPress={() => setShowMoveGroupModal(false)}>
                  <X size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {activeGuide?.groups
                  .filter(g => g.id !== activeGroupId)
                  .map(group => (
                    <TouchableOpacity
                      key={group.id}
                      style={styles.moveGroupItem}
                      onPress={() => moveProductsToGroup(group.id)}
                    >
                      <Text style={styles.moveGroupName}>{group.name}</Text>
                      <Text style={styles.moveGroupCount}>
                        {group.items.length} items
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <CustomBottomTab
          activeTab="Category"
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

      {/* Cart panel — outside SafeAreaView to cover full screen */}
      <InlineCartPanel
        visible={showCart}
        onClose={() => setShowCart(false)}
        cartItems={cartItems}
        setCartItems={setCartItems}
        allGuideProducts={allGuideProducts}
      />
    </View>
  );
}

/* ================================================================
   STYLES
================================================================ */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: H_PADDING,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F4',
    backgroundColor: '#FFFFFF',
  },
  menuButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  headerSubtitle: { fontSize: 12.5, color: '#9CA3AF', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 12, fontWeight: '700', color: '#374151' },
  cartButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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
  cartBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },

  // Empty screen
  contentWrap: { flex: 1, paddingHorizontal: H_PADDING, paddingTop: 24 },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F2F4',
    alignItems: 'center',
    paddingVertical: 44,
    paddingHorizontal: 24,
    marginTop: 80,
  },
  starCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e86de',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 20,
  },
  createButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  // Detail screen
  detailScroll: {
    paddingHorizontal: H_PADDING,
    paddingTop: 16,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  breadcrumbText: { fontSize: 13, color: '#6B7280' },
  breadcrumbSep: { color: '#9CA3AF' },
  breadcrumbActive: { fontSize: 13, fontWeight: '700', color: '#111827' },
  detailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginRight: 10,
  },
  itemsBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  itemsBadgeText: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  detailActionRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  detailActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  detailActionBtnText: { fontSize: 13, fontWeight: '600', color: '#111827' },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e86de',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
  },
  selectAllTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  divider: { height: 1, backgroundColor: '#F1F2F4', marginBottom: 16 },
  gridRow: { flexDirection: 'row', marginBottom: 12 },
  detailEmptyWrap: { alignItems: 'center', paddingTop: 10 },
  basketCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  detailEmptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  detailEmptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addProductsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e86de',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  addProductsBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },

  // List screen
  listScroll: {
    paddingHorizontal: H_PADDING,
    paddingTop: 20,
    paddingBottom: 40,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  listHeaderTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  listCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e86de',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  listCreateBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  guideCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  guideCardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#16a34a1b',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  defaultBadgeText: { fontSize: 11, fontWeight: '700', color: '#16A34A' },
  guideCardMeta: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  guideCardDivider: {
    height: 1,
    backgroundColor: '#F1F2F4',
    marginVertical: 12,
  },
  groupRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  groupRowName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  groupRowCount: { fontSize: 14, fontWeight: '600', color: '#374151' },
  addGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  addGroupBtnText: { fontSize: 13, fontWeight: '600', color: '#2e86de' },
  renameDeleteRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  renameBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 11,
  },
  renameBtnText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F2',
    borderRadius: 10,
    paddingVertical: 11,
  },
  deleteBtnText: { fontSize: 13, fontWeight: '600', color: '#EF4444' },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e86de',
    borderRadius: 10,
    paddingVertical: 14,
  },
  downloadBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  // Modals
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupMenuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  groupMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  groupMenuItemText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  groupMenuDivider: { height: 1, backgroundColor: '#F1F2F4' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: { fontSize: 13, color: '#6B7280' },
  modalCloseBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#2e86de',
    borderRadius: 15,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontSize: 12,
    color: '#111827',
    marginBottom: 4,
    backgroundColor: '#FAFAFA',
  },
  textInputError: { borderColor: '#EF4444' },
  errorText: { fontSize: 12, color: '#EF4444', marginBottom: 8, marginLeft: 2 },
  saveButton: {
    backgroundColor: '#2e86de',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  saveButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: { color: '#374151', fontWeight: '600', fontSize: 14 },

  // Product context menu (3-dot)
  productMenuCard: {
    position: 'absolute',
    width: 170,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  productMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  productMenuIcon: { fontSize: 14, color: '#374151', marginRight: 8 },
  productMenuTxt: { fontSize: 12, fontWeight: '500', color: '#374151' },
  productMenuDivider: { height: 1, backgroundColor: '#f1f2f4' },

  // Move group modal
  moveGroupItem: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moveGroupName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  moveGroupCount: { fontSize: 12, color: '#9CA3AF' },

  // Delete confirmation modal
  deleteModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  deleteIconWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  deleteSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  deleteBtnRow: { flexDirection: 'row', width: '100%' },
  cancelDeleteBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelDeleteBtnText: { color: '#374151', fontWeight: '700' },
  confirmDeleteBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmDeleteBtnText: { color: '#FFFFFF', fontWeight: '700' },
});
