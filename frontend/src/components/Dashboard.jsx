import React from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ArrowUpRight,
  Briefcase,
  DollarSign
} from 'lucide-react';

export default function Dashboard({ user, onNavigate, leaveRequests, onApproveLeave, onRejectLeave, isClockedIn, onToggleClock }) {
  const isHR = user && (user.role === 'HR' || user.role === 'Admin');

  // Pending Leave Requests for HR Approval
  const pendingLeaves = leaveRequests.filter(r => r.status === 'Pending');

  return (
    <div className="page-wrapper">
      {/* Hero Welcome Banner */}
      <div style={styles.heroBanner} className="glass-panel">
        <div>
          <div style={styles.heroBadge}>
            <span className="pulse-dot" />
            <span>Dayflow System Online</span>
          </div>
          <h1 style={styles.heroTitle}>
            Welcome back, <span className="text-gradient">{user ? user.name : 'Guest User'}</span>!
          </h1>
          <p style={styles.heroSub}>
            {isHR 
              ? 'HR Operations Command Center. Manage employee attendance, review leave approvals, and oversee payroll.'
              : 'Your personal HR hub. Clock in/out, view your time logs, apply for leave, and check salary details.'}
          </p>
        </div>

        {/* Hero Clock Action Card */}
        <div style={styles.clockCard} className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock size={24} color={isClockedIn ? 'var(--status-present)' : 'var(--text-muted)'} />
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily Attendance Status</p>
              <h4 style={{ fontSize: '1rem', color: isClockedIn ? 'var(--status-present)' : 'var(--text-secondary)' }}>
                {isClockedIn ? 'Currently Clocked In' : 'Clocked Out'}
              </h4>
            </div>
          </div>
          <button
            onClick={onToggleClock}
            className={isClockedIn ? 'btn-danger' : 'btn-success'}
            style={{ width: '100%', marginTop: '0.75rem' }}
          >
            {isClockedIn ? 'Check Out' : 'Check In Now'}
          </button>
        </div>
      </div>

      {/* Role-Based Dashboard View */}
      {isHR ? (
        /* HR / ADMIN DASHBOARD (3.2.2) */
        <div>
          {/* Stats Summary Grid */}
          <div className="stats-grid">
            <div className="stat-card glass-panel">
              <div>
                <p style={styles.statLabel}>Total Workforce</p>
                <h3 style={styles.statValue}>148</h3>
                <p style={styles.statSub}>+4 onboarded this month</p>
              </div>
              <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
                <Users size={26} />
              </div>
            </div>

            <div className="stat-card glass-panel">
              <div>
                <p style={styles.statLabel}>Present Today</p>
                <h3 style={styles.statValue}>132</h3>
                <p style={styles.statSub}><span style={{ color: 'var(--status-present)' }}>89.1%</span> attendance rate</p>
              </div>
              <div className="stat-icon" style={{ background: 'var(--status-present-bg)', color: 'var(--status-present)' }}>
                <UserCheck size={26} />
              </div>
            </div>

            <div className="stat-card glass-panel">
              <div>
                <p style={styles.statLabel}>Pending Leave Approvals</p>
                <h3 style={styles.statValue}>{pendingLeaves.length}</h3>
                <p style={styles.statSub}>Requires HR action</p>
              </div>
              <div className="stat-icon" style={{ background: 'var(--status-halfday-bg)', color: 'var(--status-halfday)' }}>
                <AlertCircle size={26} />
              </div>
            </div>

            <div className="stat-card glass-panel">
              <div>
                <p style={styles.statLabel}>Payroll Status</p>
                <h3 style={styles.statValue}>$184.5k</h3>
                <p style={styles.statSub}>August batch verified</p>
              </div>
              <div className="stat-icon" style={{ background: 'var(--status-leave-bg)', color: 'var(--status-leave)' }}>
                <DollarSign size={26} />
              </div>
            </div>
          </div>

          {/* HR Pending Leave Approvals Section */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>Pending Leave Approvals</h2>
                <p style={styles.sectionSub}>Review and act on leave applications from employees</p>
              </div>
              <button onClick={() => onNavigate('leave')} className="btn-secondary">
                View All Requests <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
              {pendingLeaves.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <CheckCircle size={36} color="var(--status-present)" style={{ marginBottom: '0.5rem' }} />
                  <p>All leave requests have been reviewed!</p>
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Employee</th>
                      <th style={styles.th}>Leave Type</th>
                      <th style={styles.th}>Date Range</th>
                      <th style={styles.th}>Remarks</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingLeaves.map((req) => (
                      <tr key={req.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={{ fontWeight: '600' }}>{req.employeeName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.employeeId}</div>
                        </td>
                        <td style={styles.td}>
                          <span className="badge badge-halfday">{req.type}</span>
                        </td>
                        <td style={styles.td}>{req.startDate} to {req.endDate}</td>
                        <td style={styles.td}>{req.remarks || 'No remarks'}</td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => onApproveLeave(req.id)}
                              className="btn-success"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => onRejectLeave(req.id)}
                              className="btn-danger"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* EMPLOYEE DASHBOARD (3.2.1) */
        <div>
          {/* Stats Summary Grid */}
          <div className="stats-grid">
            <div className="stat-card glass-panel">
              <div>
                <p style={styles.statLabel}>Available Paid Leave</p>
                <h3 style={styles.statValue}>14 Days</h3>
                <p style={styles.statSub}>4 days taken this year</p>
              </div>
              <div className="stat-icon" style={{ background: 'var(--status-present-bg)', color: 'var(--status-present)' }}>
                <Calendar size={26} />
              </div>
            </div>

            <div className="stat-card glass-panel">
              <div>
                <p style={styles.statLabel}>Hours Worked This Week</p>
                <h3 style={styles.statValue}>38.5 hrs</h3>
                <p style={styles.statSub}>On track for 40h goal</p>
              </div>
              <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
                <Clock size={26} />
              </div>
            </div>

            <div className="stat-card glass-panel">
              <div>
                <p style={styles.statLabel}>Monthly Attendance</p>
                <h3 style={styles.statValue}>96%</h3>
                <p style={styles.statSub}>19 Present • 1 Leave</p>
              </div>
              <div className="stat-icon" style={{ background: 'var(--status-leave-bg)', color: 'var(--status-leave)' }}>
                <TrendingUp size={26} />
              </div>
            </div>

            <div className="stat-card glass-panel">
              <div>
                <p style={styles.statLabel}>Job Title</p>
                <h3 style={{ fontSize: '1.25rem', marginTop: '0.35rem' }}>Software Engineer</h3>
                <p style={styles.statSub}>Engineering Dept</p>
              </div>
              <div className="stat-icon" style={{ background: 'var(--status-halfday-bg)', color: 'var(--status-halfday)' }}>
                <Briefcase size={26} />
              </div>
            </div>
          </div>

          {/* Quick Access Cards */}
          <div style={styles.quickGrid}>
            <div
              onClick={() => onNavigate('attendance')}
              className="glass-panel"
              style={styles.quickCard}
            >
              <Clock size={32} color="#818cf8" />
              <div>
                <h4>Attendance Tracker</h4>
                <p style={styles.quickSub}>Log daily check-ins, view weekly time logs</p>
              </div>
            </div>

            <div
              onClick={() => onNavigate('leave')}
              className="glass-panel"
              style={styles.quickCard}
            >
              <Calendar size={32} color="#34d399" />
              <div>
                <h4>Apply for Leave</h4>
                <p style={styles.quickSub}>Submit paid/sick leave applications</p>
              </div>
            </div>

            <div
              onClick={() => onNavigate('payroll')}
              className="glass-panel"
              style={styles.quickCard}
            >
              <DollarSign size={32} color="#f59e0b" />
              <div>
                <h4>View Salary & Payslips</h4>
                <p style={styles.quickSub}>Check Monthly compensation structure</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  heroBanner: {
    padding: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '2rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#6ee7b7',
    padding: '0.35rem 0.85rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
  },
  heroTitle: {
    fontSize: '1.85rem',
    marginBottom: '0.4rem',
  },
  heroSub: {
    color: 'var(--text-secondary)',
    maxWidth: '640px',
    fontSize: '0.95rem',
  },
  clockCard: {
    padding: '1.25rem',
    minWidth: '240px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  sectionSub: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  statValue: {
    fontSize: '1.65rem',
    margin: '0.25rem 0',
  },
  statSub: {
    fontSize: '0.775rem',
    color: 'var(--text-secondary)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '0.85rem 1rem',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    borderBottom: '1px solid var(--glass-border)',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  td: {
    padding: '0.85rem 1rem',
    fontSize: '0.9rem',
  },
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  quickCard: {
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  quickSub: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginTop: '0.2rem',
  },
};
