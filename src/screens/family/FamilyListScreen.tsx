import StatePanel from '@/src/components/state/StatePanel';
import { useCreateFamilyMutation } from '@/src/features/family/mutations';
import {
    useFamilyInvitesQuery,
    useMyFamiliesQuery,
} from '@/src/features/family/queries';
import { useMeOverviewQuery } from '@/src/features/me/queries';
import {
    moderateScale,
    scale,
    scaleFont,
    verticalScale,
} from '@/src/styles/responsive';
import { cardSystem, shared } from '@/src/styles/shared';
import { colors, shadows, typography } from '@/src/styles/tokens';
import type { FamilyGroup } from '@/src/types/family';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Image,
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
import { CreateFamilyModal, SectionLabel } from './familyShared';
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
    const [familyAvatarUri, setFamilyAvatarUri] = useState<string | null>(null);
    const {
        data: families = [],
        isLoading,
        isError,
        refetch,
    } = useMyFamiliesQuery();
    const { data: pendingInvites = [] } = useFamilyInvitesQuery({
        status: 'pending',
        page: 1,
        limit: 20,
    });

    const isEmpty = !isLoading && !isError && families.length === 0;

    const handlePickFamilyAvatar = async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert(
                'Ch\u01B0a c\u00F3 quy\u1EC1n truy c\u1EADp \u1EA3nh',
                'H\u00E3y cho ph\u00E9p \u1EE9ng d\u1EE5ng truy c\u1EADp th\u01B0 vi\u1EC7n \u1EA3nh \u0111\u1EC3 ch\u1ECDn \u1EA3nh \u0111\u1EA1i di\u1EC7n gia \u0111\u00ECnh.',
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]?.uri) {
            setFamilyAvatarUri(result.assets[0].uri);
        }
    };

    const { data: meOverview } = useMeOverviewQuery();
    const createFamilyMutation = useCreateFamilyMutation();

    const handleCreateFamily = () => {
        if (!familyName.trim()) {
            Alert.alert(
                'Thi\u1EBFu th\u00F4ng tin',
                'Vui l\u00F2ng nh\u1EADp t\u00EAn gia \u0111\u00ECnh.',
            );
            return;
        }

        const fullName =
            (meOverview?.profile as any)?.full_name ||
            'Ch\u1EE7 gia \u0111\u00ECnh';

        createFamilyMutation.mutate(
            {
                name: familyName,
                address: familyAddress || null,
                avatar_url: familyAvatarUri || null,
                owner_profile_full_name: fullName,
            },
            {
                onSuccess: () => {
                    setShowCreateSheet(false);
                    setFamilyName('');
                    setFamilyAddress('');
                    setFamilyAvatarUri(null);
                },
            },
        );
    };

    const handleCloseCreateSheet = () => {
        setShowCreateSheet(false);
    };

    const navigateToFamily = (familyId: string) => {
        router.push({
            pathname: '/family/[familyId]',
            params: { familyId },
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={localStyles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={localStyles.topbar}>
                    <View>
                        <Text style={localStyles.topbarTitle}>
                            {'Gia \u0110\u00ECnh'}
                        </Text>
                    </View>

                    <View style={localStyles.topbarRight}>
                        <Pressable
                            style={shared.iconBtn}
                            onPress={() => setShowCreateSheet(true)}
                        >
                            <Ionicons
                                name='add'
                                size={18}
                                color={colors.primary}
                            />
                        </Pressable>

                        <Pressable
                            style={shared.iconBtn}
                            onPress={() => router.push('/family/invites')}
                        >
                            <View>
                                <Ionicons
                                    name='notifications-outline'
                                    size={16}
                                    color={colors.text3}
                                />
                                {pendingInvites.length > 0 ? (
                                    <View style={localStyles.badge}>
                                        <Text style={localStyles.badgeText}>
                                            {pendingInvites.length}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        </Pressable>
                    </View>
                </View>

                {!isEmpty ? (
                    <>
                        <SectionLabel
                            title={'Gia \u0111\u00ECnh c\u1EE7a t\u00F4i'}
                        />
                    </>
                ) : null}

                {isLoading ? (
                    <StatePanel
                        variant='loading'
                        title={
                            '\u0110ang t\u1EA3i danh s\u00E1ch gia \u0111\u00ECnh'
                        }
                        message={
                            'Vui l\u00F2ng ch\u1EDD trong gi\u00E2y l\u00E1t \u0111\u1EC3 \u0111\u1ED3ng b\u1ED9 d\u1EEF li\u1EC7u m\u1EDBi nh\u1EA5t.'
                        }
                    />
                ) : null}

                {isError ? (
                    <StatePanel
                        variant='error'
                        title={
                            'Kh\u00F4ng t\u1EA3i \u0111\u01B0\u1EE3c danh s\u00E1ch gia \u0111\u00ECnh'
                        }
                        message={
                            'C\u00F3 l\u1ED7i x\u1EA3y ra khi l\u1EA5y d\u1EEF li\u1EC7u gia \u0111\u00ECnh. Vui l\u00F2ng th\u1EED l\u1EA1i.'
                        }
                        actionLabel={'Th\u1EED l\u1EA1i'}
                        onAction={() => {
                            refetch();
                        }}
                    />
                ) : null}

                {isEmpty ? (
                    <View style={localStyles.emptyState}>
                        <EmptyFamilyIllustration />

                        <Text style={localStyles.emptyTitle}>
                            {
                                'B\u1EA1n ch\u01B0a c\u00F3 gia \u0111\u00ECnh n\u00E0o'
                            }
                        </Text>
                        <Text style={localStyles.emptyMessage}>
                            {
                                'T\u1EA1o gia \u0111\u00ECnh m\u1EDBi ho\u1EB7c tham gia b\u1EB1ng m\u00E3 m\u1EDDi \u0111\u1EC3 b\u1EAFt'
                            }
                            {'\n'}
                            {
                                '\u0111\u1EA7u theo d\u00F5i s\u1EE9c kh\u1ECFe cho c\u1EA3 nh\u00E0.'
                            }
                        </Text>

                        <Pressable
                            style={localStyles.primaryCard}
                            onPress={() => setShowCreateSheet(true)}
                        >
                            <View style={localStyles.primaryCardBg}>
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
                                        {'T\u1EA1o gia \u0111\u00ECnh m\u1EDBi'}
                                    </Text>
                                    <Text style={localStyles.primaryCardSub}>
                                        {
                                            'B\u1EA1n s\u1EBD l\u00E0 ch\u1EE7 gia \u0111\u00ECnh'
                                        }
                                    </Text>
                                </View>

                                <View style={localStyles.primaryCardTail}>
                                    <Ionicons
                                        name='add'
                                        size={16}
                                        color='#fff'
                                    />
                                </View>
                            </View>
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
                                    {'Tham gia gia \u0111\u00ECnh'}
                                </Text>
                                <Text style={localStyles.secondaryCardSub}>
                                    {
                                        'Nh\u1EADp m\u00E3 m\u1EDDi t\u1EEB ng\u01B0\u1EDDi th\u00E2n'
                                    }
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
                                {
                                    'Sau khi t\u1EA1o gia \u0111\u00ECnh b\u1EA1n c\u00F3 th\u1EC3'
                                }
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
                                        {
                                            'Qu\u1EA3n l\u00FD t\u1EE7 thu\u1ED1c chung c\u1EA3 nh\u00E0'
                                        }
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
                                        {
                                            'Xem h\u1ED3 s\u01A1 s\u1EE9c kh\u1ECFe t\u1EEBng th\u00E0nh vi\u00EAn'
                                        }
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
                                        {
                                            'Nh\u1EAFc u\u1ED1ng thu\u1ED1c cho ng\u01B0\u1EDDi th\u00E2n'
                                        }
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                ) : null}

                {!isLoading && !isError
                    ? families.map((family: FamilyGroup, idx: number) => {
                          const nameParts = (family.name || 'G\u0110')
                              .split(' ')
                              .filter(Boolean);
                          const initials =
                              nameParts.length >= 2
                                  ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
                                  : (family.name || 'G\u0110')
                                        .slice(0, 2)
                                        .toUpperCase();
                          // Mock reminder count - replace with real API data when ready
                          const reminderCount = idx === 0 ? 3 : 0;
                          return (
                              <Pressable
                                  key={family.id}
                                  style={[
                                      styles.fcard,
                                      reminderCount > 0
                                          ? localStyles.familyCardAlertWrap
                                          : localStyles.familyCardCalmWrap,
                                  ]}
                                  onPress={() => navigateToFamily(family.id)}
                              >
                                  <View
                                      style={[
                                          localStyles.fcardCard,
                                          reminderCount > 0
                                              ? localStyles.fcardCardAlert
                                              : localStyles.fcardCardCalm,
                                      ]}
                                  >
                                      {/* Top row: avatar + name + arrow */}
                                      <View style={localStyles.fcardTopRow}>
                                          <View
                                              style={[
                                                  localStyles.fcardInitials,
                                                  reminderCount > 0
                                                      ? localStyles.fcardInitialsAlert
                                                      : localStyles.fcardInitialsCalm,
                                              ]}
                                          >
                                              {family.avatarUrl ? (
                                                  <Image
                                                      source={{
                                                          uri: family.avatarUrl,
                                                      }}
                                                      style={
                                                          localStyles.fcardAvatarImage
                                                      }
                                                      resizeMode='cover'
                                                  />
                                              ) : (
                                                  <Text
                                                      style={[
                                                          localStyles.fcardInitialsText,
                                                          reminderCount > 0
                                                              ? localStyles.fcardInitialsTextAlert
                                                              : localStyles.fcardInitialsTextCalm,
                                                      ]}
                                                  >
                                                      {initials}
                                                  </Text>
                                              )}
                                          </View>
                                          <View style={{ flex: 1 }}>
                                              <Text
                                                  style={[
                                                      styles.fcardName,
                                                      reminderCount > 0
                                                          ? localStyles.fcardNameAlert
                                                          : localStyles.fcardNameCalm,
                                                  ]}
                                              >
                                                  {family.name}
                                              </Text>
                                              <Text
                                                  style={[
                                                      styles.fcardMeta,
                                                      reminderCount > 0
                                                          ? localStyles.fcardMetaAlert
                                                          : localStyles.fcardMetaCalm,
                                                  ]}
                                              >
                                                  {family.memberCount}{' '}
                                                  {'th\u00E0nh vi\u00EAn'}
                                              </Text>
                                          </View>
                                          <Pressable
                                              style={[
                                                  styles.fcardArrow,
                                                  reminderCount > 0
                                                      ? localStyles.fcardArrowAlert
                                                      : localStyles.fcardArrowCalm,
                                              ]}
                                              onPress={() =>
                                                  navigateToFamily(family.id)
                                              }
                                          >
                                              <Ionicons
                                                  name='chevron-forward'
                                                  size={14}
                                                  color={colors.text2}
                                              />
                                          </Pressable>
                                      </View>

                                      {/* Divider */}
                                      <View
                                          style={[
                                              localStyles.fcardDivider,
                                              reminderCount > 0
                                                  ? localStyles.fcardDividerAlert
                                                  : localStyles.fcardDividerCalm,
                                          ]}
                                      />

                                      {/* Reminder row only */}
                                      <View
                                          style={[
                                              localStyles.fcardReminderRow,
                                              reminderCount > 0
                                                  ? localStyles.fcardReminderRowHighlight
                                                  : localStyles.fcardReminderRowQuiet,
                                          ]}
                                      >
                                          <View
                                              style={
                                                  localStyles.fcardReminderLead
                                              }
                                          >
                                              <Ionicons
                                                  name={
                                                      reminderCount > 0
                                                          ? 'notifications'
                                                          : 'notifications-outline'
                                                  }
                                                  size={12}
                                                  color={
                                                      reminderCount > 0
                                                          ? colors.warning
                                                          : colors.text3
                                                  }
                                              />
                                              <Text
                                                  style={[
                                                      localStyles.fcardSummaryText,
                                                      reminderCount > 0
                                                          ? localStyles.fcardSummaryHighlight
                                                          : localStyles.fcardSummaryMuted,
                                                  ]}
                                              >
                                                  {reminderCount > 0
                                                      ? `C\u00F3 ${reminderCount} nh\u1EAFc nh\u1EDF h\u00F4m nay`
                                                      : 'Ch\u01B0a c\u00F3 nh\u1EAFc nh\u1EDF h\u00F4m nay'}
                                              </Text>
                                          </View>
                                      </View>
                                  </View>
                              </Pressable>
                          );
                      })
                    : null}

                {!isLoading && !isError && families.length > 0 ? (
                    <View style={localStyles.bottomSpacer} />
                ) : null}
            </ScrollView>

            <CreateFamilyModal
                visible={showCreateSheet}
                familyName={familyName}
                familyAddress={familyAddress}
                familyAvatarUri={familyAvatarUri}
                onChangeFamilyName={setFamilyName}
                onChangeFamilyAddress={setFamilyAddress}
                onPickFamilyAvatar={handlePickFamilyAvatar}
                onSubmit={handleCreateFamily}
                onClose={handleCloseCreateSheet}
            />

            {createFamilyMutation.isPending && (
                <View style={localStyles.overlay}>
                    <View style={localStyles.loadingBox}>
                        <StatusBar
                            barStyle='light-content'
                            backgroundColor='rgba(0,0,0,0.5)'
                        />
                        <View style={localStyles.loadingSpinner} />
                        <Text style={localStyles.loadingText}>
                            {'\u0110ang t\u1EA1o gia \u0111\u00ECnh...'}
                        </Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const localStyles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    },
    loadingBox: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderRadius: 20,
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    loadingSpinner: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.2)',
        borderTopColor: '#fff',
    },
    loadingText: {
        color: '#fff',
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
    },
    scrollContent: {
        paddingBottom: verticalScale(30),
    },
    topbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(10),
        paddingBottom: verticalScale(8),
    },
    topbarTitle: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(28),
        color: '#0F2D27',
        letterSpacing: -0.5,
        lineHeight: scaleFont(34),
    },
    topbarSub: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11),
        color: colors.text3,
        marginTop: verticalScale(1),
        letterSpacing: 0.1,
    },
    topbarRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
    addFamilyTopBtn: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOpacity: 0.16,
    },
    bottomSpacer: {
        height: verticalScale(12),
    },
    bellBtn: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
    },
    headSub: {
        paddingHorizontal: scale(20),
        marginBottom: verticalScale(4),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        lineHeight: verticalScale(18),
        color: colors.text3,
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

    // Family card avatar/initials
    familyCardActiveWrap: {
        shadowColor: colors.primary,
    },
    familyCardAlertWrap: {
        shadowColor: '#8CCFB5',
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 3,
    },
    familyCardCalmWrap: {
        shadowColor: '#A9B8B1',
        shadowOpacity: 0.04,
    },
    fcardCard: {
        ...cardSystem.shell,
        paddingHorizontal: scale(18),
        paddingVertical: verticalScale(16),
        overflow: 'hidden',
    },
    fcardCardAlert: {
        backgroundColor: '#FFFFFF',
        borderWidth: 0,
        borderColor: 'transparent',
    },
    fcardCardCalm: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E7EFEB',
    },
    fcardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
        minHeight: verticalScale(42),
    },
    fcardDivider: {
        height: 0,
        marginVertical: 0,
    },
    fcardDividerAlert: {
        backgroundColor: '#DCEFE6',
    },
    fcardDividerCalm: {
        backgroundColor: '#E4ECE8',
    },
    fcardReminderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: scale(10),
        borderRadius: moderateScale(14),
        minHeight: verticalScale(32),
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(6),
        alignSelf: 'flex-start',
        marginLeft: scale(54),
        marginTop: verticalScale(8),
    },
    fcardReminderRowHighlight: {
        backgroundColor: '#FFF7EC',
    },
    fcardReminderRowQuiet: {
        backgroundColor: '#F3F6FA',
    },
    fcardReminderLead: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(7),
        flex: 1,
    },
    fcardReminderCount: {
        minWidth: moderateScale(24),
        height: moderateScale(24),
        paddingHorizontal: scale(7),
        borderRadius: moderateScale(999),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FDE7C4',
    },
    fcardReminderCountText: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(10.5),
        color: '#C77700',
    },
    fcardSummaryText: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(10.75),
        lineHeight: verticalScale(14),
    },
    fcardSummaryHighlight: {
        color: '#C77700',
    },
    fcardSummaryMuted: {
        color: '#93A0AF',
    },
    fcardInitials: {
        ...cardSystem.rowIcon,
        width: moderateScale(48),
        height: moderateScale(48),
        borderRadius: moderateScale(15),
        borderWidth: 1.25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fcardInitialsAlert: {
        borderColor: '#B7E3CF',
        backgroundColor: '#ECF8F2',
    },
    fcardInitialsCalm: {
        borderColor: '#DCE8E1',
        backgroundColor: '#F5F8F6',
    },
    fcardInitialsText: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(16),
        letterSpacing: -0.4,
    },
    fcardInitialsTextAlert: {
        color: colors.primary,
    },
    fcardInitialsTextCalm: {
        color: '#5E736B',
    },
    fcardAvatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: moderateScale(14),
        backgroundColor: '#E8EFEC',
    },
    fcardNameAlert: {
        color: '#12342E',
    },
    fcardNameCalm: {
        color: colors.text,
    },
    fcardMetaAlert: {
        color: '#68847A',
    },
    fcardMetaCalm: {
        color: '#73817C',
    },
    fcardArrowAlert: {
        backgroundColor: '#EEF6F2',
        borderColor: '#D8E8E0',
    },
    fcardArrowCalm: {
        backgroundColor: '#F4F7FB',
    },
    fcardAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4),
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(8),
        borderRadius: moderateScale(999),
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOpacity: 0.16,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: verticalScale(4) },
        elevation: 3,
    },
    fcardActionText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
        color: '#fff',
    },
    familyTipsCard: {
        marginHorizontal: scale(20),
        marginTop: verticalScale(12),
        backgroundColor: colors.card,
        borderRadius: moderateScale(20),
        borderWidth: 1,
        borderColor: '#E6EEEA',
        paddingHorizontal: scale(18),
        paddingVertical: verticalScale(18),
        ...shadows.card,
    },
    familyTipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
        marginBottom: verticalScale(14),
    },
    familyTipsIcon: {
        width: scale(34),
        height: scale(34),
        borderRadius: scale(12),
        backgroundColor: '#EEF8F3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    familyTipsTitle: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(14),
        color: colors.text,
    },
    familyTipsList: {
        gap: verticalScale(12),
    },
    familyTipRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: scale(10),
    },
    familyTipDot: {
        width: scale(9),
        height: scale(9),
        borderRadius: scale(4.5),
        backgroundColor: colors.primaryLight,
        marginTop: verticalScale(6),
    },
    familyTipText: {
        flex: 1,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        lineHeight: verticalScale(20),
        color: colors.text2,
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
        backgroundColor: colors.primary,
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
