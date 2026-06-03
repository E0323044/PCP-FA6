const express = require('express');
const router = express.Router();

const { register, login, getMe } = require('../controllers/authController');
const { syncData, getHealth } = require('../controllers/syncController');
const { protect, authorize } = require('../middleware/authMiddleware');

const {
  getStudents,
  getStudentById,
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  createDrive,
  getDrives,
  getDriveById,
  updateDrive,
  deleteDrive,
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  scheduleInterview,
  updateInterviewResult,
  getInterviews
} = require('../controllers/placementController');

const {
  getPlacementAnalytics,
  getDepartmentAnalytics,
  getCompanyAnalytics
} = require('../controllers/analyticsController');

// ============================================================
// SECTION A - AUTHENTICATION & AUTHORIZATION
// ============================================================
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', protect, getMe);

// ============================================================
// SECTION B - DATASET SYNCHRONIZATION & HEALTH
// ============================================================
router.post('/sync', protect, syncData);
router.get('/health', getHealth);

// ============================================================
// SECTION D - CRUD & WORKFLOW APIS
// ============================================================

// Students
router.get('/students', protect, getStudents);
router.get('/students/:id', protect, getStudentById);

// Companies
router.post('/companies', protect, authorize('admin', 'placement_officer'), createCompany);
router.get('/companies', protect, getCompanies);
router.get('/companies/:id', protect, getCompanyById);
router.patch('/companies/:id', protect, authorize('admin', 'placement_officer'), updateCompany);
router.delete('/companies/:id', protect, authorize('admin', 'placement_officer'), deleteCompany);

// Drives
router.post('/drives', protect, authorize('admin', 'placement_officer'), createDrive);
router.get('/drives', protect, getDrives);
router.get('/drives/:id', protect, getDriveById);
router.patch('/drives/:id', protect, authorize('admin', 'placement_officer'), updateDrive);
router.delete('/drives/:id', protect, authorize('admin', 'placement_officer'), deleteDrive);

// Applications
router.post('/applications', protect, createApplication);
router.get('/applications', protect, getApplications);
router.get('/applications/:id', protect, getApplicationById);
router.patch('/applications/:id', protect, authorize('admin', 'placement_officer'), updateApplication);
router.delete('/applications/:id', protect, authorize('admin', 'placement_officer'), deleteApplication);

// ============================================================
// SECTION E - INTERVIEW WORKFLOW APIS
// ============================================================
router.post('/interviews', protect, authorize('admin', 'placement_officer'), scheduleInterview);
router.patch('/interviews/:id', protect, authorize('admin', 'placement_officer'), updateInterviewResult);
router.get('/interviews', protect, getInterviews);

// ============================================================
// SECTION G - ANALYTICS & AGGREGATION APIS
// ============================================================
router.get('/analytics/placements', protect, authorize('admin', 'placement_officer'), getPlacementAnalytics);
router.get('/analytics/departments', protect, authorize('admin', 'placement_officer'), getDepartmentAnalytics);
router.get('/analytics/companies', protect, authorize('admin', 'placement_officer'), getCompanyAnalytics);

module.exports = router;
