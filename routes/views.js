const path = require('path');
const express = require('express');
const router = express.Router();

// Correct the path to point to the project root's public/views directory
const viewsPath = path.resolve(__dirname, '..', 'public', 'views');

// Home page
router.get('/', (req, res) => {
  res.sendFile(path.join(viewsPath, 'index.html'));
});

// Login
router.get('/login', (req, res) => {
  res.sendFile(path.join(viewsPath, 'login.html'));
});

// Register
router.get('/register', (req, res) => {
  res.sendFile(path.join(viewsPath, 'register.html'));
});

// Signup (this might be redundant with register)
router.get('/signup', (req, res) => {
  res.sendFile(path.join(viewsPath, 'signup.html'));
});

// Dashboard
router.get('/dashboard', (req, res) => {
  res.sendFile(path.join(viewsPath, 'dashboard.html'));
});

// About Us 
router.get('/about', (req, res) => {
  res.sendFile(path.join(viewsPath, 'about.html'));
});

// Contact Us - Fixed space in filename
router.get('/contact', (req, res) => {
  res.sendFile(path.join(viewsPath, 'contact.html')); // Changed from 'contact us .html'
});

// Blog
router.get('/blog', (req, res) => {
  res.sendFile(path.join(viewsPath, 'blog.html'));
});

// Courses
router.get('/courses', (req, res) => {
  res.sendFile(path.join(viewsPath, 'courses.html'));
});

// Web Development Course
router.get('/web-development', (req, res) => {
  res.sendFile(path.join(viewsPath, 'web-development.html'));
});

// Data Science Course
router.get('/data-science', (req, res) => {
  res.sendFile(path.join(viewsPath, 'data-science.html'));
});

// UI/UX Design Course
router.get('/ui-ux', (req, res) => {
  res.sendFile(path.join(viewsPath, 'ui-ux.html'));
});

// Digital Marketing Course
router.get('/digital-marketing', (req, res) => {
  res.sendFile(path.join(viewsPath, 'digital-marketing.html'));
});

// Profile
router.get('/profile', (req, res) => {
  res.sendFile(path.join(viewsPath, 'profile.html')); 
});

// Project Management
router.get('/project-management', (req, res) => {   
  res.sendFile(path.join(viewsPath, 'project-management.html')); 
});

// Cybersecurity
router.get('/cybersecurity', (req, res) => {   
  res.sendFile(path.join(viewsPath, 'cybersecurity.html')); 
});

// Video Editing
router.get('/video-editing', (req, res) => {   
  res.sendFile(path.join(viewsPath, 'video-editing.html')); 
});

// AI/ML
router.get('/ai', (req, res) => {
  res.sendFile(path.join(viewsPath, 'ai.html')); // Changed from 'AI.html'
});

// Data Analytics
router.get('/data-analytics', (req, res) => {
  res.sendFile(path.join(viewsPath, 'data-analytics.html')); 
});

// Graphic Design
router.get('/graphic-design', (req, res) => {
  res.sendFile(path.join(viewsPath, 'graphic-design.html')); 
});

// Programming
router.get('/programming', (req, res) => {
  res.sendFile(path.join(viewsPath, 'programming.html')); 
});

// Forgot Password
router.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(viewsPath, 'forgot-password.html')); 
});

// Terms
router.get('/terms', (req, res) => {
  res.sendFile(path.join(viewsPath, 'terms.html'));
});

// 404 fallback - This should come LAST
router.get('*', (req, res) => {
  res.sendFile(path.join(viewsPath, '404.html'));
});

module.exports = router;