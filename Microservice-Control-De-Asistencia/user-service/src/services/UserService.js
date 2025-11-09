const UserRepository = require('../repositories/UserRepository');
const PasswordUtils = require('../utils/passwordUtils');

const ALLOWED_ROLES = ['professor', 'student'];

class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    async getAllActiveUsers() {
        try {
            return await this.userRepository.findAll();
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async getUserById(id) {
        try {
            const user = await this.userRepository.findById(id);
            if (!user || user.is_active === false) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async createUser(accountData) {
        try {
            const { username, password, email, full_name, role } = accountData;

            if (!username || !password) {
                throw new Error('Username and password are required');
            }

            if (!ALLOWED_ROLES.includes(role)) {
                throw new Error('Invalid role');
            }

            const existingUser = await this.userRepository.findByUsername(username);
            if (existingUser && existingUser.is_active) {
                throw new Error('Username already exists');
            }

            const passwordHash = await PasswordUtils.hashPassword(password);

            const userToCreate = {
                username,
                password_hash: passwordHash,
                email: email || null,
                full_name: full_name || null,
                role
            };

            const userId = await this.userRepository.insert(userToCreate);
            return await this.userRepository.findById(userId);
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async updateUser(id, updates) {
        try {
            const allowedUpdates = { ...updates };

            if (allowedUpdates.role && !ALLOWED_ROLES.includes(allowedUpdates.role)) {
                throw new Error('Invalid role');
            }

            if (allowedUpdates.password) {
                allowedUpdates.password_hash = await PasswordUtils.hashPassword(allowedUpdates.password);
                delete allowedUpdates.password;
            }

            const success = await this.userRepository.update(id, allowedUpdates);
            if (!success) {
                throw new Error('User not found or no changes made');
            }

            return await this.userRepository.findById(id);
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async authenticate(username, password) {
        try {
            const user = await this.userRepository.findByUsername(username);
            if (!user || user.is_active === false) {
                throw new Error('Invalid credentials');
            }

            const isValidPassword = await user.validatePassword(password);
            if (!isValidPassword) {
                throw new Error('Invalid credentials');
            }

            return user;
        } catch (error) {
            throw new Error(`Authentication error: ${error.message}`);
        }
    }

    async deactivateUser(id) {
        try {
            const success = await this.userRepository.deactivate(id);
            if (!success) {
                throw new Error('User not found');
            }
            return true;
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async deleteUser(id) {
        try {
            return await this.userRepository.deleteById(id);
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }
}

module.exports = UserService;