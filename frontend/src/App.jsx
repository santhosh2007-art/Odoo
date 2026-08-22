import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import AttendanceModule from './components/AttendanceModule';
import LeaveModule from './components/LeaveModule';
import ProfileModule from './components/ProfileModule';
import PayrollModule from './components/PayrollModule';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(true);

  // Default Logged In User State (Demo User)
  const [user, setUser] = useState({
    id: 1,
    employeeId: 'EMP-HR-001',
    name: 'Sarah Jenkins (HR Manager)',
    email: 'hr@dayflow.com',
    role: 'HR',
    isVerified: true,
  });

  const [token, setToken] = useState('demo-token-xyz');

  // Shared Leave Requests State
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 101,
      employeeId: 'EMP-DEV-101',
      employeeName: 'Alex Rivera',
      type: 'Paid Leave',
      startDate: '2026-08-25',
      endDate: '2026-08-28',
      remarks: 'Family vacation & personal time off',
      status: 'Pending',
    },
    {
      id: 102,
      employeeId: 'EMP-DES-201',
      employeeName: 'Emily Taylor',
      type: 'Sick Leave',
      startDate: '2026-08-20',
      endDate: '2026-08-21',
      remarks: 'Fever and medical rest',
      status: 'Approved',
    },
    {
      id: 103,
      employeeId: 'EMP-SLS-301',
      employeeName: 'Michael Scott',
      type: 'Unpaid Leave',
      startDate: '2026-09-01',
      endDate: '2026-09-05',
      remarks: 'Attending personal seminar',
      status: 'Pending',
    },
  ]);

  // Apply Theme Attribute to <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Toggle Role between HR and Employee for testing both perspective views
  const handleSwitchRole = () => {
    if (!user) return;
    const newRole = user.role === 'HR' || user.role === 'Admin' ? 'Employee' : 'HR';
    const newName = newRole === 'HR' ? 'Sarah Jenkins (HR Manager)' : 'Alex Rivera';
    const newEmpId = newRole === 'HR' ? 'EMP-HR-001' : 'EMP-DEV-101';
    const newEmail = newRole === 'HR' ? 'hr@dayflow.com' : 'employee@dayflow.com';

    setUser({
      ...user,
      role: newRole,
      name: newName,
      employeeId: newEmpId,
      email: newEmail,
    });
  };

  const handleLoginSuccess = (userObj, tokenStr) => {
    setUser(userObj);
    setToken(tokenStr);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setIsAuthModalOpen(true);
  };

  const handleApplyLeave = (newLeaveData) => {
    const newReq = {
      id: Date.now(),
      employeeId: user ? user.employeeId : 'EMP-DEV-101',
      employeeName: user ? user.name : 'Alex Rivera',
      type: newLeaveData.type,
      startDate: newLeaveData.startDate,
      endDate: newLeaveData.endDate,
      remarks: newLeaveData.remarks,
      status: 'Pending',
    };
    setLeaveRequests([newReq, ...leaveRequests]);
  };

  const handleApproveLeave = (id) => {
    setLeaveRequests(leaveRequests.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
  };

  const handleRejectLeave = (id) => {
    setLeaveRequests(leaveRequests.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
  };

  const handleToggleClock = () => {
    setIsClockedIn(prev => !prev);
  };

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            onNavigate={(tab) => setActiveTab(tab)}
            leaveRequests={leaveRequests}
            onApproveLeave={handleApproveLeave}
            onRejectLeave={handleRejectLeave}
            isClockedIn={isClockedIn}
            onToggleClock={handleToggleClock}
          />
        );
      case 'attendance':
        return (
          <AttendanceModule
            user={user}
            isClockedIn={isClockedIn}
            onToggleClock={handleToggleClock}
          />
        );
      case 'leave':
        return (
          <LeaveModule
            user={user}
            leaveRequests={leaveRequests}
            onApplyLeave={handleApplyLeave}
            onApproveLeave={handleApproveLeave}
            onRejectLeave={handleRejectLeave}
          />
        );
      case 'profile':
        return (
          <ProfileModule
            user={user}
            onUpdateUser={(updated) => setUser(updated)}
          />
        );
      case 'payroll':
        return <PayrollModule user={user} />;
      default:
        return (
          <Dashboard
            user={user}
            onNavigate={(tab) => setActiveTab(tab)}
            leaveRequests={leaveRequests}
            onApproveLeave={handleApproveLeave}
            onRejectLeave={handleRejectLeave}
            isClockedIn={isClockedIn}
            onToggleClock={handleToggleClock}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Header Bar */}
        <Navbar
          user={user}
          theme={theme}
          toggleTheme={toggleTheme}
          onSwitchRole={handleSwitchRole}
          openAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Active Tab Page Content */}
        {renderActiveModule()}
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
