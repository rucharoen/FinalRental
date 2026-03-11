import { API_ENDPOINTS } from '../services/api';

export const formatImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;

    // ถ้าเป็นรูปสินค้าที่เก็บไว้ใน Supabase (เช็คจาก prefix เดิมที่ Render ส่งมา)
    if (url.includes('/uploads/products/')) {
        const fileName = url.split('/').pop();
        return `${API_ENDPOINTS.SUPABASE_STORAGE_URL}/${fileName}`;
    }

    // fallback กรณีรูปอื่นๆ (เช่น slip หรือ kyc ที่ยังไม่ได้ย้าย)
    return `${API_ENDPOINTS.RENTAL_BASE_URL}${url}`;
};
