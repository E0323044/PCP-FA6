const Student = require('../models/Student');
const Company = require('../models/Company');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
const Interview = require('../models/Interview');

// ============================================================
// SECTION D - Student APIs
// ============================================================

// GET /students (with filters: department, cgpaMin, status)
const getStudents = async (req, res) => {
  try {
    const { department, cgpaMin, status, search, page = 1, limit = 100 } = req.query;
    const query = {};

    if (department) query.department = department.toUpperCase().trim();
    if (cgpaMin) query.cgpa = { $gte: Number(cgpaMin) };
    if (status) query.status = status.trim();

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      message: "Operation successful",
      data: students,
      total,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /students/:id
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    return res.status(200).json({ success: true, message: "Operation successful", data: student });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// SECTION D - Company APIs
// ============================================================

// POST /companies
const createCompany = async (req, res) => {
  try {
    const { companyId, name, role, package: pkg, eligibleDepartments, minimumCgpa, driveDate } = req.body;

    if (!companyId || !name || !role || pkg === undefined || !eligibleDepartments || minimumCgpa === undefined || !driveDate) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existing = await Company.findOne({ companyId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Company ID already exists' });
    }

    const company = await Company.create({
      companyId,
      name: name.trim(),
      role: role.trim(),
      package: Number(pkg),
      eligibleDepartments: eligibleDepartments.map(d => d.toUpperCase().trim()),
      minimumCgpa: Number(minimumCgpa),
      driveDate: new Date(driveDate),
      status: req.body.status || 'active'
    });

    return res.status(201).json({ success: true, message: "Operation successful", data: company });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /companies
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({}).sort({ name: 1 });
    return res.status(200).json({ success: true, message: "Operation successful", data: companies });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /companies/:id
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    return res.status(200).json({ success: true, message: "Operation successful", data: company });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /companies/:id
const updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    return res.status(200).json({ success: true, message: "Operation successful", data: company });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /companies/:id
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    return res.status(200).json({ success: true, message: 'Company deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// SECTION D - Drive APIs
// ============================================================

// POST /drives
const createDrive = async (req, res) => {
  try {
    const { driveId, company, title, mode, location, registrationDeadline, rounds } = req.body;

    if (!driveId || !company || !title || !registrationDeadline) {
      return res.status(400).json({ success: false, message: 'Drive ID, Company, Title, and Deadline are required' });
    }

    const companyExists = await Company.findById(company);
    if (!companyExists) {
      return res.status(404).json({ success: false, message: 'Company reference does not exist' });
    }

    const drive = await Drive.create({
      driveId,
      company,
      title: title.trim(),
      mode: mode || 'on-campus',
      location: location ? location.trim() : '',
      registrationDeadline: new Date(registrationDeadline),
      rounds: rounds || [],
      status: req.body.status || 'open'
    });

    return res.status(201).json({ success: true, message: "Operation successful", data: drive });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /drives (with filters: status, companyName)
const getDrives = async (req, res) => {
  try {
    const { status, company, search } = req.query;
    const query = {};

    if (status) query.status = status.trim();

    // Find drives by company reference
    let companyQuery = {};
    if (company) {
      companyQuery.name = { $regex: company, $options: 'i' };
      const matchedCompanies = await Company.find(companyQuery).select('_id');
      query.company = { $in: matchedCompanies.map(c => c._id) };
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const drives = await Drive.find(query).populate('company').sort({ registrationDeadline: 1 });
    return res.status(200).json({ success: true, message: "Operation successful", data: drives });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /drives/:id
const getDriveById = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id).populate('company');
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    return res.status(200).json({ success: true, message: "Operation successful", data: drive });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /drives/:id
const updateDrive = async (req, res) => {
  try {
    const drive = await Drive.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('company');
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    return res.status(200).json({ success: true, message: "Operation successful", data: drive });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /drives/:id
const deleteDrive = async (req, res) => {
  try {
    const drive = await Drive.findByIdAndDelete(req.params.id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    return res.status(200).json({ success: true, message: 'Drive deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// SECTION D - Application APIs with Workflow rules
// ============================================================

// POST /applications
const createApplication = async (req, res) => {
  try {
    const { applicationId, student, drive } = req.body;

    if (!applicationId || !student || !drive) {
      return res.status(400).json({ success: false, message: 'Application ID, Student reference, and Drive reference are required' });
    }

    const studentRecord = await Student.findById(student);
    if (!studentRecord) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const driveRecord = await Drive.findById(drive).populate('company');
    if (!driveRecord) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    // --- WORKFLOW RULES ---

    // 1. Closed drives cannot accept applications
    if (driveRecord.status === 'closed') {
      return res.status(400).json({ success: false, message: 'This placement drive has been closed' });
    }

    // 2. Student CGPA must satisfy company minimum CGPA
    if (studentRecord.cgpa < driveRecord.company.minimumCgpa) {
      return res.status(400).json({
        success: false,
        message: `Student CGPA (${studentRecord.cgpa}) is lower than the company minimum requirement (${driveRecord.company.minimumCgpa})`,
      });
    }

    // 3. Student department must be eligible
    const isDeptEligible = driveRecord.company.eligibleDepartments.includes(studentRecord.department);
    if (!isDeptEligible) {
      return res.status(400).json({
        success: false,
        message: `Student department (${studentRecord.department}) is not eligible for this company`,
      });
    }

    // 4. Duplicate applications not allowed
    const duplicate = await Application.findOne({ student, drive });
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'Student has already applied to this drive' });
    }

    const application = await Application.create({
      applicationId,
      student,
      drive,
      currentRound: driveRecord.rounds[0] || 'Aptitude Test',
      status: 'applied'
    });

    return res.status(201).json({ success: true, message: "Operation successful", data: application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate application found' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /applications (pagination, search, status, combined queries)
const getApplications = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status.trim();

    // Manage combined queries, pagination and search
    let matchingStudents = [];
    let matchingDrives = [];

    if (search) {
      // Find students matching search term
      const students = await Student.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { studentId: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      matchingStudents = students.map(s => s._id);

      // Find drives matching search term or company name
      const companies = await Company.find({
        name: { $regex: search, $options: 'i' }
      }).select('_id');

      const drives = await Drive.find({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { company: { $in: companies.map(c => c._id) } }
        ]
      }).select('_id');
      matchingDrives = drives.map(d => d._id);

      // Construct search query
      query.$or = [
        { student: { $in: matchingStudents } },
        { drive: { $in: matchingDrives } }
      ];
    }

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate('student')
      .populate({
        path: 'drive',
        populate: { path: 'company' }
      })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Operation successful",
      data: applications,
      total,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /applications/:id
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('student')
      .populate({
        path: 'drive',
        populate: { path: 'company' }
      });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    return res.status(200).json({ success: true, message: "Operation successful", data: application });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /applications/:id
const updateApplication = async (req, res) => {
  try {
    const { status, currentRound } = req.body;

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (status) application.status = status;
    if (currentRound) application.currentRound = currentRound;

    await application.save();

    // If application status changed to selected, mark student as placed
    if (status === 'selected') {
      await Student.findByIdAndUpdate(application.student, { status: 'placed' });
    }

    const updated = await Application.findById(req.params.id)
      .populate('student')
      .populate({
        path: 'drive',
        populate: { path: 'company' }
      });

    return res.status(200).json({ success: true, message: "Operation successful", data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /applications/:id
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    return res.status(200).json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// SECTION E - Interview Workflow APIs
// ============================================================

// POST /interviews (Schedule Interview)
const scheduleInterview = async (req, res) => {
  try {
    const { interviewId, application, interviewer, round, scheduledAt } = req.body;

    if (!interviewId || !application || !interviewer || !round || !scheduledAt) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const appRecord = await Application.findById(application);
    if (!appRecord) {
      return res.status(404).json({ success: false, message: 'Application reference does not exist' });
    }

    // --- WORKFLOW RULES ---
    
    // 1. Rejected applications cannot receive interviews
    if (appRecord.status === 'rejected') {
      return res.status(400).json({ success: false, message: 'Rejected applications cannot receive interviews' });
    }

    // 2. Selected candidates cannot be rescheduled (selected means already hired)
    if (appRecord.status === 'selected') {
      return res.status(400).json({ success: false, message: 'Selected candidates cannot be scheduled for new interview rounds' });
    }

    // 3. Interview date must be valid
    const dateVal = new Date(scheduledAt);
    if (isNaN(dateVal.getTime())) {
      return res.status(400).json({ success: false, message: 'Interview date is invalid' });
    }

    const interview = await Interview.create({
      interviewId,
      application,
      interviewer: interviewer.trim(),
      round: round.trim(),
      scheduledAt: dateVal,
      result: 'pending'
    });

    return res.status(201).json({ success: true, message: "Operation successful", data: interview });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /interviews/:id (Update Interview Result)
const updateInterviewResult = async (req, res) => {
  try {
    const { result } = req.body;

    if (!result || !['pending', 'pass', 'fail'].includes(result)) {
      return res.status(400).json({ success: false, message: 'Result must be pending, pass, or fail' });
    }

    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    const appRecord = await Application.findById(interview.application);
    if (!appRecord) {
      return res.status(404).json({ success: false, message: 'Associated application not found' });
    }

    // --- WORKFLOW RULES ---
    if (appRecord.status === 'rejected') {
      return res.status(400).json({ success: false, message: 'Cannot update results for a rejected application' });
    }

    interview.result = result;
    await interview.save();

    // Automate application status update based on interview result
    if (result === 'pass') {
      appRecord.status = 'shortlisted';
    } else if (result === 'fail') {
      appRecord.status = 'rejected';
    }
    await appRecord.save();

    return res.status(200).json({
      success: true,
      message: "Operation successful",
      data: { interview, applicationStatus: appRecord.status }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /interviews
const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({})
      .populate({
        path: 'application',
        populate: [
          { path: 'student' },
          { path: 'drive', populate: { path: 'company' } }
        ]
      })
      .sort({ scheduledAt: 1 });
    return res.status(200).json({ success: true, message: "Operation successful", data: interviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
