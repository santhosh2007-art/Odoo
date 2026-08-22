import React, { useState } from 'react';
import { DollarSign, Download, FileText, CheckCircle2, TrendingUp, ShieldAlert, Edit, Save } from 'lucide-react';

export default function PayrollModule({ user }) {
  const isHR = user && (user.role === 'HR' || user.role === 'Admin');

  // Employee Payroll Records (HR View)
  const [payrollRecords, setPayrollRecords] = useState([
    { id: 1, empName: 'Alex Rivera', empId: 'EMP-DEV-101', role: 'Senior Software Engineer', baseSalary: 6250, bonus: 500, tax: 1250, netPay: 5500, status: 'Paid' },
    { id: 2, empName: 'Sarah Jenkins', empId: 'EMP-HR-001', role: 'HR Manager', baseSalary: 7083, bonus: 750, tax: 1416, netPay: 6417, status: 'Paid' },
    { id: 3, empName: 'David Chen', empId: 'EMP-DEV-102', role: 'Frontend Engineer', baseSalary: 5416, bonus: 400, tax: 1083, netPay: 4733, status: 'Paid' },
    { id: 4, empName: 'Emily Taylor', empId: 'EMP-DES-201', role: 'UI/UX Designer', baseSalary: 5200, bonus: 350, tax: 1040, netPay: 4510, status: 'Processing' },
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editSalary, setEditSalary] = useState('');

  const handleStartEdit = (rec) => {
    setEditingId(rec.id);
    setEditSalary(rec.baseSalary);
  };

  const handleSaveSalary = (id) => {
    setPayrollRecords(payrollRecords.map(r => {
      if (r.id === id) {
        const base = parseFloat(editSalary) || r.baseSalary;
        const tax = Math.round(base * 0.2);
        const net = base + r.bonus - tax;
        return { ...r, baseSalary: base, tax, netPay: net };
      }
      return r;
    }));
    setEditingId(null);
  };

  return (
    <div className="page-wrapper">
      {/* Top Banner */}
      <div style={styles.topBanner} className="glass-panel">
        <div>
          <h2>Payroll & Salary Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isHR 
              ? 'Admin Payroll Control. Review employee compensation, edit salary structures, and process monthly payouts.'
              : 'Read-only View of your monthly salary structure, allowances, tax deductions, and downloadable payslips.'}
          </p>
        </div>

        <button onClick={() => alert('Downloading August 2026 Salary Slip PDF...')} className="btn-primary">
          <Download size={18} /> Download Payslip
        </button>
      </div>

      {isHR ? (
        /* ADMIN PAYROLL CONTROL (3.6.2) */
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3>Workforce Payroll Master List</h3>
            <span className="badge badge-present">August 2026 Batch Verified</span>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Employee</th>
                <th style={styles.th}>Job Title</th>
                <th style={styles.th}>Monthly Base ($)</th>
                <th style={styles.th}>Allowances ($)</th>
                <th style={styles.th}>Tax Deduction ($)</th>
                <th style={styles.th}>Net Payout ($)</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>HR Action</th>
              </tr>
            </thead>
            <tbody>
              {payrollRecords.map((rec) => (
                <tr key={rec.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: '600' }}>{rec.empName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rec.empId}</div>
                  </td>
                  <td style={styles.td}>{rec.role}</td>
                  <td style={styles.td}>
                    {editingId === rec.id ? (
                      <input
                        type="number"
                        value={editSalary}
                        onChange={(e) => setEditSalary(e.target.value)}
                        style={{ width: '100px' }}
                        className="form-control"
                      />
                    ) : (
                      `$${rec.baseSalary.toLocaleString()}`
                    )}
                  </td>
                  <td style={styles.td}>+${rec.bonus}</td>
                  <td style={styles.td}>-${rec.tax}</td>
                  <td style={{ ...styles.td, fontWeight: '700', color: 'var(--accent-primary)' }}>
                    ${rec.netPay.toLocaleString()}
                  </td>
                  <td style={styles.td}>
                    <span className={`badge badge-${rec.status === 'Paid' ? 'present' : 'halfday'}`}>
                      {rec.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {editingId === rec.id ? (
                      <button onClick={() => handleSaveSalary(rec.id)} className="btn-success" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                        Save
                      </button>
                    ) : (
                      <button onClick={() => handleStartEdit(rec)} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                        Edit Salary
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* EMPLOYEE PAYROLL VIEW (3.6.1) */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Monthly Payslip Summary */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
              August 2026 Salary Breakdown
            </h3>

            <div style={styles.breakdownRow}>
              <span>Gross Base Salary</span>
              <strong>$6,250.00</strong>
            </div>
            <div style={styles.breakdownRow}>
              <span>Performance Bonus</span>
              <strong style={{ color: 'var(--status-present)' }}>+$500.00</strong>
            </div>
            <div style={styles.breakdownRow}>
              <span>Health & Medical Benefit</span>
              <strong style={{ color: 'var(--status-present)' }}>+$250.00</strong>
            </div>
            <div style={styles.breakdownRow}>
              <span>Income Tax Withholding</span>
              <strong style={{ color: 'var(--status-absent)' }}>-$1,250.00</strong>
            </div>
            <div style={styles.breakdownRow}>
              <span>Social Security / Provident Fund</span>
              <strong style={{ color: 'var(--status-absent)' }}>-$250.00</strong>
            </div>

            <div style={{ ...styles.breakdownRow, borderTop: '2px solid var(--glass-border)', paddingTop: '0.85rem', marginTop: '0.85rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Net Take-Home Pay</span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--status-present)' }}>$5,500.00</span>
            </div>
          </div>

          {/* Payslip History List */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
              Payslip History
            </h3>

            {[
              { month: 'August 2026', amount: '$5,500.00', status: 'Paid on Aug 01' },
              { month: 'July 2026', amount: '$5,500.00', status: 'Paid on Jul 01' },
              { month: 'June 2026', amount: '$5,500.00', status: 'Paid on Jun 01' },
              { month: 'May 2026', amount: '$5,250.00', status: 'Paid on May 01' },
            ].map((item, idx) => (
              <div key={idx} style={styles.historyRow}>
                <div>
                  <div style={{ fontWeight: '600' }}>{item.month}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.status}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <strong style={{ fontSize: '1rem' }}>{item.amount}</strong>
                  <button
                    onClick={() => alert(`Downloading PDF payslip for ${item.month}...`)}
                    className="btn-secondary"
                    style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                  >
                    PDF
                  </button>
                </div>
              </div>
            ))}
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
  breakdownRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.65rem 0',
    fontSize: '0.95rem',
  },
  historyRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
};
