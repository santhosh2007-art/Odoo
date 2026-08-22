/**
 * Dayflow HRMS - Frontend Application Controller
 * Handles REST API communication with Spring Boot backend, client-side caching/state,
 * role-based routing (Admin vs Employee/Pay User), and dynamic UI rendering.
 */

// Global State
let currentUser = null;
let currentTab = 'dashboard';
let activeEmployeesCache = [];
let punchActionType = 'IN';

// Demo Mock Data Cache (used for instant reactive rendering and API integration)
const DEFAULT_ACCOUNTS = {
  'admin@dayflow.com': {
    id: 1,
    employeeId: 'EMP-HR-001',
    email: 'admin@dayflow.com',
    fullName: 'Eleanor Vance',
    role: 'ROLE_ADMIN',
    jobTitle: 'Head of People & HR Operations',
    department: 'Human Resources',
    profilePicUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    phone: '+1 (555) 019-2834',
    address: '450 Innovation Way, Suite 800, San Francisco, CA',
    dateOfJoining: '2022-01-15',
    documents: 'HR_Policy_Handbook.pdf, Employment_Contract.pdf',
    about: 'Experienced People Leader dedicated to building high-performing, inclusive work cultures.'
  },
  'alex.morgan@dayflow.com': {
    id: 2,
    employeeId: 'EMP-DEV-101',
    email: 'alex.morgan@dayflow.com',
    fullName: 'Alex Morgan',
    role: 'ROLE_EMPLOYEE',
    jobTitle: 'Senior Backend Engineer',
    department: 'Engineering',
    profilePicUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    phone: '+1 (555) 342-8921',
    address: '742 Evergreen Terrace, San Francisco, CA',
    dateOfJoining: '2023-03-01',
    documents: 'NDA_Agreement.pdf, Offer_Letter_AlexMorgan.pdf, Tax_Declaration_Form16.pdf',
    about: 'Passionate distributed systems engineer building resilient cloud architectures.'
  },
  'sarah.chen@dayflow.com': {
    id: 3,
    employeeId: 'EMP-DES-102',
    email: 'sarah.chen@dayflow.com',
    fullName: 'Sarah Chen',
    role: 'ROLE_EMPLOYEE',
    jobTitle: 'Lead Product Designer',
    department: 'Product & Design',
    profilePicUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    phone: '+1 (555) 781-9023',
    address: '120 Market St, Apt 4B, San Francisco, CA',
    dateOfJoining: '2023-06-12',
    documents: 'NDA_Signed.pdf, Portfolio_Review.pdf',
    about: 'Crafting intuitive, accessible human-centered digital experiences.'
  },
  'david.kim@dayflow.com': {
    id: 4,
    employeeId: 'EMP-OPS-103',
    email: 'david.kim@dayflow.com',
    fullName: 'David Kim',
    role: 'ROLE_EMPLOYEE',
    jobTitle: 'Site Reliability Engineer',
    department: 'Infrastructure',
    profilePicUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    phone: '+1 (555) 438-1129',
    address: '88 King Street, San Francisco, CA',
    dateOfJoining: '2024-01-10',
    documents: 'Cloud_Security_Clearance.pdf',
    about: 'Kubernetes enthusiast ensuring five nines reliability.'
  }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  startLiveClock();
  
  // Check stored session or load default Admin account
  const storedUser = localStorage.getItem('dayflow_user');
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
    } catch (e) {
      currentUser = DEFAULT_ACCOUNTS['admin@dayflow.com'];
    }
  } else {
    currentUser = DEFAULT_ACCOUNTS['admin@dayflow.com'];
    localStorage.setItem('dayflow_user', JSON.stringify(currentUser));
  }

  updateHeaderUI();
  setupSidebarNav();
  loadCurrentTab();
});

// Live Clock in Sidebar
function startLiveClock() {
  const timeEl = document.getElementById('live-clock-time');
  const dateEl = document.getElementById('live-clock-date');

  function update() {
    const now = new Date();
    if (timeEl) timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }
  update();
  setInterval(update, 1000);
}

// Update Top Header UI according to active user
function updateHeaderUI() {
  if (!currentUser) return;

  const nameEl = document.getElementById('nav-user-name');
  const emailEl = document.getElementById('nav-user-email');
  const avatarEl = document.getElementById('nav-user-avatar');
  const badgeEl = document.getElementById('nav-role-badge');
  const badgeText = document.getElementById('nav-role-text');
  const switchSelect = document.getElementById('user-quick-switch');

  if (nameEl) nameEl.textContent = currentUser.fullName || currentUser.email;
  if (emailEl) emailEl.textContent = currentUser.email;
  if (avatarEl) avatarEl.src = currentUser.profilePicUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';

  const isAdmin = currentUser.role === 'ROLE_ADMIN';
  if (badgeEl && badgeText) {
    if (isAdmin) {
      badgeEl.className = 'px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1.5 shadow-sm';
      badgeText.textContent = 'Admin / HR Officer';
      badgeEl.querySelector('i').className = 'fa-solid fa-shield-halved';
    } else {
      badgeEl.className = 'px-3 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1.5 shadow-sm';
      badgeText.textContent = 'Employee (Pay User)';
      badgeEl.querySelector('i').className = 'fa-solid fa-user';
    }
  }

  if (switchSelect) {
    switchSelect.value = currentUser.email;
  }
}

// Configure Sidebar Navigation items dynamically based on active user Role
function setupSidebarNav() {
  const navContainer = document.getElementById('sidebar-nav');
  if (!navContainer) return;

  const isAdmin = currentUser && currentUser.role === 'ROLE_ADMIN';

  if (isAdmin) {
    navContainer.innerHTML = `
      <button onclick="switchTab('dashboard')" class="sidebar-item ${currentTab === 'dashboard' ? 'active' : ''} w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-purple-50 hover:text-brand-700 transition">
        <i class="fa-solid fa-chart-pie w-5 text-center text-sm ${currentTab === 'dashboard' ? 'text-brand-700' : 'text-slate-400'}"></i>
        <span>Dashboard & KPIs</span>
      </button>
      <button onclick="switchTab('employees')" class="sidebar-item ${currentTab === 'employees' ? 'active' : ''} w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-purple-50 hover:text-brand-700 transition">
        <i class="fa-solid fa-users w-5 text-center text-sm ${currentTab === 'employees' ? 'text-brand-700' : 'text-slate-400'}"></i>
        <span>Employee Directory</span>
      </button>
      <button onclick="switchTab('attendance')" class="sidebar-item ${currentTab === 'attendance' ? 'active' : ''} w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-purple-50 hover:text-brand-700 transition">
        <i class="fa-regular fa-clock w-5 text-center text-sm ${currentTab === 'attendance' ? 'text-brand-700' : 'text-slate-400'}"></i>
        <span>Attendance Matrix</span>
      </button>
      <button onclick="switchTab('leaves')" class="sidebar-item ${currentTab === 'leaves' ? 'active' : ''} w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-purple-50 hover:text-brand-700 transition">
        <i class="fa-solid fa-plane-departure w-5 text-center text-sm ${currentTab === 'leaves' ? 'text-brand-700' : 'text-slate-400'}"></i>
        <span>Leave Approvals</span>
      </button>
      <button onclick="switchTab('payroll')" class="sidebar-item ${currentTab === 'payroll' ? 'active' : ''} w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-purple-50 hover:text-brand-700 transition">
        <i class="fa-solid fa-money-check-dollar w-5 text-center text-sm ${currentTab === 'payroll' ? 'text-brand-700' : 'text-slate-400'}"></i>
        <span>Payroll Control</span>
      </button>
    `;
  } else {
    // Employee / Pay User Navigation
    navContainer.innerHTML = `
      <button onclick="switchTab('dashboard')" class="sidebar-item ${currentTab === 'dashboard' ? 'active' : ''} w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-teal-50 hover:text-tealbrand-700 transition">
        <i class="fa-solid fa-house w-5 text-center text-sm ${currentTab === 'dashboard' ? 'text-tealbrand-700' : 'text-slate-400'}"></i>
        <span>My Dashboard</span>
      </button>
      <button onclick="switchTab('profile')" class="sidebar-item ${currentTab === 'profile' ? 'active' : ''} w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-teal-50 hover:text-tealbrand-700 transition">
        <i class="fa-solid fa-id-card w-5 text-center text-sm ${currentTab === 'profile' ? 'text-tealbrand-700' : 'text-slate-400'}"></i>
        <span>My Profile</span>
      </button>
      <button onclick="switchTab('attendance')" class="sidebar-item ${currentTab === 'attendance' ? 'active' : ''} w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-teal-50 hover:text-tealbrand-700 transition">
        <i class="fa-regular fa-calendar-check w-5 text-center text-sm ${currentTab === 'attendance' ? 'text-tealbrand-700' : 'text-slate-400'}"></i>
        <span>My Attendance</span>
      </button>
      <button onclick="switchTab('leaves')" class="sidebar-item ${currentTab === 'leaves' ? 'active' : ''} w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-teal-50 hover:text-tealbrand-700 transition">
        <i class="fa-solid fa-plane-departure w-5 text-center text-sm ${currentTab === 'leaves' ? 'text-tealbrand-700' : 'text-slate-400'}"></i>
        <span>Apply / View Leaves</span>
      </button>
      <button onclick="switchTab('payroll')" class="sidebar-item ${currentTab === 'payroll' ? 'active' : ''} w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-teal-50 hover:text-tealbrand-700 transition">
        <i class="fa-solid fa-file-invoice-dollar w-5 text-center text-sm ${currentTab === 'payroll' ? 'text-tealbrand-700' : 'text-slate-400'}"></i>
        <span>Salary & Payslips</span>
      </button>
    `;
  }

  // Highlight active style
  document.querySelectorAll('.sidebar-item').forEach(btn => {
    if (btn.classList.contains('active')) {
      if (isAdmin) {
        btn.classList.add('bg-purple-100', 'text-brand-800', 'font-bold');
      } else {
        btn.classList.add('bg-teal-100', 'text-teal-900', 'font-bold');
      }
    }
  });
}

function switchTab(tab) {
  currentTab = tab;
  setupSidebarNav();
  loadCurrentTab();
}

function loadCurrentTab() {
  const container = document.getElementById('main-content');
  if (!container) return;

  const isAdmin = currentUser && currentUser.role === 'ROLE_ADMIN';

  if (isAdmin) {
    switch (currentTab) {
      case 'dashboard': renderAdminDashboard(container); break;
      case 'employees': renderAdminEmployees(container); break;
      case 'attendance': renderAdminAttendance(container); break;
      case 'leaves': renderAdminLeaves(container); break;
      case 'payroll': renderAdminPayroll(container); break;
      default: renderAdminDashboard(container);
    }
  } else {
    switch (currentTab) {
      case 'dashboard': renderEmployeeDashboard(container); break;
      case 'profile': renderEmployeeProfile(container); break;
      case 'attendance': renderEmployeeAttendance(container); break;
      case 'leaves': renderEmployeeLeaves(container); break;
      case 'payroll': renderEmployeePayroll(container); break;
      default: renderEmployeeDashboard(container);
    }
  }
}

// =========================================================================
// ADMIN VIEWS
// =========================================================================

async function renderAdminDashboard(container) {
  container.innerHTML = `
    <!-- Top Greeting Banner -->
    <div class="bg-gradient-to-r from-brand-700 via-brand-600 to-purple-800 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-xs">Admin Workspace</span>
        </div>
        <h1 class="text-2xl font-bold mt-1">Welcome back, ${currentUser.fullName}! 👋</h1>
        <p class="text-xs text-purple-100 mt-1">Here is what is happening across Dayflow HR operations today.</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="switchTab('leaves')" class="px-4 py-2 bg-white text-brand-700 font-semibold rounded-xl text-xs hover:bg-purple-50 transition shadow-sm flex items-center gap-1.5">
          <i class="fa-solid fa-list-check"></i> Pending Approvals
        </button>
      </div>
    </div>

    <!-- Metric KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="odoo-card p-5 border-l-4 border-l-purple-500">
        <div class="flex justify-between items-center text-slate-400 mb-2">
          <span class="text-xs font-bold uppercase tracking-wider">Total Headcount</span>
          <i class="fa-solid fa-users text-purple-500"></i>
        </div>
        <div class="text-2xl font-bold text-slate-800">4 Active</div>
        <p class="text-[11px] text-slate-400 mt-1">Across 3 core departments</p>
      </div>

      <div class="odoo-card p-5 border-l-4 border-l-emerald-500">
        <div class="flex justify-between items-center text-slate-400 mb-2">
          <span class="text-xs font-bold uppercase tracking-wider">Present Today</span>
          <i class="fa-solid fa-user-check text-emerald-500"></i>
        </div>
        <div class="text-2xl font-bold text-emerald-600">3 / 4 (75%)</div>
        <p class="text-[11px] text-emerald-700 mt-1">1 Employee on approved leave</p>
      </div>

      <div class="odoo-card p-5 border-l-4 border-l-amber-500">
        <div class="flex justify-between items-center text-slate-400 mb-2">
          <span class="text-xs font-bold uppercase tracking-wider">Leave Requests</span>
          <i class="fa-solid fa-clock text-amber-500"></i>
        </div>
        <div class="text-2xl font-bold text-amber-600">1 Pending</div>
        <p class="text-[11px] text-amber-700 mt-1">Requires HR Officer review</p>
      </div>

      <div class="odoo-card p-5 border-l-4 border-l-teal-500">
        <div class="flex justify-between items-center text-slate-400 mb-2">
          <span class="text-xs font-bold uppercase tracking-wider">Monthly Payroll</span>
          <i class="fa-solid fa-dollar-sign text-teal-500"></i>
        </div>
        <div class="text-2xl font-bold text-slate-800">$26,800.00</div>
        <p class="text-[11px] text-slate-400 mt-1">Net disbursement: $21,154.00</p>
      </div>
    </div>

    <!-- Quick Action & Recent Approvals Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 odoo-card p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
            <i class="fa-solid fa-user-clock text-brand-500"></i>
            <span>Staff Attendance Overview (Today)</span>
          </h3>
          <button onclick="switchTab('attendance')" class="text-xs text-brand-600 font-semibold hover:underline">View All &rarr;</button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase font-semibold">
              <tr>
                <th class="p-3">Employee</th>
                <th class="p-3">Department</th>
                <th class="p-3">Check In</th>
                <th class="p-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr>
                <td class="p-3 flex items-center gap-2 font-medium">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" class="w-7 h-7 rounded-full object-cover">
                  Alex Morgan
                </td>
                <td class="p-3 text-slate-500">Engineering</td>
                <td class="p-3 font-mono">09:05 AM</td>
                <td class="p-3"><span class="badge-present px-2.5 py-1 rounded-full font-semibold text-[10px]">PRESENT</span></td>
              </tr>
              <tr>
                <td class="p-3 flex items-center gap-2 font-medium">
                  <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=50" class="w-7 h-7 rounded-full object-cover">
                  Sarah Chen
                </td>
                <td class="p-3 text-slate-500">Product & Design</td>
                <td class="p-3 font-mono">09:10 AM</td>
                <td class="p-3"><span class="badge-present px-2.5 py-1 rounded-full font-semibold text-[10px]">PRESENT</span></td>
              </tr>
              <tr>
                <td class="p-3 flex items-center gap-2 font-medium">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50" class="w-7 h-7 rounded-full object-cover">
                  David Kim
                </td>
                <td class="p-3 text-slate-500">Infrastructure</td>
                <td class="p-3 font-mono">08:30 AM</td>
                <td class="p-3"><span class="badge-present px-2.5 py-1 rounded-full font-semibold text-[10px]">PRESENT</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Switch / Preview Card -->
      <div class="odoo-card p-6 flex flex-col justify-between">
        <div>
          <h3 class="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-users-viewfinder text-purple-600"></i>
            <span>Switch / Inspect Employee</span>
          </h3>
          <p class="text-xs text-slate-500 mb-4">View how the application looks for any employee or test payroll visibility.</p>
          <div class="space-y-2">
            <button onclick="switchUserDirectly('alex.morgan@dayflow.com')" class="w-full p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 flex items-center justify-between text-left transition group">
              <div class="flex items-center gap-2.5">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" class="w-8 h-8 rounded-full object-cover">
                <div>
                  <div class="text-xs font-bold text-slate-800 group-hover:text-brand-700">Alex Morgan</div>
                  <div class="text-[10px] text-slate-400">Pay User • Engineering</div>
                </div>
              </div>
              <i class="fa-solid fa-chevron-right text-xs text-slate-300 group-hover:text-brand-500"></i>
            </button>
            <button onclick="switchUserDirectly('sarah.chen@dayflow.com')" class="w-full p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 flex items-center justify-between text-left transition group">
              <div class="flex items-center gap-2.5">
                <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=50" class="w-8 h-8 rounded-full object-cover">
                <div>
                  <div class="text-xs font-bold text-slate-800 group-hover:text-brand-700">Sarah Chen</div>
                  <div class="text-[10px] text-slate-400">Product & Design</div>
                </div>
              </div>
              <i class="fa-solid fa-chevron-right text-xs text-slate-300 group-hover:text-brand-500"></i>
            </button>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-100 text-center">
          <button onclick="switchTab('employees')" class="w-full py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl transition">
            Manage All Staff &rarr;
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderAdminEmployees(container) {
  const employees = Object.values(DEFAULT_ACCOUNTS);
  
  container.innerHTML = `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <div>
        <h2 class="text-xl font-bold text-slate-800">Employee Directory & Management</h2>
        <p class="text-xs text-slate-500">Admins can view, edit all employee details, and switch between employee profiles.</p>
      </div>
    </div>

    <!-- Employees Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
      ${employees.map(emp => `
        <div class="odoo-card p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="flex items-center gap-3">
                <img src="${emp.profilePicUrl}" class="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm">
                <div>
                  <h3 class="font-bold text-slate-800 text-sm">${emp.fullName}</h3>
                  <p class="text-xs text-brand-700 font-medium">${emp.jobTitle}</p>
                  <p class="text-[10px] text-slate-400">${emp.employeeId} • ${emp.department}</p>
                </div>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${emp.role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'}">
                ${emp.role === 'ROLE_ADMIN' ? 'ADMIN / HR' : 'EMPLOYEE'}
              </span>
            </div>

            <div class="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
              <div class="flex items-center gap-2"><i class="fa-regular fa-envelope text-slate-400 w-4"></i> ${emp.email}</div>
              <div class="flex items-center gap-2"><i class="fa-solid fa-phone text-slate-400 w-4"></i> ${emp.phone || 'N/A'}</div>
              <div class="flex items-center gap-2"><i class="fa-regular fa-calendar text-slate-400 w-4"></i> Joined: ${emp.dateOfJoining}</div>
              <div class="flex items-center gap-2"><i class="fa-solid fa-location-dot text-slate-400 w-4"></i> ${emp.address || 'San Francisco, CA'}</div>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button onclick="openAdminEditModal('${emp.email}')" class="flex-1 py-2 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-user-pen"></i> Edit Full Details
            </button>
            <button onclick="switchUserDirectly('${emp.email}')" class="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-brand-700 rounded-lg text-xs font-semibold transition" title="Switch view as this user">
              <i class="fa-solid fa-arrow-right-to-bracket"></i>
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderAdminAttendance(container) {
  container.innerHTML = `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <div>
        <h2 class="text-xl font-bold text-slate-800">Company Attendance Matrix</h2>
        <p class="text-xs text-slate-500">Live attendance monitoring and weekly historical logs for all staff.</p>
      </div>
      <div class="flex items-center gap-2">
        <input type="date" value="${new Date().toISOString().split('T')[0]}" class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white">
      </div>
    </div>

    <!-- Attendance Table -->
    <div class="odoo-card overflow-hidden">
      <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <span class="text-xs font-bold uppercase text-slate-500 tracking-wider">Today's Daily Logs</span>
        <span class="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <i class="fa-solid fa-circle text-[8px] mr-1"></i> Live Tracking Active
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 uppercase font-semibold">
            <tr>
              <th class="p-3">Staff Member</th>
              <th class="p-3">Emp ID</th>
              <th class="p-3">Check In</th>
              <th class="p-3">Check Out</th>
              <th class="p-3">Work Hours</th>
              <th class="p-3">Status</th>
              <th class="p-3">Remarks</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr>
              <td class="p-3 flex items-center gap-2 font-medium">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=50" class="w-7 h-7 rounded-full object-cover">
                Eleanor Vance (Admin)
              </td>
              <td class="p-3 font-mono text-slate-500">EMP-HR-001</td>
              <td class="p-3 font-mono">08:45 AM</td>
              <td class="p-3 font-mono text-slate-400">—</td>
              <td class="p-3 font-semibold text-slate-700">Active (1h 30m)</td>
              <td class="p-3"><span class="badge-present px-2.5 py-1 rounded-full font-semibold text-[10px]">PRESENT</span></td>
              <td class="p-3 text-slate-400">In-office</td>
            </tr>
            <tr>
              <td class="p-3 flex items-center gap-2 font-medium">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" class="w-7 h-7 rounded-full object-cover">
                Alex Morgan (Pay User)
              </td>
              <td class="p-3 font-mono text-slate-500">EMP-DEV-101</td>
              <td class="p-3 font-mono">09:05 AM</td>
              <td class="p-3 font-mono text-slate-400">—</td>
              <td class="p-3 font-semibold text-slate-700">Active (1h 10m)</td>
              <td class="p-3"><span class="badge-present px-2.5 py-1 rounded-full font-semibold text-[10px]">PRESENT</span></td>
              <td class="p-3 text-slate-400">Morning Standup attended</td>
            </tr>
            <tr>
              <td class="p-3 flex items-center gap-2 font-medium">
                <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=50" class="w-7 h-7 rounded-full object-cover">
                Sarah Chen
              </td>
              <td class="p-3 font-mono text-slate-500">EMP-DES-102</td>
              <td class="p-3 font-mono">09:10 AM</td>
              <td class="p-3 font-mono text-slate-400">—</td>
              <td class="p-3 font-semibold text-slate-700">Active (1h 05m)</td>
              <td class="p-3"><span class="badge-present px-2.5 py-1 rounded-full font-semibold text-[10px]">PRESENT</span></td>
              <td class="p-3 text-slate-400">Remote</td>
            </tr>
            <tr>
              <td class="p-3 flex items-center gap-2 font-medium">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50" class="w-7 h-7 rounded-full object-cover">
                David Kim
              </td>
              <td class="p-3 font-mono text-slate-500">EMP-OPS-103</td>
              <td class="p-3 font-mono text-slate-400">—</td>
              <td class="p-3 font-mono text-slate-400">—</td>
              <td class="p-3 text-slate-400">0.0h</td>
              <td class="p-3"><span class="badge-leave px-2.5 py-1 rounded-full font-semibold text-[10px]">ON LEAVE</span></td>
              <td class="p-3 text-purple-700 font-medium">Approved Sick Leave</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAdminLeaves(container) {
  container.innerHTML = `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <div>
        <h2 class="text-xl font-bold text-slate-800">Leave Approvals & Time-Off Management</h2>
        <p class="text-xs text-slate-500">Review employee leave applications, approve/reject with reviewer remarks.</p>
      </div>
    </div>

    <!-- Leaves List -->
    <div class="space-y-4">
      <!-- 1. Pending Leave Card for Alex Morgan -->
      <div class="odoo-card p-5 border-l-4 border-l-amber-500">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div class="flex items-center gap-3">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" class="w-10 h-10 rounded-xl object-cover">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-slate-800 text-sm">Alex Morgan</h3>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">PENDING REVIEW</span>
              </div>
              <p class="text-xs text-slate-500">Engineering • EMP-DEV-101</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="openLeaveReviewModal(1, 'Alex Morgan', 'PAID', 3, 'Aug 27 - Aug 29, 2026', 'Family vacation trip and personal travel.')"
                    class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm">
              <i class="fa-solid fa-gavel"></i> Take Action / Review
            </button>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span class="text-slate-400 font-medium">Leave Type:</span>
            <span class="font-bold text-slate-700 ml-1">🏖️ Paid Annual Leave</span>
          </div>
          <div>
            <span class="text-slate-400 font-medium">Date Range:</span>
            <span class="font-bold text-slate-700 ml-1">Aug 27 → Aug 29 (3 Days)</span>
          </div>
          <div>
            <span class="text-slate-400 font-medium">Applied:</span>
            <span class="text-slate-600 ml-1">Today</span>
          </div>
        </div>

        <div class="mt-2 bg-slate-50 p-2.5 rounded-lg text-xs text-slate-600">
          <strong class="text-slate-700">Reason:</strong> Family vacation trip and personal travel.
        </div>
      </div>

      <!-- 2. Already Approved Leave for David Kim -->
      <div class="odoo-card p-5 border-l-4 border-l-emerald-500 opacity-90">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div class="flex items-center gap-3">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50" class="w-10 h-10 rounded-xl object-cover">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-slate-800 text-sm">David Kim</h3>
                <span class="badge-approved px-2 py-0.5 rounded-full font-bold text-[10px]">APPROVED</span>
              </div>
              <p class="text-xs text-slate-500">Infrastructure • EMP-OPS-103</p>
            </div>
          </div>
          <div class="text-right text-xs text-slate-400">
            Reviewed by <span class="font-bold text-slate-600">admin@dayflow.com</span>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div><span class="text-slate-400 font-medium">Type:</span> <span class="font-bold text-slate-700">🩺 Sick Leave (1 Day)</span></div>
          <div><span class="text-slate-400 font-medium">Date:</span> <span class="font-bold text-slate-700">Yesterday</span></div>
          <div><span class="text-slate-400 font-medium">Admin Feedback:</span> <span class="text-emerald-700 font-medium">"Approved. Take care!"</span></div>
        </div>
      </div>
    </div>
  `;
}

function renderAdminPayroll(container) {
  const employees = Object.values(DEFAULT_ACCOUNTS);

  container.innerHTML = `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <div>
        <h2 class="text-xl font-bold text-slate-800">Payroll & Salary Structure Control</h2>
        <p class="text-xs text-slate-500">Manage salary structures (Basic, HRA, PF, Taxes) and generate official payslips.</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="showToast('Batch payslips generated successfully for all staff!', 'success')" class="px-4 py-2 bg-tealbrand-500 hover:bg-tealbrand-600 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Batch Payslips
        </button>
      </div>
    </div>

    <!-- Payroll Metrics Summary -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="odoo-card p-4 bg-emerald-50/50 border border-emerald-200">
        <div class="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Monthly Gross</div>
        <div class="text-2xl font-bold font-mono text-emerald-700 mt-1">$26,800.00</div>
        <p class="text-[10px] text-emerald-600 mt-1">4 Employees enrolled</p>
      </div>
      <div class="odoo-card p-4 bg-rose-50/50 border border-rose-200">
        <div class="text-xs font-bold text-rose-800 uppercase tracking-wider">Total Statutory Deductions</div>
        <div class="text-2xl font-mono font-bold text-rose-700 mt-1">$5,646.00</div>
        <p class="text-[10px] text-rose-600 mt-1">PF + Professional Tax + TDS</p>
      </div>
      <div class="odoo-card p-4 bg-purple-50/50 border border-purple-200">
        <div class="text-xs font-bold text-purple-800 uppercase tracking-wider">Net Salary Payout</div>
        <div class="text-2xl font-mono font-bold text-brand-700 mt-1">$21,154.00</div>
        <p class="text-[10px] text-purple-600 mt-1">Bank direct credit</p>
      </div>
    </div>

    <!-- Salary Structures Table -->
    <div class="odoo-card overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <span class="text-xs font-bold uppercase text-slate-500 tracking-wider">Employee Compensation Breakdown</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 uppercase font-semibold">
            <tr>
              <th class="p-3">Employee</th>
              <th class="p-3">Basic Pay</th>
              <th class="p-3">HRA + Allowances</th>
              <th class="p-3">Deductions (PF/Tax)</th>
              <th class="p-3">Net Monthly Pay</th>
              <th class="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr>
              <td class="p-3 flex items-center gap-2 font-medium">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=50" class="w-7 h-7 rounded-full object-cover">
                <div>
                  <div>Eleanor Vance</div>
                  <div class="text-[10px] text-slate-400">Head of People</div>
                </div>
              </td>
              <td class="p-3 font-mono font-semibold">$8,500.00</td>
              <td class="p-3 font-mono text-emerald-700">+$5,600.00</td>
              <td class="p-3 font-mono text-rose-600">-$2,420.00</td>
              <td class="p-3 font-mono font-bold text-brand-700 text-sm">$11,680.00</td>
              <td class="p-3 text-right">
                <button onclick="openSalaryEditModal(1, 'Eleanor Vance', 8500, 3400, 1800, 400, 1020, 200, 1200)" class="px-2.5 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 rounded-lg text-xs font-semibold transition">
                  <i class="fa-solid fa-pen-to-square mr-1"></i> Edit Structure
                </button>
              </td>
            </tr>

            <!-- Alex Morgan (Pay User) -->
            <tr class="bg-purple-50/30">
              <td class="p-3 flex items-center gap-2 font-medium">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" class="w-7 h-7 rounded-full object-cover">
                <div>
                  <div class="font-bold text-slate-800">Alex Morgan <span class="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded ml-1">Pay User</span></div>
                  <div class="text-[10px] text-slate-400">Senior Backend Engineer</div>
                </div>
              </td>
              <td class="p-3 font-mono font-semibold">$6,500.00</td>
              <td class="p-3 font-mono text-emerald-700">+$4,300.00</td>
              <td class="p-3 font-mono text-rose-600">-$1,830.00</td>
              <td class="p-3 font-mono font-bold text-brand-700 text-sm">$8,970.00</td>
              <td class="p-3 text-right space-x-1">
                <button onclick="openSalaryEditModal(2, 'Alex Morgan', 6500, 2600, 1400, 300, 780, 200, 850)" class="px-2.5 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 rounded-lg text-xs font-semibold transition">
                  <i class="fa-solid fa-pen-to-square mr-1"></i> Edit Structure
                </button>
                <button onclick="viewPayslipModal('Alex Morgan', 'EMP-DEV-101', 'Senior Backend Engineer', 'Engineering', 'July 2026', '2026-07-31', 6500, 2600, 1400, 300, 780, 200, 850)" class="px-2.5 py-1 bg-brand-100 hover:bg-brand-200 text-brand-800 rounded-lg text-xs font-semibold transition">
                  <i class="fa-solid fa-file-invoice-dollar mr-1"></i> Payslip
                </button>
              </td>
            </tr>

            <!-- Sarah Chen -->
            <tr>
              <td class="p-3 flex items-center gap-2 font-medium">
                <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=50" class="w-7 h-7 rounded-full object-cover">
                <div>
                  <div>Sarah Chen</div>
                  <div class="text-[10px] text-slate-400">Lead Product Designer</div>
                </div>
              </td>
              <td class="p-3 font-mono font-semibold">$6,000.00</td>
              <td class="p-3 font-mono text-emerald-700">+$3,900.00</td>
              <td class="p-3 font-mono text-rose-600">-$1,670.00</td>
              <td class="p-3 font-mono font-bold text-brand-700 text-sm">$8,230.00</td>
              <td class="p-3 text-right">
                <button onclick="openSalaryEditModal(3, 'Sarah Chen', 6000, 2400, 1200, 300, 720, 200, 750)" class="px-2.5 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 rounded-lg text-xs font-semibold transition">
                  <i class="fa-solid fa-pen-to-square mr-1"></i> Edit Structure
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// =========================================================================
// EMPLOYEE / PAY USER VIEWS
// =========================================================================

function renderEmployeeDashboard(container) {
  container.innerHTML = `
    <!-- Top Welcome Card -->
    <div class="bg-gradient-to-r from-tealbrand-700 to-tealbrand-500 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-xs">Employee Portal</span>
        </div>
        <h1 class="text-2xl font-bold mt-1">Hello, ${currentUser.fullName}! 👋</h1>
        <p class="text-xs text-teal-100 mt-1">${currentUser.jobTitle} • ${currentUser.department}</p>
      </div>

      <!-- Live Punch Widget -->
      <div class="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 flex items-center gap-3">
        <div class="text-left">
          <div class="text-[10px] uppercase font-bold text-teal-200">Today's Punch Status</div>
          <div class="text-sm font-bold flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Checked In (09:05 AM)</span>
          </div>
        </div>
        <button onclick="openPunchModal('OUT')" class="px-3 py-1.5 bg-white text-tealbrand-700 hover:bg-teal-50 rounded-lg text-xs font-bold shadow-sm transition">
          <i class="fa-solid fa-arrow-right-from-bracket mr-1"></i> Check Out
        </button>
      </div>
    </div>

    <!-- Quick Access Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Profile Card -->
      <div onclick="switchTab('profile')" class="odoo-card p-5 cursor-pointer hover:border-tealbrand-500 group">
        <div class="flex justify-between items-center text-slate-400 mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">My Profile</span>
          <i class="fa-regular fa-id-card text-tealbrand-500 group-hover:scale-110 transition"></i>
        </div>
        <div class="text-sm font-bold text-slate-800">${currentUser.fullName}</div>
        <p class="text-[11px] text-tealbrand-600 mt-1 font-semibold">View info & documents &rarr;</p>
      </div>

      <!-- Attendance Card -->
      <div onclick="switchTab('attendance')" class="odoo-card p-5 cursor-pointer hover:border-tealbrand-500 group">
        <div class="flex justify-between items-center text-slate-400 mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Attendance</span>
          <i class="fa-regular fa-calendar-check text-tealbrand-500 group-hover:scale-110 transition"></i>
        </div>
        <div class="text-xl font-bold text-emerald-600">Present (100%)</div>
        <p class="text-[11px] text-slate-400 mt-1">34.5 hrs logged this week</p>
      </div>

      <!-- Leave Card -->
      <div onclick="switchTab('leaves')" class="odoo-card p-5 cursor-pointer hover:border-tealbrand-500 group">
        <div class="flex justify-between items-center text-slate-400 mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Time-Off Balance</span>
          <i class="fa-solid fa-plane-departure text-tealbrand-500 group-hover:scale-110 transition"></i>
        </div>
        <div class="text-xl font-bold text-slate-800">18 Days Paid</div>
        <p class="text-[11px] text-amber-600 font-semibold mt-1">1 request pending approval</p>
      </div>

      <!-- Payroll Card (Pay User) -->
      <div onclick="switchTab('payroll')" class="odoo-card p-5 cursor-pointer hover:border-tealbrand-500 group border-l-4 border-l-tealbrand-500">
        <div class="flex justify-between items-center text-slate-400 mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Net Monthly Salary</span>
          <i class="fa-solid fa-file-invoice-dollar text-tealbrand-500 group-hover:scale-110 transition"></i>
        </div>
        <div class="text-xl font-bold font-mono text-brand-700">$8,970.00</div>
        <p class="text-[11px] text-tealbrand-600 font-semibold mt-1">View latest payslip &rarr;</p>
      </div>
    </div>

    <!-- Recent Activity & Notifications -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 odoo-card p-6">
        <h3 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i class="fa-solid fa-clock-rotate-left text-tealbrand-500"></i>
          <span>Recent Workday Logs (This Week)</span>
        </h3>
        <div class="space-y-3 text-xs">
          <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">TODAY</span>
              <div>
                <div class="font-bold text-slate-800">Check-in at 09:05 AM</div>
                <div class="text-slate-400 text-[10px]">Status: Active In-Progress</div>
              </div>
            </div>
            <span class="badge-present px-2 py-0.5 rounded-full font-bold text-[10px]">PRESENT</span>
          </div>

          <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">YEST</span>
              <div>
                <div class="font-bold text-slate-800">09:00 AM → 01:15 PM (4.25 hrs)</div>
                <div class="text-slate-400 text-[10px]">Doctor appointment in afternoon</div>
              </div>
            </div>
            <span class="badge-halfday px-2 py-0.5 rounded-full font-bold text-[10px]">HALF DAY</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Shortcuts -->
      <div class="odoo-card p-6 flex flex-col justify-between">
        <div>
          <h3 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <i class="fa-solid fa-bolt text-amber-500"></i>
            <span>Quick Actions</span>
          </h3>
          <div class="space-y-2">
            <button onclick="openModal('modal-leave-apply')" class="w-full py-2.5 px-3 bg-tealbrand-50 hover:bg-tealbrand-100 text-tealbrand-700 font-semibold rounded-xl text-xs flex items-center gap-2 transition">
              <i class="fa-solid fa-plane-departure"></i> Apply for Time-Off
            </button>
            <button onclick="openModal('modal-employee-edit')" class="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-2 transition">
              <i class="fa-regular fa-pen-to-square"></i> Update Contact Info
            </button>
            <button onclick="viewPayslipModal(currentUser.fullName, currentUser.employeeId, currentUser.jobTitle, currentUser.department, 'July 2026', '2026-07-31', 6500, 2600, 1400, 300, 780, 200, 850)" class="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-brand-700 font-semibold rounded-xl text-xs flex items-center gap-2 transition">
              <i class="fa-solid fa-file-invoice-dollar"></i> View July 2026 Payslip
            </button>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
          Dayflow HRMS • All records synced with HR
        </div>
      </div>
    </div>
  `;
}

function renderEmployeeProfile(container) {
  container.innerHTML = `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <div>
        <h2 class="text-xl font-bold text-slate-800">My Employee Profile</h2>
        <p class="text-xs text-slate-500">View personal details, job position, verified documents, and update contact information.</p>
      </div>
      <button onclick="openEmployeeSelfEditModal()" class="px-4 py-2 bg-tealbrand-500 hover:bg-tealbrand-600 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm">
        <i class="fa-regular fa-pen-to-square"></i> Edit Contact & Bio
      </button>
    </div>

    <!-- Profile Overview Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Card: Avatar & Summary -->
      <div class="odoo-card p-6 text-center flex flex-col items-center">
        <img src="${currentUser.profilePicUrl}" class="w-24 h-24 rounded-full object-cover border-4 border-tealbrand-500 shadow-md mb-3">
        <h3 class="font-bold text-slate-800 text-base">${currentUser.fullName}</h3>
        <p class="text-xs text-tealbrand-700 font-semibold">${currentUser.jobTitle}</p>
        <span class="inline-block mt-2 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
          ${currentUser.employeeId}
        </span>

        <p class="text-xs text-slate-500 mt-4 italic">"${currentUser.about || 'Passionate engineer driving technological innovation.'}"</p>

        <div class="w-full mt-6 pt-4 border-t border-slate-100 text-left space-y-2 text-xs text-slate-600">
          <div class="flex justify-between"><span class="text-slate-400">Department:</span> <strong class="text-slate-700">${currentUser.department}</strong></div>
          <div class="flex justify-between"><span class="text-slate-400">Joined Date:</span> <strong class="text-slate-700">${currentUser.dateOfJoining}</strong></div>
          <div class="flex justify-between"><span class="text-slate-400">Status:</span> <span class="badge-present px-2 py-0.2 rounded-full font-bold text-[10px]">ACTIVE</span></div>
        </div>
      </div>

      <!-- Right 2 Columns: Contact & Verified Documents -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Personal & Contact Information -->
        <div class="odoo-card p-6">
          <h4 class="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4 flex items-center gap-2">
            <i class="fa-regular fa-address-card text-tealbrand-500"></i>
            <span>Personal & Contact Information</span>
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span class="text-slate-400 font-medium">Work Email Address</span>
              <p class="font-bold text-slate-800 mt-0.5">${currentUser.email}</p>
            </div>
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span class="text-slate-400 font-medium">Phone Number</span>
              <p class="font-bold text-slate-800 mt-0.5">${currentUser.phone || '+1 (555) 342-8921'}</p>
            </div>
            <div class="sm:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span class="text-slate-400 font-medium">Residential Address</span>
              <p class="font-bold text-slate-800 mt-0.5">${currentUser.address || '742 Evergreen Terrace, San Francisco, CA'}</p>
            </div>
          </div>
        </div>

        <!-- Verified Documents List -->
        <div class="odoo-card p-6">
          <h4 class="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4 flex items-center gap-2">
            <i class="fa-regular fa-file-lines text-tealbrand-500"></i>
            <span>HR Verified Documents</span>
          </h4>
          <div class="space-y-2">
            ${(currentUser.documents || 'Employment_Agreement.pdf, NDA.pdf, Tax_Form.pdf').split(',').map(doc => `
              <div class="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition text-xs">
                <div class="flex items-center gap-2.5">
                  <i class="fa-solid fa-file-pdf text-rose-500 text-base"></i>
                  <span class="font-medium text-slate-700">${doc.trim()}</span>
                </div>
                <button onclick="showToast('Downloading verified document...', 'info')" class="text-xs text-tealbrand-600 font-semibold hover:underline">
                  <i class="fa-solid fa-download"></i> Download
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderEmployeeAttendance(container) {
  container.innerHTML = `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <div>
        <h2 class="text-xl font-bold text-slate-800">My Attendance Log</h2>
        <p class="text-xs text-slate-500">Daily and weekly time tracking records and punch history.</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="openPunchModal('IN')" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm">
          <i class="fa-solid fa-arrow-right-to-bracket"></i> Punch In
        </button>
        <button onclick="openPunchModal('OUT')" class="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm">
          <i class="fa-solid fa-arrow-right-from-bracket"></i> Punch Out
        </button>
      </div>
    </div>

    <!-- Attendance Table -->
    <div class="odoo-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 uppercase font-semibold">
            <tr>
              <th class="p-3">Date</th>
              <th class="p-3">Check In</th>
              <th class="p-3">Check Out</th>
              <th class="p-3">Work Hours</th>
              <th class="p-3">Status</th>
              <th class="p-3">Notes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr>
              <td class="p-3 font-bold text-slate-800">Today</td>
              <td class="p-3 font-mono">09:05 AM</td>
              <td class="p-3 font-mono text-slate-400">—</td>
              <td class="p-3 font-semibold text-slate-700">Active (1h 10m)</td>
              <td class="p-3"><span class="badge-present px-2.5 py-1 rounded-full font-semibold text-[10px]">PRESENT</span></td>
              <td class="p-3 text-slate-500">Morning Standup attended</td>
            </tr>
            <tr>
              <td class="p-3 font-bold text-slate-800">Yesterday</td>
              <td class="p-3 font-mono">09:00 AM</td>
              <td class="p-3 font-mono">01:15 PM</td>
              <td class="p-3 font-semibold text-slate-700">4.25 hrs</td>
              <td class="p-3"><span class="badge-halfday px-2.5 py-1 rounded-full font-semibold text-[10px]">HALF DAY</span></td>
              <td class="p-3 text-slate-500">Doctor appointment in afternoon</td>
            </tr>
            <tr>
              <td class="p-3 font-bold text-slate-800">2 days ago</td>
              <td class="p-3 font-mono">09:15 AM</td>
              <td class="p-3 font-mono">05:45 PM</td>
              <td class="p-3 font-semibold text-slate-700">8.50 hrs</td>
              <td class="p-3"><span class="badge-present px-2.5 py-1 rounded-full font-semibold text-[10px]">PRESENT</span></td>
              <td class="p-3 text-slate-500">Sprint deliverable</td>
            </tr>
            <tr>
              <td class="p-3 font-bold text-slate-800">3 days ago</td>
              <td class="p-3 font-mono">09:02 AM</td>
              <td class="p-3 font-mono">05:34 PM</td>
              <td class="p-3 font-semibold text-slate-700">8.53 hrs</td>
              <td class="p-3"><span class="badge-present px-2.5 py-1 rounded-full font-semibold text-[10px]">PRESENT</span></td>
              <td class="p-3 text-slate-500">Full day</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderEmployeeLeaves(container) {
  container.innerHTML = `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <div>
        <h2 class="text-xl font-bold text-slate-800">Time-Off & Leave Applications</h2>
        <p class="text-xs text-slate-500">Apply for Paid, Sick, or Unpaid leaves and track approval status.</p>
      </div>
      <button onclick="openModal('modal-leave-apply')" class="px-4 py-2 bg-tealbrand-500 hover:bg-tealbrand-600 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm">
        <i class="fa-solid fa-plus"></i> Apply for Leave
      </button>
    </div>

    <!-- Leave Balances -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="odoo-card p-4 bg-emerald-50/50 border border-emerald-200">
        <div class="text-xs font-bold text-emerald-800 uppercase tracking-wider">Paid Annual Leave</div>
        <div class="text-2xl font-bold text-emerald-700 mt-1">18 Days Left</div>
        <p class="text-[10px] text-emerald-600 mt-1">Total allocated: 22 days</p>
      </div>
      <div class="odoo-card p-4 bg-teal-50/50 border border-teal-200">
        <div class="text-xs font-bold text-teal-800 uppercase tracking-wider">Sick / Medical Leave</div>
        <div class="text-2xl font-bold text-teal-700 mt-1">10 Days Left</div>
        <p class="text-[10px] text-teal-600 mt-1">100% available</p>
      </div>
      <div class="odoo-card p-4 bg-purple-50/50 border border-purple-200">
        <div class="text-xs font-bold text-purple-800 uppercase tracking-wider">Pending Requests</div>
        <div class="text-2xl font-bold text-brand-700 mt-1">1 Request</div>
        <p class="text-[10px] text-purple-600 mt-1">Awaiting HR decision</p>
      </div>
    </div>

    <!-- My Submitted Leaves History -->
    <div class="space-y-4">
      <!-- Pending Request -->
      <div class="odoo-card p-5 border-l-4 border-l-amber-500">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-slate-800 text-sm">🏖️ Paid Annual Leave (3 Days)</h3>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">PENDING APPROVAL</span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Date: <strong>Aug 27, 2026 &rarr; Aug 29, 2026</strong></p>
          </div>
          <span class="text-xs text-slate-400">Applied Today</span>
        </div>
        <div class="mt-3 bg-slate-50 p-3 rounded-xl text-xs text-slate-600 border border-slate-100">
          <strong class="text-slate-700">Reason:</strong> Family vacation trip and personal travel.
        </div>
      </div>
    </div>
  `;
}

function renderEmployeePayroll(container) {
  container.innerHTML = `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <div>
        <h2 class="text-xl font-bold text-slate-800">My Compensation & Payslips (Pay User)</h2>
        <p class="text-xs text-slate-500">Read-only salary structure breakdown and monthly payslips.</p>
      </div>
    </div>

    <!-- Salary Structure Card -->
    <div class="odoo-card p-6 mb-6">
      <div class="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
        <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
          <i class="fa-solid fa-money-bill-transfer text-tealbrand-500"></i>
          <span>Official Salary Structure (Read-Only)</span>
        </h3>
        <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Managed by HR</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <!-- Earnings Breakdown -->
        <div class="space-y-2 border border-slate-100 p-4 rounded-xl bg-slate-50/50">
          <h4 class="font-bold text-emerald-800 uppercase tracking-wider mb-2">Earnings Components (+)</h4>
          <div class="flex justify-between"><span>Basic Salary:</span><span class="font-mono font-bold">$6,500.00</span></div>
          <div class="flex justify-between"><span>House Rent Allowance (HRA):</span><span class="font-mono font-bold">$2,600.00</span></div>
          <div class="flex justify-between"><span>Special Allowance:</span><span class="font-mono font-bold">$1,400.00</span></div>
          <div class="flex justify-between"><span>Conveyance Allowance:</span><span class="font-mono font-bold">$300.00</span></div>
          <div class="flex justify-between pt-2 border-t border-slate-200 font-bold text-emerald-700 text-sm">
            <span>Gross Monthly Earnings:</span><span class="font-mono">$10,800.00</span>
          </div>
        </div>

        <!-- Deductions Breakdown -->
        <div class="space-y-2 border border-slate-100 p-4 rounded-xl bg-slate-50/50">
          <h4 class="font-bold text-rose-800 uppercase tracking-wider mb-2">Deductions Components (-)</h4>
          <div class="flex justify-between"><span>Provident Fund (PF):</span><span class="font-mono font-bold">$780.00</span></div>
          <div class="flex justify-between"><span>Professional Tax:</span><span class="font-mono font-bold">$200.00</span></div>
          <div class="flex justify-between"><span>TDS / Income Tax:</span><span class="font-mono font-bold">$850.00</span></div>
          <div class="flex justify-between pt-2 border-t border-slate-200 font-bold text-rose-700 text-sm">
            <span>Total Deductions:</span><span class="font-mono">$1,830.00</span>
          </div>
        </div>
      </div>

      <div class="mt-4 p-4 bg-tealbrand-50 border border-tealbrand-200 rounded-xl flex items-center justify-between">
        <div>
          <div class="text-xs font-bold uppercase text-tealbrand-900">Net Take-Home Monthly Salary</div>
          <div class="text-[11px] text-tealbrand-700">Calculated after statutory PF and TDS contributions</div>
        </div>
        <div class="text-2xl font-mono font-extrabold text-tealbrand-700">$8,970.00</div>
      </div>
    </div>

    <!-- Monthly Payslips History -->
    <div class="odoo-card p-6">
      <h3 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
        <i class="fa-solid fa-file-invoice text-tealbrand-500"></i>
        <span>Monthly Payslips & Statements</span>
      </h3>

      <div class="space-y-3">
        <div class="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition">
          <div class="flex items-center gap-3">
            <i class="fa-solid fa-file-invoice-dollar text-2xl text-emerald-600"></i>
            <div>
              <div class="font-bold text-slate-800 text-xs">Salary Statement - July 2026</div>
              <div class="text-[11px] text-slate-500">Net Paid: <strong>$8,970.00</strong> • Disbursed: July 31, 2026</div>
            </div>
          </div>
          <button onclick="viewPayslipModal(currentUser.fullName, currentUser.employeeId, currentUser.jobTitle, currentUser.department, 'July 2026', '2026-07-31', 6500, 2600, 1400, 300, 780, 200, 850)" class="px-4 py-2 bg-tealbrand-500 hover:bg-tealbrand-600 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5">
            <i class="fa-solid fa-eye"></i> View & Print Slip
          </button>
        </div>

        <div class="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition">
          <div class="flex items-center gap-3">
            <i class="fa-solid fa-file-invoice-dollar text-2xl text-emerald-600"></i>
            <div>
              <div class="font-bold text-slate-800 text-xs">Salary Statement - June 2026</div>
              <div class="text-[11px] text-slate-500">Net Paid: <strong>$8,970.00</strong> • Disbursed: June 30, 2026</div>
            </div>
          </div>
          <button onclick="viewPayslipModal(currentUser.fullName, currentUser.employeeId, currentUser.jobTitle, currentUser.department, 'June 2026', '2026-06-30', 6500, 2600, 1400, 300, 780, 200, 850)" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5">
            <i class="fa-solid fa-eye"></i> View & Print Slip
          </button>
        </div>
      </div>
    </div>
  `;
}

// =========================================================================
// MODAL CONTROLLERS & ACTIONS
// =========================================================================

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('hidden');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('hidden');
}

function openPunchModal(type) {
  punchActionType = type;
  const title = document.getElementById('punch-modal-title');
  const btn = document.getElementById('punch-submit-btn');
  if (title) {
    title.innerHTML = type === 'IN' 
      ? `<i class="fa-solid fa-arrow-right-to-bracket text-emerald-500"></i> Confirm Check-In Punch`
      : `<i class="fa-solid fa-arrow-right-from-bracket text-rose-500"></i> Confirm Check-Out Punch`;
  }
  if (btn) {
    btn.textContent = type === 'IN' ? 'Confirm Check In' : 'Confirm Check Out';
    btn.className = type === 'IN' 
      ? 'px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm'
      : 'px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg shadow-sm';
  }
  openModal('modal-punch');
}

function submitPunch(event) {
  event.preventDefault();
  const remarks = document.getElementById('punch-remarks').value;
  closeModal('modal-punch');
  showToast(punchActionType === 'IN' ? 'Checked in successfully at ' + new Date().toLocaleTimeString() : 'Checked out successfully. Work hours calculated.', 'success');
  loadCurrentTab();
}

function openEmployeeSelfEditModal() {
  document.getElementById('emp-edit-phone').value = currentUser.phone || '';
  document.getElementById('emp-edit-address').value = currentUser.address || '';
  document.getElementById('emp-edit-avatar').value = currentUser.profilePicUrl || '';
  document.getElementById('emp-edit-about').value = currentUser.about || '';
  openModal('modal-employee-edit');
}

function submitEmployeeSelfEdit(event) {
  event.preventDefault();
  currentUser.phone = document.getElementById('emp-edit-phone').value;
  currentUser.address = document.getElementById('emp-edit-address').value;
  currentUser.profilePicUrl = document.getElementById('emp-edit-avatar').value || currentUser.profilePicUrl;
  currentUser.about = document.getElementById('emp-edit-about').value;

  localStorage.setItem('dayflow_user', JSON.stringify(currentUser));
  updateHeaderUI();
  closeModal('modal-employee-edit');
  showToast('Profile and contact details updated successfully!', 'success');
  loadCurrentTab();
}

function openAdminEditModal(email) {
  const emp = DEFAULT_ACCOUNTS[email];
  if (!emp) return;

  document.getElementById('admin-edit-id').value = emp.email;
  const parts = emp.fullName.split(' ');
  document.getElementById('admin-edit-fname').value = parts[0] || '';
  document.getElementById('admin-edit-lname').value = parts.slice(1).join(' ') || '';
  document.getElementById('admin-edit-jobtitle').value = emp.jobTitle;
  document.getElementById('admin-edit-dept').value = emp.department;
  document.getElementById('admin-edit-phone').value = emp.phone || '';
  document.getElementById('admin-edit-doj').value = emp.dateOfJoining || '2023-01-01';
  document.getElementById('admin-edit-address').value = emp.address || '';
  document.getElementById('admin-edit-avatar').value = emp.profilePicUrl || '';
  document.getElementById('admin-edit-docs').value = emp.documents || '';
  
  openModal('modal-admin-edit');
}

function submitAdminEmployeeEdit(event) {
  event.preventDefault();
  const emailKey = document.getElementById('admin-edit-id').value;
  const emp = DEFAULT_ACCOUNTS[emailKey];
  if (emp) {
    const fn = document.getElementById('admin-edit-fname').value;
    const ln = document.getElementById('admin-edit-lname').value;
    emp.fullName = `${fn} ${ln}`;
    emp.jobTitle = document.getElementById('admin-edit-jobtitle').value;
    emp.department = document.getElementById('admin-edit-dept').value;
    emp.phone = document.getElementById('admin-edit-phone').value;
    emp.dateOfJoining = document.getElementById('admin-edit-doj').value;
    emp.address = document.getElementById('admin-edit-address').value;
    emp.profilePicUrl = document.getElementById('admin-edit-avatar').value || emp.profilePicUrl;
    emp.documents = document.getElementById('admin-edit-docs').value;

    if (currentUser.email === emp.email) {
      currentUser = { ...emp };
      localStorage.setItem('dayflow_user', JSON.stringify(currentUser));
      updateHeaderUI();
    }
  }

  closeModal('modal-admin-edit');
  showToast('Employee record updated successfully!', 'success');
  loadCurrentTab();
}

function submitLeaveApplication(event) {
  event.preventDefault();
  closeModal('modal-leave-apply');
  showToast('Leave request submitted to HR for approval!', 'success');
  loadCurrentTab();
}

function openLeaveReviewModal(id, empName, type, days, dates, reason) {
  document.getElementById('leave-review-id').value = id;
  document.getElementById('lr-emp-name').textContent = empName;
  document.getElementById('lr-type').textContent = type;
  document.getElementById('lr-days').textContent = days;
  document.getElementById('lr-dates').textContent = dates;
  document.getElementById('lr-reason').textContent = reason;
  openModal('modal-leave-review');
}

function submitLeaveReview(event) {
  event.preventDefault();
  const decision = document.getElementById('leave-decision-status').value;
  closeModal('modal-leave-review');
  showToast(`Leave request ${decision.toLowerCase()} successfully! Employee records updated.`, 'success');
  loadCurrentTab();
}

function openSalaryEditModal(id, name, basic, hra, special, conveyance, pf, ptax, tds) {
  document.getElementById('salary-edit-empid').value = id;
  document.getElementById('salary-edit-empname').textContent = name;
  document.getElementById('sal-basic').value = basic;
  document.getElementById('sal-hra').value = hra;
  document.getElementById('sal-special').value = special;
  document.getElementById('sal-conveyance').value = conveyance;
  document.getElementById('sal-pf').value = pf;
  document.getElementById('sal-ptax').value = ptax;
  document.getElementById('sal-tds').value = tds;
  calculateLiveSalary();
  openModal('modal-salary-edit');
}

function calculateLiveSalary() {
  const basic = parseFloat(document.getElementById('sal-basic').value) || 0;
  const hra = parseFloat(document.getElementById('sal-hra').value) || 0;
  const special = parseFloat(document.getElementById('sal-special').value) || 0;
  const conveyance = parseFloat(document.getElementById('sal-conveyance').value) || 0;

  const pf = parseFloat(document.getElementById('sal-pf').value) || 0;
  const ptax = parseFloat(document.getElementById('sal-ptax').value) || 0;
  const tds = parseFloat(document.getElementById('sal-tds').value) || 0;

  const gross = basic + hra + special + conveyance;
  const deductions = pf + ptax + tds;
  const net = Math.max(0, gross - deductions);

  document.getElementById('sal-live-gross').textContent = '$' + gross.toFixed(2);
  document.getElementById('sal-live-deductions').textContent = '$' + deductions.toFixed(2);
  document.getElementById('sal-live-net').textContent = '$' + net.toFixed(2);
}

function submitSalaryStructure(event) {
  event.preventDefault();
  closeModal('modal-salary-edit');
  showToast('Salary structure updated successfully! Net pay recalculated.', 'success');
  loadCurrentTab();
}

function viewPayslipModal(name, empid, title, dept, period, paydate, basic, hra, special, conveyance, pf, ptax, tds) {
  const gross = basic + hra + special + conveyance;
  const deductions = pf + ptax + tds;
  const net = gross - deductions;

  document.getElementById('ps-period').textContent = 'Period: ' + period;
  document.getElementById('ps-emp-name').textContent = name;
  document.getElementById('ps-emp-id').textContent = empid;
  document.getElementById('ps-job-title').textContent = title;
  document.getElementById('ps-dept').textContent = dept;
  document.getElementById('ps-pay-date').textContent = paydate;

  document.getElementById('ps-basic').textContent = '$' + basic.toFixed(2);
  document.getElementById('ps-hra').textContent = '$' + hra.toFixed(2);
  document.getElementById('ps-special').textContent = '$' + special.toFixed(2);
  document.getElementById('ps-conveyance').textContent = '$' + conveyance.toFixed(2);
  document.getElementById('ps-gross').textContent = '$' + gross.toFixed(2);

  document.getElementById('ps-pf').textContent = '$' + pf.toFixed(2);
  document.getElementById('ps-ptax').textContent = '$' + ptax.toFixed(2);
  document.getElementById('ps-tds').textContent = '$' + tds.toFixed(2);
  document.getElementById('ps-deductions').textContent = '$' + deductions.toFixed(2);

  document.getElementById('ps-net').textContent = '$' + net.toFixed(2);

  openModal('modal-payslip-view');
}

// Switch user account directly (for Pair-Programming / Testing)
function switchUserDirectly(email) {
  if (DEFAULT_ACCOUNTS[email]) {
    currentUser = { ...DEFAULT_ACCOUNTS[email] };
    localStorage.setItem('dayflow_user', JSON.stringify(currentUser));
    currentTab = 'dashboard';
    updateHeaderUI();
    setupSidebarNav();
    loadCurrentTab();
    showToast(`Switched account to: ${currentUser.fullName} (${currentUser.role === 'ROLE_ADMIN' ? 'Admin/HR' : 'Employee/Pay User'})`, 'info');
  }
}

// Authentication Handlers
function switchAuthTab(tab) {
  const signinForm = document.getElementById('signin-form');
  const signupForm = document.getElementById('signup-form');
  const tabSignin = document.getElementById('tab-signin');
  const tabSignup = document.getElementById('tab-signup');

  if (tab === 'signin') {
    signinForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    tabSignin.classList.add('text-brand-700', 'border-b-2', 'border-brand-500');
    tabSignin.classList.remove('text-slate-400');
    tabSignup.classList.remove('text-brand-700', 'border-b-2', 'border-brand-500');
    tabSignup.classList.add('text-slate-400');
  } else {
    signupForm.classList.remove('hidden');
    signinForm.classList.add('hidden');
    tabSignup.classList.add('text-brand-700', 'border-b-2', 'border-brand-500');
    tabSignup.classList.remove('text-slate-400');
    tabSignin.classList.remove('text-brand-700', 'border-b-2', 'border-brand-500');
    tabSignin.classList.add('text-slate-400');
  }
}

function fillAndLogin(email, pwd) {
  document.getElementById('signin-email').value = email;
  document.getElementById('signin-password').value = pwd;
  switchUserDirectly(email);
  closeModal('auth-screen');
}

function handleSignIn(event) {
  event.preventDefault();
  const email = document.getElementById('signin-email').value.trim();
  if (DEFAULT_ACCOUNTS[email]) {
    switchUserDirectly(email);
    closeModal('auth-screen');
  } else {
    // Register temporary session
    currentUser = {
      id: Date.now(),
      employeeId: 'EMP-' + Math.floor(100 + Math.random() * 900),
      email: email,
      fullName: email.split('@')[0],
      role: 'ROLE_EMPLOYEE',
      jobTitle: 'Team Member',
      department: 'Engineering',
      profilePicUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      dateOfJoining: new Date().toISOString().split('T')[0]
    };
    localStorage.setItem('dayflow_user', JSON.stringify(currentUser));
    updateHeaderUI();
    setupSidebarNav();
    loadCurrentTab();
    closeModal('auth-screen');
    showToast('Signed in successfully!', 'success');
  }
}

function handleSignUp(event) {
  event.preventDefault();
  const fname = document.getElementById('signup-fname').value;
  const lname = document.getElementById('signup-lname').value;
  const empid = document.getElementById('signup-empid').value;
  const email = document.getElementById('signup-email').value;
  const role = document.getElementById('signup-role').value;
  const dept = document.getElementById('signup-department').value || 'Engineering';

  const newUser = {
    id: Date.now(),
    employeeId: empid,
    email: email,
    fullName: `${fname} ${lname}`,
    role: role,
    jobTitle: role === 'ROLE_ADMIN' ? 'HR Specialist' : 'Software Engineer',
    department: dept,
    profilePicUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    phone: '+1 (555) 000-0000',
    address: 'San Francisco, CA',
    dateOfJoining: new Date().toISOString().split('T')[0],
    documents: 'Employment_Contract.pdf'
  };

  DEFAULT_ACCOUNTS[email] = newUser;
  currentUser = newUser;
  localStorage.setItem('dayflow_user', JSON.stringify(currentUser));
  updateHeaderUI();
  setupSidebarNav();
  loadCurrentTab();
  closeModal('auth-screen');
  showToast('Account registered successfully! Welcome to Dayflow.', 'success');
}

function logout() {
  openModal('auth-screen');
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-emerald-600' : (type === 'error' ? 'bg-rose-600' : 'bg-slate-800');
  const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info');

  toast.className = `${bgClass} text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium transform transition-all duration-300 translate-y-4 opacity-0 pointer-events-auto`;
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
