# Dayflow - Human Resource Management System (HRMS)

> **Every workday, perfectly aligned.**  
> An enterprise-grade, Odoo-inspired Human Resource Management System built with **Java (Spring Boot)**, **Spring Data JPA**, **Spring Security RBAC**, and a **Responsive Web UI**.

---

## 🌟 Overview & Architecture

Dayflow HRMS provides complete digital HR workflows with distinct privileges for **Admin / HR Officers** and **Employees (Pay Users)**:

```
dayflow-hrms-java/
├── pom.xml                                      # Maven build configuration
├── src/
│   └── main/
│       ├── java/com/dayflow/hrms/
│       │   ├── DayflowHrmsApplication.java     # Spring Boot Entrypoint
│       │   ├── config/                         # SecurityConfig & DataInitializer
│       │   ├── model/                          # JPA Entities (User, EmployeeProfile, Attendance, LeaveRequest, SalaryStructure, Payslip)
│       │   ├── dto/                            # API Request/Response Transfer Objects
│       │   ├── repository/                     # Spring Data JPA Repositories
│       │   ├── service/                        # Business logic & calculations
│       │   └── controller/                     # REST / Web API Endpoints
│       └── resources/
│           ├── application.properties          # Server & In-Memory H2 Configuration
│           └── static/                         # Interactive Web UI (HTML, CSS, JS)
```

---

## 👥 Role Capabilities Matrix

| Feature | Admin / HR Officer | Employee (Pay User) |
| :--- | :--- | :--- |
| **Authentication** | Sign in / Sign up with Admin privileges | Sign in / Sign up with Employee ID & credentials |
| **Dashboard** | Organization KPIs, Headcount, Today's attendance rate, Pending leave queues | Personalized summary, live punch widget, leave balances, recent activity |
| **Profile Management** | Full access to view and edit all details of any employee (Job, Dept, Joining date, salary, documents) | Self-service edit limited to personal details (Phone, Address, Avatar, Bio) |
| **Attendance** | Company-wide daily and weekly matrix; manual adjustment/override capability | Daily/weekly personal log, check-in / check-out punch logger |
| **Leave Management** | Review all requests; approve or reject with manager comments; updates attendance automatically | Apply for Paid, Sick, or Unpaid leaves; date range selector; live status tracking |
| **Payroll & Salary** | Manage full salary structures (Basic, HRA, Allowances, PF, Tax); batch generate payslips | Read-only salary structure breakdown; view and print monthly payslips |

---

## 🔑 Pre-Seeded Demo Accounts

| Role | Email | Password | Name | Position |
| :--- | :--- | :--- | :--- | :--- |
| **Admin / HR Officer** | `admin@dayflow.com` | `admin123` | Eleanor Vance | Head of People & HR Operations |
| **Pay User (Employee)** | `alex.morgan@dayflow.com` | `user123` | Alex Morgan | Senior Backend Engineer |
| **Employee** | `sarah.chen@dayflow.com` | `user123` | Sarah Chen | Lead Product Designer |
| **Employee** | `david.kim@dayflow.com` | `user123` | David Kim | Site Reliability Engineer |

---

## 🚀 How to Run the Application

### Option 1: Run with Java Spring Boot & Maven

Make sure **Java 17+** and **Maven** are installed on your machine.

1. Navigate to the project directory:
   ```bash
   cd C:\Users\rathi\.gemini\antigravity\scratch\dayflow-hrms-java
   ```
2. Build and run the Spring Boot server:
   ```bash
   mvn clean spring-boot:run
   ```
3. Open your browser and access the application at:
   - **Web Portal:** `http://localhost:8080`
   - **H2 Database Console:** `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:dayflowdb`, User: `sa`, Password: *empty*)

### Option 2: Direct Static Browser Preview

You can also open `src/main/resources/static/index.html` directly in any web browser to interact with the frontend immediately.

---

## 📑 API Endpoints Summary

- **Auth**: `POST /api/auth/login`, `POST /api/auth/register`
- **Admin**: `GET /api/admin/employees`, `PUT /api/admin/employees/{id}`, `GET /api/admin/overview-stats`
- **Employee**: `GET /api/employee/profile`, `PUT /api/employee/profile`
- **Attendance**: `POST /api/attendance/punch-in`, `POST /api/attendance/punch-out`, `GET /api/attendance/my-logs`, `GET /api/attendance/company-logs`
- **Leaves**: `POST /api/leaves/apply`, `GET /api/leaves/my-leaves`, `GET /api/leaves/all`, `PUT /api/leaves/{id}/review`
- **Payroll**: `GET /api/payroll/my-salary`, `GET /api/payroll/my-payslips`, `GET /api/payroll/structures`, `PUT /api/payroll/structures/{id}`, `POST /api/payroll/generate/{id}`
