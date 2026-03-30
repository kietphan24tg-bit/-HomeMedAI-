import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Animated, Modal, Pressable, Text, View } from 'react-native';
import type { FamilyOption } from '../home.types';
import { styles } from '../styles';

export default function FamilyPickerSheet({
    visible,
    backdropAnim,
    slideAnim,
    selectedFamily,
    familyOptions,
    isLoading,
    error,
    onClose,
    onSelectFamily,
    onRetry,
}: {
    visible: boolean;
    backdropAnim: Animated.Value;
    slideAnim: Animated.Value;
    selectedFamily: string | null;
    familyOptions: FamilyOption[];
    isLoading: boolean;
    error: string | null;
    onClose: () => void;
    onSelectFamily: (id: string) => void;
    onRetry: () => void;
}): React.JSX.Element {
    const renderLoadingState = () => (
        <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 12 }}>
            <Text style={[styles.sheetSubtitle, { marginTop: 0 }]}>
                Đang tải danh sách gia đình...
            </Text>
            {[0, 1, 2].map((item) => (
                <View
                    key={item}
                    style={[
                        styles.fpRow,
                        {
                            backgroundColor: '#F8FAFC',
                            borderRadius: 18,
                            marginHorizontal: 0,
                            paddingHorizontal: 16,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.fpIcon,
                            { backgroundColor: '#E2E8F0', borderRadius: 14 },
                        ]}
                    />
                    <View style={{ flex: 1, gap: 8 }}>
                        <View
                            style={{
                                width: '55%',
                                height: 14,
                                borderRadius: 999,
                                backgroundColor: '#E2E8F0',
                            }}
                        />
                        <View
                            style={{
                                width: '38%',
                                height: 11,
                                borderRadius: 999,
                                backgroundColor: '#EDF2F7',
                            }}
                        />
                    </View>
                </View>
            ))}
        </View>
    );

    const renderEmptyState = () => (
        <View
            style={{
                paddingHorizontal: 24,
                paddingTop: 28,
                paddingBottom: 12,
                alignItems: 'center',
            }}
        >
            <View
                style={{
                    width: 72,
                    height: 72,
                    borderRadius: 24,
                    backgroundColor: '#EFF6FF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 18,
                }}
            >
                <Ionicons name='people-outline' size={30} color='#2563EB' />
            </View>
            <Text
                style={[
                    styles.sheetTitle,
                    { fontSize: 18, textAlign: 'center', marginBottom: 8 },
                ]}
            >
                Bạn chưa có gia đình nào
            </Text>
            <Text
                style={[
                    styles.sheetSubtitle,
                    {
                        textAlign: 'center',
                        marginTop: 0,
                        lineHeight: 20,
                        marginBottom: 20,
                    },
                ]}
            >
                Tạo gia đình mới hoặc chờ lời mời tham gia từ người thân để bắt
                đầu quản lý sức khỏe chung.
            </Text>
            <Pressable
                style={{
                    width: '100%',
                    backgroundColor: '#2563EB',
                    borderRadius: 16,
                    paddingVertical: 14,
                    alignItems: 'center',
                    marginBottom: 10,
                }}
            >
                <Text
                    style={{
                        color: '#fff',
                        fontFamily: 'Inter_700Bold',
                        fontSize: 14,
                    }}
                    onPress={() => router.push('/family')}
                >
                    Tạo gia đình
                </Text>
            </Pressable>
            <Pressable
                style={{
                    width: '100%',
                    borderWidth: 1.5,
                    borderColor: '#DBEAFE',
                    backgroundColor: '#F8FBFF',
                    borderRadius: 16,
                    paddingVertical: 14,
                    alignItems: 'center',
                }}
            >
                <Text
                    style={{
                        color: '#2563EB',
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 14,
                    }}
                >
                    Xem lời mời
                </Text>
            </Pressable>
        </View>
    );

    const renderErrorState = () => (
        <View
            style={{
                paddingHorizontal: 24,
                paddingTop: 28,
                paddingBottom: 12,
                alignItems: 'center',
            }}
        >
            <View
                style={{
                    width: 72,
                    height: 72,
                    borderRadius: 24,
                    backgroundColor: '#FFF7ED',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 18,
                }}
            >
                <Ionicons
                    name='cloud-offline-outline'
                    size={30}
                    color='#EA580C'
                />
            </View>
            <Text
                style={[
                    styles.sheetTitle,
                    { fontSize: 18, textAlign: 'center', marginBottom: 8 },
                ]}
            >
                Không tải được danh sách gia đình
            </Text>
            <Text
                style={[
                    styles.sheetSubtitle,
                    {
                        textAlign: 'center',
                        marginTop: 0,
                        lineHeight: 20,
                        marginBottom: 20,
                    },
                ]}
            >
                {error || 'Vui lòng thử lại sau ít phút.'}
            </Text>
            <Pressable
                style={{
                    width: '100%',
                    backgroundColor: '#2563EB',
                    borderRadius: 16,
                    paddingVertical: 14,
                    alignItems: 'center',
                }}
                onPress={onRetry}
            >
                <Text
                    style={{
                        color: '#fff',
                        fontFamily: 'Inter_700Bold',
                        fontSize: 14,
                    }}
                >
                    Thử lại
                </Text>
            </Pressable>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType='none'
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <Animated.View
                style={[styles.sheetBackdrop, { opacity: backdropAnim }]}
            >
                <Pressable style={{ flex: 1 }} onPress={onClose} />
            </Animated.View>

            <Animated.View
                style={[
                    styles.sheetContainer,
                    { transform: [{ translateY: slideAnim }] },
                ]}
            >
                <View style={styles.sheetHandle} />

                <View style={styles.sheetHeader}>
                    <Text style={styles.sheetTitle}>Chọn gia đình</Text>
                    <Text style={styles.sheetSubtitle}>
                        Xem tổng quan sức khỏe của gia đình nào?
                    </Text>
                </View>

                {isLoading
                    ? renderLoadingState()
                    : error
                      ? renderErrorState()
                      : familyOptions.length === 0
                        ? renderEmptyState()
                        : familyOptions.map((family) => (
                              <Pressable
                                  key={family.id}
                                  style={[
                                      styles.fpRow,
                                      selectedFamily === family.id &&
                                          styles.fpRowActive,
                                  ]}
                                  onPress={() => onSelectFamily(family.id)}
                              >
                                  <LinearGradient
                                      colors={
                                          family.gradientColors ?? [
                                              '#1D4ED8',
                                              '#2563EB',
                                              '#0D9488',
                                          ]
                                      }
                                      start={{ x: 0, y: 0 }}
                                      end={{ x: 1, y: 1 }}
                                      style={styles.fpIcon}
                                  >
                                      <Ionicons
                                          name={
                                              (family.iconName ??
                                                  'home-outline') as any
                                          }
                                          size={22}
                                          color='#fff'
                                      />
                                  </LinearGradient>
                                  <View style={{ flex: 1 }}>
                                      <Text style={styles.fpName}>
                                          {family.name}
                                      </Text>
                                      <Text style={styles.fpMeta}>
                                          {family.numberOfMembers} thành viên ·{' '}
                                          {family.role}
                                      </Text>
                                  </View>
                                  {selectedFamily === family.id ? (
                                      <View style={styles.fpCheck}>
                                          <Ionicons
                                              name='checkmark'
                                              size={13}
                                              color='#fff'
                                          />
                                      </View>
                                  ) : null}
                              </Pressable>
                          ))}
            </Animated.View>
        </Modal>
    );
}
