type AuthSessionBridge = {
    getAccessToken: () => string | null;
    setAccessToken: (token: string) => void;
    clearSession: () => Promise<void>;
};

const defaultBridge: AuthSessionBridge = {
    getAccessToken: () => null,
    setAccessToken: () => {},
    clearSession: async () => {},
};

let authSessionBridge: AuthSessionBridge = defaultBridge;

export function configureAuthSessionBridge(bridge: Partial<AuthSessionBridge>) {
    authSessionBridge = {
        ...authSessionBridge,
        ...bridge,
    };
}

export function getAuthSessionBridge() {
    return authSessionBridge;
}
