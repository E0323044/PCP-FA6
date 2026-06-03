import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const LoginPage = () => {
  const { login, register, loading, error } = useApp();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    studentId: '',
    department: 'CSE',
    cgpa: '',
    graduationYear: 2026,
    phone: '',
  });

  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setMessage('');
    const result = await login(loginForm);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setFormError(result.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setMessage('');
    
    // Simple frontend validation
    if (registerForm.role === 'student') {
      const cgpaNum = Number(registerForm.cgpa);
      if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
        setFormError('CGPA must be between 0 and 10');
        return;
      }
    }

    const result = await register({
      ...registerForm,
      cgpa: registerForm.role === 'student' ? Number(registerForm.cgpa) : undefined,
      graduationYear: Number(registerForm.graduationYear),
    });

    if (result.success) {
      setMessage('Registration successful! Please login.');
      setIsRegister(false);
      setLoginForm({ email: registerForm.email, password: '' });
    } else {
      setFormError(result.message);
    }
  };

  return (
    <div data-testid="login-page" style={styles.container}>
      <div className="glass-card" style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Placement Portal</h1>
          <p style={styles.subtitle}>
            {isRegister ? 'Create an account to get started' : 'Sign in to access your dashboard'}
          </p>
        </div>

        {error && <div data-testid="error-msg" style={styles.errorAlert}>{error}</div>}
        {formError && <div style={styles.errorAlert}>{formError}</div>}
        {message && <div style={styles.successAlert}>{message}</div>}

        {!isRegister ? (
          <form onSubmit={handleLoginSubmit} data-testid="login-form">
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                data-testid="email-input"
                type="email"
                name="email"
                placeholder="you@university.com"
                value={loginForm.email}
                onChange={handleLoginChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                data-testid="password-input"
                type="password"
                name="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={handleLoginChange}
                required
                style={styles.input}
              />
            </div>

            <button
              data-testid="login-btn"
              type="submit"
              disabled={loading}
              style={styles.btn}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Arun Kumar"
                value={registerForm.name}
                onChange={handleRegisterChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="arun@mail.com"
                value={registerForm.email}
                onChange={handleRegisterChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={registerForm.password}
                onChange={handleRegisterChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Role</label>
              <select
                name="role"
                value={registerForm.role}
                onChange={handleRegisterChange}
                style={styles.select}
              >
                <option value="student">Student</option>
                <option value="placement_officer">Placement Officer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {registerForm.role === 'student' && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Student ID</label>
                  <input
                    type="text"
                    name="studentId"
                    placeholder="S101"
                    value={registerForm.studentId}
                    onChange={handleRegisterChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Department</label>
                  <select
                    name="department"
                    value={registerForm.department}
                    onChange={handleRegisterChange}
                    style={styles.select}
                  >
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    name="cgpa"
                    placeholder="8.50"
                    value={registerForm.cgpa}
                    onChange={handleRegisterChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Graduation Year</label>
                  <input
                    type="number"
                    name="graduationYear"
                    value={registerForm.graduationYear}
                    onChange={handleRegisterChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="9876543210"
                    value={registerForm.phone}
                    onChange={handleRegisterChange}
                    style={styles.input}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.btn, gridColumn: 'span 2' }}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
        )}

        <div style={styles.footer}>
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setFormError('');
              setMessage('');
            }}
            style={styles.toggleBtn}
          >
            {isRegister
              ? 'Already have an account? Sign In'
              : "Don't have an account? Register Here"}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '500px',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-card)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #a78bfa 0%, #06b6d4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
  },
  formGroup: {
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    padding: '12px 16px',
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid var(--border-card)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'var(--transition)',
  },
  select: {
    padding: '12px 16px',
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid var(--border-card)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
    cursor: 'pointer',
    width: '100%',
  },
  btn: {
    marginTop: '12px',
    padding: '14px',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontWeight: '700',
    fontSize: '0.875rem',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
    transition: 'var(--transition)',
    width: '100%',
  },
  errorAlert: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--danger)',
    padding: '12px',
    fontSize: '0.875rem',
    marginBottom: '20px',
    textAlign: 'center',
  },
  successAlert: {
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--success)',
    padding: '12px',
    fontSize: '0.875rem',
    marginBottom: '20px',
    textAlign: 'center',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  }
};

export default LoginPage;
