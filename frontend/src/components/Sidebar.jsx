import React from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  CalendarCheck, 
  UserCircle, 
  DollarSign, 
  LogOut, 
  Layers
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance Log', icon: Clock },
    { id: 'leave', label: 'Leave Requests', icon: CalendarCheck },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
    { id: 'payroll', label: 'Payroll & Salary', icon: DollarSign },
  ];

  return (
    <aside style={styles.sidebar} className="glass-panel">
      {/* Brand Logo */}
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>
          <Layers size={26} color="#ffffff" />
        </div>
        <div>
          <h2 style={styles.brandTitle}>
            Day<span className="text-gradient">flow</span>
          </h2>
          <p style={styles.brandTagline}>HRMS Platform</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              }}
            >
              <Icon size={20} color={isActive ? '#6366f1' : 'var(--text-secondary)'} />
              <span>{item.label}</span>
              {isActive && <span style={styles.activeDot} />}
            </button>
          );
        })}
      </nav>

      {/* User Status Card */}
      {user && (
        <div style={styles.userCard} className="glass-panel">
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={styles.userName}>{user.name}</h4>
              <p style={styles.userRole}>{user.role} • {user.employeeId}</p>
            </div>
          </div>
          <button onClick={onLogout} style={styles.logoutBtn} title="Sign Out">
            <LogOut size={18} color="var(--status-absent)" />
          </button>
        </div>
      )}
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '280px',
    height: 'calc(100vh - 2rem)',
    margin: '1rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '1.5rem',
    position: 'sticky',
    top: '1rem',
    zIndex: 100,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--glass-border)',
  },
  logoIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'var(--accent-gradient)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
  },
  brandTitle: {
    fontSize: '1.35rem',
    fontWeight: '800',
    lineHeight: 1.1,
  },
  brandTagline: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.85rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--text-secondary)',
    background: 'transparent',
    fontWeight: '600',
    fontSize: '0.95rem',
    width: '100%',
    position: 'relative',
    transition: 'all 0.2s ease',
  },
  navItemActive: {
    color: 'var(--text-primary)',
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
  },
  activeDot: {
    position: 'absolute',
    right: '12px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-primary)',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.85rem',
    marginTop: '1rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1,
    overflow: 'hidden',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'var(--accent-gradient-emerald)',
    color: '#ffffff',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    fontSize: '0.725rem',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    background: 'transparent',
    padding: '0.5rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
