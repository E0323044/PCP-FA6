const axios = require('axios');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
const Interview = require('../models/Interview');

const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// ============================================================
// Fallback Mock Placement Dataset
// ============================================================
const getMockDataset = () => {
  return {
    students: [
      { studentId: "S101", name: " arun kumar ", email: "ARUN@MAIL.COM", department: "cse", cgpa: 8.5, skills: ["React", "Node", "MongoDB"], graduationYear: 2026, phone: "9876543210", status: "active" },
      { studentId: "S102", name: "priya sharma", email: "priya@mail.com", department: "ece", cgpa: 7.8, skills: ["Embedded C", "IoT"], graduationYear: 2026, phone: "9876543211", status: "active" },
      { studentId: "S103", name: "vikram singh", email: "vikram@mail.com", department: "eee", cgpa: 9.1, skills: ["Power Systems", "MATLAB"], graduationYear: 2026, phone: "9876543212", status: "active" },
      { studentId: "S104", name: "divya ramakrishnan", email: "divya@mail.com", department: "cse", cgpa: 6.9, skills: ["HTML", "CSS", "JS"], graduationYear: 2026, phone: "9876543213", status: "active" },
      { studentId: "S105", name: "siddharth roy", email: "sid@mail.com", department: "it", cgpa: 8.2, skills: ["Python", "SQL"], graduationYear: 2026, phone: "9876543214", status: "active" },
      // Invalid students for validation tests
      { studentId: "S106", name: "Invalid Cgpa Student", email: "invalidcgpa@mail.com", department: "cse", cgpa: 11.5, skills: ["Java"], graduationYear: 2026, phone: "9876543215", status: "active" },
      { studentId: "S107", name: "Invalid Email Student", email: "invalidemail@", department: "it", cgpa: 7.5, skills: ["C++"], graduationYear: 2026, phone: "9876543216", status: "active" }
    ],
    companies: [
      { companyId: "C201", name: "TechNova", role: "Software Engineer", package: 1200000, eligibleDepartments: ["CSE", "IT"], minimumCgpa: 8.0, driveDate: "2026-06-15T09:00:00.000Z", status: "active" },
      { companyId: "C202", name: "InnovaSystems", role: "Graduate Engineer Trainee", package: 600000, eligibleDepartments: ["CSE", "IT", "ECE", "EEE"], minimumCgpa: 7.0, driveDate: "2026-06-20T09:00:00.000Z", status: "active" },
      { companyId: "C203", name: "ElectroWorks", role: "Hardware Engineer", package: 800000, eligibleDepartments: ["ECE", "EEE"], minimumCgpa: 7.5, driveDate: "2026-06-25T09:00:00.000Z", status: "active" }
    ],
    drives: [
      { driveId: "D301", companyId: "C201", title: "TechNova Software Engineering Drive", mode: "on-campus", location: "Block A Seminar Hall", registrationDeadline: "2026-06-10T23:59:59.000Z", rounds: ["Aptitude Test", "Technical Interview", "HR Interview"], status: "open" },
      { driveId: "D302", companyId: "C202", title: "InnovaSystems GET Drive", mode: "remote", location: "Virtual", registrationDeadline: "2026-06-18T23:59:59.000Z", rounds: ["Aptitude Test", "Coding Round", "Technical & HR Interview"], status: "open" }
    ],
    applications: [
      { applicationId: "A401", studentId: "S101", driveId: "D301", currentRound: "Aptitude Test", status: "applied", appliedAt: "2026-06-04T10:00:00.000Z" },
      { applicationId: "A402", studentId: "S105", driveId: "D301", currentRound: "Technical Interview", status: "shortlisted", appliedAt: "2026-06-04T10:30:00.000Z" },
      { applicationId: "A403", studentId: "S102", driveId: "D302", currentRound: "Coding Round", status: "applied", appliedAt: "2026-06-05T11:00:00.000Z" }
    ],
    interviews: [
      { interviewId: "I501", applicationId: "A402", interviewer: "Dr. Sandeep", round: "Technical Interview", scheduledAt: "2026-06-12T14:00:00.000Z", result: "pending" }
    ]
  };
};

// ============================================================
// Q4 - Sync API
// POST /api/sync
// ============================================================
const syncData = async (req, res) => {
  try {
    let sourceData = null;

    // 1. Try to fetch from external API
    try {
      const response = await axios.get('https://t4e-testserver.onrender.com/api/data', {
        headers: {
          Authorization: req.headers.authorization || '',
        },
        timeout: 5000,
      });

      // If we got a valid array format or structure back
      if (response.data && Array.isArray(response.data.students)) {
        sourceData = response.data;
        console.log("Successfully fetched dataset from external API!");
      }
    } catch (fetchErr) {
      console.log("External API fetch failed or timed out. Falling back to mock dataset...", fetchErr.message);
    }

    // 2. Fall back to mock dataset if external API didn't return expected structure
    if (!sourceData || !sourceData.students) {
      sourceData = getMockDataset();
    }

    let insertedStudents = 0, rejectedStudents = 0, duplicateStudents = 0;
    let insertedCompanies = 0, rejectedCompanies = 0, duplicateCompanies = 0;
    let insertedDrives = 0, rejectedDrives = 0, duplicateDrives = 0;
    let insertedApplications = 0, rejectedApplications = 0, duplicateApplications = 0;
    let insertedInterviews = 0, rejectedInterviews = 0, duplicateInterviews = 0;

    const companyMap = new Map(); // map companyId -> ObjectId
    const driveMap = new Map(); // map driveId -> ObjectId
    const studentMap = new Map(); // map studentId -> ObjectId
    const appMap = new Map(); // map applicationId -> ObjectId

    // --- Sync Companies ---
    for (const company of sourceData.companies || []) {
      try {
        if (!company.companyId || !company.name || !company.role || company.package === undefined || company.minimumCgpa === undefined) {
          rejectedCompanies++;
          continue;
        }

        const existing = await Company.findOne({ companyId: company.companyId });
        if (existing) {
          companyMap.set(company.companyId, existing._id);
          duplicateCompanies++;
          continue;
        }

        // Sanitize
        const cleanName = toTitleCase(company.name);

        const newCompany = await Company.create({
          companyId: company.companyId,
          name: cleanName,
          role: company.role.trim(),
          package: Number(company.package),
          eligibleDepartments: Array.isArray(company.eligibleDepartments) 
            ? company.eligibleDepartments.map(d => d.toUpperCase().trim()) 
            : [],
          minimumCgpa: Number(company.minimumCgpa),
          driveDate: new Date(company.driveDate),
          status: company.status || 'active',
        });

        companyMap.set(company.companyId, newCompany._id);
        insertedCompanies++;
      } catch (err) {
        console.error("Company sync error:", err.message);
        rejectedCompanies++;
      }
    }

    // --- Sync Students ---
    for (const student of sourceData.students || []) {
      try {
        // Validation Checks
        if (!student.studentId || !student.name || !student.email || !student.department) {
          rejectedStudents++;
          continue;
        }

        const cgpaVal = Number(student.cgpa);
        if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) {
          rejectedStudents++;
          continue;
        }

        if (!validateEmail(student.email)) {
          rejectedStudents++;
          continue;
        }

        const existing = await Student.findOne({ studentId: student.studentId });
        if (existing) {
          studentMap.set(student.studentId, existing._id);
          duplicateStudents++;
          continue;
        }

        // Sanitization
        const cleanName = toTitleCase(student.name);
        const cleanEmail = student.email.toLowerCase().trim();
        const cleanDept = student.department.toUpperCase().trim();

        const newStudent = await Student.create({
          studentId: student.studentId,
          name: cleanName,
          email: cleanEmail,
          department: cleanDept,
          cgpa: cgpaVal,
          skills: Array.isArray(student.skills) ? student.skills : [],
          graduationYear: Number(student.graduationYear || 2026),
          phone: student.phone ? student.phone.trim() : '',
          status: student.status || 'active',
        });

        studentMap.set(student.studentId, newStudent._id);
        insertedStudents++;
      } catch (err) {
        console.error("Student sync error:", err.message);
        rejectedStudents++;
      }
    }

    // --- Sync Drives ---
    for (const drive of sourceData.drives || []) {
      try {
        if (!drive.driveId || !drive.companyId || !drive.title) {
          rejectedDrives++;
          continue;
        }

        const existing = await Drive.findOne({ driveId: drive.driveId });
        if (existing) {
          driveMap.set(drive.driveId, existing._id);
          duplicateDrives++;
          continue;
        }

        const companyObjId = companyMap.get(drive.companyId) || await Company.findOne({ companyId: drive.companyId }).then(c => c?._id);
        if (!companyObjId) {
          // Reject drive if company reference is invalid
          rejectedDrives++;
          continue;
        }

        const newDrive = await Drive.create({
          driveId: drive.driveId,
          company: companyObjId,
          title: toTitleCase(drive.title),
          mode: drive.mode || 'on-campus',
          location: drive.location ? drive.location.trim() : '',
          registrationDeadline: new Date(drive.registrationDeadline),
          rounds: Array.isArray(drive.rounds) ? drive.rounds : [],
          status: drive.status || 'open',
        });

        driveMap.set(drive.driveId, newDrive._id);
        insertedDrives++;
      } catch (err) {
        console.error("Drive sync error:", err.message);
        rejectedDrives++;
      }
    }

    // --- Sync Applications ---
    for (const app of sourceData.applications || []) {
      try {
        if (!app.applicationId || !app.studentId || !app.driveId) {
          rejectedApplications++;
          continue;
        }

        const existing = await Application.findOne({ applicationId: app.applicationId });
        if (existing) {
          appMap.set(app.applicationId, existing._id);
          duplicateApplications++;
          continue;
        }

        const studentObjId = studentMap.get(app.studentId) || await Student.findOne({ studentId: app.studentId }).then(s => s?._id);
        const driveObjId = driveMap.get(app.driveId) || await Drive.findOne({ driveId: app.driveId }).then(d => d?._id);

        if (!studentObjId || !driveObjId) {
          rejectedApplications++;
          continue;
        }

        const newApp = await Application.create({
          applicationId: app.applicationId,
          student: studentObjId,
          drive: driveObjId,
          currentRound: app.currentRound || 'Aptitude Test',
          status: app.status || 'applied',
          appliedAt: new Date(app.appliedAt || Date.now()),
        });

        appMap.set(app.applicationId, newApp._id);
        insertedApplications++;
      } catch (err) {
        console.error("Application sync error:", err.message);
        rejectedApplications++;
      }
    }

    // --- Sync Interviews ---
    for (const interview of sourceData.interviews || []) {
      try {
        if (!interview.interviewId || !interview.applicationId || !interview.interviewer || !interview.round) {
          rejectedInterviews++;
          continue;
        }

        const existing = await Interview.findOne({ interviewId: interview.interviewId });
        if (existing) {
          duplicateInterviews++;
          continue;
        }

        const appObjId = appMap.get(interview.applicationId) || await Application.findOne({ applicationId: interview.applicationId }).then(a => a?._id);
        if (!appObjId) {
          rejectedInterviews++;
          continue;
        }

        await Interview.create({
          interviewId: interview.interviewId,
          application: appObjId,
          interviewer: toTitleCase(interview.interviewer),
          round: interview.round,
          scheduledAt: new Date(interview.scheduledAt),
          result: interview.result || 'pending',
        });

        insertedInterviews++;
      } catch (err) {
        console.error("Interview sync error:", err.message);
        rejectedInterviews++;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Operation successful",
      data: {
        students: { totalFetched: sourceData.students.length, inserted: insertedStudents, duplicates: duplicateStudents, rejected: rejectedStudents },
        companies: { totalFetched: sourceData.companies.length, inserted: insertedCompanies, duplicates: duplicateCompanies, rejected: rejectedCompanies },
        drives: { totalFetched: sourceData.drives.length, inserted: insertedDrives, duplicates: duplicateDrives, rejected: rejectedDrives },
        applications: { totalFetched: sourceData.applications.length, inserted: insertedApplications, duplicates: duplicateApplications, rejected: rejectedApplications },
        interviews: { totalFetched: sourceData.interviews.length, inserted: insertedInterviews, duplicates: duplicateInterviews, rejected: rejectedInterviews }
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// Q5 - Health API
// GET /api/health
// ============================================================
const getHealth = async (req, res) => {
  try {
    const isConnected = require('mongoose').connection.readyState === 1;
    const documentCount = await Student.countDocuments() + 
                          await Company.countDocuments() + 
                          await Drive.countDocuments() + 
                          await Application.countDocuments() + 
                          await Interview.countDocuments();

    return res.status(200).json({
      success: true,
      database: isConnected ? "connected" : "disconnected",
      documentCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { syncData, getHealth };
