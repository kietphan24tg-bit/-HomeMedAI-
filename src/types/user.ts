export interface User {
    email?: string;
    password?: string;
    phone_number?: string;
    fullname: string;
    dob: Date;
    gender: string;
    height_cm: number;
    weight_kg: number;
    address: string;
    avatar_url: string;
    blood_type: string;
    chronic_diseases: string[];
    allergies: string[];
}
