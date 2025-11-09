const db = require('../../config/database');
const User = require('../models/User');

class UserRepository {
    async findAll() {
        try {
            const [rows] = await db.execute(
                'SELECT id, username, password_hash, email, full_name, role, is_active, created_at FROM users WHERE is_active = TRUE'
            );
            return rows.map(row => new User(row));
        } catch (error) {
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const [rows] = await db.execute(
                'SELECT id, username, password_hash, email, full_name, role, is_active, created_at FROM users WHERE id = ?',
                [id]
            );
            return rows.length > 0 ? new User(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error fetching user by id: ${error.message}`);
        }
    }

    async findByUsername(username) {
        try {
            const [rows] = await db.execute(
                'SELECT id, username, password_hash, email, full_name, role, is_active, created_at FROM users WHERE username = ? LIMIT 1',
                [username]
            );
            return rows.length > 0 ? new User(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error fetching user by username: ${error.message}`);
        }
    }

    async insert(userData) {
        try {
            const { username, password_hash, email, full_name, role } = userData;
            
            const [result] = await db.execute(
                'INSERT INTO users (username, password_hash, email, full_name, role) VALUES (?, ?, ?, ?, ?)',
                [username, password_hash, email, full_name, role]
            );
            
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Username already exists');
            }
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    async update(id, userData) {
        try {
            const fields = [];
            const values = [];
            
            Object.keys(userData).forEach(key => {
                if (userData[key] !== undefined) {
                    fields.push(`${key} = ?`);
                    values.push(userData[key]);
                }
            });
            
            if (fields.length === 0) {
                throw new Error('No fields to update');
            }
            
            values.push(id);
            
            const [result] = await db.execute(
                `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
                values
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    async deactivate(id) {
        try {
            const [result] = await db.execute(
                'UPDATE users SET is_active = FALSE WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deactivating user: ${error.message}`);
        }
    }

    async deleteById(id) {
        try {
            const [result] = await db.execute(
                'DELETE FROM users WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }
}

module.exports = UserRepository;