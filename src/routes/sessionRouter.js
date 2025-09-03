import { Router } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { passportCall } from '../middleware/auth.js';
import { userModel } from '../dao/models/userModel.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { UserDTO, UserAuthDTO } from '../dto/UserDTO.js';
import { emailService } from '../services/emailService.js';
import crypto from 'crypto';

const router = Router();
const userRepository = new UserRepository();

// Endpoint de registro múltiple (temporal para pruebas)
router.post('/register', async (req, res) => {
    try {
        const { users } = req.body;
        
        if (!users || !Array.isArray(users)) {
            return res.status(400).send({
                status: 'error',
                message: 'Debe enviar un array de usuarios en el campo "users"'
            });
        }

        const createdUsers = [];
        const errors = [];

        for (let i = 0; i < users.length; i++) {
            const userData = users[i];
            const { first_name, last_name, email, age, password, role } = userData;

            try {
                // Verificar si el usuario ya existe
                const existingUser = await userModel.findOne({ email });
                if (existingUser) {
                    errors.push(`Usuario ${i + 1}: El email ${email} ya existe`);
                    continue;
                }

                // Crear nuevo usuario (el password se encripta automáticamente)
                const newUser = await userModel.create({
                    first_name,
                    last_name,
                    email,
                    age,
                    password,
                    role: role || 'user'
                });

                createdUsers.push({
                    id: newUser._id,
                    first_name: newUser.first_name,
                    last_name: newUser.last_name,
                    email: newUser.email,
                    age: newUser.age,
                    role: newUser.role
                });

            } catch (error) {
                errors.push(`Usuario ${i + 1}: ${error.message}`);
            }
        }

        res.send({
            status: 'success',
            message: `${createdUsers.length} usuarios creados exitosamente`,
            created: createdUsers,
            errors: errors
        });

    } catch (error) {
        res.status(500).send({
            status: 'error',
            message: 'Error al crear usuarios: ' + error.message
        });
    }
});

// Endpoint de login
router.post('/login', passport.authenticate('login', { session: false }), async (req, res) => {
    try {
        const user = req.user;
        
        // Crear token JWT
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email, 
                role: user.role 
            }, 
            "CoderCoder123", 
            { expiresIn: '24h' }
        );

        // Usar DTO para respuesta de autenticación
        const userAuthDTO = UserAuthDTO.fromUser(user);
        
        res.send({
            status: 'success',
            message: 'Login exitoso',
            token: token,
            user: userAuthDTO
        });

    } catch (error) {
        res.status(500).send({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});

// Endpoint current - según consigna (usando DTO para evitar información sensible)
router.get('/current', passportCall('current'), async (req, res) => {
    try {
        // Obtener información completa del usuario usando Repository
        const user = await userRepository.findByIdSafe(req.user.id);
        
        if (!user) {
            return res.status(404).send({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }

        // Usar DTO para enviar solo información necesaria
        const userDTO = UserDTO.fromUser(user);
        
        res.send({
            status: 'success',
            user: userDTO
        });
    } catch (error) {
        res.status(500).send({
            status: 'error',
            message: 'Error al obtener información del usuario'
        });
    }
});

// Endpoint para solicitar recuperación de contraseña
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).send({
                status: 'error',
                message: 'El email es requerido'
            });
        }

        // Buscar usuario por email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe un usuario con ese email'
            });
        }

        // Generar token de reset
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date();
        resetExpires.setMinutes(resetExpires.getMinutes() + (process.env.PASSWORD_RESET_EXPIRES || 60));

        // Actualizar usuario con token y expiración
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;
        await user.save();

        // Crear enlace de reset
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

        // Enviar email
        await emailService.sendPasswordResetEmail(email, resetLink);

        res.send({
            status: 'success',
            message: 'Se ha enviado un correo con las instrucciones para recuperar tu contraseña'
        });

    } catch (error) {
        console.error('Error en forgot-password:', error);
        res.status(500).send({
            status: 'error',
            message: 'Error al procesar la solicitud de recuperación'
        });
    }
});

// Endpoint para restablecer contraseña
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).send({
                status: 'error',
                message: 'Token y nueva contraseña son requeridos'
            });
        }

        // Buscar usuario con token válido y no expirado
        const user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).send({
                status: 'error',
                message: 'Token inválido o expirado'
            });
        }

        // Actualizar contraseña y limpiar token
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.send({
            status: 'success',
            message: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error en reset-password:', error);
        res.status(500).send({
            status: 'error',
            message: 'Error al restablecer la contraseña'
        });
    }
});

// Endpoint para obtener lista de usuarios (temporal para pruebas)
router.get('/users', async (req, res) => {
    try {
        const users = await userModel.find({}).select('-password');
        res.send({
            status: 'success',
            users: users
        });
    } catch (error) {
        res.status(500).send({
            status: 'error',
            message: 'Error al obtener usuarios: ' + error.message
        });
    }
});

export default router;