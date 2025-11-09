const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

class PasswordUtils {
    static async hashPassword(plainPassword) {
        return await bcrypt.hash(plainPassword, SALT_ROUNDS);
    }

    static async comparePassword(plainPassword, hash) {
        return await bcrypt.compare(plainPassword, hash);
    }
}

module.exports = PasswordUtils;