import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle2, XCircle, AlertCircle, Filter, Search } from 'lucide-react';

export default function AttendanceModule({ user, isClockedIn, onToggleClock }) {
  const isHR = user && (user.role === 'HR' || user.role === 'Admin');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Live Timer
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock Weekly Log Data
  const myAttendanceLogs = [
    { date: '2026-08-22 (Today)', checkIn: isClockedIn ? '09:00 AM' : '--', checkOut: isClockedIn ? 'In Progress' : '--', hours: isClockedIn ? '4.5 hrs' : '0 hrs', status: isClockedIn ? 'Present' : 'Absent' },
    { date: '2026-08-21 (Fri)', checkIn: '08:55 AM', checkOut: '05:10 PM', hours: '8.2 hrs', status: 'Present' },
    { date: '2026-08-20 (Thu)', checkIn: '09:05 AM', checkOut: '05:00 PM', hours: '7.9 hrs', status: 'Present' },
    { date: '2026-08-19 (Wed)', checkIn: '09:00 AM', checkOut: '01:00 PM', hours: '4.0 hrs', status: 'Half-day' },
    { date: '2026-08-18 (Tue)', checkIn: '--', checkOut: '--', hours: '0 hrs', status: 'Leave' },
    { date: '2026-08-17 (Mon)', checkIn: '08:50 AM', checkOut: '05:15 PM', hours: '8.4 hrs', status: 'Present' },
  ];

  // Mock HR Workforce Attendance Log
  const allEmployeeLogs = [
    { id: 1, name: 'Alex Rivera', empId: 'EMP-DEV-101', dept: 'Engineering', checkIn: '08:55 AM', checkOut: 'In Progress', status: 'Present' },
    { id: 2, name: 'Sarah Jenkins', empId: 'EMP-HR-001', dept: 'Human Resources', checkIn: '08:45 AM', checkOut: 'In Progress', status: 'Present' },
    { id: 3, name: 'David Chen', empId: 'EMP-DEV-102', dept: 'Engineering', checkIn: '09:15 AM', checkOut: 'In Progress', status: 'Present' },
    { id: 4, name: 'Emily Taylor', empId: 'EMP-DES-201', dept: 'Design', checkIn: '--', checkOut: '--', status: 'Absent' },
    { id: 5, name: 'Michael Scott', empId: 'EMP-SLS-301', dept: 'Sales', checkIn: '09:00 AM', checkOut: '01:00 PM', status: 'Half-day' },
    { id: 6, name: 'Lisa Wong', empId: 'EMP-MKT-401', dept: 'Marketing', checkIn: '--', checkOut: '--', status: 'Leave' },
  ];

  const filteredLogs = allEmployeeLogs.filter((emp) => {
    const matchesFilter = filterStatus === 'ALL' || emp.status === filterStatus;
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || emp.empId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="page-wrapper">
      {/* Header & Clock Widget */}
      <div style={styles.topBanner} className="glass-panel">
        <div>
          <h2>Attendance Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isHR 
              ? 'Workforce Attendance Log & Real-time Check-in Monitor'
              : 'Track your daily check-in, check-out, and weekly time logs'}
          </p>
        </div>

        {/* Live Clock Card */}
        <div style={styles.timerCard} className="glass-panel">
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Time</p>
            <h3 style={{ fontSize: '1.4rem', fontFamily: 'monospace', color: 'var(--accent-primary)' }}>{time}</h3>
          </div>
          <button
            onClick={onToggleClock}
            className={isClockedIn ? 'btn-danger' : 'btn-success'}
            style={{ padding: '0.6rem 1.25rem' }}
          >
            {isClockedIn ? 'Clock Out' : 'Clock In'}
          </button>
        </div>
      </div>

      {isHR ? (
        /* ADMIN / HR ATTENDANCE VIEW (3.4.2) */
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={styles.filterBar}>
            {/* Search Box */}
            <div style={styles.searchBox}>
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search by name or Employee ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['ALL', 'Present', 'Absent', 'Half-day', 'Leave'].map((st) => (
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
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Check-In Time</th>
                <th style={styles.th}>Check-Out Time</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((emp) => (
                <tr key={emp.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: '600' }}>{emp.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.empId}</div>
                  </td>
                  <td style={styles.td}>{emp.dept}</td>
                  <td style={styles.td}>{emp.checkIn}</td>
                  <td style={styles.td}>{emp.checkOut}</td>
                  <td style={styles.td}>
                    <span className={`badge badge-${emp.status.toLowerCase()}`}>
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* EMPLOYEE ATTENDANCE VIEW (3.4.1) */
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Weekly Attendance Log</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Check-In</th>
                <th style={styles.th}>Check-Out</th>
                <th style={styles.th}>Hours Logged</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {myAttendanceLogs.map((log, idx) => (
                <tr key={idx} style={styles.tr}>
                  <td style={styles.td}>{log.date}</td>
                  <td style={styles.td}>{log.checkIn}</td>
                  <td style={styles.td}>{log.checkOut}</td>
                  <td style={styles.td}>{log.hours}</td>
                  <td style={styles.td}>
                    <span className={`badge badge-${log.status.toLowerCase()}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
  timerCard: {
    padding: '0.75rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(0, 0, 0, 0.15)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.5rem 1rem',
    width: '300px',
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    width: '100%',
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
};
