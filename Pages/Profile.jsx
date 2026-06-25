import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomBottomTab from './CustomBottomTab';
import {
  Menu,
  MoreVertical,
  Paperclip,
  Camera,
  Send,
} from 'lucide-react-native';

const INITIAL_MESSAGES = [
  {
    id: '1',
    name: 'Samuel Ponraj',
    role: 'Store Manager',
    avatar: '🧔🏾',
    text: 'Hi Rama',
    time: 'Jun 18 - 12:59 PM',
    dateGroup: 'Jun 18',
  },
  {
    id: '2',
    name: 'Neela Krishnan',
    role: 'Store Employee',
    avatar: '👩🏾',
    text: 'hello',
    time: 'Jun 18 - 1:00 PM',
    dateGroup: 'Jun 18',
  },
];

function AvatarEmoji({ emoji }) {
  return (
    <View style={st.avatarWrap}>
      <Text style={st.avatarEmoji}>{emoji}</Text>
    </View>
  );
}

function DateSeparator({ label }) {
  return (
    <View style={st.dateSepWrap}>
      <Text style={st.dateSepTxt}>{label}</Text>
    </View>
  );
}

function MessageBubble({ msg }) {
  return (
    <View style={st.bubbleRow}>
      <AvatarEmoji emoji={msg.avatar} />
      <View style={st.bubble}>
        <View style={st.bubbleHeader}>
          <Text style={st.bubbleName}>{msg.name}</Text>
          <Text style={st.bubbleRole}> ~ {msg.role}</Text>
        </View>
        <Text style={st.bubbleText}>{msg.text}</Text>
        <Text style={st.bubbleTime}>{msg.time}</Text>
      </View>
    </View>
  );
}

const BOTTOM_TAB_HEIGHT = 60;

// ─── Helper: format current time ─────────────────────────────────────────────
function getFormattedTime() {
  const now = new Date();
  const months = [
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
  const month = months[now.getMonth()];
  const day = now.getDate();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${month} ${day} - ${hours}:${minutes} ${ampm}`;
}

// ─── Helper: format date group ────────────────────────────────────────────────
function getDateGroup() {
  const now = new Date();
  const months = [
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
  return `${months[now.getMonth()]} ${now.getDate()}`;
}

export default function MessagesScreen({ navigation }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const [activeTab, setActiveTab] = useState('Profile');

  // ─── Send Message ────────────────────────────────────────────────────────
  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const newMessage = {
      id: Date.now().toString(),
      name: 'You',
      role: 'Store Employee',
      avatar: '🧑🏽',
      text: trimmed,
      time: getFormattedTime(),
      dateGroup: getDateGroup(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    // Auto scroll to bottom after send
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Group messages by date
  const dateGroups = [];
  const seen = new Set();
  messages.forEach(m => {
    if (!seen.has(m.dateGroup)) {
      seen.add(m.dateGroup);
      dateGroups.push(m.dateGroup);
    }
  });

  return (
    <View style={st.root}>
      <SafeAreaView style={st.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={
            Platform.OS === 'ios' ? BOTTOM_TAB_HEIGHT : -70
          }
        >
          {/* ── Header ── */}
          <View style={st.header}>
            <TouchableOpacity style={st.menuBtn} activeOpacity={0.7}>
              <Menu size={22} color="#111827" />
            </TouchableOpacity>
            <View style={st.headerCenter}>
              <Text style={st.headerTitle}>Messages</Text>
              <Text style={st.headerSub}>View customer and team messages</Text>
            </View>
            <View style={st.headerRight}>
              <TouchableOpacity style={st.dotBtn} activeOpacity={0.7}>
                <MoreVertical size={20} color="#6B7280" />
              </TouchableOpacity>
              <View style={st.avatar}>
                <Text style={st.avatarTxt}>AV</Text>
              </View>
            </View>
          </View>

          {/* ── Messages List ── */}
          <ScrollView
            ref={scrollRef}
            style={st.msgList}
            contentContainerStyle={st.msgListContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({ animated: true })
            }
          >
            {dateGroups.map(dateGroup => (
              <View key={dateGroup}>
                <DateSeparator label={dateGroup} />
                {messages
                  .filter(m => m.dateGroup === dateGroup)
                  .map(msg => (
                    <MessageBubble key={msg.id} msg={msg} />
                  ))}
              </View>
            ))}
          </ScrollView>

          {/* ── Input Bar ── */}
          <View style={st.inputBar}>
            <TouchableOpacity style={st.inputIcon} activeOpacity={0.7}>
              <Paperclip size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TextInput
              style={st.textInput}
              placeholder="Write a message..."
              placeholderTextColor="#9CA3AF"
              value={input}
              onChangeText={setInput}
              multiline
              returnKeyType="default"
              onSubmitEditing={handleSend}
            />

            <TouchableOpacity style={st.inputIcon} activeOpacity={0.7}>
              <Camera size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Send button — active only when input has text */}
            <TouchableOpacity
              style={[st.sendBtn, !input.trim() && st.sendBtnDisabled]}
              activeOpacity={0.85}
              onPress={handleSend}
              disabled={!input.trim()}
            >
              <Send size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Spacer so input bar sits above bottom tab */}
          <View style={{ height: BOTTOM_TAB_HEIGHT }} />
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* ── Bottom Tab pinned at bottom ── */}
      <View style={st.bottomTabWrapper}>
        <CustomBottomTab
          activeTab={activeTab}
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
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  safe: { flex: 1, backgroundColor: '#fff' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f4',
    backgroundColor: '#fff',
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dotBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { fontSize: 12, fontWeight: '700', color: '#374151' },

  // Messages list
  msgList: { flex: 1, backgroundColor: '#fff' },
  msgListContent: {
    paddingHorizontal: 14,
    paddingTop: 24,
    paddingBottom: 16,
    flexGrow: 1,
  },

  // Date separator
  dateSepWrap: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  dateSepTxt: {
    fontSize: 12.5,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // Message bubble
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  avatarEmoji: { fontSize: 22 },

  bubble: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  bubbleName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
  },
  bubbleRole: {
    fontSize: 11.5,
    color: '#2e86de',
    fontWeight: '500',
  },
  bubbleText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 6,
  },
  bubbleTime: {
    fontSize: 11,
    color: '#2e86de',
    textAlign: 'right',
    fontWeight: '500',
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f2f4',
    backgroundColor: '#fff',
    gap: 6,
    marginBottom: 30,
  },
  inputIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    paddingHorizontal: 4,
    maxHeight: 100,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2e86de',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#93c5fd',
  },

  // Bottom tab pinned
  bottomTabWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    height: BOTTOM_TAB_HEIGHT,
  },
});
