export type FamilyRole =
    | 'owner'
    | 'father'
    | 'mother'
    | 'son'
    | 'daughter'
    | 'grandfather'
    | 'grandmother'
    | 'brother'
    | 'sister'
    | 'uncle'
    | 'aunt'
    | 'nephew'
    | 'other';

export type Gender = 'male' | 'female' | 'other';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type FamilyInviteStatus =
    | 'pending'
    | 'accepted'
    | 'rejected'
    | 'expired';

export type UserVaccinationStatus =
    | 'not_started'
    | 'in_progress'
    | 'completed'
    | 'overdue';

export type VaccinationDoseStatus = 'scheduled' | 'completed' | 'missed';

export type MealTime = 'before_meal' | 'after_meal' | 'with_meal';

export type MedicineUnit =
    | 'tablet'
    | 'capsule'
    | 'ml'
    | 'pack'
    | 'bottle'
    | 'tube';

export interface Profile {
    full_name: string;
    date_of_birth: string;
    gender: Gender;
    height_cm?: number;
    weight_kg?: number;
    address?: string;

    avatar_url?: string;
    phone_number?: string;
}

export interface MedicalRecordAttachment {
    id: string;
    medical_record_id: string;
    file_name: string;
    file_type: string;
    file_url: string;
}

export interface FollowUpAppointment {
    id: string;
    medical_record_id: string;
    appointment_date: string;
    purpose: string;
    notes?: string;
    remind_before_days?: number;
}

export interface MedicalRecord {
    id: string;
    health_profile_id: string;
    name: string;
    exam_date: string;
    specialty?: string;
    facility_name?: string;
    doctor_name?: string;
    diagnosis?: string;
    notes?: string;
    attachments?: MedicalRecordAttachment[];
    follow_up_appointments?: FollowUpAppointment[];
}

export interface VaccinationRecommendation {
    id: string;
    code: string;
    name: string;
    disease_name: string;
    total_doses_required: number;
    notes?: string;
}

export interface VaccinationDose {
    id: string;
    user_vaccination_id: string;
    dose_number: number;
    status: VaccinationDoseStatus;
    taken_date?: string | null;
    scheduled_date?: string | null;
    facility_name?: string;
    remind_before_days?: number;
    proof_image_url?: string | null;
    notes?: string;
}

export interface UserVaccination {
    id: string;
    health_profile_id: string;
    recommendation_id: string;
    completed_doses: number;
    status: UserVaccinationStatus;
    notes?: string;
    recommendation?: VaccinationRecommendation;
    doses?: VaccinationDose[];
}

export interface PrescriptionItem {
    id: string;
    prescription_id: string;
    medicine_name: string;
    unit?: MedicineUnit;
    quantity?: number;
    start_date?: string;
    dosage?: string;
    times_per_day?: number;
    intake_time?: string[];
    meal_time?: MealTime;
    notes?: string;
}

export interface Prescription {
    id: string;
    health_profile_id: string;
    medical_record_id?: string | null;
    prescribed_date: string;
    doctor_name?: string;
    notes?: string;
    items?: PrescriptionItem[];
}

export interface HealthProfile {
    blood_type?: BloodType;
    chronic_conditions?: string[];
    allergies?: string[];
    medical_records?: MedicalRecord[];
    user_vaccinations?: UserVaccination[];
    prescriptions?: Prescription[];
}

export interface FamilyMember {
    id: string;
    family_id: string;
    user_id?: string | null;
    role: FamilyRole;
    is_owner?: boolean;
    is_self?: boolean;
    joined_at?: string;

    profile: Profile;
    health_profile: HealthProfile;
}

export interface FamilyInvite {
    id: string;
    family_id: string;

    phone_number?: string;
    user_id?: string;
    role: FamilyRole;

    status: FamilyInviteStatus;
    invited_at: string;
    responded_at?: string;
}

export interface Family {
    id: string;
    name: string;
    address?: string;
    avatar_url?: string;
    created_by: string;
    created_at: string;
    members: FamilyMember[];
    invites?: FamilyInvite[];
}
