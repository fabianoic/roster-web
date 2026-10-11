export interface Store {
    id: string;
    name: string;
    address: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface StoreFilter {
    name?: string;
    address?: string;
    size?: number;
}

export interface StoreSummary {
    id: string;
    name: string;
}