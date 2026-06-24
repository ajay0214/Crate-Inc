import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const C = {
  amber: '#F5A623',
  amberDark: '#D4881A',
  amberLight: '#FFF0D6',
  amberSoft: '#FEF3E2',
  orange: '#FF6B35',
  orangeLight: '#FFF1EB',
  cream: '#FFF8EF',
  creamDeep: '#F5ECD9',
  white: '#FFFFFF',
  cardBg: '#FFFFFF',
  textDark: '#1C1C1E',
  textMid: '#3C3C43',
  textMuted: '#8E8E93',
  border: '#F0E6D6',
  borderFocus: '#F5A623',
  danger: '#FF3B30',
  success: '#34C759',
  green: '#1E8A3C',
  shadow: 'rgba(245,166,35,0.18)',
};

function BackgroundDecor() {
  return (
    <>
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorDot1} />
      <View style={styles.decorStripe} />
      <View style={styles.decorDot2} />
    </>
  );
}

function FoodBadge({ emoji, style, delay = 0 }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay,
      useNativeDriver: true,
      tension: 60,
      friction: 7,
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -7,
          duration: 2000,
          useNativeDriver: true,
          delay: delay + 300,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.foodBadge,
        style,
        { transform: [{ translateY: floatAnim }, { scale: scaleAnim }] },
      ]}
    >
      <Text style={styles.foodBadgeEmoji}>{emoji}</Text>
    </Animated.View>
  );
}

function InputField({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    Animated.parallel([
      Animated.timing(borderAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: false,
      }),
      Animated.timing(bgAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start();
  };
  const handleBlur = () => {
    Animated.parallel([
      Animated.timing(borderAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: false,
      }),
      Animated.timing(bgAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.border, C.amber],
  });
  const bgColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.creamDeep, C.amberSoft],
  });

  return (
    <Animated.View
      style={[styles.inputWrapper, { borderColor, backgroundColor: bgColor }]}
    >
      <Image source={icon} style={styles.inputIcon} resizeMode="contain" />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={C.textMuted}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !showPassword}
        keyboardType={keyboardType || 'default'}
        autoCapitalize={autoCapitalize || 'none'}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {secureTextEntry && (
        <TouchableOpacity
          onPress={() => setShowPassword(v => !v)}
          style={styles.eyeBtn}
        >
          <Image
            source={
              showPassword
                ? require('../Assets/eyeclose.png')
                : require('../Assets/eye.png')
            }
            style={styles.eyeImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

export default function LoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countryCode, setCountryCode] = useState('IN');
  const [callingCode, setCallingCode] = useState('91');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showOtpCard, setShowOtpCard] = useState(false);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(null);

  const logoAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(50)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 750,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(cardAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (showOtpCard) {
      const timer = setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [showOtpCard]);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    const otpValue = newOtp.join('');

    if (otpValue.length === 6) {
      setError('');

      setTimeout(() => {
        navigation.replace('Dashboard');
      }, 300);
    }
  };

  const handleVerifyOtp = () => {
    const otpValue = otp.join('');

    if (!otpValue) {
      setError('Please enter OTP');
      return;
    }

    if (otpValue.length !== 6) {
      setError('Please enter a valid 6 digit OTP');
      return;
    }

    setError('');
    navigation.replace('Dashboard');
  };

  const handleLogin = () => {
    if (!phoneNumber.trim()) {
      setError('Please enter mobile number');
      return;
    }

    const fullNumber = `+${callingCode}${phoneNumber}`;
    const phoneInfo = parsePhoneNumberFromString(fullNumber);

    if (!phoneInfo || !phoneInfo.isValid()) {
      setError('Please enter a valid mobile number');
      return;
    }

    setError('');
    setShowOtpCard(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.cream} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.scroll}>
          <BackgroundDecor />

          <FoodBadge
            emoji="🥩"
            style={{ top: height * 0.09, left: 18 }}
            delay={100}
          />
          <FoodBadge
            emoji="🐔"
            style={{ top: height * 0.13, right: 22 }}
            delay={350}
          />
          <FoodBadge
            emoji="🥦"
            style={{ top: height * 0.18, left: 55 }}
            delay={600}
          />
          <FoodBadge
            emoji="🥚"
            style={{ top: height * 0.075, right: 65 }}
            delay={200}
          />

          <View style={styles.topContent}>
            <Animated.View
              style={[
                styles.heroSection,
                {
                  opacity: logoAnim,
                  transform: [
                    {
                      scale: logoAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.75, 1],
                      }),
                    },
                    {
                      translateY: logoAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.logoRing}>
                <View style={styles.logoBadge}>
                  <Image
                    source={require('../Assets/crate-inc-new.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
              </View>

              <View style={styles.taglineRow}>
                <View style={styles.taglineDash} />
                <Text style={styles.tagline}>Farm Fresh · Delivered Fast</Text>
                <View style={styles.taglineDash} />
              </View>
            </Animated.View>

            {!showOtpCard && (
              <Animated.View
                style={[
                  styles.card,
                  {
                    opacity: cardOpacity,
                    transform: [{ translateY: cardAnim }],
                  },
                ]}
              >
                <View style={styles.cardTopStripe} />

                <View style={styles.cardHeader}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle}>Enter Mobile Number</Text>
                    <Image
                      source={require('../Assets/phone.png')}
                      style={styles.titleIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.cardSubtitle}>
                    we'll send you one-time password to sign-in securely
                  </Text>
                </View>

                {error ? (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                  </View>
                ) : null}

                <View style={styles.phoneContainer}>
                  <TouchableOpacity
                    style={styles.countryCode}
                    onPress={() => setShowCountryPicker(true)}
                  >
                    <CountryPicker
                      countryCode={countryCode}
                      withFlag
                      withCallingCode
                      withFilter
                      withEmoji
                      visible={showCountryPicker}
                      onClose={() => setShowCountryPicker(false)}
                      onSelect={country => {
                        setCountryCode(country.cca2);
                        setCallingCode(country.callingCode[0]);
                      }}
                      renderFlagButton={() => null}
                    />
                    <Text style={styles.countryText}>+{callingCode}</Text>
                    <Image
                      style={styles.dropdownIcon}
                      source={require('../Assets/down-arrow.png')}
                    />
                  </TouchableOpacity>

                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholderTextColor="grey"
                  />
                </View>

                <View style={styles.secureRow}>
                  <Image
                    source={require('../Assets/protect.png')}
                    style={styles.secureIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.secureText}>
                    Your data is secure with us.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.loginBtn, loading && styles.loginBtnLoading]}
                  onPress={handleLogin}
                  activeOpacity={0.88}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={C.white} size="small" />
                  ) : (
                    <View style={styles.loginBtnInner}>
                      <Text style={styles.loginBtnText}>Send OTP</Text>
                      <View style={styles.loginBtnArrowBadge}>
                        <Text style={styles.loginBtnArrow}>→</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.otpInfoContainer}>
                  <Text style={styles.otpInfoIcon}>✨</Text>
                  <Text style={styles.otpInfoText}>
                    Fast, private, and protected sign in
                  </Text>
                </View>
              </Animated.View>
            )}

            {showOtpCard && (
              <Animated.View
                style={[
                  styles.card,
                  {
                    opacity: cardOpacity,
                    transform: [{ translateY: cardAnim }],
                  },
                ]}
              >
                <View style={styles.cardTopStripe} />

                <View style={{ marginBottom: 0 }}>
                  <View
                    style={{ flexDirection: 'row', justifyContent: 'center' }}
                  >
                    <Text style={[styles.cardTitle, { textAlign: 'center' }]}>
                      Enter OTP
                    </Text>
                    <View
                      style={{
                        marginLeft: 0,
                        marginTop: -10,
                        width: 50,
                        height: 50,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 50,
                      }}
                    >
                      <Image
                        source={require('../Assets/protect.png')}
                        style={styles.otpHeaderIcon}
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.otpLabelRow}>
                  <Text style={styles.otpLabel}>OTP Code</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowOtpCard(false);
                    }}
                  >
                    <Text style={styles.changeNumber}>← Change number</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={ref => (otpRefs.current[index] = ref)}
                      style={[
                        styles.otpBox,
                        focusedIndex === index && styles.otpBoxFocused,
                      ]}
                      maxLength={1}
                      keyboardType="number-pad"
                      value={digit}
                      onFocus={() => setFocusedIndex(index)}
                      onBlur={() => setFocusedIndex(null)}
                      onChangeText={value => handleOtpChange(value, index)}
                      onKeyPress={({ nativeEvent }) => {
                        if (
                          nativeEvent.key === 'Backspace' &&
                          !otp[index] &&
                          index > 0
                        ) {
                          otpRefs.current[index - 1]?.focus();
                        }
                      }}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.loginBtn}
                  onPress={handleVerifyOtp}
                  activeOpacity={0.9}
                >
                  <View style={styles.loginBtnInner}>
                    <Text style={styles.loginBtnText}> Login</Text>
                    <View style={styles.loginBtnArrowBadge}>
                      <Text style={styles.loginBtnArrow}>→</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <View style={styles.otpMessageBox}>
                  <Text style={styles.otpMessageText}>
                    A 6 digit OTP has been sent to +{callingCode} {phoneNumber}.
                  </Text>
                </View>

                <View style={styles.otpInfoContainer}>
                  <Text style={styles.otpInfoIcon}>✨</Text>
                  <Text style={styles.otpInfoText}>
                    Fast, private, and protected sign in
                  </Text>
                </View>
              </Animated.View>
            )}
          </View>

          <Image
            source={require('../Assets/crate-image.png')}
            style={styles.bottomBanner}
            resizeMode="contain"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.cream,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: C.cream,
    justifyContent: 'space-between',
  },
  topContent: {
    width: '100%',
    alignItems: 'center',
  },

  decorCircle1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: C.amber,
    opacity: 0.12,
  },
  decorCircle2: {
    position: 'absolute',
    bottom: 60,
    left: -90,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: C.orange,
    opacity: 0.09,
  },
  decorDot1: {
    position: 'absolute',
    top: 60,
    left: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: C.amber,
    opacity: 0.1,
  },
  decorDot2: {
    position: 'absolute',
    bottom: 140,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.orange,
    opacity: 0.1,
  },
  decorStripe: {
    position: 'absolute',
    top: height * 0.28,
    left: -40,
    width: width + 80,
    height: 2,
    backgroundColor: C.amber,
    opacity: 0.12,
    transform: [{ rotate: '-3deg' }],
  },

  foodBadge: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.amber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: C.amberLight,
  },
  foodBadgeEmoji: {
    fontSize: 18, // was 22
  },

  heroSection: {
    alignItems: 'center',
    marginTop: 70,
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: C.amberLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: C.white,
    shadowColor: C.amber,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
    marginTop: 30,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.amberSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 54,
    height: 54,
  },
  brandName: {
    fontSize: 26, // was 30
    fontWeight: '800',
    color: C.textDark,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  taglineDash: {
    width: 22,
    height: 2,
    backgroundColor: C.amber,
    borderRadius: 1,
  },
  tagline: {
    fontSize: 9, // was 11
    color: C.amberDark,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },

  bottomBanner: {
    width: width,
    height: 220,
    marginTop: 10,
  },

  card: {
    width: width - 28,
    backgroundColor: C.white,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingBottom: 26,
    paddingTop: 0,
    shadowColor: '#B8762A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 14,
    overflow: 'hidden',
  },
  cardTopStripe: {
    height: 6,
    backgroundColor: C.amber,
    marginBottom: 22,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    width: 500,
    alignSelf: 'center',
  },
  cardHeader: {
    marginBottom: 18, // was 22
  },
  cardTitle: {
    fontSize: 17, // was 20
    fontWeight: '800',
    color: C.textDark,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12, // was 14
    color: C.textMuted,
    fontWeight: '400',
  },

  errorBanner: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  errorText: {
    color: C.danger,
    fontSize: 11, // was 13
    fontWeight: '500',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
    height: 54,
  },
  inputIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: C.amber,
    opacity: 0.85,
  },
  input: {
    flex: 1,
    fontSize: 13, // was 15
    color: C.textDark,
    fontWeight: '400',
  },
  eyeBtn: {
    padding: 6,
  },
  eyeImage: {
    width: 22,
    height: 22,
    tintColor: C.textMuted,
  },

  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -6,
  },
  forgotText: {
    color: C.orange,
    fontSize: 11, // was 13
    fontWeight: '600',
  },

  loginBtn: {
    backgroundColor: C.amber,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.amber,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 22,
  },
  loginBtnLoading: {
    opacity: 0.75,
  },
  loginBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loginBtnText: {
    color: C.white,
    fontSize: 15, // was 17
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  loginBtnArrowBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 5,
  },
  loginBtnArrow: {
    color: C.white,
    fontSize: 14, // was 16
    fontWeight: '700',
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dividerText: {
    color: C.textMuted,
    fontSize: 10, // was 12
    fontWeight: '500',
  },

  socialRow: {
    flexDirection: 'row',
    gap: 10,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingVertical: 11,
    backgroundColor: C.creamDeep,
  },
  socialIcon: {
    fontSize: 13, // was 15
    fontWeight: '900',
  },
  socialLabel: {
    fontSize: 9, // was 11
    fontWeight: '600',
    color: C.textMid,
  },

  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
  },
  signupPrompt: {
    color: C.textMuted,
    fontSize: 12, // was 14
  },
  signupLink: {
    color: C.orange,
    fontSize: 12, // was 14
    fontWeight: '700',
  },

  trustRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  trustIcon: {
    fontSize: 10, // was 12
  },
  trustLabel: {
    color: C.textMid,
    fontSize: 9, // was 11
    fontWeight: '600',
  },

  otpInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
  },
  otpInfoIcon: {
    fontSize: 12, // was 14
    marginRight: 6,
    color: C.amber,
  },
  otpInfoText: {
    fontSize: 11, // was 13
    fontWeight: '600',
    color: '#8A97B5',
  },

  phoneContainer: {
    flexDirection: 'row',
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  countryCode: {
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  countryText: {
    fontSize: 12, // was 14
    fontWeight: '700',
    color: '#111827',
    marginLeft: 20,
  },
  dropdownIcon: {
    width: 14,
    height: 14,
    fontWeight: 600, // was 17
    color: '#111827',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 14, // was 16
    color: '#111827',
  },

  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  secureIcon: {
    width: 22,
    height: 22,
    marginRight: 8,
    tintColor: 'green',
  },
  secureText: {
    fontSize: 12, // was 14
    color: '#6B7280',
    fontWeight: '500',
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  titleIcon: {
    width: 24,
    height: 24,
    marginLeft: 8,
    tintColor: C.amber,
  },

  otpHeaderIcon: {
    width: 30,
    height: 30,
    tintColor: C.amber,
  },
  otpLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  otpLabel: {
    fontSize: 15, // was 17
    fontWeight: '700',
    color: '#111827',
  },
  changeNumber: {
    color: C.amber,
    fontSize: 13, // was 16
    fontWeight: '700',
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  otpBox: {
    width: 50,
    height: 60,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontSize: 15, // was 22
    fontWeight: '700',
    color: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  otpBoxFocused: {
    borderColor: C.amber,
    borderWidth: 2,
    backgroundColor: '#FFF8EF',
  },
  otpBoxActive: {
    borderColor: '#60A5FA',
    borderWidth: 2,
  },

  otpMessageBox: {
    backgroundColor: '#FFF8EF',
    borderRadius: 14,
    padding: 10,
    marginBottom: 15,
  },
  otpMessageText: {
    color: '#64748B',
    fontSize: 10, // was 13
    fontWeight: '600',
  },
});
