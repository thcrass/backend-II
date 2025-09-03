import { BaseRepository } from './BaseRepository.js';
import productModel from '../dao/models/productModel.js';

export class ProductRepository extends BaseRepository {
    constructor() {
        super(productModel);
    }

    /**
     * Obtener productos con paginación
     */
    async findWithPagination(options = {}) {
        try {
            const { page = 1, limit = 10, sort, query = {} } = options;
            
            const paginationOptions = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: sort || { createdAt: -1 }
            };

            return await this.model.paginate(query, paginationOptions);
        } catch (error) {
            throw new Error(`Error finding products with pagination: ${error.message}`);
        }
    }

    /**
     * Buscar productos por categoría
     */
    async findByCategory(category) {
        try {
            return await this.model.find({ category });
        } catch (error) {
            throw new Error(`Error finding products by category: ${error.message}`);
        }
    }

    /**
     * Verificar y actualizar stock
     */
    async updateStock(id, quantity) {
        try {
            const product = await this.findById(id);
            if (!product) {
                throw new Error('Product not found');
            }
            
            if (product.stock < quantity) {
                throw new Error('Insufficient stock');
            }

            product.stock -= quantity;
            return await product.save();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verificar disponibilidad de stock
     */
    async checkStock(id, requestedQuantity) {
        try {
            const product = await this.findById(id);
            if (!product) {
                return { available: false, reason: 'Product not found' };
            }
            
            if (product.stock < requestedQuantity) {
                return { 
                    available: false, 
                    reason: 'Insufficient stock',
                    availableStock: product.stock
                };
            }

            return { available: true, product };
        } catch (error) {
            throw new Error(`Error checking stock: ${error.message}`);
        }
    }
}