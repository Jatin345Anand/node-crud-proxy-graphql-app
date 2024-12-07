const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const studentRoutes = require('./routes/studentRoutes');

// Initialize the app
const app = express();
const PORT = 5000;

// Middleware
app.use(helmet());
app.use(bodyParser.json());
app.use(cors());

// Database connection
mongoose
  .connect('mongodb://localhost:27017/studentsdb', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Database connection error:', err));

  console.log('in routing');
// Routes
app.use('/api/students', studentRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
