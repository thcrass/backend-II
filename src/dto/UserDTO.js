/**
 * Data Transfer Object para Usuario
 * Contiene solo la información necesaria y no sensible para el cliente
 */
export class UserDTO {
    constructor(user) {
        this.id = user._id;
        this.first_name = user.first_name;
        this.last_name = user.last_name;
        this.email = user.email;
        this.age = user.age;
        this.role = user.role;
        this.cart = user.cart;
        // Información sensible que NO se incluye:
        // - password
        // - createdAt/updatedAt (opcional, depende de necesidades)
    }

    /**
     * Método estático para crear DTO desde objeto usuario
     */
    static fromUser(user) {
        if (!user) return null;
        return new UserDTO(user);
    }

    /**
     * Método estático para crear DTOs desde array de usuarios
     */
    static fromUsers(users) {
        return users.map(user => new UserDTO(user));
    }
}

/**
 * DTO simplificado para respuestas de autenticación
 */
export class UserAuthDTO {
    constructor(user) {
        this.id = user._id;
        this.first_name = user.first_name;
        this.last_name = user.last_name;
        this.email = user.email;
        this.role = user.role;
    }

    static fromUser(user) {
        if (!user) return null;
        return new UserAuthDTO(user);
    }
}

/**
 * DTO para perfil público de usuario
 */
export class UserPublicDTO {
    constructor(user) {
        this.id = user._id;
        this.first_name = user.first_name;
        this.last_name = user.last_name;
        this.role = user.role;
        // No incluye email ni información personal
    }

    static fromUser(user) {
        if (!user) return null;
        return new UserPublicDTO(user);
    }
}