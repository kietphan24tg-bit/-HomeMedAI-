import { AntDesign, MaterialIcons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // Note: Install @react-native-async-storage/async-storage
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    View,
} from 'react-native';
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

const initialMessages: ChatMessage[] = [
    {
        id: 'welcome',
        sender: 'ai',
        text: 'Xin chào! Tôi là trợ lý AI y tế. Bạn muốn hỏi gì hôm nay?',
        time: '09:00',
    },
];

function formatTimestamp(date: Date) {
    return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    });
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
        loadSessions();
        const newId = `session-${Date.now()}`;
        setCurrentSessionId(newId);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollToEnd({ animated: true });
        }
    }, [messages, isLoading]);

    const loadSessions = async () => {
        // Mock: In real app, load from AsyncStorage
        // const stored = await AsyncStorage.getItem('chatbot_sessions');
        // if (stored) setSessions(JSON.parse(stored));
    };

    const saveSessions = async (newSessions: ChatSession[]) => {
        // Mock: In real app, save to AsyncStorage
        // await AsyncStorage.setItem('chatbot_sessions', JSON.stringify(newSessions));

        setSessions(newSessions);
    };

    const saveCurrentSession = () => {
        if (messages.length <= 1) return; // Don't save empty sessions
        const title =
            messages.find((m) => m.sender === 'user')?.text.slice(0, 50) ||
            'New Chat';
        const session: ChatSession = {
            id: currentSessionId,
            messages,
            title,
            timestamp: Date.now(),
        };
        const updated = sessions
            .filter((s) => s.id !== currentSessionId)
            .concat(session);
        saveSessions(updated);
    };

    const loadSession = (session: ChatSession) => {
        setMessages(session.messages);
        setCurrentSessionId(session.id);
        setShowHistoryModal(false);
    };

    const resetChat = () => {
        saveCurrentSession();
        const newId = `session-${Date.now()}`;
        setCurrentSessionId(newId);
        setMessages(initialMessages);
    };

    const handleBackPress = () => {
        saveCurrentSession();
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

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: trimmed,
            time: formatTimestamp(new Date()),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        console.log(trimmed);
        const repliedMessage = await apiClient.post('/rag/chat', {
            session_id: String(1),
            question: trimmed,
        });

        console.log(repliedMessage.data.answer);
        setTimeout(() => {
            const reply: ChatMessage = {
                id: `ai-${Date.now()}`,
                sender: 'ai',
                text: repliedMessage.data.answer,
                time: formatTimestamp(new Date()),
            };
            setMessages((prev) => [...prev, reply]);
            setIsLoading(false);
            // Save after AI reply
            setTimeout(saveCurrentSession, 100);
        }, 1200);
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
                                AI Tư vấn sức khỏe
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
                        Nhập triệu chứng, thuốc hoặc thắc mắc của bạn bên dưới.
                    </Text>
                </View>

                <View style={chatbotStyles.chatZone}>
                    <ScrollView
                        ref={scrollRef}
                        style={{ flex: 1 }}
                        contentContainerStyle={chatbotStyles.messagesList}
                        showsVerticalScrollIndicator={false}
                    >
                        {messageNodes}
                        {isLoading ? (
                            <View style={chatbotStyles.loader}>
                                <ActivityIndicator
                                    size='small'
                                    color={colors.primary}
                                />
                                <Text style={chatbotStyles.loaderText}>
                                    Đang trả lời...
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
                                placeholder='Gõ tin nhắn...'
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
                            Lịch sử trò chuyện
                        </Text>
                        {sessions.length === 0 ? (
                            <Text style={chatbotStyles.noSessions}>
                                Chưa có cuộc trò chuyện nào.
                            </Text>
                        ) : (
                            <FlatList
                                data={sessions.sort(
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

function getMockReply(text: string) {
    const normalized = text.toLowerCase();

    if (normalized.includes('đau') || normalized.includes('sốt')) {
        return 'Với triệu chứng đó, bạn nên theo dõi nhiệt độ và nghỉ ngơi. Nếu kéo dài, nên đến cơ sở y tế để khám.';
    }

    if (normalized.includes('thuốc') || normalized.includes('uống')) {
        return 'Hãy đọc kỹ hướng dẫn sử dụng thuốc và hỏi bác sĩ nếu bạn có thắc mắc về liều lượng hoặc tác dụng phụ.';
    }

    return 'Mình đã nhận được câu hỏi của bạn. Bạn có thể cho mình thêm chi tiết để mình tư vấn chính xác hơn không?';
}
