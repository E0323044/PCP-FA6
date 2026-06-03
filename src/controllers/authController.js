const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'pcp_fa6_jwt_secret_key_987654', {
    expiresIn: '30d',
  });
};

// ============================================================
// Q1 - Register API
// POST /api/auth/register
// ============================================================
const register = async (req, res) => {
  try {
    const { name, email, password, role, studentId, department, cgpa, graduationYear, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and role are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    let studentRef = null;

    // If role is student, check/create Student profile as well
    if (role === 'student') {
      if (!studentId || !department || cgpa === undefined || !graduationYear) {
        return res.status(400).json({
          success: false,
          message: 'Student profiles require studentId, department, cgpa, and graduationYear',
        });
      }

      // Check if student ID already exists
      let student = await Student.findOne({ studentId });
      if (!student) {
        // Create new Student profile
        student = await Student.create({
          studentId,
          name,
          email,
          department,
          cgpa,
          graduationYear,
          phone,
          status: 'active',
        });
      }
      studentRef = student._id;
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      studentRef,
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentRef: user.studentRef,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// Q2 - Login API
// POST /api/auth/login
// ============================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).populate('studentRef');
    if (user && (await user.comparePassword(password))) {
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentRef: user.studentRef,
          token: generateToken(user._id),
        },
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// Q3 - Current User API
// GET /api/auth/me
// ============================================================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('studentRef');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Fetched current user successfully',
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe };
