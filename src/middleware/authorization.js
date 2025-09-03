/**
 * Middleware de autorización por roles
 * Trabaja junto con la estrategia "current" para limitar acceso según roles
 */

/**
 * Middleware para verificar que el usuario sea administrador
 */
export const isAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'No hay usuario autenticado'
            });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Acceso denegado. Se requiere rol de administrador.'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error en verificación de autorización'
        });
    }
};

/**
 * Middleware para verificar que el usuario sea usuario normal (no admin)
 */
export const isUser = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'No hay usuario autenticado'
            });
        }

        if (req.user.role === 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Acción no permitida para administradores'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error en verificación de autorización'
        });
    }
};

/**
 * Middleware para verificar que el usuario esté autenticado (cualquier rol)
 */
export const isAuthenticated = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Acceso denegado. Se requiere autenticación.'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error en verificación de autenticación'
        });
    }
};

/**
 * Middleware para verificar que el usuario sea propietario del recurso o admin
 */
export const isOwnerOrAdmin = (resourceUserIdField = 'user') => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'No hay usuario autenticado'
                });
            }

            // Si es admin, permitir acceso
            if (req.user.role === 'admin') {
                return next();
            }

            // Verificar que el recurso pertenezca al usuario
            const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
            
            if (req.user.id !== resourceUserId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Acceso denegado. Solo puedes acceder a tus propios recursos.'
                });
            }

            next();
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error en verificación de autorización'
            });
        }
    };
};

/**
 * Factory para crear middleware de roles específicos
 */
export const hasRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'No hay usuario autenticado'
                });
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    status: 'error',
                    message: `Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`
                });
            }

            next();
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error en verificación de autorización'
            });
        }
    };
};