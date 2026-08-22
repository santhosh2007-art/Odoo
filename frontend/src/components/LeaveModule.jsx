import React, { useState } from 'react';
import { Calendar, Plus, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

export default function LeaveModule({ user, leaveRequests, onApplyLeave, onApproveLeave, onRejectLeave }) {
  const isHR = user && (user.role === 'HR' || user.role === 'Admin');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Form state for leave application
  const [leaveForm, setLeaveForm] = useState({
    type: 'Paid Leave',
    startDate: '',
    endDate: '',
    remarks: '',
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!leaveForm.startDate || !leaveForm.endDate) return;

    onApplyLeave({
      type: leaveForm.type,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      remarks: leaveForm.remarks,
    });

    setLeaveForm({ type: 'Paid Leave', startDate: '', endDate: '', remarks: '' });
    setShowApplyModal(false);
  };

  const filteredRequests = leaveRequests.filter(req => {
    if (filterStatus === 'ALL') return true;
    return req.status === filterStatus;
  });

  return (
    <div className="page-wrapper">
      {/* Top Banner */}
      <div style={styles.topBanner} className="glass-panel">
        <div>
          <h2>Leave & Time-Off Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isHR 
              ? 'Review and manage employee leave applications and approval workflows'
              : 'Apply for paid/sick leave, track request statuses, and view remaining balances'}
          </p>
        </div>

        {!isHR && (
          <button onClick={() => setShowApplyModal(true)} className="btn-primary">
            <Plus size={18} /> Apply for Leave
          </button>
        )}
      </div>

      {/* Leave Balances Grid */}
      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div>
            <p style={styles.statLabel}>Paid Annual Leave</p>
            <h3 style={styles.statValue}>14 Days Available</h3>
            <p style={styles.statSub}>18 days total entitlement</p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
            <Calendar size={24} />
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div>
            <p style={styles.statLabel}>Sick Leave</p>
            <h3 style={styles.statValue}>8 Days Available</h3>
            <p style={styles.statSub}>2 days used this year</p>
          </div>
          <div className="stat-icon" style={{ background: 'var(--status-present-bg)', color: 'var(--status-present)' }}>
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div>
            <p style={styles.statLabel}>Unpaid Leave</p>
            <h3 style={styles.statValue}>0 Days Used</h3>
            <p style={styles.statSub}>Standard policy applies</p>
          </div>
          <div className="stat-icon" style={{ background: 'var(--status-halfday-bg)', color: 'var(--status-halfday)' }}>
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Main Leave Requests Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={styles.tableHeader}>
          <h3>{isHR ? 'Workforce Leave Requests' : 'My Leave Applications'}</h3>

          {/* Filter Status Pills */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['ALL', 'Pending', 'Approved', 'Rejected'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  ...styles.filterBtn,
                  ...(filterStatus === st ? styles.filterBtnActive : {}),
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Employee</th>
              <th style={styles.th}>Leave Type</th>
              <th style={styles.th}>Date Range</th>
              <th style={styles.th}>Remarks</th>
              <th style={styles.th}>Status</th>
              {isHR && <th style={styles.th}>HR Action</th>}
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map(req => (
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
                  <span className={`badge badge-${req.status === 'Approved' ? 'present' : req.status === 'Rejected' ? 'absent' : 'halfday'}`}>
                    {req.status}
                  </span>
                </td>
                {isHR && (
                  <td style={styles.td}>
                    {req.status === 'Pending' ? (
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
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Processed</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Apply for Leave Modal */}
      {showApplyModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal} className="glass-panel">
            <h3 style={{ marginBottom: '1.25rem' }}>Apply for Leave</h3>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Leave Type</label>
                <select
                  value={leaveForm.type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                  className="form-control"
                >
                  <option value="Paid Leave">Paid Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>End Date</label>
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    required
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Remarks / Reason</label>
                <textarea
                  rows="3"
                  placeholder="Explain reason for leave request..."
                  value={leaveForm.remarks}
                  onChange={(e) => setLeaveForm({ ...leaveForm, remarks: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Leave Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  topBanner: {
    padding: '1.5rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  statValue: {
    fontSize: '1.35rem',
    margin: '0.25rem 0',
  },
  statSub: {
    fontSize: '0.775rem',
    color: 'var(--text-secondary)',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  filterBtn: {
    padding: '0.4rem 0.85rem',
    borderRadius: '20px',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  filterBtnActive: {
    background: 'var(--accent-gradient)',
    color: '#ffffff',
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
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    width: '100%',
    maxWidth: '520px',
    padding: '2rem',
    borderRadius: 'var(--border-radius-lg)',
  },
};
