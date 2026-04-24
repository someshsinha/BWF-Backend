const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const PORT = process.env.PORT || 5000;

const connectDB = require('./utils/configure');

// ── Route imports ─────────────────────────────────────────────────────────────
const authRoutes        = require('./auth/route');
const dashboardRoutes   = require('./student/dashboard/routes');
const coursesRoutes     = require('./student/courses/routes');
const noticeboardRoutes = require('./student/noticeboard/routes');

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// ── DB ────────────────────────────────────────────────────────────────────────
connectDB();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api',                     authRoutes);
app.use('/api/student/dashboard',   dashboardRoutes);
app.use('/api/student/courses',     coursesRoutes);
app.use('/api/student/noticeboard', noticeboardRoutes);

app.get('/', (req, res) => res.send('BWF Server running...'));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});