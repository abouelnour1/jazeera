
export interface MedicationItem {
  id: string;
  name: string;
  concentration: string;
  usage: string;
  image?: File | string | null;
}

export interface PrescriptionRequest {
  id: string;
  fullName: string;
  phoneNumber: string;
  refillDate: string;
  notes: string;
  medications: MedicationItem[];
  submissionDate: string; // ISO String
  status: 'pending' | 'completed' | 'cancelled';
}

export interface MissingMedicationRequest {
  id: string;
  fullName: string;
  phoneNumber: string;
  medicineName: string;
  notes?: string;
  submissionDate: string; // ISO String
  status: 'pending' | 'completed' | 'cancelled';
}

export interface DietAdvice {
  condition: string;
  allowedFoods: string[];
  forbiddenFoods: string[];
  tips: string[];
  disclaimer: string;
}

export interface MedicalDataMap {
  [key: string]: DietAdvice;
}