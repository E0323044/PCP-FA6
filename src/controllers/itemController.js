const { getToken, fetchDataset } = require('../config/apiService');
const Item = require('../models/Item');

// ============================================================
// Auth: Get Token
// POST /api/auth/token
// Body: { registerNo, password }
// ============================================================
const login = async (req, res) => {
  try {
    const { registerNo, password } = req.body;
    if (!registerNo || !password) {
      return res.status(400).json({
        success: false,
        message: 'Register number and password are required',
      });
    }
    const data = await getToken(registerNo, password);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

// ============================================================
// Sync: Fetch dataset and store in MongoDB (skip duplicates)
// POST /api/sync
// Headers: Authorization: Bearer <token>
// ============================================================
const syncData = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token required' });
    }

    const dataset = await fetchDataset(token);
    const items = Array.isArray(dataset) ? dataset : dataset.data || [];

    let inserted = 0;
    let skipped = 0;
    const errors = [];

    for (const item of items) {
      try {
        // Validate & sanitize — update based on your actual fields
        if (!item.name || typeof item.name !== 'string') {
          skipped++;
          continue;
        }

        // Try to insert; skip if duplicate
        const newItem = new Item({
          name: item.name?.trim(),
          email: item.email?.toLowerCase().trim(),
          // Map more fields here
        });

        await newItem.save();
        inserted++;
      } catch (err) {
        if (err.code === 11000) {
          skipped++; // Duplicate
        } else {
          errors.push(err.message);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Data synced successfully',
      inserted,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// CRUD: Get all items (with search & filter)
// GET /api/items?search=&page=1&limit=10
// ============================================================
const getAll = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = { isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: items,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// CRUD: Get single item
// GET /api/items/:id
// ============================================================
const getOne = async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, isDeleted: false });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// CRUD: Create item
// POST /api/items
// ============================================================
const createOne = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const item = new Item({ name: name.trim(), email: email?.toLowerCase().trim() });
    await item.save();
    return res.status(201).json({ success: true, data: item });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Duplicate entry' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// CRUD: Update item
// PUT /api/items/:id
// ============================================================
const updateOne = async (req, res) => {
  try {
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// CRUD: Delete item (soft delete)
// DELETE /api/items/:id
// ============================================================
const deleteOne = async (req, res) => {
  try {
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    return res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// Statistics / Analytics
// GET /api/stats
// ============================================================
const getStats = async (req, res) => {
  try {
    const total = await Item.countDocuments({ isDeleted: false });
    const deleted = await Item.countDocuments({ isDeleted: true });
    // Add more aggregation stats as needed
    return res.status(200).json({
      success: true,
      data: { total, deleted },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { login, syncData, getAll, getOne, createOne, updateOne, deleteOne, getStats };
