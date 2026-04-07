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

const MOCK_PROFILE = {
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

    // ─── Users / Me ────────────────────────────────────
    {
        method: 'get',
        pattern: /^\/users\/me$/,
        handler: () => ({
            user: MOCK_USER,
            profile: MOCK_PROFILE,
            health_profile: MOCK_HEALTH_PROFILE,
            post_login_flow_completed: true,
        }),
    },
    {
        method: 'get',
        pattern: /^\/user\/profile$/,
        handler: () => MOCK_PROFILE,
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
            if (scope === 'without_family') return [];
            return [MOCK_PROFILE];
        },
    },
    {
        method: 'post',
        pattern: /^\/users\/me\/personal-profile$/,
        handler: (_url, config) => ({
            ...MOCK_PROFILE,
            ...(config.data ? JSON.parse(String(config.data)) : {}),
            id: uid(),
        }),
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
            family_name: 'Phan Family',
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
        handler: () => ({ message: 'Thành công.' }),
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
                console.log(`[MockAPI] ${method.toUpperCase()} ${url} → 200`);
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
