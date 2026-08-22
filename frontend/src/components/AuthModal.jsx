import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, CheckCircle, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    employeeId: '',
    email: '',
    password: '',
    name: '',
    role: 'Employee',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  // Password rules validation helper
  const evaluatePassword = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
  };

  const passwordRules = evaluatePassword(formData.password);
  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  const handleDemoLogin = async (roleType) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const email = roleType === 'HR' ? 'hr@dayflow.com' : 'employee@dayflow.com';
      const password = roleType === 'HR' ? 'Admin@1234' : 'Employee@1234';

      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        onLoginSuccess(json.data.user, json.data.token);
        onClose();
      } else {
        // Fallback for standalone demo mode
        const demoUser = roleType === 'HR'
          ? { id: 1, employeeId: 'EMP-HR-001', email: 'hr@dayflow.com', name: 'Sarah Jenkins (HR Manager)', role: 'HR', isVerified: true }
          : { id: 2, employeeId: 'EMP-DEV-101', email: 'employee@dayflow.com', name: 'Alex Rivera', role: 'Employee', isVerified: true };
        onLoginSuccess(demoUser, 'demo-jwt-token-12345');
        onClose();
      }
    } catch (err) {
      // Offline fallback
      const demoUser = roleType === 'HR'
        ? { id: 1, employeeId: 'EMP-HR-001', email: 'hr@dayflow.com', name: 'Sarah Jenkins (HR Manager)', role: 'HR', isVerified: true }
        : { id: 2, employeeId: 'EMP-DEV-101', email: 'employee@dayflow.com', name: 'Alex Rivera', role: 'Employee', isVerified: true };
      onLoginSuccess(demoUser, 'demo-jwt-token-12345');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (activeTab === 'signin') {
        const res = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });

        const json = await res.json();
        if (res.ok && json.success) {
          onLoginSuccess(json.data.user, json.data.token);
          onClose();
        } else {
          setErrorMsg(json.message || 'Sign in failed. Please check your credentials.');
        }
      } else {
        // Sign Up
        if (!isPasswordValid) {
          setErrorMsg('Please satisfy all password security requirements.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const json = await res.json();
        if (res.ok && json.success) {
          setSuccessMsg('Account created successfully! Verification URL provided.');
          // Auto verify in dev/demo
          if (json.data && json.data.verificationToken) {
            await fetch(`/api/auth/verify-email?token=${json.data.verificationToken}`);
          }
          setTimeout(() => {
            setActiveTab('signin');
            setSuccessMsg('');
          }, 1500);
        } else {
          setErrorMsg(json.message || 'Registration failed.');
        }
      }
    } catch (err) {
      setErrorMsg('Failed to connect to backend server. Operating in offline demo mode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} className="glass-panel">
        {/* Header */}
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>
            Day<span className="text-gradient">flow</span> Account Access
          </h3>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Quick Demo Login Bar */}
        <div style={styles.demoBar}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={14} color="#f59e0b" /> Quick Demo Login:
          </span>
          <button onClick={() => handleDemoLogin('HR')} style={styles.demoBtnHR}>
            HR Manager
          </button>
          <button onClick={() => handleDemoLogin('Employee')} style={styles.demoBtnEmp}>
            Employee
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={styles.tabContainer}>
          <button
            onClick={() => setActiveTab('signin')}
            style={{ ...styles.tab, ...(activeTab === 'signin' ? styles.tabActive : {}) }}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            style={{ ...styles.tab, ...(activeTab === 'signup' ? styles.tabActive : {}) }}
          >
            Create Account
          </button>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div style={styles.errorAlert}>
            <AlertCircle size={16} color="var(--status-absent)" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div style={styles.successAlert}>
            <CheckCircle size={16} color="var(--status-present)" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {activeTab === 'signup' && (
            <>
              <div className="form-group">
                <label>Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  placeholder="e.g. EMP-101"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Account Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="Employee">Employee (Regular Access)</option>
                  <option value="HR">HR Officer / Admin (Management Access)</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="user@dayflow.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          {/* Password Security Rules Indicator (for Sign Up) */}
          {activeTab === 'signup' && formData.password.length > 0 && (
            <div style={styles.rulesBox}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password Security Rules:</p>
              <div style={styles.rulesGrid}>
                <span style={passwordRules.length ? styles.ruleValid : styles.ruleInvalid}>✓ 8+ Chars</span>
                <span style={passwordRules.uppercase ? styles.ruleValid : styles.ruleInvalid}>✓ Uppercase</span>
                <span style={passwordRules.lowercase ? styles.ruleValid : styles.ruleInvalid}>✓ Lowercase</span>
                <span style={passwordRules.number ? styles.ruleValid : styles.ruleInvalid}>✓ Number</span>
                <span style={passwordRules.special ? styles.ruleValid : styles.ruleInvalid}>✓ Special Char</span>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Processing...' : activeTab === 'signin' ? 'Sign In to Dashboard' : 'Register Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    width: '100%',
    maxWidth: '460px',
    padding: '2rem',
    borderRadius: 'var(--border-radius-lg)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.25rem',
  },
  modalTitle: {
    fontSize: '1.35rem',
  },
  closeBtn: {
    background: 'transparent',
    padding: '0.25rem',
  },
  demoBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.25rem',
    background: 'rgba(245, 158, 11, 0.08)',
    border: '1px dashed rgba(245, 158, 11, 0.3)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.5rem 0.75rem',
  },
  demoBtnHR: {
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#a5b4fc',
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '0.25rem 0.6rem',
    borderRadius: '6px',
  },
  demoBtnEmp: {
    background: 'rgba(16, 185, 129, 0.2)',
    color: '#6ee7b7',
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '0.25rem 0.6rem',
    borderRadius: '6px',
  },
  tabContainer: {
    display: 'flex',
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '4px',
    borderRadius: 'var(--border-radius-sm)',
    marginBottom: '1.25rem',
  },
  tab: {
    flex: 1,
    padding: '0.6rem',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontWeight: '600',
    fontSize: '0.9rem',
    borderRadius: '8px',
  },
  tabActive: {
    background: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--status-absent-bg)',
    color: 'var(--status-absent)',
    padding: '0.75rem',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    marginBottom: '1rem',
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--status-present-bg)',
    color: 'var(--status-present)',
    padding: '0.75rem',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  rulesBox: {
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '0.65rem',
    borderRadius: 'var(--border-radius-sm)',
    marginBottom: '0.5rem',
  },
  rulesGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.35rem',
    fontSize: '0.725rem',
  },
  ruleValid: { color: 'var(--status-present)' },
  ruleInvalid: { color: 'var(--text-muted)' },
};
