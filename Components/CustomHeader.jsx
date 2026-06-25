import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ShoppingCart } from 'lucide-react-native';

// ─── Constants ────────────────────────────────────────────────────────────────
const GRADIENT_START = '#4c6ef5';
const GRADIENT_END = '#3b5bdb';

// ─── CustomHeader ─────────────────────────────────────────────────────────────
const CustomHeader = ({
  title = 'My Orders',
  subtitle = '',
  type,
  avatarText = 'AV',
  cartCount = 0,
  showBack = false,
  onCartPress,
  onAvatarPress,
}) => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  // ── Actions ────────────────────────────────────────────────────────────────
  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <StatusBar
        backgroundColor={GRADIENT_END}
        barStyle="light-content"
        translucent={false}
      />

      {/* ── Safe Area with blue background ── */}
      <SafeAreaView style={st.safeArea} edges={['top']}>
        {/* ── Header Container ── */}
        <View style={st.container}>
          {/* ── Row: back arrow + titles + right icons ── */}
          <View style={st.row}>
            {/* LEFT: back arrow */}
            <View style={st.leftSlot}>
              {showBack && (
                <TouchableOpacity
                  style={st.backBtn}
                  activeOpacity={0.7}
                  onPress={goBack}
                >
                  <ArrowLeft size={22} color="#fff" />
                </TouchableOpacity>
              )}
            </View>

            {/* CENTER: title + subtitle */}
            <View style={st.centerSlot}>
              <Text style={st.title} numberOfLines={1}>
                {title}
              </Text>
              {!!subtitle && (
                <Text style={st.subtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </View>

            {/* RIGHT: avatar + cart */}
            <View style={st.rightSlot}>
              {/* Avatar circle */}
              <TouchableOpacity
                style={st.avatar}
                activeOpacity={0.8}
                onPress={onAvatarPress}
              >
                <Text style={st.avatarTxt}>{avatarText}</Text>
              </TouchableOpacity>

              {/* Cart button — shown when type === 'Y' or always */}
              <TouchableOpacity
                style={st.cartBtn}
                activeOpacity={0.8}
                onPress={
                  onCartPress ?? (() => navigation.navigate('Sidemenuscreen'))
                }
              >
                <ShoppingCart size={22} color="#3b5bdb" />
                {cartCount > 0 && (
                  <View style={st.badge}>
                    <Text style={st.badgeTxt}>
                      {cartCount > 99 ? '99+' : cartCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* ── Logout Confirmation Modal ── */}
    </>
  );
};

export default CustomHeader;

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  // Safe area — blue top background
  safeArea: {
    backgroundColor: GRADIENT_END,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    overflow: 'hidden',
  },

  // Main container — blue pill shape
  container: {
    backgroundColor: GRADIENT_START,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 22,
  },

  // ── Row layout ──────────────────────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Left slot — back arrow
  leftSlot: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Center slot — titles
  centerSlot: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 3,
    fontWeight: '400',
  },

  // Right slot — avatar + cart
  rightSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  // Avatar circle
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },

  // Cart button
  cartBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Badge on cart
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3b5bdb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
});
