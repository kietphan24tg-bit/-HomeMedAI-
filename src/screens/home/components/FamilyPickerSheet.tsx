import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Modal, Pressable, Text, View } from 'react-native';
import StatePanel from '@/src/components/state/StatePanel';
import type { FamilyOption } from '../home.types';
import { styles } from '../styles';

type Props = {
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
    onCreateFamily: () => void;
    onViewInvites: () => void;
};

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
    onCreateFamily,
    onViewInvites,
}: Props): React.JSX.Element {
    const renderLoadingState = () => (
        <StatePanel
            variant='loading'
            title='Đang tải danh sách gia đình'
            message='Vui lòng chờ trong giây lát để lấy dữ liệu mới nhất.'
            compact
        />
    );

    const renderEmptyState = () => (
        <View
            style={{
                paddingHorizontal: 28,
                paddingTop: 32,
                paddingBottom: 20,
                alignItems: 'center',
            }}
        >
            <StatePanel
                variant='empty'
                title='Bạn chưa có gia đình nào'
                message='Tạo gia đình đầu tiên để bắt đầu quản lý sức khỏe cho cả nhà.'
                compact
                flat
            />
            <Pressable
                style={{
                    width: '100%',
                    backgroundColor: '#2563EB',
                    borderRadius: 16,
                    paddingVertical: 14,
                    alignItems: 'center',
                    marginTop: 10,
                }}
                onPress={onCreateFamily}
            >
                <Text
                    style={{
                        color: '#fff',
                        fontFamily: 'Inter_700Bold',
                        fontSize: 14,
                    }}
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
                    marginTop: 10,
                }}
                onPress={onViewInvites}
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
            style={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 12 }}
        >
            <StatePanel
                variant='error'
                title='Không tải được danh sách gia đình'
                message={error || 'Vui lòng thử lại sau ít phút.'}
                actionLabel='Thử lại'
                onAction={onRetry}
                compact
            />
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
                                                  'home-outline') as never
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
