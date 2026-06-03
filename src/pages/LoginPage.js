import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const LoginPage = () => {
  const { login, loading, error } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ registerNo: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form);
    if (result.success) navigate('/dashboard');
  };

  return (
    <div data-testid="login-page" style={{ maxWidth: 400, margin: '80px auto', padding: 24 }}>
      <h1>Student Login</h1>
      {error && <p data-testid="error-msg" style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} data-testid="login-form">
        <div>
          <label>Register Number</label>
          <input
            data-testid="register-no-input"
            type="text"
            name="registerNo"
            value={form.registerNo}
            onChange={handleChange}
            required
            style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }}
          />
        </div>
        <div>
          <label>Password</label>
          <input
            data-testid="password-input"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }}
          />
        </div>
        <button
          data-testid="login-btn"
          type="submit"
          disabled={loading}
          style={{ padding: '10px 24px', cursor: 'pointer' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
