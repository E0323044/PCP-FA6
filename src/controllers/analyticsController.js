const Application = require('../models/Application');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Drive = require('../models/Drive');

// ============================================================
// Q15 - Placement Analytics
// GET /api/analytics/placements
// ============================================================
const getPlacementAnalytics = async (req, res) => {
  try {
    const stats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Format output
    const result = {
      totalApplications: 0,
      applied: 0,
      shortlisted: 0,
      selected: 0,
      rejected: 0,
    };

    stats.forEach((item) => {
      const status = item._id; // applied, shortlisted, selected, rejected
      if (result.hasOwnProperty(status)) {
        result[status] = item.count;
      }
      result.totalApplications += item.count;
    });

    return res.status(200).json({
      success: true,
      message: 'Operation successful',
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// Q16 - Department Analytics
// GET /api/analytics/departments
// ============================================================
const getDepartmentAnalytics = async (req, res) => {
  try {
    const stats = await Student.aggregate([
      {
        $group: {
          _id: '$department',
          totalStudents: { $sum: 1 },
          placedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'placed'] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          department: '$_id',
          totalStudents: 1,
          placedCount: 1,
          placementPercentage: {
            $cond: [
              { $gt: ['$totalStudents', 0] },
              { $multiply: [{ $divide: ['$placedCount', '$totalStudents'] }, 100] },
              0,
            ],
          },
        },
      },
      { $sort: { department: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      message: 'Operation successful',
      data: stats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// Q17 - Company Analytics
// GET /api/analytics/companies
// ============================================================
const getCompanyAnalytics = async (req, res) => {
  try {
    const stats = await Company.aggregate([
      {
        $lookup: {
          from: 'drives',
          localField: '_id',
          foreignField: 'company',
          as: 'drives',
        },
      },
      {
        $lookup: {
          from: 'applications',
          let: { driveIds: '$drives._id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$drive', '$$driveIds'] },
                    { $eq: ['$status', 'selected'] },
                  ],
                },
              },
            },
          ],
          as: 'selectedApplications',
        },
      },
      {
        $project: {
          companyId: 1,
          name: 1,
          role: 1,
          package: 1,
          highestPackage: '$package',
          driveParticipationCount: { $size: '$drives' },
          selectedStudentsCount: { $size: '$selectedApplications' },
        },
      },
      { $sort: { package: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      message: 'Operation successful',
      data: stats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPlacementAnalytics,
  getDepartmentAnalytics,
  getCompanyAnalytics,
};
