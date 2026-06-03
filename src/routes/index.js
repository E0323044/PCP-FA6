const express = require('express');
const router = express.Router();
const {
  login,
  syncData,
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
  getStats,
} = require('../controllers/itemController');

// Auth
router.post('/auth/login', login);

// Sync dataset from external API
router.post('/sync', syncData);

// Stats / Analytics
router.get('/stats', getStats);

// CRUD
router.get('/items', getAll);
router.get('/items/:id', getOne);
router.post('/items', createOne);
router.put('/items/:id', updateOne);
router.delete('/items/:id', deleteOne);

module.exports = router;
