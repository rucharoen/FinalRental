import * as SecureStore from "expo-secure-store";

export interface CartItem {
    id: string;
    productId: number;
    shopName: string;
    productName: string;
    image: string;
    rentPeriod: string;
    price: number;
    quantity: number;
    selected: boolean;
    shopSelected: boolean;
    startDate?: string;
    endDate?: string;
}

class CartService {
    private readonly BASE_CART_KEY = "userCart_v1"; // เปลี่ยนเวอร์ชั่นเพื่อให้แน่ใจว่าได้โครงสร้างใหม่

    /**
     * ดึง Key ของตะกร้าตาม User ID
     */
    private async getCartKey(): Promise<string> {
        try {
            const userData = await SecureStore.getItemAsync("userData");
            if (userData) {
                const user = JSON.parse(userData);
                // รองรับทั้ง id และ _id
                const userId = user.id || user._id;
                if (userId) return `${this.BASE_CART_KEY}_${userId}`;
            }
        } catch (e) {
            console.error("[Cart] Error generating cart key, using fallback:", e);
        }
        return this.BASE_CART_KEY; // กรณีไม่ได้ล็อกอินหรือหา ID ไม่เจอ
    }

    /**
     * ดึงรายการทั้งหมดในตะกร้า
     */
    async getCartItems(): Promise<CartItem[]> {
        try {
            const key = await this.getCartKey();
            const data = await SecureStore.getItemAsync(key);
            if (!data) return [];

            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error("[Cart] Error loading items:", error);
            return [];
        }
    }

    /**
     * เพิ่มสินค้าลงตะกร้า
     */
    async addToCart(item: CartItem): Promise<void> {
        try {
            const key = await this.getCartKey();
            const cart = await this.getCartItems();

            // เช็คว่ามีสินค้าชิ้นนี้ + ในช่วงเวลาเดียวกัน อยู่ในตะกร้าแล้วหรือยัง
            const existingItemIndex = cart.findIndex(i =>
                i.productId === item.productId &&
                i.startDate === item.startDate &&
                i.endDate === item.endDate
            );

            if (existingItemIndex > -1) {
                // ถ้ามีแล้ว ให้บวกจำนวนเพิ่ม
                cart[existingItemIndex].quantity += (item.quantity || 1);
            } else {
                // ถ้ายังไม่มี ให้เพิ่มเป็นรายการใหม่
                // ตรวจสอบให้มั่นใจว่าไอเทมมี ID
                const newItem = {
                    ...item,
                    id: item.id || `cart_${Date.now()}_${item.productId}`
                };
                cart.push(newItem);
            }

            // [ระวัง] SecureStore มี Limit 2KB ถ้าสินค้าเยอะมากอาจจะพังได้
            await SecureStore.setItemAsync(key, JSON.stringify(cart));
        } catch (error) {
            console.error("[Cart] Error adding item:", error);
            throw new Error("ไม่สามารถเพิ่มสินค้าลงตะกร้าได้");
        }
    }

    /**
     * ลบสินค้าออกจากตะกร้า
     */
    async removeFromCart(id: string): Promise<void> {
        try {
            const key = await this.getCartKey();
            const cart = await this.getCartItems();
            const updatedCart = cart.filter(i => i.id !== id);
            await SecureStore.setItemAsync(key, JSON.stringify(updatedCart));
        } catch (error) {
            console.error("[Cart] Error removing item:", error);
        }
    }

    /**
     * อัปเดตจำนวนสินค้า
     */
    async updateQuantity(id: string, newQuantity: number): Promise<void> {
        if (newQuantity < 1) return;

        try {
            const key = await this.getCartKey();
            const cart = await this.getCartItems();
            const index = cart.findIndex(i => i.id === id);

            if (index > -1) {
                cart[index].quantity = newQuantity;
                await SecureStore.setItemAsync(key, JSON.stringify(cart));
            }
        } catch (error) {
            console.error("[Cart] Error updating quantity:", error);
        }
    }

    /**
     * ล้างตะกร้าสินค้า
     */
    async clearCart(): Promise<void> {
        try {
            const key = await this.getCartKey();
            await SecureStore.deleteItemAsync(key);
        } catch (error) {
            console.error("[Cart] Error clearing cart:", error);
        }
    }
}

export default new CartService();
