import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';

const tabs = [
  {
    key: 'Home',
    label: 'Home',
    icon: require('../Assets/square.png'),
  },
  {
    key: 'Category',
    label: 'Order Guide',
    icon: require('../Assets/star.png'),
  },

  {
    key: 'Cart',
    label: 'Catalog',
    icon: require('../Assets/book.png'),
  },
  {
    key: 'Orders',
    label: 'My Orders',
    icon: require('../Assets/order.png'),
  },
  {
    key: 'Profile',
    label: 'Chat',
    icon: require('../Assets/chat.png'),
  },
];

const CustomBottomTab = ({
  activeTab,
  onTabPress,
  cartCount = 0,
}) => {
  return (
    <View style={styles.container}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            activeOpacity={0.8}
            onPress={() => onTabPress(tab.key)}
          >
            <>
              <View style={{ position: 'relative' }}>
                {isActive ? (
                  <View style={styles.activeIconContainer}>
                    <Image
                      source={tab.icon}
                      style={styles.activeIcon}
                      resizeMode="contain"
                    />
                  </View>
                ) : (
                  <Image
                    source={tab.icon}
                    style={styles.icon}
                    resizeMode="contain"
                  />
                )}

                {tab.key === 'Cart' && cartCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {cartCount > 99 ? '99+' : cartCount}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={isActive ? styles.activeLabel : styles.label}>
                {tab.label}
              </Text>
            </>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CustomBottomTab;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,

    height: 90,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 15,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,

    backgroundColor: '#6fafe021',

    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    width: 24,
    height: 24,
    tintColor: '#9CA3AF',
  },

  activeIcon: {
    width: 24,
    height: 24,
    tintColor: '#0984e3',
  },

  label: {
    marginTop: 4,
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  activeLabel: {
    marginTop: 4,
    fontSize: 10,
    color: '#0984e3',
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#FFF',
  },

  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
});