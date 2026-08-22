import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, DollarSign, Edit, Save, Shield, FileCheck } from 'lucide-react';

export default function ProfileModule({ user, onUpdateUser }) {
  const isHR = user && (user.role === 'HR' || user.role === 'Admin');
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user ? user.name : 'Alex Rivera',
    email: user ? user.email : 'employee@dayflow.com',
    employeeId: user ? user.employeeId : 'EMP-DEV-101',
    role: user ? user.role : 'Employee',
    phone: '+1 (555) 0144-892',
    address: '42 Innovation Drive, Suite 300, San Francisco, CA',
    jobTitle: isHR ? 'HR Manager' : 'Senior Software Engineer',
    department: isHR ? 'Human Resources' : 'Engineering & Development',
    dateOfJoining: '2024-03-15',
    salaryBase: isHR ? '$85,000 / year' : '$75,000 / year',
  });

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    if (onUpdateUser) {
      onUpdateUser({ ...user, name: profileData.name });
    }
  };

  return (
    <div className="page-wrapper">
      {/* Top Banner */}
      <div style={styles.topBanner} className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={styles.avatarLarge}>
            {profileData.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2>{profileData.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {profileData.jobTitle} • {profileData.department}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
              <span className={`badge ${isHR ? 'badge-hr' : 'badge-employee'}`}>
                {profileData.role}
              </span>
              <span className="badge badge-present">Account Verified</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className={isEditing ? 'btn-success' : 'btn-secondary'}
        >
          {isEditing ? <><Save size={18} /> Save Changes</> : <><Edit size={18} /> Edit Profile</>}
        </button>
      </div>

      {/* Profile Sections Grid */}
      <div style={styles.grid}>
        {/* Personal Details */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={styles.cardTitle}><User size={20} color="#818cf8" /> Personal Details</h3>
          
          <div style={styles.detailGroup}>
            <label style={styles.label}>Full Name</label>
            {isEditing && isHR ? (
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="form-control"
              />
            ) : (
              <p style={styles.value}>{profileData.name}</p>
            )}
          </div>

          <div style={styles.detailGroup}>
            <label style={styles.label}>Email Address</label>
            <p style={styles.value}>{profileData.email}</p>
          </div>

          <div style={styles.detailGroup}>
            <label style={styles.label}>Phone Number</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="form-control"
              />
            ) : (
              <p style={styles.value}>{profileData.phone}</p>
            )}
          </div>

          <div style={styles.detailGroup}>
            <label style={styles.label}>Home Address</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                className="form-control"
              />
            ) : (
              <p style={styles.value}>{profileData.address}</p>
            )}
          </div>
        </div>

        {/* Job Details */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={styles.cardTitle}><Briefcase size={20} color="#34d399" /> Job & Employment Information</h3>

          <div style={styles.detailGroup}>
            <label style={styles.label}>Employee ID</label>
            <p style={styles.value}>{profileData.employeeId}</p>
          </div>

          <div style={styles.detailGroup}>
            <label style={styles.label}>Job Title</label>
            {isEditing && isHR ? (
              <input
                type="text"
                value={profileData.jobTitle}
                onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })}
                className="form-control"
              />
            ) : (
              <p style={styles.value}>{profileData.jobTitle}</p>
            )}
          </div>

          <div style={styles.detailGroup}>
            <label style={styles.label}>Department</label>
            {isEditing && isHR ? (
              <input
                type="text"
                value={profileData.department}
                onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                className="form-control"
              />
            ) : (
              <p style={styles.value}>{profileData.department}</p>
            )}
          </div>

          <div style={styles.detailGroup}>
            <label style={styles.label}>Date of Joining</label>
            <p style={styles.value}>{profileData.dateOfJoining}</p>
          </div>
        </div>

        {/* Salary & Documents */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={styles.cardTitle}><DollarSign size={20} color="#f59e0b" /> Compensation & Documents</h3>

          <div style={styles.detailGroup}>
            <label style={styles.label}>Base Salary Structure</label>
            {isEditing && isHR ? (
              <input
                type="text"
                value={profileData.salaryBase}
                onChange={(e) => setProfileData({ ...profileData, salaryBase: e.target.value })}
                className="form-control"
              />
            ) : (
              <p style={styles.value}>{profileData.salaryBase}</p>
            )}
          </div>

          <div style={styles.detailGroup}>
            <label style={styles.label}>Verified Documents</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.35rem' }}>
              <div style={styles.docItem}>
                <FileCheck size={16} color="var(--status-present)" />
                <span>Employment Contract.pdf</span>
              </div>
              <div style={styles.docItem}>
                <FileCheck size={16} color="var(--status-present)" />
                <span>Tax W-2 Form (2025).pdf</span>
              </div>
              <div style={styles.docItem}>
                <FileCheck size={16} color="var(--status-present)" />
                <span>Identity Verification.pdf</span>
              </div>
            </div>
          </div>
        </div>
      </div>
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
  avatarLarge: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'var(--accent-gradient)',
    color: '#ffffff',
    fontSize: '1.75rem',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    fontSize: '1.1rem',
    marginBottom: '1.25rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid var(--glass-border)',
  },
  detailGroup: {
    marginBottom: '1rem',
  },
  label: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    display: 'block',
    marginBottom: '0.2rem',
  },
  value: {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  docItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    background: 'rgba(0, 0, 0, 0.15)',
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--glass-border)',
  },
};
