package com.dayflow.hrms.config;

import com.dayflow.hrms.model.*;
import com.dayflow.hrms.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final SalaryStructureRepository salaryStructureRepository;
    private final PayslipRepository payslipRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           EmployeeProfileRepository employeeProfileRepository,
                           AttendanceRepository attendanceRepository,
                           LeaveRequestRepository leaveRequestRepository,
                           SalaryStructureRepository salaryStructureRepository,
                           PayslipRepository payslipRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.employeeProfileRepository = employeeProfileRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.salaryStructureRepository = salaryStructureRepository;
        this.payslipRepository = payslipRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        System.out.println(">>> Initializing Dayflow HRMS database with sample Admin & Employee records...");

        // 1. Admin / HR Officer Account
        User adminUser = new User("EMP-HR-001", "admin@dayflow.com", passwordEncoder.encode("admin123"), Role.ROLE_ADMIN);
        adminUser = userRepository.save(adminUser);

        EmployeeProfile adminProfile = new EmployeeProfile(
                adminUser,
                "Eleanor",
                "Vance",
                "+1 (555) 019-2834",
                "450 Innovation Way, Suite 800, San Francisco, CA",
                "Head of People & HR Operations",
                "Human Resources",
                LocalDate.of(2022, 1, 15),
                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
                "HR_Policy_Handbook.pdf, Employment_Contract_Eleanor.pdf, Benefits_Summary.pdf"
        );
        adminProfile.setAbout("Experienced People Leader dedicated to building high-performing, inclusive work cultures and streamlined HR operations.");
        adminProfile = employeeProfileRepository.save(adminProfile);

        SalaryStructure adminSalary = new SalaryStructure(
                adminProfile,
                8500.0, // Basic
                3400.0, // HRA
                1800.0, // Special Allowance
                400.0,  // Conveyance
                1020.0, // PF
                200.0,  // Prof Tax
                1200.0  // TDS
        );
        salaryStructureRepository.save(adminSalary);

        // 2. Employee 1 (Alex Morgan - Pay User & Engineer)
        User emp1User = new User("EMP-DEV-101", "alex.morgan@dayflow.com", passwordEncoder.encode("user123"), Role.ROLE_EMPLOYEE);
        emp1User = userRepository.save(emp1User);

        EmployeeProfile emp1Profile = new EmployeeProfile(
                emp1User,
                "Alex",
                "Morgan",
                "+1 (555) 342-8921",
                "742 Evergreen Terrace, San Francisco, CA",
                "Senior Backend Engineer",
                "Engineering",
                LocalDate.of(2023, 3, 1),
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
                "NDA_Agreement.pdf, Offer_Letter_AlexMorgan.pdf, Tax_Declaration_Form16.pdf"
        );
        emp1Profile.setAbout("Passionate distributed systems engineer building resilient cloud architectures.");
        emp1Profile = employeeProfileRepository.save(emp1Profile);

        SalaryStructure emp1Salary = new SalaryStructure(
                emp1Profile,
                6500.0, // Basic
                2600.0, // HRA
                1400.0, // Special Allowance
                300.0,  // Conveyance
                780.0,  // PF
                200.0,  // Prof Tax
                850.0   // TDS
        );
        salaryStructureRepository.save(emp1Salary);

        // 3. Employee 2 (Sarah Chen - Lead Designer)
        User emp2User = new User("EMP-DES-102", "sarah.chen@dayflow.com", passwordEncoder.encode("user123"), Role.ROLE_EMPLOYEE);
        emp2User = userRepository.save(emp2User);

        EmployeeProfile emp2Profile = new EmployeeProfile(
                emp2User,
                "Sarah",
                "Chen",
                "+1 (555) 781-9023",
                "120 Market St, Apt 4B, San Francisco, CA",
                "Lead Product Designer",
                "Product & Design",
                LocalDate.of(2023, 6, 12),
                "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
                "NDA_Signed.pdf, Portfolio_Review.pdf, Offer_Letter.pdf"
        );
        emp2Profile.setAbout("Crafting intuitive, accessible human-centered digital experiences.");
        emp2Profile = employeeProfileRepository.save(emp2Profile);

        SalaryStructure emp2Salary = new SalaryStructure(
                emp2Profile,
                6000.0, // Basic
                2400.0, // HRA
                1200.0, // Special Allowance
                300.0,  // Conveyance
                720.0,  // PF
                200.0,  // Prof Tax
                750.0   // TDS
        );
        salaryStructureRepository.save(emp2Salary);

        // 4. Employee 3 (David Kim - DevOps Engineer)
        User emp3User = new User("EMP-OPS-103", "david.kim@dayflow.com", passwordEncoder.encode("user123"), Role.ROLE_EMPLOYEE);
        emp3User = userRepository.save(emp3User);

        EmployeeProfile emp3Profile = new EmployeeProfile(
                emp3User,
                "David",
                "Kim",
                "+1 (555) 438-1129",
                "88 King Street, San Francisco, CA",
                "Site Reliability Engineer",
                "Infrastructure",
                LocalDate.of(2024, 1, 10),
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
                "Cloud_Security_Clearance.pdf, Onboarding_Checklist.pdf"
        );
        emp3Profile.setAbout("Kubernetes enthusiast ensuring five nines reliability.");
        emp3Profile = employeeProfileRepository.save(emp3Profile);

        SalaryStructure emp3Salary = new SalaryStructure(
                emp3Profile,
                5800.0,
                2320.0,
                1100.0,
                300.0,
                696.0,
                200.0,
                700.0
        );
        salaryStructureRepository.save(emp3Salary);

        // 5. Seed Historical & Today Attendance Records
        LocalDate today = LocalDate.now();

        // Admin today attendance
        attendanceRepository.save(new Attendance(adminProfile, today, LocalTime.of(8, 45), null, AttendanceStatus.PRESENT, 0.0, "In-office"));

        // Emp1 (Alex) past few days attendance
        attendanceRepository.save(new Attendance(emp1Profile, today.minusDays(3), LocalTime.of(9, 2), LocalTime.of(17, 34), AttendanceStatus.PRESENT, 8.53, "Full day"));
        attendanceRepository.save(new Attendance(emp1Profile, today.minusDays(2), LocalTime.of(9, 15), LocalTime.of(17, 45), AttendanceStatus.PRESENT, 8.50, "Full day"));
        attendanceRepository.save(new Attendance(emp1Profile, today.minusDays(1), LocalTime.of(9, 0), LocalTime.of(13, 15), AttendanceStatus.HALF_DAY, 4.25, "Doctor appointment in afternoon"));
        attendanceRepository.save(new Attendance(emp1Profile, today, LocalTime.of(9, 5), null, AttendanceStatus.PRESENT, 0.0, "Morning Standup attended"));

        // Emp2 (Sarah) attendance
        attendanceRepository.save(new Attendance(emp2Profile, today.minusDays(1), LocalTime.of(9, 30), LocalTime.of(18, 0), AttendanceStatus.PRESENT, 8.5, "Design Sprint"));
        attendanceRepository.save(new Attendance(emp2Profile, today, LocalTime.of(9, 10), null, AttendanceStatus.PRESENT, 0.0, "Working remotely"));

        // Emp3 (David) attendance
        attendanceRepository.save(new Attendance(emp3Profile, today.minusDays(1), null, null, AttendanceStatus.ON_LEAVE, 0.0, "Approved Sick Leave"));
        attendanceRepository.save(new Attendance(emp3Profile, today, LocalTime.of(8, 30), null, AttendanceStatus.PRESENT, 0.0, "On-call shift"));

        // 6. Seed Leave Requests
        // Pending request from Alex Morgan
        LeaveRequest leave1 = new LeaveRequest(
                emp1Profile,
                LeaveType.PAID,
                today.plusDays(5),
                today.plusDays(7),
                3,
                "Family vacation trip and personal travel."
        );
        leaveRequestRepository.save(leave1);

        // Approved request from David Kim
        LeaveRequest leave2 = new LeaveRequest(
                emp3Profile,
                LeaveType.SICK,
                today.minusDays(1),
                today.minusDays(1),
                1,
                "Severe seasonal viral flu and fever."
        );
        leave2.setStatus(LeaveStatus.APPROVED);
        leave2.setAdminComments("Approved. Take care and get well soon!");
        leave2.setReviewedBy(adminUser.getEmail());
        leave2.setReviewedAt(LocalDateTime.now().minusDays(1));
        leaveRequestRepository.save(leave2);

        // Rejected request example
        LeaveRequest leave3 = new LeaveRequest(
                emp2Profile,
                LeaveType.UNPAID,
                today.minusDays(10),
                today.minusDays(8),
                3,
                "Personal conference attendance."
        );
        leave3.setStatus(LeaveStatus.REJECTED);
        leave3.setAdminComments("Conflict with critical Q3 product launch milestone. Reschedule for next quarter.");
        leave3.setReviewedBy(adminUser.getEmail());
        leave3.setReviewedAt(LocalDateTime.now().minusDays(11));
        leaveRequestRepository.save(leave3);

        // 7. Seed Generated Monthly Payslips for Alex Morgan (Pay User) and others
        payslipRepository.save(new Payslip(emp1Profile, "July", 2026, emp1Salary, PayslipStatus.PAID, LocalDate.of(2026, 7, 31)));
        payslipRepository.save(new Payslip(emp1Profile, "June", 2026, emp1Salary, PayslipStatus.PAID, LocalDate.of(2026, 6, 30)));
        payslipRepository.save(new Payslip(emp2Profile, "July", 2026, emp2Salary, PayslipStatus.PAID, LocalDate.of(2026, 7, 31)));
        payslipRepository.save(new Payslip(emp3Profile, "July", 2026, emp3Salary, PayslipStatus.PAID, LocalDate.of(2026, 7, 31)));

        System.out.println(">>> Dayflow HRMS initialized successfully!");
        System.out.println(">>> Admin Login: admin@dayflow.com / admin123");
        System.out.println(">>> Employee (Pay User) Login: alex.morgan@dayflow.com / user123");
    }
}
