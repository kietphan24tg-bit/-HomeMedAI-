export type HomeMode = 'personal' | 'family';

export type FamilyOption = {
    id: string;
    name: string;
    numberOfMembers: number;
    role: string;
    gradientColors?: [string, string, string];
    iconName?: string;
};
