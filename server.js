const express = require('express');
const fs = require('fs');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ensure tmp/sessions directory exists
const sessionsDir = path.join(__dirname, 'tmp', 'sessions');
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

// Use API routes
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});