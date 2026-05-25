const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'eventhub_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/programmes'));
app.use('/api/registrations', require('./routes/registrations'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
