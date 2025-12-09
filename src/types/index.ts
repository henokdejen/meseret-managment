// Database types matching Supabase schema

export interface Member {
    id: string;
    full_name: string;
    room_id: string;
    water_bill_id: string | null;
    water_bill_registration_name: string | null;
    water_bill_payers: string[];
    phone: string | null;
    joined_at: string;
    is_active: boolean;
    created_at: string;
}

export interface Setting {
    id: string;
    key: string;
    value: {
        amount?: number;
        [key: string]: unknown;
    };
}

export interface Contribution {
    id: string;
    member_id: string;
    amount: number;
    month: number;
    year: number;
    paid_at: string;
    notes: string | null;
    created_at: string;
    // Joined field
    member?: Member;
}

export interface Expense {
    id: string;
    type: 'water' | 'electric_shared' | 'guard_salary' | 'janitor_salary' | 'other';
    description: string | null;
    amount: number;
    month: number | null;
    year: number | null;
    date: string | null;
    created_at: string;
    metadata: Record<string, unknown> | null;
}

export interface WaterBill {
    id: string;
    member_id: string;
    billing_month: number;
    billing_year: number;
    amount: number;
    bill_id: string | null;
    paid_from_pool: boolean;
    created_at: string;
    // Joined field
    member?: Member;
}

export interface Transaction {
    id: string;
    kind: 'deposit' | 'withdraw';
    direction: 'in' | 'out';
    memberId: string | null;
    memberName: string | null;
    amount: number;
    createdAt: string;
    month: number | null;
    year: number | null;
    description: string | null;
}

// Member payment status for a given period
export interface MemberPaymentStatus {
    member: Member;
    requiredAmount: number;
    paidAmount: number;
    status: 'paid' | 'partial' | 'unpaid';
}
