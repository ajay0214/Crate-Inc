import React, { useState } from 'react'; import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    StatusBar, Image, ImageBackground
} from 'react-native';

import CustomBottomTab from './CustomBottomTab';

const COLORS = {
    gradientStart: '#FF7043',
    gradientEnd: '#F5A623',
    primary: '#FF7043',
    primaryLight: '#FFF0E0',
    background: '#FFF8F0',
    white: '#FFFFFF',
    text: '#1C1C1E',
    subText: '#8E8E93',
    border: '#F0E6D6',
    danger: '#FF3B30',
    success: '#4CAF50',
    blue: '#1976D2',
    blueLight: '#E3F2FD',
    purple: '#9C27B0',
    purpleLight: '#F3E5F5',
    deepPurple: '#673AB7',
    deepPurpleLight: '#EDE7F6',
    green: '#388E3C',
    greenLight: '#E8F5E9',
    amber: '#F9A825',
    amberLight: '#FFF8E1',
};

const menuSections = [
    {
        label: 'Activity',
        items: [
            {
                title: 'My Orders',
                subtitle: 'Track your recent purchases',
                icon: require('../Assets/order.png'),
                iconBg: COLORS.amberLight,
                badge: '2 New',
                badgeColor: COLORS.danger,
                screen: 'Orders',
            },
            {
                title: 'Wishlist',
                subtitle: '8 items saved',
                icon: require('../Assets/heart.png'),
                iconBg: COLORS.amberLight,
                screen: 'Wishlist',
            },
        ],
    },
    {
        label: 'Account',
        items: [
            {
                title: 'Manage Addresses',
                subtitle: 'Manage saved addresses',
                icon: require('../Assets/location.png'),
                iconBg: COLORS.amberLight,
                screen: 'Address',
            },
            {
                title: 'Payment Methods',
                subtitle: 'Cards & UPI linked',
                icon: require('../Assets/payment.png'),
                iconBg: COLORS.amberLight,
                screen: 'Payment',
            },
            {
                title: 'Coupons & Offers',
                subtitle: '12 coupons available',
                icon: require('../Assets/coupon.png'),
                iconBg: COLORS.amberLight,
                badge: '12',
                badgeColor: COLORS.gradientEnd,
                screen: 'Coupons',
            },
        ],
    },
    {
        label: 'Preferences',
        items: [
            {
                title: 'Notifications',
                subtitle: 'Push, email & SMS alerts',
                icon: require('../Assets/bell.png'),
                iconBg: COLORS.amberLight,
                screen: 'Notifications',
            },
            {
                title: 'Help & Support',
                subtitle: 'FAQs, chat with us',
                icon: require('../Assets/secure.png'),
                iconBg: COLORS.amberLight,
                screen: 'Help',
            },
            {
                title: 'Settings',
                subtitle: 'App preferences & privacy',
                icon: require('../Assets/settings.png'),
                iconBg: COLORS.amberLight,
                screen: 'Settings',
            },
        ],
    },
];

export default function Profile({ navigation }) {

    const [activeTab, setActiveTab] = useState('Profile');

    const [cartCount, setCartCount] = useState(3);


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.gradientStart} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Orange gradient background behind header + avatar */}
                <ImageBackground
                    source={require('../Assets/Grocery.png')}
                    style={styles.heroBg}
                    imageStyle={styles.heroBgImage}
                >
                    <View style={styles.heroOverlay} />
                </ImageBackground>
                {/* Header Row */}
                <View style={styles.header}>
                    <View style={{ width: 38 }} />

                    <TouchableOpacity style={styles.notifBtn}>
                        <Image
                            source={require('../Assets/bell.png')}
                            style={{
                                width: 20,
                                height: 20,
                                tintColor: '#fff',
                            }}
                        />
                    </TouchableOpacity>
                </View>

                {/* Avatar & User Info */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarWrap}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>AK</Text>
                        </View>
                        <View style={styles.editIconWrap}>
                            <Image
                                source={require('../Assets/edit.png')}
                                style={{
                                    width: 12,
                                    height: 12,
                                    tintColor: '#fff',
                                }}
                            />
                        </View>
                    </View>

                    <Text style={styles.userName}>Ajay Kumar</Text>
                    <Text style={styles.userEmail}>ajay@gmail.com</Text>
                    <Text style={styles.userPhone}>+91 98765 43210</Text>

                    <TouchableOpacity style={styles.editBtn} activeOpacity={0.85}>
                        <Text style={styles.editBtnText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Row */}


                {/* Menu Sections */}
                {menuSections.map((section, si) => (
                    <View key={si}>
                        <Text style={styles.sectionLabel}>{section.label}</Text>
                        <View style={styles.menuCard}>
                            {section.items.map((item, ii) => (
                                <TouchableOpacity
                                    key={ii}
                                    style={[
                                        styles.menuItem,
                                        ii < section.items.length - 1 && styles.menuItemBorder,
                                    ]}
                                    activeOpacity={0.75}
                                    onPress={() => navigation.navigate(item.screen)}
                                >
                                    <View style={[styles.menuIconWrap, { backgroundColor: item.iconBg }]}>
                                        <Image
                                            source={item.icon}
                                            style={styles.menuIcon}
                                            resizeMode="contain"
                                        />
                                    </View>

                                    <View style={styles.menuTextWrap}>
                                        <Text style={styles.menuTitle}>{item.title}</Text>
                                        <Text style={styles.menuSub}>{item.subtitle}</Text>
                                    </View>

                                    {item.badge && (
                                        <View style={[styles.badge, { backgroundColor: item.badgeColor }]}>
                                            <Text style={styles.badgeText}>{item.badge}</Text>
                                        </View>
                                    )}

                                    <Text style={styles.arrow}>›</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.85}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>

            <CustomBottomTab
                activeTab="Profile"
                cartCount={cartCount}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    /* Hero orange background */
    heroBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 240,
    },
    heroBgImage: {
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },

    /* Header */
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 4,

    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.white,
    },
    notifBtn: {
        width: 38,
        height: 38,
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* Profile Section */
    profileSection: {
        alignItems: 'center',
        paddingTop: 1,
    },
    avatarWrap: {
        position: 'relative',
    },
    avatar: {
        width: 78,
        height: 78,
        borderRadius: 44,
        backgroundColor: COLORS.gradientEnd,
        borderWidth: 4,
        borderColor: COLORS.gradientEnd,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.white,
    },
    editIconWrap: {
        position: 'absolute',
        bottom: 0,
        right: -2,
        width: 26,
        height: 26,
        backgroundColor: COLORS.gradientEnd,
        borderRadius: 13,
        borderWidth: 2.5,
        borderColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userName: {
        fontSize: 21,
        fontWeight: '900',
        color: COLORS.gradientEnd,
        marginTop: 14,
    },
    userEmail: {
        fontSize: 13,
        color: COLORS.white,
        fontWeight: '600',
        marginTop: 3,
    },
    menuIcon: {
        width: 22,
        height: 22,
        tintColor: COLORS.gradientEnd
    },
    userPhone: {
        fontSize: 13,
        color: COLORS.white,
        fontWeight: '600',
        marginTop: 2,
    },
    editBtn: {
        marginTop: 14,
        backgroundColor: COLORS.gradientEnd,
        paddingHorizontal: 32,
        paddingVertical: 11,
        borderRadius: 20,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 6,
    },
    editBtnText: {
        color: COLORS.white,
        fontWeight: '800',
        fontSize: 14,
        letterSpacing: 0.3,
    },

    /* Stats */
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 16,
        marginTop: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 18,
        paddingVertical: 18,
        paddingHorizontal: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    statNum: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.primary,
    },
    statLabel: {
        fontSize: 11,
        color: COLORS.subText,
        fontWeight: '700',
        marginTop: 3,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    /* Section label */
    sectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.subText,
        textTransform: 'uppercase',
        letterSpacing: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 8,
    },

    /* Menu card */
    menuCard: {
        marginHorizontal: 16,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    menuIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    menuTextWrap: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
    },
    menuSub: {
        fontSize: 12,
        color: COLORS.subText,
        fontWeight: '600',
        marginTop: 2,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        marginRight: 8,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: '800',
    },
    arrow: {
        fontSize: 22,
        color: COLORS.subText,
        fontWeight: '300',
    },

    /* Logout */
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.gradientEnd,
        marginHorizontal: 16,
        marginTop: 24,
        borderRadius: 16,
        paddingVertical: 16,
        shadowColor: COLORS.danger,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    logoutText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '800',
    },
});