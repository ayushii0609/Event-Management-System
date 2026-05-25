const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

router.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const validRoles = ['admin', 'student'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    const checkSql = 'select id from users where email = ?';
    db.query(checkSql, [email], async (err, existing) => {
        if (err) return res.status(500).json({ error: err.message });
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const sql = 'insert into users (name, email, password, role) values (?, ?, ?, ?)';
        db.query(sql, [name, email, hashed, role], (err2, result) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ message: 'Account created successfully!' });
        });
    });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const sql = 'select * from users where email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
        res.json({ message: 'Login successful', user: req.session.user });
    });
});

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out' });
});

router.get('/me', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    res.json(req.session.user);
});

module.exports = router;
