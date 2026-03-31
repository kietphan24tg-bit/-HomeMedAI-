import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient, type LinearGradientProps } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
    Defs,
    Path,
    Stop,
    LinearGradient as SvgLinearGradient,
} from 'react-native-svg';
import StatePanel from '@/src/components/state/StatePanel';
import { useMyFamiliesQuery } from '@/src/features/family/queries';
import { scale, scaleFont, verticalScale } from '@/src/styles/responsive';
import { shared } from '@/src/styles/shared';
import { colors, shadows, typography } from '@/src/styles/tokens';
import {
    CreateFamilyModal,
    INITIAL_INVITES,
    SectionLabel,
} from './familyShared';
import { styles } from './styles';

const AnimatedView = Animated.View;

function EmptyFamilyIllustration() {
    const floatA = useRef(new Animated.Value(0)).current;
    const floatB = useRef(new Animated.Value(0)).current;
    const floatC = useRef(new Animated.Value(0)).current;
    const pulse = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loopA = Animated.loop(
            Animated.sequence([
                Animated.timing(floatA, {
                    toValue: -8,
                    duration: 1800,
                    useNativeDriver: true,
                }),
                Animated.timing(floatA, {
                    toValue: 0,
                    duration: 1800,
                    useNativeDriver: true,
                }),
            ]),
        );

        const loopB = Animated.loop(
            Animated.sequence([
                Animated.timing(floatB, {
                    toValue: -10,
                    duration: 2300,
                    useNativeDriver: true,
                }),
                Animated.timing(floatB, {
                    toValue: 0,
                    duration: 2300,
                    useNativeDriver: true,
                }),
            ]),
        );

        const loopC = Animated.loop(
            Animated.sequence([
                Animated.timing(floatC, {
                    toValue: -7,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(floatC, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ]),
        );

        const pulseLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulse, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ]),
        );

        loopA.start();
        loopB.start();
        loopC.start();
        pulseLoop.start();

        return () => {
            loopA.stop();
            loopB.stop();
            loopC.stop();
            pulseLoop.stop();
        };
    }, [floatA, floatB, floatC, pulse]);

    const pulseScale = pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.04],
    });

    return (
        <View style={localStyles.illustrationWrap}>
            <AnimatedView
                style={[
                    localStyles.bgCircleOuter,
                    { transform: [{ scale: pulseScale }] },
                ]}
            />
            <View style={localStyles.bgCircleInner} />

            <View style={localStyles.houseWrap}>
                <Svg width={64} height={64} viewBox='0 0 64 64' fill='none'>
                    <Defs>
                        <SvgLinearGradient
                            id='houseGrad'
                            x1='0'
                            y1='0'
                            x2='1'
                            y2='1'
                        >
                            <Stop offset='0%' stopColor='#2563EB' />
                            <Stop offset='100%' stopColor='#0D9488' />
                        </SvgLinearGradient>
                    </Defs>
                    <Path
                        d='M8 26L32 6L56 26V58H38V42H26V58H8V26Z'
                        fill='url(#houseGrad)'
                        opacity='0.15'
                    />
                    <Path
                        d='M8 26L32 6L56 26V58H38V42H26V58H8V26Z'
                        stroke='url(#houseGrad)'
                        strokeWidth='2.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                    <Path
                        d='M22 58V38H42V58'
                        stroke='url(#houseGrad)'
                        strokeWidth='2.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                    <Path
                        d='M28 30H36V38H28V30Z'
                        stroke='url(#houseGrad)'
                        strokeWidth='2.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                    <Path
                        d='M46 22L54 30'
                        stroke='url(#houseGrad)'
                        strokeWidth='2.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                </Svg>
            </View>

            <AnimatedView
                style={[
                    localStyles.floatBlue,
                    { transform: [{ translateY: floatA }] },
                ]}
            >
                <Ionicons
                    name='person-outline'
                    size={13}
                    color={colors.primary}
                />
            </AnimatedView>

            <AnimatedView
                style={[
                    localStyles.floatWarm,
                    { transform: [{ translateY: floatB }] },
                ]}
            />

            <AnimatedView
                style={[
                    localStyles.floatMint,
                    { transform: [{ translateY: floatC }] },
                ]}
            />
        </View>
    );
}

export default function FamilyListScreen(): React.JSX.Element {
    const [showCreateSheet, setShowCreateSheet] = useState(false);
    const [familyName, setFamilyName] = useState('');
    const [familyAddress, setFamilyAddress] = useState('');
    const {
        data: families = [],
        isLoading,
        isError,
        refetch,
    } = useMyFamiliesQuery();

    const isEmpty = !isLoading && !isError && families.length === 0;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={localStyles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={localStyles.topbar}>
                    <Text style={localStyles.topbarTitle}>Gia Đình</Text>

                    <View style={localStyles.topbarRight}>
                        {isEmpty ? (
                            <View style={[shared.iconBtn, localStyles.gridBtn]}>
                                <Ionicons
                                    name='grid-outline'
                                    size={16}
                                    color='#F59E0B'
                                />
                            </View>
                        ) : null}

                        <Pressable
                            style={shared.iconBtn}
                            onPress={() =>
                                router.push('/(tabs)/family/invites')
                            }
                        >
                            <View>
                                <Ionicons
                                    name='notifications-outline'
                                    size={16}
                                    color={colors.text2}
                                />
                                {INITIAL_INVITES.length > 0 ? (
                                    <View style={localStyles.badge}>
                                        <Text style={localStyles.badgeText}>
                                            {INITIAL_INVITES.length}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        </Pressable>
                    </View>
                </View>

                {!isEmpty ? (
                    <>
                        <Text style={localStyles.headSub}>
                            Quản lý gia đình và kết nối hồ sơ sức khỏe chung.
                        </Text>
                        <SectionLabel title='Gia đình của tôi' />
                    </>
                ) : null}

                {isLoading ? (
                    <StatePanel
                        variant='loading'
                        title='Đang tải danh sách gia đình'
                        message='Vui lòng chờ trong giây lát để đồng bộ dữ liệu mới nhất.'
                    />
                ) : null}

                {isError ? (
                    <StatePanel
                        variant='error'
                        title='Không tải được danh sách gia đình'
                        message='Có lỗi xảy ra khi lấy dữ liệu gia đình. Vui lòng thử lại.'
                        actionLabel='Thử lại'
                        onAction={() => {
                            refetch();
                        }}
                    />
                ) : null}

                {isEmpty ? (
                    <View style={localStyles.emptyState}>
                        <EmptyFamilyIllustration />

                        <Text style={localStyles.emptyTitle}>
                            Bạn chưa có gia đình nào
                        </Text>
                        <Text style={localStyles.emptyMessage}>
                            Tạo gia đình mới hoặc tham gia bằng mã mời để bắt
                            đầu theo dõi sức khỏe cho cả nhà.
                        </Text>

                        <Pressable
                            style={localStyles.primaryCard}
                            onPress={() => setShowCreateSheet(true)}
                        >
                            <LinearGradient
                                colors={['#1E3A8A', '#2563EB', '#0D9488']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={localStyles.primaryCardBg}
                            >
                                <View style={localStyles.primaryGlowLg} />
                                <View style={localStyles.primaryGlowSm} />

                                <View style={localStyles.primaryCardIcon}>
                                    <Ionicons
                                        name='home-outline'
                                        size={22}
                                        color='#fff'
                                    />
                                </View>

                                <View style={localStyles.primaryCardBody}>
                                    <Text style={localStyles.primaryCardTitle}>
                                        Tạo gia đình mới
                                    </Text>
                                    <Text style={localStyles.primaryCardSub}>
                                        Bạn sẽ là chủ gia đình
                                    </Text>
                                </View>

                                <View style={localStyles.primaryCardTail}>
                                    <Ionicons
                                        name='add'
                                        size={16}
                                        color='#fff'
                                    />
                                </View>
                            </LinearGradient>
                        </Pressable>

                        <Pressable
                            style={localStyles.secondaryCard}
                            onPress={() => router.push('/join-family-code')}
                        >
                            <View style={localStyles.secondaryCardIcon}>
                                <Ionicons
                                    name='people-outline'
                                    size={22}
                                    color={colors.primary}
                                />
                            </View>
                            <View style={localStyles.secondaryCardBody}>
                                <Text style={localStyles.secondaryCardTitle}>
                                    Tham gia gia đình
                                </Text>
                                <Text style={localStyles.secondaryCardSub}>
                                    Nhập mã mời từ người thân
                                </Text>
                            </View>
                            <Ionicons
                                name='chevron-forward'
                                size={16}
                                color={colors.text3}
                            />
                        </Pressable>

                        <View style={localStyles.featureCard}>
                            <Text style={localStyles.featureTitle}>
                                Sau khi tạo gia đình bạn có thể
                            </Text>

                            <View style={localStyles.featureList}>
                                <View style={localStyles.featureRow}>
                                    <View
                                        style={[
                                            localStyles.featureIcon,
                                            { backgroundColor: '#F0FDFA' },
                                        ]}
                                    >
                                        <Ionicons
                                            name='medkit-outline'
                                            size={14}
                                            color='#0D9488'
                                        />
                                    </View>
                                    <Text style={localStyles.featureText}>
                                        Quản lý tủ thuốc chung cả nhà
                                    </Text>
                                </View>

                                <View style={localStyles.featureRow}>
                                    <View
                                        style={[
                                            localStyles.featureIcon,
                                            { backgroundColor: '#EFF6FF' },
                                        ]}
                                    >
                                        <Ionicons
                                            name='document-text-outline'
                                            size={14}
                                            color={colors.primary}
                                        />
                                    </View>
                                    <Text style={localStyles.featureText}>
                                        Xem hồ sơ sức khỏe từng thành viên
                                    </Text>
                                </View>

                                <View style={localStyles.featureRow}>
                                    <View
                                        style={[
                                            localStyles.featureIcon,
                                            { backgroundColor: '#FFF7ED' },
                                        ]}
                                    >
                                        <Ionicons
                                            name='notifications-outline'
                                            size={14}
                                            color='#EA580C'
                                        />
                                    </View>
                                    <Text style={localStyles.featureText}>
                                        Nhắc uống thuốc cho người thân
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                ) : null}

                {!isLoading && !isError
                    ? families.map((family) => (
                          <Pressable
                              key={family.id}
                              style={styles.fcard}
                              onPress={() =>
                                  router.push(`/(tabs)/family/${family.id}`)
                              }
                          >
                              <LinearGradient
                                  colors={
                                      family.gradientColors as LinearGradientProps['colors']
                                  }
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 1 }}
                                  style={styles.fcardBg}
                              >
                                  <View
                                      style={{
                                          position: 'absolute',
                                          top: -verticalScale(80),
                                          right: -scale(40),
                                          width: scale(200),
                                          height: scale(200),
                                          borderRadius: scale(100),
                                          backgroundColor:
                                              'rgba(255,255,255,0.07)',
                                      }}
                                  />
                                  <View
                                      style={{
                                          position: 'absolute',
                                          bottom: -verticalScale(40),
                                          left: scale(20),
                                          width: scale(110),
                                          height: scale(110),
                                          borderRadius: scale(55),
                                          backgroundColor:
                                              'rgba(255,255,255,0.04)',
                                      }}
                                  />
                                  <View style={styles.fcardInner}>
                                      <View style={styles.fcardIcon}>
                                          <Ionicons
                                              name={family.iconName as never}
                                              size={22}
                                              color='#fff'
                                          />
                                      </View>
                                      <View style={styles.fcardInfo}>
                                          <Text style={styles.fcardName}>
                                              {family.name}
                                          </Text>
                                          <Text style={styles.fcardMeta}>
                                              {family.memberCount} thành viên
                                          </Text>
                                          <Text style={styles.fcardRole}>
                                              Vai trò của bạn:{' '}
                                              {family.roleEmoji} {family.role}
                                          </Text>
                                      </View>
                                      <View style={styles.fcardArrow}>
                                          <Ionicons
                                              name='chevron-forward'
                                              size={14}
                                              color='#fff'
                                          />
                                      </View>
                                  </View>
                              </LinearGradient>
                          </Pressable>
                      ))
                    : null}

                {!isLoading && !isError && families.length > 0 ? (
                    <Pressable
                        style={styles.addFcard}
                        onPress={() => setShowCreateSheet(true)}
                    >
                        <View style={styles.addFcardInner}>
                            <View style={styles.addFcardIc}>
                                <Ionicons
                                    name='add'
                                    size={18}
                                    color={colors.primary}
                                />
                            </View>
                            <View>
                                <Text style={styles.addFcardTitle}>
                                    Thêm gia đình
                                </Text>
                                <Text style={styles.addFcardSub}>
                                    Tạo hoặc tham gia một gia đình mới
                                </Text>
                            </View>
                        </View>
                    </Pressable>
                ) : null}
            </ScrollView>

            <CreateFamilyModal
                visible={showCreateSheet}
                familyName={familyName}
                familyAddress={familyAddress}
                onChangeFamilyName={setFamilyName}
                onChangeFamilyAddress={setFamilyAddress}
                onClose={() => setShowCreateSheet(false)}
            />
        </SafeAreaView>
    );
}

const localStyles = StyleSheet.create({
    scrollContent: {
        paddingBottom: verticalScale(30),
    },
    topbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(14),
        paddingTop: verticalScale(4),
        paddingBottom: verticalScale(4),
    },
    topbarTitle: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(27),
        color: colors.text,
        letterSpacing: -0.35,
    },
    topbarRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
    },
    headSub: {
        paddingHorizontal: scale(14),
        marginTop: verticalScale(2),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        lineHeight: verticalScale(19),
        color: colors.text3,
        maxWidth: scale(280),
    },
    gridBtn: {
        backgroundColor: '#FFF7ED',
        borderColor: '#F59E0B',
    },
    badge: {
        position: 'absolute',
        top: -7,
        right: -9,
        minWidth: 18,
        height: 18,
        paddingHorizontal: 4,
        borderRadius: 9,
        backgroundColor: '#E11D48',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.bg,
    },
    badgeText: {
        color: '#fff',
        fontFamily: typography.font.bold,
        fontSize: scaleFont(9),
    },
    emptyState: {
        paddingHorizontal: scale(14),
        paddingTop: verticalScale(4),
        paddingBottom: verticalScale(24),
    },
    illustrationWrap: {
        position: 'relative',
        width: scale(160),
        height: verticalScale(140),
        alignSelf: 'center',
        marginBottom: verticalScale(14),
    },
    bgCircleOuter: {
        position: 'absolute',
        top: verticalScale(0),
        left: scale(10),
        width: scale(140),
        height: scale(140),
        borderRadius: 999,
        backgroundColor: '#EFF6FF',
        opacity: 0.8,
    },
    bgCircleInner: {
        position: 'absolute',
        top: verticalScale(16),
        left: scale(26),
        width: scale(108),
        height: scale(108),
        borderRadius: 999,
        backgroundColor: '#DBEAFE',
    },
    houseWrap: {
        position: 'absolute',
        inset: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    floatBlue: {
        position: 'absolute',
        top: verticalScale(18),
        right: scale(0),
        width: scale(34),
        height: scale(34),
        borderRadius: 999,
        backgroundColor: '#BFDBFE',
        borderWidth: 2,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    floatWarm: {
        position: 'absolute',
        bottom: verticalScale(12),
        right: scale(-2),
        width: scale(22),
        height: scale(22),
        borderRadius: 999,
        backgroundColor: '#FDBA74',
        borderWidth: 2,
        borderColor: '#fff',
    },
    floatMint: {
        position: 'absolute',
        top: verticalScale(26),
        left: scale(6),
        width: scale(20),
        height: scale(20),
        borderRadius: 999,
        backgroundColor: '#86EFAC',
        borderWidth: 2,
        borderColor: '#fff',
    },
    emptyTitle: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(20),
        color: colors.text,
        textAlign: 'center',
        marginBottom: verticalScale(8),
    },
    emptyMessage: {
        paddingHorizontal: scale(24),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(14),
        lineHeight: verticalScale(24),
        color: colors.text3,
        textAlign: 'center',
        marginBottom: verticalScale(20),
    },
    primaryCard: {
        borderRadius: scale(18),
        overflow: 'hidden',
        marginBottom: verticalScale(14),
        ...shadows.card,
    },
    primaryCardBg: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(14),
        paddingHorizontal: scale(18),
        paddingVertical: verticalScale(18),
    },
    primaryGlowLg: {
        position: 'absolute',
        right: -10,
        top: -10,
        width: scale(70),
        height: scale(70),
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    primaryGlowSm: {
        position: 'absolute',
        right: scale(20),
        bottom: -14,
        width: scale(44),
        height: scale(44),
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    primaryCardIcon: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(14),
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryCardBody: {
        flex: 1,
    },
    primaryCardTitle: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(15),
        color: '#fff',
        letterSpacing: -0.2,
    },
    primaryCardSub: {
        marginTop: verticalScale(2),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11),
        color: 'rgba(255,255,255,0.68)',
    },
    primaryCardTail: {
        width: scale(28),
        height: scale(28),
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(14),
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: scale(18),
        paddingHorizontal: scale(18),
        paddingVertical: verticalScale(18),
        marginBottom: verticalScale(16),
        ...shadows.card,
    },
    secondaryCardIcon: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(14),
        backgroundColor: colors.primaryBg,
        borderWidth: 1.5,
        borderColor: '#BFDBFE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryCardBody: {
        flex: 1,
    },
    secondaryCardTitle: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(15),
        color: colors.text,
    },
    secondaryCardSub: {
        marginTop: verticalScale(2),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11),
        color: colors.text3,
    },
    featureCard: {
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: scale(16),
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(16),
    },
    featureTitle: {
        marginBottom: verticalScale(12),
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
        color: colors.text3,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    featureList: {
        gap: verticalScale(10),
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
    },
    featureIcon: {
        width: scale(28),
        height: scale(28),
        borderRadius: scale(8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        flex: 1,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text2,
    },
});
