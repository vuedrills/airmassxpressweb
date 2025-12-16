import { User } from './user';

export interface EquipmentCapacity {
    id: string;
    equipmentType: string;
    capacityCode: string;
    displayName: string;
    minWeightTons?: number;
    maxWeightTons?: number;
    sortOrder: number;
}

export interface InventoryItem {
    id: string;
    userId: string;
    name: string;
    category: string;
    capacity?: string;
    location?: string;
    photos?: string[];
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
    user?: User;

    // V2 Fields
    capacityId?: string;
    equipmentCapacity?: EquipmentCapacity;
    lat?: number;
    lng?: number;
    withOperator?: boolean;
    hourlyRate?: number;
    dailyRate?: number;
    weeklyRate?: number;
    deliveryFee?: number;
    operatorBundled?: boolean;
    operatorFee?: number;
}
