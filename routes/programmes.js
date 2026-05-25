const express = require('express');
const router = express.Router();
const db = require('../config/db');

function requireAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

router.get('/', (req, res) => {
    const sql = 'select * from programmes order by event_date asc';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.get('/:id', (req, res) => {
    const sql = 'select * from programmes where id = ?';
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Event not found' });
        res.json(results[0]);
    });
});

router.post('/', requireAdmin, (req, res) => {
    const { title, description, location, event_date, event_time, organizer, max_seats } = req.body;

    if (!title || !event_date) {
        return res.status(400).json({ error: 'Title and date are required' });
    }

    const sql = `insert into programmes (title, description, location, event_date, event_time, organizer, max_seats)
                 values (?, ?, ?, ?, ?, ?, ?)`;
    const values = [title, description, location, event_date, event_time, organizer, max_seats || 50];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Event added successfully!', id: result.insertId });
    });
});

router.delete('/:id', requireAdmin, (req, res) => {
    const sql = 'delete from programmes where id = ?';
    db.query(sql, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Event deleted successfully!' });
    });
});

module.exports = router;
