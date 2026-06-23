import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
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
} from 'lucide-react-native';
import CustomBottomTab from './CustomBottomTab';

const H_PADDING = 16;
const STORAGE_KEY = 'ORDER_GUIDES';

/* ================================================================
   RELATIVE TIME HELPER
   Returns strings like "just now", "5 mins ago", "2 hrs ago", "3 days ago"
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
   MODALS — defined OUTSIDE the main component so they never
   remount on parent state changes (which caused keyboard dismiss)
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

  const [activeTab, setActiveTab] = useState('Category');

  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(prev => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const confirmDeleteGuide = () => {
    const updated = guides.filter(g => g.id !== deleteGuideId);

    setGuides(updated);
    saveGuides(updated);

    if (updated.length === 0) {
      setScreen('empty');
    }

    setDeleteGuideId(null);
  };

  /* AsyncStorage */
  useEffect(() => {
    loadGuides();
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
      updatedAt: now, // ← track update time
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
        ? { ...g, name: modalInput.trim(), updatedAt: new Date().toISOString() } // ← stamp
        : g,
    );
    setGuides(updated);
    saveGuides(updated);
    closeModal();
  };

  const deleteGuide = guideId => {
    const updated = guides.filter(g => g.id !== guideId);
    setGuides(updated);
    saveGuides(updated);
    if (updated.length === 0) setScreen('empty');
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
          } // ← stamp
        : g,
    );
    setGuides(updated);
    saveGuides(updated);
  };

  /*
   * FIX: renameGroup was broken because closeModal() cleared menuGuideId/menuGroupId
   * before the map() could read them. We now capture them in local vars first,
   * then close the modal, then apply the rename using the captured values.
   */
  const renameGroup = () => {
    if (!modalInput.trim()) {
      setModalError('Please enter a name.');
      return;
    }

    // Capture IDs before closeModal() wipes them
    const targetGuideId = menuGuideId;
    const targetGroupId = menuGroupId;
    const newName = modalInput.trim();

    const updated = guides.map(g =>
      g.id === targetGuideId
        ? {
            ...g,
            updatedAt: new Date().toISOString(), // ← stamp
            groups: g.groups.map(gr =>
              gr.id === targetGroupId ? { ...gr, name: newName } : gr,
            ),
          }
        : g,
    );
    setGuides(updated);
    saveGuides(updated); // ← persists rename to AsyncStorage
    closeModal();
  };

  const deleteGroup = (guideId, groupId) => {
    const updated = guides.map(g =>
      g.id === guideId
        ? {
            ...g,
            updatedAt: new Date().toISOString(), // ← stamp
            groups: g.groups.filter(gr => gr.id !== groupId),
          }
        : g,
    );
    setGuides(updated);
    saveGuides(updated);
    closeModal();
  };

  const activeGuide = getGuide(activeGuideId);
  const activeGroup = activeGuide?.groups.find(gr => gr.id === activeGroupId);

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
        <TouchableOpacity style={styles.cartButton} activeOpacity={0.7}>
          <ShoppingCart size={20} color="#2e86de" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>0</Text>
          </View>
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
          Create and save frequently ordered{'\n'}
          product lists for faster ordering and{'\n'}
          checkout.
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

  const DetailScreen = () => (
    <ScrollView
      contentContainerStyle={styles.detailScroll}
      showsVerticalScrollIndicator={false}
    >
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
      <View style={styles.detailTitleRow}>
        <Text style={styles.detailTitle}>{activeGroup?.name}</Text>
        <View style={styles.itemsBadge}>
          <Text style={styles.itemsBadgeText}>
            {activeGroup?.items.length} items
          </Text>
        </View>
      </View>
      <View style={styles.detailActionRow}>
        <TouchableOpacity style={styles.detailActionBtn} activeOpacity={0.7}>
          <Plus size={15} color="#111827" style={{ marginRight: 4 }} />
          <Text style={styles.detailActionBtnText}>Add Products</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.detailActionBtn} activeOpacity={0.7}>
          <Plus size={15} color="#111827" style={{ marginRight: 4 }} />
          <Text style={styles.detailActionBtnText}>Add to Quick Order</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />
      <View style={styles.detailEmptyWrap}>
        <View style={styles.basketCircle}>
          <ShoppingBasket size={30} color="#9CA3AF" strokeWidth={1.6} />
        </View>
        <Text style={styles.detailEmptyTitle}>No products added yet</Text>
        <Text style={styles.detailEmptySubtitle}>
          Add products from the catalog to build{'\n'}this order guide group.
        </Text>
        <TouchableOpacity style={styles.addProductsBtn} activeOpacity={0.85}>
          <Plus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.addProductsBtnText}>Add Products</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

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

          {/* UPDATED TIME — uses getRelativeTime() on stored updatedAt */}
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header />

      {screen === 'empty' && <EmptyScreen />}
      {screen === 'detail' && <DetailScreen />}
      {screen === 'list' && <ListScreen />}

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
          // Keep menuGuideId & menuGroupId alive — don't call closeModal() here
          // Just switch modal type so renameGroup() can still read the IDs
          setModalType('renameGroup');
          setModalInput(grp?.name || '');
          setModalError('');
        }}
        onDelete={() => deleteGroup(menuGuideId, menuGroupId)}
        onClose={closeModal}
      />

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
              This action cannot be undone. All groups and products inside this
              guide will be permanently removed.
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
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: H_PADDING,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F4',
    backgroundColor: '#FFFFFF',
    marginTop: 18,
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
  detailActionRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
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
  divider: { height: 1, backgroundColor: '#F1F2F4', marginBottom: 40 },
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
  addProductsBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
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

  deleteBtnRow: {
    flexDirection: 'row',
    width: '100%',
  },

  cancelDeleteBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
  },

  cancelDeleteBtnText: {
    color: '#374151',
    fontWeight: '700',
  },

  confirmDeleteBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },

  confirmDeleteBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
