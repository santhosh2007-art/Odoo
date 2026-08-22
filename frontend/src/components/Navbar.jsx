import React from 'react';
import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  UserCheck, 
  ShieldCheck 
} from 'lucide-react';

export default function Navbar({ user, theme, toggleTheme, onSwitchRole, openAuthModal }) {
  return (
    <header style={styles.header} className="glass-panel">
      {/* Search Input */}
      <div style={styles.searchBox}>
        <Search size={18} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search employees, requests, or reports..."
          style={styles.searchInput}
        />
      </div>

      {/* Action Controls */}
      <div style={styles.actions}>
        {/* Role Switcher Pill */}
        {user ? (
          <button
            onClick={onSwitchRole}
            style={styles.roleBtn}
            title="Click to toggle between HR and Employee role views"
          >
            {user.role === 'HR' || user.role === 'Admin' ? (
              <ShieldCheck size={16} color="#818cf8" />
            ) : (
              <UserCheck size={16} color="#34d399" />
            )}
            <span>Role: <strong>{user.role}</strong></span>
          </button>
        ) : (
          <button onClick={openAuthModal} className="btn-primary">
            Sign In / Register
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={styles.iconBtn}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun size={20} color="#f59e0b" />
          ) : (
            <Moon size={20} color="#6366f1" />
          )}
        </button>

        {/* Notification Bell */}
        <button style={styles.iconBtn} title="Notifications">
          <Bell size={20} color="var(--text-secondary)" />
          <span style={styles.notificationDot} />
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    margin: '1rem 1rem 0 1rem',
    padding: '0.85rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(0, 0, 0, 0.15)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.5rem 1rem',
    width: '360px',
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    width: '100%',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  roleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(99, 102, 241, 0.12)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '20px',
    padding: '0.4rem 1rem',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  iconBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--status-absent)',
  },
};
