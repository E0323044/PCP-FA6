import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

const DashboardPage = () => {
  const {
    user,
    logout,
    sync,
    loadStudents,
    loadCompanies,
    loadDrives,
    loadApplications,
    loadInterviews,
    loadAnalytics,
    students,
    companies,
    drives,
    applications,
    interviews,
    analytics,
    addCompany,
    addDrive,
    applyForDrive,
    editApplication,
    scheduleNewInterview,
    updateIntResult,
    loading
  } = useApp();

  const [activeTab, setActiveTab] = useState('drives'); // drives, students, companies, applications, interviews, analytics
  const [syncResult, setSyncResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states for modals
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  const [companyForm, setCompanyForm] = useState({ companyId: '', name: '', role: '', package: '', eligibleDepartments: 'CSE,IT', minimumCgpa: '', driveDate: '' });
  const [driveForm, setDriveForm] = useState({ driveId: '', company: '', title: '', mode: 'on-campus', location: '', registrationDeadline: '', rounds: 'Aptitude Test,Technical Interview' });
  const [interviewForm, setInterviewForm] = useState({ interviewId: '', application: '', interviewer: '', round: '', scheduledAt: '' });

  useEffect(() => {
    if (user) {
      loadDrives();
      loadCompanies();
      loadApplications();
      if (user.role !== 'student') {
        loadStudents();
        loadInterviews();
        loadAnalytics();
      }
    }
  }, [user]);

  const handleSync = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    const res = await sync();
    if (res.success) {
      setSyncResult(res.data);
      setSuccessMsg('Sync completed successfully!');
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleAddCompanySubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const res = await addCompany({
      ...companyForm,
      package: Number(companyForm.package),
      minimumCgpa: Number(companyForm.minimumCgpa),
      eligibleDepartments: companyForm.eligibleDepartments.split(',').map(d => d.trim().toUpperCase())
    });
    if (res.success) {
      setSuccessMsg('Company added successfully!');
      setShowCompanyModal(false);
      setCompanyForm({ companyId: '', name: '', role: '', package: '', eligibleDepartments: 'CSE,IT', minimumCgpa: '', driveDate: '' });
      loadCompanies();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleAddDriveSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const res = await addDrive({
      ...driveForm,
      rounds: driveForm.rounds.split(',').map(r => r.trim())
    });
    if (res.success) {
      setSuccessMsg('Drive created successfully!');
      setShowDriveModal(false);
      setDriveForm({ driveId: '', company: '', title: '', mode: 'on-campus', location: '', registrationDeadline: '', rounds: 'Aptitude Test,Technical Interview' });
      loadDrives();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleScheduleInterviewSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const res = await scheduleNewInterview(interviewForm);
    if (res.success) {
      setSuccessMsg('Interview scheduled successfully!');
      setShowInterviewModal(false);
      setInterviewForm({ interviewId: '', application: '', interviewer: '', round: '', scheduledAt: '' });
      loadInterviews();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleApply = async (driveId) => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!user || !user.studentRef) {
      setErrorMsg('Student profile reference missing.');
      return;
    }
    
    // Generate a unique application ID
    const appId = 'APP' + Math.floor(1000 + Math.random() * 9000);
    const res = await applyForDrive({
      applicationId: appId,
      student: user.studentRef._id || user.studentRef,
      drive: driveId
    });

    if (res.success) {
      setSuccessMsg('Applied successfully! Application ID: ' + appId);
      loadApplications();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleAppStatusChange = async (appId, newStatus) => {
    setErrorMsg('');
    setSuccessMsg('');
    const res = await editApplication(appId, { status: newStatus });
    if (res.success) {
      setSuccessMsg('Application status updated successfully!');
      loadApplications();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleInterviewResultUpdate = async (intId, newResult) => {
    setErrorMsg('');
    setSuccessMsg('');
    const res = await updateIntResult(intId, { result: newResult });
    if (res.success) {
      setSuccessMsg('Interview result updated successfully!');
      loadInterviews();
    } else {
      setErrorMsg(res.message);
    }
  };

  if (!user) return <div style={styles.container}>Loading profile...</div>;

  return (
    <div style={styles.container}>
      {/* Sidebar Navigation */}
      <div className="glass-panel" style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.brandName}>PlacementHub</h2>
          <div style={styles.profileBox}>
            <p style={styles.profileName}>{user.name}</p>
            <p style={styles.profileRole}>{user.role.replace('_', ' ')}</p>
          </div>
        </div>

        <nav style={styles.nav}>
          {user.role === 'student' ? (
            <>
              <button
                onClick={() => setActiveTab('drives')}
                style={activeTab === 'drives' ? styles.activeNavLink : styles.navLink}
              >
                💼 Placement Drives
              </button>
              <button
                onClick={() => setActiveTab('my_applications')}
                style={activeTab === 'my_applications' ? styles.activeNavLink : styles.navLink}
              >
                📄 My Applications
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('analytics')}
                style={activeTab === 'analytics' ? styles.activeNavLink : styles.navLink}
              >
                📊 Aggregated Analytics
              </button>
              <button
                onClick={() => setActiveTab('drives')}
                style={activeTab === 'drives' ? styles.activeNavLink : styles.navLink}
              >
                📅 Placement Drives
              </button>
              <button
                onClick={() => setActiveTab('students')}
                style={activeTab === 'students' ? styles.activeNavLink : styles.navLink}
              >
                🎓 Students List
              </button>
              <button
                onClick={() => setActiveTab('companies')}
                style={activeTab === 'companies' ? styles.activeNavLink : styles.navLink}
              >
                🏢 Partner Companies
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                style={activeTab === 'applications' ? styles.activeNavLink : styles.navLink}
              >
                📄 Student Applications
              </button>
              <button
                onClick={() => setActiveTab('interviews')}
                style={activeTab === 'interviews' ? styles.activeNavLink : styles.navLink}
              >
                🎙️ Interviews scheduled
              </button>
            </>
          )}
        </nav>

        <button onClick={logout} style={styles.logoutBtn}>
          🚪 Log Out
        </button>
      </div>

      {/* Main Content Area */}
      <div style={styles.content}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>
            {activeTab.replace('_', ' ').toUpperCase()}
          </h1>
          {user.role !== 'student' && (
            <button onClick={handleSync} disabled={loading} style={styles.syncBtn}>
              {loading ? 'Syncing...' : '🔄 Sync Placement Dataset'}
            </button>
          )}
        </header>

        {errorMsg && <div style={styles.errorAlert}>{errorMsg}</div>}
        {successMsg && <div style={styles.successAlert}>{successMsg}</div>}

        {syncResult && (
          <div className="glass-panel" style={styles.syncResultBox}>
            <h3>Synchronization Summary</h3>
            <p>Students: Fetched {syncResult.students.totalFetched} | Inserted {syncResult.students.inserted} | Duplicates {syncResult.students.duplicates} | Rejected {syncResult.students.rejected}</p>
            <p>Companies: Fetched {syncResult.companies.totalFetched} | Inserted {syncResult.companies.inserted} | Duplicates {syncResult.companies.duplicates} | Rejected {syncResult.companies.rejected}</p>
            <p>Drives: Fetched {syncResult.drives.totalFetched} | Inserted {syncResult.drives.inserted} | Duplicates {syncResult.drives.duplicates} | Rejected {syncResult.drives.rejected}</p>
            <button onClick={() => setSyncResult(null)} style={styles.closeSyncBtn}>Close</button>
          </div>
        )}

        {/* ============================================================
            TAB: PLACEMENT DRIVES (Student & Admin)
            ============================================================ */}
        {activeTab === 'drives' && (
          <div className="animate-fade-in">
            <div style={styles.tabActionHeader}>
              <h2>Active Drives</h2>
              {user.role !== 'student' && (
                <button onClick={() => setShowDriveModal(true)} style={styles.actionBtn}>
                  + Create New Drive
                </button>
              )}
            </div>

            <div style={styles.grid}>
              {drives.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No drives available.</p>
              ) : (
                drives.map((drive) => {
                  const companyObj = drive.company || {};
                  
                  // Check eligibility if student
                  let isEligible = true;
                  let eligibilityReason = '';
                  if (user.role === 'student' && user.studentRef) {
                    const studentCgpa = user.studentRef.cgpa;
                    const studentDept = user.studentRef.department;
                    
                    if (studentCgpa < companyObj.minimumCgpa) {
                      isEligible = false;
                      eligibilityReason = `CGPA too low (Requires ${companyObj.minimumCgpa})`;
                    } else if (companyObj.eligibleDepartments && !companyObj.eligibleDepartments.includes(studentDept)) {
                      isEligible = false;
                      eligibilityReason = `Dept not eligible (Eligible: ${companyObj.eligibleDepartments.join(', ')})`;
                    }
                  }

                  const hasApplied = applications.some(app => {
                    const appStudentId = app.student?._id || app.student;
                    const studentRefId = user.studentRef?._id || user.studentRef;
                    const appDriveId = app.drive?._id || app.drive;
                    return appStudentId === studentRefId && appDriveId === drive._id;
                  });

                  return (
                    <div key={drive._id} className="glass-card" style={styles.card}>
                      <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>{drive.title}</h3>
                        <span className={`badge badge-${drive.status === 'open' ? 'success' : 'danger'}`}>
                          {drive.status}
                        </span>
                      </div>
                      <p style={styles.cardDesc}>🏢 <strong>Company:</strong> {companyObj.name || 'N/A'}</p>
                      <p style={styles.cardDesc}>💼 <strong>Role:</strong> {companyObj.role || 'N/A'}</p>
                      <p style={styles.cardDesc}>💰 <strong>Package:</strong> {(companyObj.package / 100000).toFixed(1)} LPA</p>
                      <p style={styles.cardDesc}>📍 <strong>Mode/Location:</strong> {drive.mode} ({drive.location || 'N/A'})</p>
                      <p style={styles.cardDesc}>📌 <strong>Deadline:</strong> {new Date(drive.registrationDeadline).toLocaleDateString()}</p>
                      
                      {user.role === 'student' && (
                        <div style={styles.cardActionArea}>
                          {hasApplied ? (
                            <button disabled style={styles.appliedCardBtn}>Already Applied</button>
                          ) : !isEligible ? (
                            <button disabled title={eligibilityReason} style={styles.ineligibleCardBtn}>
                              Ineligible
                            </button>
                          ) : drive.status === 'closed' ? (
                            <button disabled style={styles.ineligibleCardBtn}>Drive Closed</button>
                          ) : (
                            <button onClick={() => handleApply(drive._id)} style={styles.applyCardBtn}>
                              Apply Now
                            </button>
                          )}
                          {!isEligible && <span style={styles.eligibilityText}>{eligibilityReason}</span>}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ============================================================
            TAB: MY APPLICATIONS (Student)
            ============================================================ */}
        {activeTab === 'my_applications' && user.role === 'student' && (
          <div className="animate-fade-in custom-table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>App ID</th>
                  <th>Drive Title</th>
                  <th>Company</th>
                  <th>Current Round</th>
                  <th>Applied At</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications
                  .filter(app => {
                    const studentId = app.student?._id || app.student;
                    const studentRefId = user.studentRef?._id || user.studentRef;
                    return studentId === studentRefId;
                  })
                  .map((app) => (
                    <tr key={app._id}>
                      <td>{app.applicationId}</td>
                      <td>{app.drive?.title || 'N/A'}</td>
                      <td>{app.drive?.company?.name || 'N/A'}</td>
                      <td>{app.currentRound}</td>
                      <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge badge-${
                          app.status === 'selected' ? 'success' :
                          app.status === 'shortlisted' ? 'info' :
                          app.status === 'rejected' ? 'danger' : 'warning'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================================
            TAB: ANALYTICS (Admin/Placement Officer)
            ============================================================ */}
        {activeTab === 'analytics' && user.role !== 'student' && (
          <div className="animate-fade-in">
            {/* Placements Stats cards */}
            {analytics.placements && (
              <div style={styles.statsContainer}>
                <div className="glass-card" style={styles.statsCard}>
                  <h4>Total Applications</h4>
                  <h2>{analytics.placements.totalApplications}</h2>
                </div>
                <div className="glass-card" style={styles.statsCard}>
                  <h4>Shortlisted</h4>
                  <h2 style={{ color: 'var(--secondary)' }}>{analytics.placements.shortlisted}</h2>
                </div>
                <div className="glass-card" style={styles.statsCard}>
                  <h4>Selected (Placed)</h4>
                  <h2 style={{ color: 'var(--success)' }}>{analytics.placements.selected}</h2>
                </div>
                <div className="glass-card" style={styles.statsCard}>
                  <h4>Rejected</h4>
                  <h2 style={{ color: 'var(--danger)' }}>{analytics.placements.rejected}</h2>
                </div>
              </div>
            )}

            <div style={styles.analyticsSection}>
              <h2>Department Performance</h2>
              <div className="custom-table-wrapper" style={{ marginTop: '12px' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Total Students</th>
                      <th>Placed Count</th>
                      <th>Placement Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.departments.map((dept) => (
                      <tr key={dept.department}>
                        <td>{dept.department}</td>
                        <td>{dept.totalStudents}</td>
                        <td>{dept.placedCount}</td>
                        <td>{dept.placementPercentage.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={styles.analyticsSection}>
              <h2>Company Recruiting Activity</h2>
              <div className="custom-table-wrapper" style={{ marginTop: '12px' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Role</th>
                      <th>Highest Package</th>
                      <th>Drives Hosted</th>
                      <th>Students Hired</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.companies.map((comp) => (
                      <tr key={comp.companyId}>
                        <td>{comp.name}</td>
                        <td>{comp.role}</td>
                        <td>{(comp.package / 100000).toFixed(1)} LPA</td>
                        <td>{comp.driveParticipationCount}</td>
                        <td>{comp.selectedStudentsCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB: STUDENTS (Admin/Placement Officer)
            ============================================================ */}
        {activeTab === 'students' && user.role !== 'student' && (
          <div className="animate-fade-in custom-table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Dept</th>
                  <th>CGPA</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((stud) => (
                  <tr key={stud._id}>
                    <td>{stud.studentId}</td>
                    <td>{stud.name}</td>
                    <td>{stud.email}</td>
                    <td>{stud.department}</td>
                    <td>{stud.cgpa.toFixed(2)}</td>
                    <td>
                      <span className={`badge badge-${
                        stud.status === 'placed' ? 'success' :
                        stud.status === 'active' ? 'info' : 'danger'
                      }`}>
                        {stud.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================================
            TAB: PARTNER COMPANIES (Admin/Placement Officer)
            ============================================================ */}
        {activeTab === 'companies' && user.role !== 'student' && (
          <div className="animate-fade-in">
            <div style={styles.tabActionHeader}>
              <h2>Registered Companies</h2>
              <button onClick={() => setShowCompanyModal(true)} style={styles.actionBtn}>
                + Register New Company
              </button>
            </div>

            <div className="custom-table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Company ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Package</th>
                    <th>Min CGPA</th>
                    <th>Eligible Depts</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((comp) => (
                    <tr key={comp._id}>
                      <td>{comp.companyId}</td>
                      <td>{comp.name}</td>
                      <td>{comp.role}</td>
                      <td>{(comp.package / 100000).toFixed(1)} LPA</td>
                      <td>{comp.minimumCgpa.toFixed(2)}</td>
                      <td>{comp.eligibleDepartments.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB: APPLICATIONS (Admin/Placement Officer)
            ============================================================ */}
        {activeTab === 'applications' && user.role !== 'student' && (
          <div className="animate-fade-in custom-table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>App ID</th>
                  <th>Student</th>
                  <th>Dept/CGPA</th>
                  <th>Drive Title</th>
                  <th>Current Round</th>
                  <th>Status Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td>{app.applicationId}</td>
                    <td>{app.student?.name || 'N/A'}</td>
                    <td>{app.student?.department || 'N/A'} ({app.student?.cgpa.toFixed(2)})</td>
                    <td>{app.drive?.title || 'N/A'}</td>
                    <td>{app.currentRound}</td>
                    <td>
                      <select
                        value={app.status}
                        onChange={(e) => handleAppStatusChange(app._id, e.target.value)}
                        style={styles.inlineSelect}
                      >
                        <option value="applied">Applied</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="selected">Selected</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================================
            TAB: INTERVIEWS (Admin/Placement Officer)
            ============================================================ */}
        {activeTab === 'interviews' && user.role !== 'student' && (
          <div className="animate-fade-in">
            <div style={styles.tabActionHeader}>
              <h2>Scheduled Interviews</h2>
              <button onClick={() => setShowInterviewModal(true)} style={styles.actionBtn}>
                🎙️ Schedule New Interview
              </button>
            </div>

            <div className="custom-table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Int ID</th>
                    <th>Student Name</th>
                    <th>Drive</th>
                    <th>Round</th>
                    <th>Interviewer</th>
                    <th>Scheduled Date</th>
                    <th>Result Action</th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map((int) => (
                    <tr key={int._id}>
                      <td>{int.interviewId}</td>
                      <td>{int.application?.student?.name || 'N/A'}</td>
                      <td>{int.application?.drive?.title || 'N/A'}</td>
                      <td>{int.round}</td>
                      <td>{int.interviewer}</td>
                      <td>{new Date(int.scheduledAt).toLocaleString()}</td>
                      <td>
                        <select
                          value={int.result}
                          onChange={(e) => handleInterviewResultUpdate(int._id, e.target.value)}
                          style={styles.inlineSelect}
                        >
                          <option value="pending">Pending</option>
                          <option value="pass">Pass</option>
                          <option value="fail">Fail</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          MODALS FOR CREATING PLACEMENT ASSETS
          ============================================================ */}

      {/* Company Modal */}
      {showCompanyModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modal}>
            <h2>Register Company</h2>
            <form onSubmit={handleAddCompanySubmit}>
              <div style={styles.formGroup}>
                <label>Company ID</label>
                <input type="text" value={companyForm.companyId} onChange={(e) => setCompanyForm({...companyForm, companyId: e.target.value})} required style={styles.modalInput} />
              </div>
              <div style={styles.formGroup}>
                <label>Company Name</label>
                <input type="text" value={companyForm.name} onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})} required style={styles.modalInput} />
              </div>
              <div style={styles.formGroup}>
                <label>Job Role</label>
                <input type="text" value={companyForm.role} onChange={(e) => setCompanyForm({...companyForm, role: e.target.value})} required style={styles.modalInput} />
              </div>
              <div style={styles.formGroup}>
                <label>Package (in Rs.)</label>
                <input type="number" value={companyForm.package} onChange={(e) => setCompanyForm({...companyForm, package: e.target.value})} required style={styles.modalInput} />
              </div>
              <div style={styles.formGroup}>
                <label>Min CGPA</label>
                <input type="number" step="0.01" value={companyForm.minimumCgpa} onChange={(e) => setCompanyForm({...companyForm, minimumCgpa: e.target.value})} required style={styles.modalInput} />
              </div>
              <div style={styles.formGroup}>
                <label>Eligible Depts (Comma separated)</label>
                <input type="text" value={companyForm.eligibleDepartments} onChange={(e) => setCompanyForm({...companyForm, eligibleDepartments: e.target.value})} required style={styles.modalInput} />
              </div>
              <div style={styles.formGroup}>
                <label>Drive Date</label>
                <input type="datetime-local" value={companyForm.driveDate} onChange={(e) => setCompanyForm({...companyForm, driveDate: e.target.value})} required style={styles.modalInput} />
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowCompanyModal(false)} style={styles.modalCancelBtn}>Cancel</button>
                <button type="submit" style={styles.modalSubmitBtn}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drive Modal */}
      {showDriveModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modal}>
            <h2>Create Drive</h2>
            <form onSubmit={handleAddDriveSubmit}>
              <div style={styles.formGroup}>
                <label>Drive ID</label>
                <input type="text" value={driveForm.driveId} onChange={(e) => setDriveForm({...driveForm, driveId: e.target.value})} required style={styles.modalInput} />
              </div>
              <div style={styles.formGroup}>
                <label>Company</label>
                <select value={driveForm.company} onChange={(e) => setDriveForm({...driveForm, company: e.target.value})} required style={styles.modalSelect}>
                  <option value="">Select Company</option>
                  {companies.map(c => <option key={c._id} value={c._id}>{c.name} - {c.role}</option>)}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label>Drive Title</label>
                <input type="text" value={driveForm.title} onChange={(e) => setDriveForm({...driveForm, title: e.target.value})} required style={styles.modalInput} />
              </div>
              <div style={styles.formGroup}>
                <label>Mode</label>
                <select value={driveForm.mode} onChange={(e) => setDriveForm({...driveForm, mode: e.target.value})} style={styles.modalSelect}>
                  <option value="on-campus">On Campus</option>
                  <option value="off-campus">Off Campus</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label>Location</label>
                <input type="text" value={driveForm.location} onChange={(e) => setDriveForm({...driveForm, location: e.target.value})} style={styles.modalInput} />
              </div>
              <div style={styles.formGroup}>
                <label>Registration Deadline</label>
                <input type="datetime-local" value={driveForm.registrationDeadline} onChange={(e) => setDriveForm({...driveForm, registrationDeadline: e.target.value})} required style={styles.modalInput} />
              </div>
              <div style={styles.formGroup}>
                <label>Rounds (Comma separated)</label>
                <input type="text" value={driveForm.rounds} onChange={(e) => setDriveForm({...driveForm, rounds: e.target.value})} style={styles.modalInput} />
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowDriveModal(false)} style={styles.modalCancelBtn}>Cancel</button>
                <button type="submit" style={styles.modalSubmitBtn}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interview Modal */}
      {showInterviewModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modal}>
            <h2>Schedule Interview</h2>
            <form onSubmit={handleScheduleInterviewSubmit}>
              <div style={styles.formGroup}>
                <label>Interview ID</label>
                <input type="text" value={interviewForm.interviewId} onChange={(e) => setInterviewForm({...interviewForm, interviewId: e.target.value})} required style={styles.modalInput} />
              </div>
              <div style={styles.formGroup}>
                <label>Application</label>
                <select value={interviewForm.application} onChange={(e) => setInterviewForm({...interviewForm, application: e.target.value})} required style={styles.modalSelect}>
                  <option value="">Select Application</option>
                  {applications.filter(a => a.status !== 'rejected').map(a => (
                    <option key={a._id} value={a._id}>
                      {a.student?.name} - {a.drive?.title} ({a.currentRound})
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label>Interviewer</label>
                <input type="text" value={interviewForm.interviewer} onChange={(e) => setInterviewForm({...interviewForm, interviewer: e.target.value})} required style={styles.modalInput} />
              </div>
              <div style={styles.formGroup}>
                <label>Round Name</label>
                <input type="text" value={interviewForm.round} onChange={(e) => setInterviewForm({...interviewForm, round: e.target.value})} required style={styles.modalInput} />
              </div>
              <div style={styles.formGroup}>
                <label>Scheduled Date & Time</label>
                <input type="datetime-local" value={interviewForm.scheduledAt} onChange={(e) => setInterviewForm({...interviewForm, scheduledAt: e.target.value})} required style={styles.modalInput} />
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowInterviewModal(false)} style={styles.modalCancelBtn}>Cancel</button>
                <button type="submit" style={styles.modalSubmitBtn}>Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg-primary)',
  },
  sidebar: {
    width: 'var(--sidebar-width)',
    borderRight: '1px solid var(--border-card)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    background: 'rgba(15, 23, 42, 0.4)',
    zIndex: 10,
  },
  sidebarHeader: {
    marginBottom: '32px',
  },
  brandName: {
    fontSize: '1.5rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #a78bfa 0%, #06b6d4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '16px',
  },
  profileBox: {
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-card)',
  },
  profileName: {
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  profileRole: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  navLink: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '12px 16px',
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'var(--transition)',
  },
  activeNavLink: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '12px 16px',
    background: 'rgba(139, 92, 246, 0.15)',
    borderLeft: '3px solid var(--primary)',
    borderTop: 'none',
    borderBottom: 'none',
    borderRight: 'none',
    color: 'var(--text-primary)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  logoutBtn: {
    padding: '12px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--danger)',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.875rem',
  },
  content: {
    marginLeft: 'var(--sidebar-width)',
    flex: 1,
    padding: '40px',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    borderBottom: '1px solid var(--border-card)',
    paddingBottom: '20px',
  },
  headerTitle: {
    fontSize: '1.75rem',
    fontWeight: '750',
    color: 'var(--text-primary)',
  },
  syncBtn: {
    padding: '10px 20px',
    background: 'rgba(6, 182, 212, 0.15)',
    border: '1px solid rgba(6, 182, 212, 0.3)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--secondary)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  tabActionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  actionBtn: {
    padding: '10px 18px',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(139, 92, 246, 0.2)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  card: {
    borderRadius: 'var(--radius-lg)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginBottom: '8px',
  },
  cardActionArea: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  applyCardBtn: {
    padding: '10px',
    background: 'var(--primary)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
  appliedCardBtn: {
    padding: '10px',
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--success)',
    fontWeight: '600',
    width: '100%',
  },
  ineligibleCardBtn: {
    padding: '10px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--danger)',
    fontWeight: '600',
    width: '100%',
  },
  eligibilityText: {
    fontSize: '0.75rem',
    color: 'var(--danger)',
    textAlign: 'center',
  },
  errorAlert: {
    padding: '12px',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--danger)',
    marginBottom: '20px',
  },
  successAlert: {
    padding: '12px',
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--success)',
    marginBottom: '20px',
  },
  syncResultBox: {
    padding: '16px',
    borderRadius: 'var(--radius-md)',
    marginBottom: '24px',
  },
  closeSyncBtn: {
    marginTop: '12px',
    padding: '6px 12px',
    background: 'none',
    border: '1px solid var(--border-card)',
    borderRadius: '4px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  statsCard: {
    padding: '20px',
    borderRadius: 'var(--radius-md)',
  },
  analyticsSection: {
    marginTop: '32px',
  },
  inlineSelect: {
    background: '#1e293b',
    border: '1px solid var(--border-card)',
    color: 'var(--text-primary)',
    padding: '6px 10px',
    borderRadius: '4px',
    outline: 'none',
    cursor: 'pointer',
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modal: {
    width: '100%',
    maxWidth: '500px',
    padding: '32px',
    borderRadius: 'var(--radius-lg)',
  },
  modalInput: {
    width: '100%',
    padding: '10px 14px',
    background: '#1e293b',
    border: '1px solid var(--border-card)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    outline: 'none',
    marginTop: '6px',
  },
  modalSelect: {
    width: '100%',
    padding: '10px 14px',
    background: '#1e293b',
    border: '1px solid var(--border-card)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    outline: 'none',
    marginTop: '6px',
    cursor: 'pointer',
  },
  formGroup: {
    marginBottom: '16px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
  },
  modalCancelBtn: {
    padding: '10px 18px',
    background: 'none',
    border: '1px solid var(--border-card)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  modalSubmitBtn: {
    padding: '10px 18px',
    background: 'var(--primary)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
  }
};

export default DashboardPage;
