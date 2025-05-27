const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const User = require('./models/User');

const app = express();
const PORT = 3000;

// MongoDB connection (clean, no deprecated options)
mongoose.connect('mongodb+srv://hsgf7667:villan7667@cluster7667.h95hy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster7667')
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'my_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Serve static frontend content from new 'host' directory
app.use(express.static(path.join(__dirname, '../host')));

// API routes
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'Username already exists' });

    const user = new User({ username, email, password }); // Store plain password for testing
    await user.save();

    req.session.user = { id: user._id, username: user.username };
    res.status(200).json({ user: { username: user.username }, token: 'session_token' });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'User not found' });

    // Compare plain password (no hashing for testing)
    if (user.password !== password) return res.status(401).json({ message: 'Incorrect password' });

    req.session.user = { id: user._id, username: user.username };
    res.status(200).json({ user: { username: user.username }, token: 'session_token' });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

app.post('/api/auth/verify', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ user: null });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/frontend/auth/index.html');
  });
});

app.get('/home', (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, '../host/frontend/home.html'));
  } else {
    res.redirect('/auth/index.html');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}/frontend/auth/index.html`);
});