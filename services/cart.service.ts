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
    private readonly CART_KEY = "userCart";

    async getCartItems(): Promise<CartItem[]> {
        try {
            const data = await SecureStore.getItemAsync(this.CART_KEY);
            if (!data) return [];
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error("Error loading cart:", error);
            return [];
        }
    }

    async addToCart(item: CartItem): Promise<void> {
        try {
            const cart = await this.getCartItems();
            const existingItemIndex = cart.findIndex(i => i.productId === item.productId && i.startDate === item.startDate && i.endDate === item.endDate);

            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += item.quantity;
            } else {
                cart.push(item);
            }

            await SecureStore.setItemAsync(this.CART_KEY, JSON.stringify(cart));
        } catch (error) {
            console.error("Error adding to cart:", error);
        }
    }

    async removeFromCart(id: string): Promise<void> {
        try {
            const cart = await this.getCartItems();
            const updatedCart = cart.filter(i => i.id !== id);
            await SecureStore.setItemAsync(this.CART_KEY, JSON.stringify(updatedCart));
        } catch (error) {
            console.error("Error removing from cart:", error);
        }
    }

    async updateQuantity(id: string, newQuantity: number): Promise<void> {
        try {
            const cart = await this.getCartItems();
            const index = cart.findIndex(i => i.id === id);
            if (index > -1) {
                cart[index].quantity = Math.max(1, newQuantity);
                await SecureStore.setItemAsync(this.CART_KEY, JSON.stringify(cart));
            }
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    }

    async clearCart(): Promise<void> {
        await SecureStore.deleteItemAsync(this.CART_KEY);
    }
}

export default new CartService();
