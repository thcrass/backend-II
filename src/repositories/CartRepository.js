import { BaseRepository } from './BaseRepository.js';
import { cartModel } from '../dao/models/cartModel.js';

export class CartRepository extends BaseRepository {
    constructor() {
        super(cartModel);
    }

    /**
     * Crear carrito para usuario
     */
    async createForUser(userId) {
        try {
            return await this.create({ 
                products: [],
                user: userId
            });
        } catch (error) {
            throw new Error(`Error creating cart for user: ${error.message}`);
        }
    }

    /**
     * Obtener carrito con productos populados
     */
    async findByIdPopulated(id) {
        try {
            return await this.model.findById(id).populate('products.product');
        } catch (error) {
            throw new Error(`Error finding cart with products: ${error.message}`);
        }
    }

    /**
     * Agregar producto al carrito
     */
    async addProduct(cartId, productId, quantity = 1) {
        try {
            const cart = await this.findById(cartId);
            if (!cart) {
                throw new Error('Cart not found');
            }

            const existingProductIndex = cart.products.findIndex(
                item => item.product.toString() === productId.toString()
            );

            if (existingProductIndex >= 0) {
                cart.products[existingProductIndex].quantity += quantity;
            } else {
                cart.products.push({ product: productId, quantity });
            }

            return await cart.save();
        } catch (error) {
            throw new Error(`Error adding product to cart: ${error.message}`);
        }
    }

    /**
     * Actualizar cantidad de producto en carrito
     */
    async updateProductQuantity(cartId, productId, quantity) {
        try {
            const cart = await this.findById(cartId);
            if (!cart) {
                throw new Error('Cart not found');
            }

            const productIndex = cart.products.findIndex(
                item => item.product.toString() === productId.toString()
            );

            if (productIndex === -1) {
                throw new Error('Product not found in cart');
            }

            if (quantity <= 0) {
                cart.products.splice(productIndex, 1);
            } else {
                cart.products[productIndex].quantity = quantity;
            }

            return await cart.save();
        } catch (error) {
            throw new Error(`Error updating product quantity: ${error.message}`);
        }
    }

    /**
     * Remover producto del carrito
     */
    async removeProduct(cartId, productId) {
        try {
            const cart = await this.findById(cartId);
            if (!cart) {
                throw new Error('Cart not found');
            }

            cart.products = cart.products.filter(
                item => item.product.toString() !== productId.toString()
            );

            return await cart.save();
        } catch (error) {
            throw new Error(`Error removing product from cart: ${error.message}`);
        }
    }

    /**
     * Limpiar carrito
     */
    async clearCart(cartId) {
        try {
            return await this.update(cartId, { products: [] });
        } catch (error) {
            throw new Error(`Error clearing cart: ${error.message}`);
        }
    }
}