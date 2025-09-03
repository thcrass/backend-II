import { BaseRepository } from './BaseRepository.js';
import { userModel } from '../dao/models/userModel.js';

export class UserRepository extends BaseRepository {
    constructor() {
        super(userModel);
    }

    /**
     * Buscar usuario por email
     */
    async findByEmail(email) {
        try {
            return await this.model.findOne({ email });
        } catch (error) {
            throw new Error(`Error finding user by email: ${error.message}`);
        }
    }

    /**
     * Crear usuario con validación de email único
     */
    async createUser(userData) {
        try {
            // Verificar que el email no exista
            const existingUser = await this.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('Email already exists');
            }
            
            return await this.create(userData);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener usuario sin información sensible (para DTOs)
     */
    async findByIdSafe(id) {
        try {
            return await this.model.findById(id).select('-password');
        } catch (error) {
            throw new Error(`Error finding user: ${error.message}`);
        }
    }

    /**
     * Validar credenciales de usuario
     */
    async validateUser(email, password) {
        try {
            const user = await this.findByEmail(email);
            if (!user || !user.comparePassword(password)) {
                return null;
            }
            return user;
        } catch (error) {
            throw new Error(`Error validating user: ${error.message}`);
        }
    }

    /**
     * Actualizar contraseña
     */
    async updatePassword(id, newPassword) {
        try {
            const user = await this.findById(id);
            user.password = newPassword;
            return await user.save();
        } catch (error) {
            throw new Error(`Error updating password: ${error.message}`);
        }
    }
}