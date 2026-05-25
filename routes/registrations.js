const express = require('express');
const router = express.Router();
const db = require('../config/db');

function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Please login to register for events' });
    }
    next();
}

router.get('/:event_id', (req, res) => {
    const sql = `select r.*, e.title as event_title
                 from registrations r
                 join programmes e on r.event_id = e.id
                 where r.event_id = ?
                 order by r.registered_at desc`;
    db.query(sql, [req.params.event_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.post('/', requireLogin, (req, res) => {
    const { event_id, phone } = req.body;
    const user = req.session.user;

    if (!event_id) {
        return res.status(400).json({ error: 'Event ID is required' });
    }

    const checkSql = 'select id from registrations where event_id = ? and email = ?';
    db.query(checkSql, [event_id, user.email], (err, existing) => {
        if (err) return res.status(500).json({ error: err.message });
        if (existing.length > 0) {
            return res.status(400).json({ error: 'You are already registered for this event!' });
        }

        const seatSql = `select e.max_seats,
                                (select count(*) from registrations where event_id = e.id) as total_registered
                         from programmes e where e.id = ?`;
        db.query(seatSql, [event_id], (err2, seatResult) => {
            if (err2) return res.status(500).json({ error: err2.message });

            const { max_seats, total_registered } = seatResult[0];
            if (total_registered >= max_seats) {
                return res.status(400).json({ error: 'Sorry! No seats available for this event.' });
            }

            const insertSql = 'insert into registrations (event_id, user_id, name, email, phone) values (?, ?, ?, ?, ?)';
            const userId = parseInt(user.id);
            db.query(insertSql, [event_id, userId, user.name, user.email, phone || null], (err3, result) => {
                if (err3) return res.status(500).json({ error: err3.message });
                res.json({ message: 'Registered successfully!', id: result.insertId });
            });
        });
    });
});

router.delete('/:id', requireLogin, (req, res) => {
    const sql = 'delete from registrations where id = ? and user_id = ?';
    db.query(sql, [req.params.id, req.session.user.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Registration cancelled.' });
    });
});

module.exports = router;
