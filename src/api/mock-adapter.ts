/**
 * Mock adapter for axios — intercepts ALL requests and returns realistic data.
 * Activate by setting EXPO_PUBLIC_MOCK_API=true in .env
 *
 * Zero changes to services/queries/mutations — they keep calling apiClient as usual.
 */
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { FAMILIES } from '@/src/data/family-data';
import { FAMILY_MEDICINES } from '@/src/data/family-medicine-data';

let _nextId = 1000;
const uid = () => `mock-${++_nextId}`;

/** In-memory MEDICINE schedules (key = medicine inventory item id) */
const _mockMedicineSchedules: Record<string, Record<string, unknown>[]> = {};

function _schedulesForItem(itemId: string) {
    if (!_mockMedicineSchedules[itemId]) {
        _mockMedicineSchedules[itemId] = [];
    }
    return _mockMedicineSchedules[itemId];
}

function _patchMockScheduleById(
    scheduleId: string,
    body: Record<string, unknown>,
): Record<string, unknown> | { detail: string } {
    for (const itemId of Object.keys(_mockMedicineSchedules)) {
        const rows = _mockMedicineSchedules[itemId];
        const idx = rows.findIndex((r) => r.id === scheduleId);
        if (idx >= 0) {
            rows[idx] = { ...rows[idx], ...body };
            return rows[idx] as Record<string, unknown>;
        }
    }
    return { detail: 'Not found' };
}

function _deleteMockScheduleById(scheduleId: string): void {
    for (const itemId of Object.keys(_mockMedicineSchedules)) {
        const rows = _mockMedicineSchedules[itemId];
        const next = rows.filter((r) => r.id !== scheduleId);
        if (next.length !== rows.length) {
            _mockMedicineSchedules[itemId] = next;
            return;
        }
    }
}

const MOCK_ACCESS_TOKEN = 'mock-access-token-abc123';
const MOCK_REFRESH_TOKEN = 'mock-refresh-token-xyz789';

const MOCK_EMAIL = 'test@homemedai.com';
const MOCK_PASSWORD = '123456';

const MOCK_USER = {
    id: 'user-001',
    email: MOCK_EMAIL,
    phone_number: '+84909123456',
    status: 'active',
    created_at: '2024-03-01T00:00:00Z',
    google_id: null,
};

const DEFAULT_MOCK_PROFILE = {
    id: 'profile-001',
    full_name: 'Nguyễn Văn An',
    date_of_birth: '1987-03-12',
    gender: 'male',
    height_cm: 170,
    weight_kg: 68,
    address: 'Quận Bình Thạnh, TP. HCM',
    avatar_url: null,
    phone_number: '+84909123456',
};

const MOCK_HEALTH_PROFILE = {
    blood_type: 'O+',
    chronic_conditions: ['Tăng huyết áp'],
    allergies: [],
    medical_records: [],
    user_vaccinations: [],
    prescriptions: [],
};

let mockProfile: typeof DEFAULT_MOCK_PROFILE | null = null;

const MOCK_NOTIFICATIONS = [
    {
        id: 'noti-001',
        category: 'MEDICINE',
        status: 'ACTIVE',
        title: 'Nhac uong thuoc',
        body: 'Metformin 500mg',
        remind_time: '18:00',
        scheduled_at: new Date().toISOString(),
        medicine_name: 'Metformin 500mg',
        dosage_per_time: '1',
        profile_id: 'profile-001',
        profile_name: 'Nguyen Van An',
        family_name: 'Phan Family',
    },
    {
        id: 'noti-002',
        category: 'MEDICINE',
        status: 'COMPLETED',
        title: 'Nhac uong thuoc',
        body: 'Amlodipine 5mg',
        remind_time: '07:00',
        scheduled_at: new Date(Date.now() - 86400000).toISOString(),
        medicine_name: 'Amlodipine 5mg',
        dosage_per_time: '1',
        profile_id: 'profile-001',
        profile_name: 'Nguyen Van An',
        family_name: 'Phan Family',
    },
];

function getMockProfile() {
    return mockProfile;
}

function isPostLoginFlowCompleted() {
    return !!mockProfile;
}

type DictionaryType = 'disease' | 'drug' | 'vaccine';

type DictionarySeedItem = {
    id: string;
    type: DictionaryType;
    title: string;
    aliases: string[];
    summary: string;
    content: Record<string, unknown>;
    source_file: string;
};

const DICTIONARY_SEED: DictionarySeedItem[] = [
    {
        id: 'disease-flu',
        type: 'disease',
        title: 'Influenza (Cúm mùa)',
        aliases: ['flu', 'cúm', 'influenza'],
        summary: 'Nhiễm virus hô hấp cấp, thường tự giới hạn sau 5-7 ngày.',
        content: {
            symptoms: ['Sốt', 'Đau họng', 'Mệt mỏi', 'Ho khan'],
            treatment: 'Nghỉ ngơi, bù nước, hạ sốt theo hướng dẫn bác sĩ.',
            warning_signs: ['Khó thở', 'Sốt cao kéo dài', 'Đau ngực'],
        },
        source_file: 'mock://dictionary/disease-flu',
    },
    {
        id: 'drug-paracetamol',
        type: 'drug',
        title: 'Paracetamol',
        aliases: ['acetaminophen', 'hạ sốt'],
        summary: 'Thuốc giảm đau, hạ sốt phổ biến cho người lớn và trẻ em.',
        content: {
            indication: ['Sốt', 'Đau đầu', 'Đau cơ'],
            adult_dose: '500-1000mg mỗi 4-6 giờ, tối đa 4000mg/ngày.',
            caution: 'Thận trọng ở người bệnh gan, tránh dùng quá liều.',
        },
        source_file: 'mock://dictionary/drug-paracetamol',
    },
    {
        id: 'vaccine-covid19',
        type: 'vaccine',
        title: 'Vaccine COVID-19',
        aliases: ['covid vaccine', 'vaccine corona'],
        summary: 'Giúp giảm nguy cơ bệnh nặng và nhập viện do COVID-19.',
        content: {
            schedule: 'Theo khuyến cáo của Bộ Y tế và nhóm nguy cơ.',
            common_reactions: ['Đau tại chỗ tiêm', 'Mệt mỏi nhẹ', 'Sốt nhẹ'],
            note: 'Theo dõi phản ứng sau tiêm ít nhất 30 phút.',
        },
        source_file: 'mock://dictionary/vaccine-covid19',
    },
];

function buildFamilyApiData() {
    return FAMILIES.map((f) => ({
        id: f.id,
        name: f.name,
        address: f.address ?? null,
        avatar_url: null,
        created_by: 'user-001',
        created_at: '2024-03-01T00:00:00Z',
        invite_code: `INV-${f.id.toUpperCase().slice(0, 6)}`,
        members: f.members.map((m, i) => ({
            id: m.id,
            family_id: f.id,
            user_id: m.isSelf ? 'user-001' : null,
            role: m.isOwner ? 'owner' : 'member',
            is_owner: !!m.isOwner,
            is_self: !!m.isSelf,
            joined_at: '2024-03-01T00:00:00Z',
            profile: {
                full_name: m.name,
                date_of_birth: m.dob ?? '1990-01-01',
                gender: m.gender === 'Nam' ? 'male' : 'female',
                height_cm: m.height ?? 165,
                weight_kg: m.weight ?? 60,
                address: m.address ?? 'TP. HCM',
                avatar_url: null,
                phone_number: m.isSelf
                    ? '+84909123456'
                    : `+8491${String(i).padStart(7, '0')}`,
            },
            health_profile: {
                blood_type: m.bloodType ?? null,
                chronic_conditions: m.chronicIllness
                    ? m.chronicIllness.split(',').map((s) => s.trim())
                    : [],
                allergies: m.allergies
                    ? m.allergies === 'Không'
                        ? []
                        : m.allergies.split(',').map((s) => s.trim())
                    : [],
                medical_records: [],
                user_vaccinations: [],
                prescriptions: [],
            },
        })),
    }));
}

function buildMedicineApiData(familyId: string) {
    return FAMILY_MEDICINES.filter((m) => m.familyId === familyId).map((m) => ({
        id: m.id,
        family_id: familyId,
        name: m.name,
        quantity: m.qty,
        unit: m.unit,
        expiry_date: m.exp,
        storage_location: m.location,
        note: m.note ?? null,
        group: m.group ?? null,
        dosage: m.dose ?? null,
        low_threshold: m.lowThreshold,
        original_quantity: m.originalQty,
        form: m.form ?? null,
        reminder: m.reminder ?? null,
    }));
}

function normalizeText(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

type RouteHandler = (
    url: string,
    config: InternalAxiosRequestConfig,
    params: Record<string, string>,
) => unknown;

interface Route {
    method: string;
    pattern: RegExp;
    handler: RouteHandler;
}

function extractParams(pattern: RegExp, url: string): Record<string, string> {
    const match = url.match(pattern);
    return match?.groups ?? {};
}

const familyApiData = buildFamilyApiData();

const routes: Route[] = [
    // ─── Auth ──────────────────────────────────────────
    {
        method: 'post',
        pattern: /^\/auth\/register$/,
        handler: () => ({
            message: 'Đăng ký thành công.',
            user: { ...MOCK_USER, id: uid() },
        }),
    },
    {
        method: 'post',
        pattern: /^\/auth\/login$/,
        handler: (_url, config) => {
            const body = config.data ? JSON.parse(String(config.data)) : {};
            if (body.email !== MOCK_EMAIL || body.password !== MOCK_PASSWORD) {
                const err: any = new Error('Unauthorized');
                err.response = {
                    status: 401,
                    data: { message: 'Email hoặc mật khẩu không đúng.' },
                };
                throw err;
            }
            return {
                access_token: MOCK_ACCESS_TOKEN,
                refresh_token: MOCK_REFRESH_TOKEN,
                user: MOCK_USER,
            };
        },
    },
    {
        method: 'post',
        pattern: /^\/auth\/google$/,
        handler: () => ({
            access_token: MOCK_ACCESS_TOKEN,
            refresh_token: MOCK_REFRESH_TOKEN,
            user: MOCK_USER,
        }),
    },
    {
        method: 'get',
        pattern: /^\/auth\/logout$/,
        handler: () => ({ message: 'Đã đăng xuất.' }),
    },
    {
        method: 'post',
        pattern: /^\/auth\/refresh$/,
        handler: () => ({
            access_token: `${MOCK_ACCESS_TOKEN}-refreshed-${Date.now()}`,
            refresh_token: MOCK_REFRESH_TOKEN,
        }),
    },
    {
        method: 'post',
        pattern: /^\/auth\/forgot-password$/,
        handler: () => ({
            reset_token: 'mock-reset-token-111',
            message: 'OTP đã gửi về email.',
        }),
    },
    {
        method: 'post',
        pattern: /^\/auth\/reset-password$/,
        handler: () => ({ message: 'Đặt lại mật khẩu thành công.' }),
    },
    {
        method: 'post',
        pattern: /^\/rag\/chat$/,
        handler: (_url, config) => {
            const body = config.data ? JSON.parse(String(config.data)) : {};
            const question = String(body.question ?? '').trim();
            const normalized = normalizeText(question);

            let answer =
                'Mình đã ghi nhận câu hỏi của bạn. Đây là phản hồi mô phỏng từ AI, không thay thế tư vấn y khoa trực tiếp.';

            if (normalized.includes('sot') || normalized.includes('fever')) {
                answer =
                    'Nếu sốt dưới 38.5°C, bạn nên nghỉ ngơi và uống đủ nước. Nếu sốt cao kéo dài trên 48 giờ hoặc kèm khó thở, hãy đi khám sớm.';
            } else if (
                normalized.includes('paracetamol') ||
                normalized.includes('thuoc')
            ) {
                answer =
                    'Paracetamol thường dùng hạ sốt, giảm đau. Người lớn thường dùng 500mg mỗi 4-6 giờ khi cần, không quá 4g/ngày.';
            } else if (
                normalized.includes('ho') ||
                normalized.includes('dau hong')
            ) {
                answer =
                    'Bạn có thể súc họng nước muối, uống nước ấm và theo dõi triệu chứng. Nếu ho kéo dài trên 1 tuần, nên khám bác sĩ.';
            }

            return {
                answer,
            };
        },
    },

    // ─── Users / Me ────────────────────────────────────
    {
        method: 'get',
        pattern: /^\/users\/me$/,
        handler: () => ({
            user: MOCK_USER,
            profiles: [
                {
                    profile: getMockProfile(),
                    health_profile: MOCK_HEALTH_PROFILE,
                },
            ],
            post_login_flow_completed: isPostLoginFlowCompleted(),
        }),
    },
    {
        method: 'get',
        pattern: /^\/notifications\/me$/,
        handler: () => ({
            items: MOCK_NOTIFICATIONS,
        }),
    },
    {
        method: 'post',
        pattern: /^\/notifications\/me\/schedules\/[^/]+\/compliance$/,
        handler: () => ({
            success: true,
            message: 'Recorded.',
        }),
    },
    {
        method: 'get',
        pattern: /^\/user\/profile$/,
        handler: () => getMockProfile(),
    },
    {
        method: 'put',
        pattern: /^\/user\/change-password$/,
        handler: () => ({ message: 'Đổi mật khẩu thành công.' }),
    },
    {
        method: 'get',
        pattern: /^\/users\/me\/profiles$/,
        handler: (_url, config) => {
            const scope =
                (config.params as Record<string, string>)?.profile_scope ??
                'all';
            if (!getMockProfile()) {
                return [];
            }
            if (scope === 'without_family') return [getMockProfile()];
            return [getMockProfile()];
        },
    },
    {
        method: 'post',
        pattern: /^\/users\/me\/personal-profile$/,
        handler: (_url, config) => {
            mockProfile = {
                ...DEFAULT_MOCK_PROFILE,
                ...(config.data ? JSON.parse(String(config.data)) : {}),
                id: uid(),
            };

            return mockProfile;
        },
    },

    // ─── Families ──────────────────────────────────────
    {
        method: 'post',
        pattern: /^\/families$/,
        handler: (_url, config) => {
            const body = config.data ? JSON.parse(String(config.data)) : {};
            return {
                id: uid(),
                name: body.name ?? 'New Family',
                address: body.address ?? null,
                avatar_url: null,
                created_by: 'user-001',
                created_at: new Date().toISOString(),
                invite_code: `INV-${uid()}`,
                members: [],
            };
        },
    },
    {
        method: 'get',
        pattern: /^\/families$/,
        handler: () =>
            familyApiData.map(({ members: _m, ...rest }) => ({
                ...rest,
                member_count:
                    familyApiData.find((f) => f.id === rest.id)?.members
                        .length ?? 0,
            })),
    },
    {
        method: 'get',
        pattern: /^\/families\/invites$/,
        handler: () => ({ total: 0, page: 1, limit: 10, data: [] }),
    },
    {
        method: 'get',
        pattern: /^\/families\/invite\/preview$/,
        handler: () => ({
            family_id: 'phan-family',
            family_name: 'Phan Family',
            invite_code: 'ABC',
            address: '123 Nguyễn Trãi, Quận 5, TP.HCM',
            created_at: '2024-03-15T00:00:00Z',
            invited_by: 'Nguyễn Văn An',
            member_count: 5,
        }),
    },
    {
        method: 'get',
        pattern: /^\/families\/(?<familyId>[^/]+)$/,
        handler: (_url, _config, p) =>
            familyApiData.find((f) => f.id === p.familyId) ?? familyApiData[0],
    },
    {
        method: 'patch',
        pattern: /^\/families\/(?<familyId>[^/]+)$/,
        handler: (_url, config, p) => {
            const body = config.data ? JSON.parse(String(config.data)) : {};
            const fam = familyApiData.find((f) => f.id === p.familyId);
            return { ...(fam ?? familyApiData[0]), ...body };
        },
    },
    {
        method: 'get',
        pattern: /^\/families\/(?<familyId>[^/]+)\/members$/,
        handler: (_url, _config, p) =>
            familyApiData.find((f) => f.id === p.familyId)?.members ?? [],
    },
    {
        method: 'get',
        pattern: /^\/families\/(?<familyId>[^/]+)\/medicine-inventory$/,
        handler: (_url, _config, p) => buildMedicineApiData(p.familyId),
    },
    {
        method: 'post',
        pattern: /^\/families\/(?<familyId>[^/]+)\/medicine-inventory$/,
        handler: (_url, config, p) => {
            const body = config.data ? JSON.parse(String(config.data)) : {};
            return { id: uid(), family_id: p.familyId, ...body };
        },
    },
    {
        method: 'get',
        pattern: /^\/medicine-inventory\/(?<itemId>[^/]+)\/schedules$/,
        handler: (_url, _config, p) => _schedulesForItem(p.itemId),
    },
    {
        method: 'post',
        pattern: /^\/medicine-inventory\/(?<itemId>[^/]+)\/schedules$/,
        handler: (_url, config, p) => {
            const body = config.data ? JSON.parse(String(config.data)) : {};
            const row = {
                id: uid(),
                profile_id: body.profile_id,
                medicine_id: p.itemId,
                title: body.title ?? null,
                category: 'MEDICINE',
                remind_time: body.remind_time,
                dosage_per_time:
                    body.dosage_per_time !== undefined &&
                    body.dosage_per_time !== null
                        ? String(body.dosage_per_time)
                        : null,
                rrule: body.rrule ?? 'FREQ=DAILY',
                status: 'ACTIVE',
            };
            _schedulesForItem(p.itemId).push(row);
            return row;
        },
    },
    {
        method: 'patch',
        pattern: /^\/medicine-inventory\/schedules\/(?<scheduleId>[^/]+)$/,
        handler: (_url, config, p) => {
            const body = config.data ? JSON.parse(String(config.data)) : {};
            return _patchMockScheduleById(p.scheduleId, body);
        },
    },
    {
        method: 'delete',
        pattern: /^\/medicine-inventory\/schedules\/(?<scheduleId>[^/]+)$/,
        handler: (_url, _config, p) => {
            _deleteMockScheduleById(p.scheduleId);
            return null;
        },
    },
    {
        method: 'post',
        pattern: /^\/families\/(?<familyId>[^/]+)\/invite\/rotate$/,
        handler: (_url, _config, p) => ({
            invite_code: `INV-${p.familyId.toUpperCase().slice(0, 4)}-${Date.now().toString(36)}`,
        }),
    },
    {
        method: 'get',
        pattern: /^\/families\/(?<familyId>[^/]+)\/profiles$/,
        handler: (_url, _config, p) =>
            (familyApiData.find((f) => f.id === p.familyId)?.members ?? []).map(
                (m) => m.profile,
            ),
    },
    {
        method: 'post',
        pattern: /^\/families\/(?<familyId>[^/]+)\/profiles$/,
        handler: (_url, config) => {
            const body = config.data ? JSON.parse(String(config.data)) : {};
            return { id: uid(), ...body };
        },
    },
    {
        method: 'post',
        pattern: /^\/families\/(?<familyId>[^/]+)\/invite-by-phone$/,
        handler: (_url, config) => {
            const body = config.data ? JSON.parse(String(config.data)) : {};
            if (body.dry_run) {
                return {
                    user_id: 'user-found-001',
                    phone_number: body.phone_number,
                    full_name: 'Trần Thị Lan',
                    avatar_url: null,
                };
            }
            return { invite_id: uid(), status: 'pending' };
        },
    },
    {
        method: 'post',
        pattern: /^\/families\/join$/,
        handler: (_url, config) => {
            const body = config.data ? JSON.parse(String(config.data)) : {};

            if (body.action === 'accept') {
                const fallbackProfile = familyApiData
                    .flatMap((family) => family.members)
                    .find((member) => member.id === body.profile_id);

                mockProfile = {
                    ...DEFAULT_MOCK_PROFILE,
                    ...(fallbackProfile?.profile ?? {}),
                    id: body.profile_id ?? uid(),
                    full_name:
                        fallbackProfile?.profile?.full_name ??
                        body.full_name ??
                        DEFAULT_MOCK_PROFILE.full_name,
                };
            }

            return { message: 'Thành công.' };
        },
    },

    // ─── Family Memberships ────────────────────────────
    {
        method: 'patch',
        pattern: /^\/family-memberships\/(?<membershipId>[^/]+)$/,
        handler: (_url, config, p) => {
            const body = config.data ? JSON.parse(String(config.data)) : {};
            return { id: p.membershipId, ...body };
        },
    },
    {
        method: 'delete',
        pattern: /^\/family-memberships\/(?<membershipId>[^/]+)$/,
        handler: () => ({ message: 'Đã xóa.' }),
    },

    // ─── Medical Dictionary ───────────────────────────
    {
        method: 'get',
        pattern: /^\/medical-dictionary\/search$/,
        handler: (_url, config) => {
            const params = (config.params ?? {}) as Record<string, unknown>;
            const q = String(params.q ?? '').trim();
            const type = (params.type as DictionaryType | undefined) ?? null;
            const page = Number(params.page ?? 1) || 1;
            const limit = Number(params.limit ?? 20) || 20;

            const normalizedQ = normalizeText(q);

            const filtered = DICTIONARY_SEED.filter((item) => {
                const typeOk = !type || item.type === type;
                if (!typeOk) return false;
                if (!normalizedQ) return true;
                const haystack = normalizeText(
                    [item.title, ...item.aliases, item.summary].join(' '),
                );
                return haystack.includes(normalizedQ);
            });

            const start = (page - 1) * limit;
            const paged = filtered.slice(start, start + limit);

            return {
                items: paged.map(
                    ({ content: _content, source_file, ...rest }) => ({
                        ...rest,
                        source_file,
                    }),
                ),
                total: filtered.length,
                page,
                limit,
                has_next: start + limit < filtered.length,
            };
        },
    },
    {
        method: 'get',
        pattern:
            /^\/medical-dictionary\/(?<entryType>disease|drug|vaccine)\/(?<itemId>[^/]+)$/,
        handler: (_url, _config, p) => {
            const found = DICTIONARY_SEED.find(
                (item) => item.type === p.entryType && item.id === p.itemId,
            );
            if (!found) {
                const err: any = new Error('Not found');
                err.response = {
                    status: 404,
                    data: { message: 'Dictionary item not found.' },
                };
                throw err;
            }
            return found;
        },
    },
];

function matchRoute(
    method: string,
    url: string,
): { handler: RouteHandler; params: Record<string, string> } | null {
    const cleanUrl = url.split('?')[0];
    for (const route of routes) {
        if (route.method !== method.toLowerCase()) continue;
        if (route.pattern.test(cleanUrl)) {
            return {
                handler: route.handler,
                params: extractParams(route.pattern, cleanUrl),
            };
        }
    }
    return null;
}

const MOCK_DELAY_MS = 300;

export function mockAdapter(
    config: InternalAxiosRequestConfig,
): Promise<AxiosResponse> {
    const url = config.url ?? '';
    const method = (config.method ?? 'get').toLowerCase();

    const match = matchRoute(method, url);

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!match) {
                console.warn(
                    `[MockAPI] Unhandled: ${method.toUpperCase()} ${url}`,
                );
                reject({
                    config,
                    response: {
                        status: 404,
                        statusText: 'Not Found',
                        data: { message: `Mock not found: ${method} ${url}` },
                        headers: {},
                        config,
                    },
                });
                return;
            }

            try {
                const data = match.handler(url, config, match.params);
                resolve({
                    data,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config,
                } as AxiosResponse);
            } catch (err: any) {
                const status = err?.response?.status ?? 500;
                const data = err?.response?.data ?? {
                    message: 'Mock handler error',
                };
                console.warn(
                    `[MockAPI] ${method.toUpperCase()} ${url} → ${status}`,
                );
                reject({
                    config,
                    response: {
                        status,
                        data,
                        headers: {},
                        config,
                    },
                });
            }
        }, MOCK_DELAY_MS);
    });
}
