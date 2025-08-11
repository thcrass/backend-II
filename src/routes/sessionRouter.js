import { Router } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { passportCall } from '../middleware/auth.js';
import { userModel } from '../dao/models/userModel.js';

const router = Router();

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

        res.send({
            status: 'success',
            message: 'Login exitoso',
            token: token,
            user: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).send({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});

// Endpoint current - según consigna
router.get('/current', passportCall('current'), (req, res) => {
    res.send({
        status: 'success',
        user: req.user
    });
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