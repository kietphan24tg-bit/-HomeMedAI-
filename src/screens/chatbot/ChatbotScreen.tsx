import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '@/src/api/client';
import { colors } from '@/src/styles/tokens';
import { chatbotStyles } from './styles';

type ChatMessage = {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    time: string;
};

type ChatSession = {
    id: string;
    messages: ChatMessage[];
    title: string;
    timestamp: number;
};

const initialMessages: ChatMessage[] = [];
const CHATBOT_SESSIONS_KEY = 'chatbot_sessions_v1';
const MAX_STORED_SESSIONS = 3;
const MAX_MESSAGES_PER_SESSION = 20;

function formatTimestamp(date: Date) {
    return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function buildSessionTitle(messages: ChatMessage[]) {
    return (
        messages
            .find((message) => message.sender === 'user')
            ?.text.slice(0, 50) || 'New Chat'
    );
}

function clampMessages(messages: ChatMessage[]) {
    return messages.slice(-MAX_MESSAGES_PER_SESSION);
}

function normalizeSessions(sessions: ChatSession[]) {
    return [...sessions]
        .map((session) => ({
            ...session,
            messages: clampMessages(session.messages || []),
        }))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_STORED_SESSIONS);
}

function getMockReply(text: string) {
    const normalized = text.toLowerCase();

    if (normalized.includes('dau') || normalized.includes('sot')) {
        return 'Voi trieu chung do, ban nen theo doi nhiet do va nghi ngoi. Neu keo dai, nen den co so y te de kham.';
    }

    if (normalized.includes('thuoc') || normalized.includes('uong')) {
        return 'Hay doc ky huong dan su dung thuoc va hoi bac si neu ban co thac mac ve lieu luong hoac tac dung phu.';
    }

    return 'Minh da nhan duoc cau hoi cua ban. Ban co the cho minh them chi tiet de minh tu van chinh xac hon khong?';
}

export default function ChatbotScreen(): React.JSX.Element {
    const scrollRef = useRef<ScrollView | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string>('');
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    useEffect(() => {
        const bootstrap = async () => {
            const loaded = await loadSessions();
            if (loaded.length > 0) {
                const latest = loaded[0];
                setSessions(loaded);
                setCurrentSessionId(latest.id);
                setMessages(latest.messages);
                return;
            }
            setCurrentSessionId(`session-${Date.now()}`);
        };

        void bootstrap();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollToEnd({ animated: true });
        }
    }, [messages, isLoading]);

    const loadSessions = async (): Promise<ChatSession[]> => {
        try {
            const stored = await AsyncStorage.getItem(CHATBOT_SESSIONS_KEY);
            if (!stored) return [];

            const parsed = JSON.parse(stored) as unknown;
            if (!Array.isArray(parsed)) return [];

            return normalizeSessions(
                parsed.filter((item): item is ChatSession => {
                    return (
                        typeof item === 'object' &&
                        item !== null &&
                        typeof (item as ChatSession).id === 'string' &&
                        Array.isArray((item as ChatSession).messages) &&
                        typeof (item as ChatSession).title === 'string' &&
                        typeof (item as ChatSession).timestamp === 'number'
                    );
                }),
            );
        } catch {
            return [];
        }
    };

    const saveSessions = async (newSessions: ChatSession[]) => {
        const normalized = normalizeSessions(newSessions);
        setSessions(normalized);
        try {
            await AsyncStorage.setItem(
                CHATBOT_SESSIONS_KEY,
                JSON.stringify(normalized),
            );
        } catch {
            // Keep UX smooth even when storage is temporarily unavailable.
        }
    };

    const saveCurrentSession = async (
        targetMessages: ChatMessage[] = messages,
        targetSessionId: string = currentSessionId,
    ) => {
        if (!targetSessionId || targetMessages.length === 0) return;

        const session: ChatSession = {
            id: targetSessionId,
            messages: clampMessages(targetMessages),
            title: buildSessionTitle(targetMessages),
            timestamp: Date.now(),
        };
        const updated = sessions
            .filter((s) => s.id !== targetSessionId)
            .concat(session);
        await saveSessions(updated);
    };

    const loadSession = (session: ChatSession) => {
        setMessages(session.messages);
        setCurrentSessionId(session.id);
        setShowHistoryModal(false);
    };

    const resetChat = () => {
        void saveCurrentSession();
        const newId = `session-${Date.now()}`;
        setCurrentSessionId(newId);
        setMessages(initialMessages);
    };

    const handleBackPress = () => {
        void saveCurrentSession();
        router.back();
    };

    const handleHistoryPress = () => {
        setShowHistoryModal(true);
    };

    const handleSessionSelect = (session: ChatSession) => {
        loadSession(session);
    };

    const sendMessage = async () => {
        const trimmed = inputValue.trim();
        if (!trimmed || isLoading) {
            return;
        }

        const resolvedSessionId = currentSessionId || `session-${Date.now()}`;
        if (!currentSessionId) {
            setCurrentSessionId(resolvedSessionId);
        }

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: trimmed,
            time: formatTimestamp(new Date()),
        };
        const baseMessages = [...messages, userMessage];

        setMessages(baseMessages);
        setInputValue('');
        setIsLoading(true);

        try {
            let answer = '';

            try {
                const repliedMessage = await apiClient.post('/rag/chat', {
                    session_id: resolvedSessionId,
                    question: trimmed,
                });
                answer = String(
                    repliedMessage?.data?.answer ||
                        'Minh chua co phan hoi phu hop, ban thu dat cau hoi chi tiet hon nhe.',
                );
            } catch (error) {
                console.error(error);
                answer = getMockReply(trimmed);
            }

            const reply: ChatMessage = {
                id: `ai-${Date.now()}`,
                sender: 'ai',
                text: answer,
                time: formatTimestamp(new Date()),
            };
            const finalMessages = [...baseMessages, reply];
            setMessages(finalMessages);
            await saveCurrentSession(finalMessages, resolvedSessionId);
        } catch {
            const fallbackReply: ChatMessage = {
                id: `ai-${Date.now()}`,
                sender: 'ai',
                text: 'Hien tai ket noi dang gian doan. Ban vui long thu lai sau it phut.',
                time: formatTimestamp(new Date()),
            };
            const finalMessages = [...baseMessages, fallbackReply];
            setMessages(finalMessages);
            await saveCurrentSession(finalMessages, resolvedSessionId);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitEditing = () => {
        sendMessage();
    };

    const messageNodes = useMemo(
        () =>
            messages.map((message) => (
                <View
                    key={message.id}
                    style={[
                        chatbotStyles.messageBubble,
                        message.sender === 'user'
                            ? chatbotStyles.messageUser
                            : chatbotStyles.messageAi,
                    ]}
                >
                    <Text style={chatbotStyles.messageText}>
                        {message.text}
                    </Text>
                    <Text style={chatbotStyles.messageMeta}>
                        {message.time}
                    </Text>
                </View>
            )),
        [messages],
    );

    return (
        <SafeAreaView style={chatbotStyles.container}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={chatbotStyles.header}>
                    <View style={chatbotStyles.headerRow}>
                        <View style={chatbotStyles.headerLeft}>
                            <Pressable
                                onPress={handleBackPress}
                                style={chatbotStyles.iconButton}
                            >
                                <AntDesign
                                    name='left'
                                    size={20}
                                    color={colors.text}
                                />
                            </Pressable>
                            <Text style={chatbotStyles.title}>
                                AI Tu van suc khoe
                            </Text>
                        </View>
                        <View style={chatbotStyles.headerActions}>
                            <Pressable
                                onPress={resetChat}
                                style={chatbotStyles.iconButton}
                            >
                                <MaterialIcons
                                    name='refresh'
                                    size={20}
                                    color={colors.text}
                                />
                            </Pressable>
                            <Pressable
                                onPress={handleHistoryPress}
                                style={chatbotStyles.iconButton}
                            >
                                <MaterialIcons
                                    name='history'
                                    size={20}
                                    color={colors.text}
                                />
                            </Pressable>
                        </View>
                    </View>
                    <Text style={chatbotStyles.subtitle}>
                        Nhap trieu chung, thuoc hoac thac mac cua ban ben duoi.
                    </Text>
                </View>

                <View style={chatbotStyles.chatZone}>
                    <ScrollView
                        ref={scrollRef}
                        style={{ flex: 1 }}
                        contentContainerStyle={chatbotStyles.messagesList}
                        showsVerticalScrollIndicator={false}
                    >
                        {messages.length === 0 ? (
                            <View style={chatbotStyles.emptyStateCard}>
                                <Text style={chatbotStyles.emptyStateTitle}>
                                    Xin chao, toi la tro ly AI y te
                                </Text>
                                <Text style={chatbotStyles.emptyStateText}>
                                    Hay nhap trieu chung hoac cau hoi de bat dau
                                    tu van.
                                </Text>
                            </View>
                        ) : null}
                        {messageNodes}
                        {isLoading ? (
                            <View style={chatbotStyles.loader}>
                                <ActivityIndicator
                                    size='small'
                                    color={colors.primary}
                                />
                                <Text style={chatbotStyles.loaderText}>
                                    Dang tra loi...
                                </Text>
                            </View>
                        ) : null}
                    </ScrollView>
                </View>

                <View style={chatbotStyles.inputArea}>
                    <View style={chatbotStyles.inputRow}>
                        <View style={chatbotStyles.inputWrap}>
                            <TextInput
                                style={chatbotStyles.textInput}
                                placeholder='Go tin nhan...'
                                placeholderTextColor={colors.text3}
                                value={inputValue}
                                onChangeText={setInputValue}
                                multiline
                                returnKeyType='send'
                                onSubmitEditing={handleSubmitEditing}
                                editable={!isLoading}
                            />
                        </View>
                        <Pressable
                            onPress={sendMessage}
                            style={[
                                chatbotStyles.sendButton,
                                (!inputValue.trim() || isLoading) &&
                                    chatbotStyles.sendButtonDisabled,
                            ]}
                            disabled={!inputValue.trim() || isLoading}
                        >
                            <MaterialIcons name='send' size={22} color='#fff' />
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
            <Modal
                visible={showHistoryModal}
                transparent
                animationType='fade'
                onRequestClose={() => setShowHistoryModal(false)}
            >
                <Pressable
                    style={chatbotStyles.modalOverlay}
                    onPress={() => setShowHistoryModal(false)}
                >
                    <View style={chatbotStyles.modalContent}>
                        <Text style={chatbotStyles.modalTitle}>
                            Lich su tro chuyen
                        </Text>
                        {sessions.length === 0 ? (
                            <Text style={chatbotStyles.noSessions}>
                                Chua co cuoc tro chuyen nao.
                            </Text>
                        ) : (
                            <FlatList
                                data={[...sessions].sort(
                                    (a, b) => b.timestamp - a.timestamp,
                                )}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <Pressable
                                        style={chatbotStyles.sessionItem}
                                        onPress={() =>
                                            handleSessionSelect(item)
                                        }
                                    >
                                        <Text
                                            style={chatbotStyles.sessionTitle}
                                        >
                                            {item.title}
                                        </Text>
                                        <Text style={chatbotStyles.sessionMeta}>
                                            {new Date(
                                                item.timestamp,
                                            ).toLocaleString('vi-VN')}
                                        </Text>
                                    </Pressable>
                                )}
                                showsVerticalScrollIndicator={false}
                            />
                        )}
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}
