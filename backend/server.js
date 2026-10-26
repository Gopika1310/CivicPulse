const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB
const client = new MongoClient(process.env.MONGO_URI);
let db, users, issues, notifications;

async function connectDB() {
  await client.connect();
  db = client.db(process.env.DB_NAME);
  users = db.collection('users');
  issues = db.collection('issues');
  notifications = db.collection('notifications');
  console.log('✅ MongoDB connected to', process.env.DB_NAME);
}

// ---------- AUTH ----------

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields required' });
    }
    if (!['Citizen', 'Government'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const existing = await users.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await users.insertOne({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role,
      createdAt: new Date()
    });

    const token = jwt.sign(
      { id: result.insertedId, role, name, email: email.toLowerCase() },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: result.insertedId, name, email: email.toLowerCase(), role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const user = await users.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- ISSUES ----------

app.get('/api/issues', async (req, res) => {
  try {
    const list = await issues.find().sort({ createdAt: -1 }).toArray();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/issues', async (req, res) => {
  try {
    const { title, description, location, category, coordinates, reportedBy, reporterName } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description required' });
    }

    const issue = {
      title,
      description,
      location: location || 'Not specified',
      coordinates: coordinates || null, // { lat, lng }
      category: category || 'Other',
      status: 'Pending',
      reportedBy: reportedBy || null,
      reporterName: reporterName || 'Anonymous',
      createdAt: new Date()
    };

    const result = await issues.insertOne(issue);

    // Create notification for government users
    await notifications.insertOne({
      message: `New ${category} issue: "${title}"`,
      issueId: result.insertedId,
      targetRole: 'Government',
      read: false,
      createdAt: new Date()
    });

    res.status(201).json({ ...issue, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/issues/:id', async (req, res) => {
  try {
    const result = await issues.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: req.body.status } },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Not found' });

    // Notify citizen
    if (result.reportedBy) {
      await notifications.insertOne({
        message: `Your issue "${result.title}" is now ${req.body.status}`,
        issueId: result._id,
        targetUser: result.reportedBy,
        read: false,
        createdAt: new Date()
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/issues/:id', async (req, res) => {
  try {
    await issues.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- NOTIFICATIONS ----------

app.get('/api/notifications/:userId/:role', async (req, res) => {
  try {
    const { userId, role } = req.params;
    const list = await notifications.find({
      $or: [
        { targetUser: userId },
        { targetRole: role }
      ]
    }).sort({ createdAt: -1 }).limit(20).toArray();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    await notifications.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { read: true } }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- USER ----------

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await users.findOne({ _id: new ObjectId(req.params.id) });
    if (!user) return res.status(404).json({ error: 'Not found' });
    delete user.password;
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- STATS ----------

app.get('/api/stats', async (req, res) => {
  try {
    const total = await issues.countDocuments();
    const pending = await issues.countDocuments({ status: 'Pending' });
    const resolved = await issues.countDocuments({ status: 'Resolved' });
    const inProgress = await issues.countDocuments({ status: 'In Progress' });
    res.json({ total, pending, resolved, inProgress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health
app.get('/', (req, res) => res.json({ status: 'CivicPulse API 🚀' }));

connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log('');
    console.log('🚀 Backend: http://localhost:' + PORT);
    console.log('📡 Auth:    /api/auth');
    console.log('📡 Issues:  /api/issues');
    console.log('📡 Notif:   /api/notifications');
    console.log('');
  });
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});