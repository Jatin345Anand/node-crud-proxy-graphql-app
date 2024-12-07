const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validateStudent } = require('../utils/validator');
const redis = require('redis');

// Create Redis Client
const redisClient = redis.createClient();

redisClient.on('connect', () => console.log('Connected to Redis'));
redisClient.on('error', (err) => console.error('Redis Error:', err));

// Middleware to check Redis cache
const cache = (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(); // Skip caching for requests without IDs

  redisClient.get(id, (err, data) => {
    if (err) return res.status(500).json({ message: 'Redis error', error: err });

    if (data) {
      console.log('Cache hit');
      res.json(JSON.parse(data)); // Return cached data
    } else {
      console.log('Cache miss');
      next(); // Proceed to the database if not in cache
    }
  });
};


const SECRET_KEY = 'your_secret_key';



// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  console.log('Token is',token);
  if (!token) return res.status(403).json({ message: 'Access denied, token missing!' });

  try {
    const decoded = jwt.verify(token.split(' ')[1], SECRET_KEY); // Bearer token
    console.log('Decoced',decoded);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Student.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// router.use();
// GET: List all students
router.get('/',verifyToken, async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Create a new student
router.post('/', validateStudent, async (req, res) => {
  const body = req.body;
  body.password = body.password ? body.password : 'abc$123';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(body.password, salt);
  body.password = hashedPassword;
  const token = jwt.sign({ email: body.email }, SECRET_KEY, { expiresIn: '1h' });
  body.token = token;
  console.log('HASHED user',body);
  const student = new Student(body);
  try {
    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET: Retrieve a specific student
// cache
router.get('/:id',verifyToken, async (req, res) => {
  console.log('Deleted : ',req.query.id,req.params.id);
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
     // Cache the response in Redis
    //  redisClient.setex(req.params.id, 3600, JSON.stringify(student)); // Cache for 1 hour

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT: Update a student
router.put('/:id',verifyToken, async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedStudent) return res.status(404).json({ message: 'Student not found' });
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE: Delete a student
router.delete('/:id',verifyToken, async (req, res) => {
  console.log('Deleted : ');
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
