const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');

// Load configuration
const config = require('./config');

/**
 * IMPORTANT: To start this server in PowerShell:
 * 1. Use: cd .. ; node server.js    (note the semicolon instead of &&)
 * 2. Or better, run directly: node server.js
 * 
 * PowerShell doesn't support the && operator - use ; instead
 */

const app = express();
const PORT = config.server.port || 8080;
const HOST = config.server.host || 'localhost';

// Basic security middleware
app.use(helmet({
  contentSecurityPolicy: false // We'll set this manually
}));

// Enhanced CORS config
app.use(cors(config.server.cors));

// Updated CSP headers
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.tailwindcss.com https://unpkg.com https://cdn.jsdelivr.net https://cdn.ethers.io; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://fonts.googleapis.com; connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 ws://localhost:8000 wss://localhost:8000; font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https://*; frame-src 'self'"
  );
  next();
});

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Serve static files with proper MIME types
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html');
    }
  }
}));

// Serve specific directories
app.use('/js', express.static(path.join(__dirname, 'src/js')));
app.use('/css', express.static(path.join(__dirname, 'src/css')));
app.use('/html', express.static(path.join(__dirname, 'src/html')));
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/build', express.static(path.join(__dirname, 'build')));

// Main routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/admin.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/login.html'));
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Web server running',
    environment: config.app.name,
    version: config.app.version
  });
});

// Fallback route handler for HTML files
app.get('/:page.html', (req, res, next) => {
  const page = req.params.page;
  if (page.includes('.')) {
    return next();
  }
  
  const filePath = path.join(__dirname, 'src', 'html', `${page}.html`);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    next();
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'src/html/404.html'));
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
}); 