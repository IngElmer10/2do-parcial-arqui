class User {
    constructor({ id, username, password_hash, email, full_name, role, is_active, created_at }) {
        this.id = id;
        this.username = username;
        this.password_hash = password_hash;
        this.email = email;
        this.full_name = full_name;
        this.role = role;
        this.is_active = is_active !== undefined ? is_active : true;
        this.created_at = created_at;
    }

    async validatePassword(plainPassword) {
        const PasswordUtils = require('../utils/passwordUtils');
        return await PasswordUtils.comparePassword(plainPassword, this.password_hash);
    }

    toJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            full_name: this.full_name,
            role: this.role,
            is_active: this.is_active,
            created_at: this.created_at
        };
    }

    // Elimina la información sensible antes de enviar al cliente
    toSafeJSON() {
        const { password_hash, ...safeUser } = this.toJSON();
        return safeUser;
    }
}

module.exports = User;