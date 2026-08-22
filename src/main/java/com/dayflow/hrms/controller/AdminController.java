package com.dayflow.hrms.controller;

import com.dayflow.hrms.dto.AdminEmployeeUpdateRequest;
import com.dayflow.hrms.model.EmployeeProfile;
import com.dayflow.hrms.service.AttendanceService;
import com.dayflow.hrms.service.EmployeeService;
import com.dayflow.hrms.service.LeaveService;
import com.dayflow.hrms.service.PayrollService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final EmployeeService employeeService;
    private final AttendanceService attendanceService;
    private final LeaveService leaveService;
    private final PayrollService payrollService;

    public AdminController(EmployeeService employeeService,
                           AttendanceService attendanceService,
                           LeaveService leaveService,
                           PayrollService payrollService) {
        this.employeeService = employeeService;
        this.attendanceService = attendanceService;
        this.leaveService = leaveService;
        this.payrollService = payrollService;
    }

    /**
     * Get all employees list / search
     */
    @GetMapping("/employees")
    public ResponseEntity<List<EmployeeProfile>> getAllEmployees(@RequestParam(required = false) String query,
                                                                 @RequestParam(required = false) String department) {
        if (department != null && !department.isEmpty()) {
            return ResponseEntity.ok(employeeService.getEmployeesByDepartment(department));
        }
        return ResponseEntity.ok(employeeService.searchEmployees(query));
    }

    /**
     * Get specific employee details
     */
    @GetMapping("/employees/{id}")
    public ResponseEntity<EmployeeProfile> getEmployeeDetails(@PathVariable Long id) {
        return employeeService.getEmployeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Admin edit employee details (Full control)
     */
    @PutMapping("/employees/{id}")
    public ResponseEntity<?> updateEmployeeDetails(@PathVariable Long id,
                                                   @RequestBody AdminEmployeeUpdateRequest request) {
        try {
            EmployeeProfile updated = employeeService.adminUpdateEmployee(id, request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Admin overview statistics (Headcount, Attendance, Leaves, Payroll)
     */
    @GetMapping("/overview-stats")
    public ResponseEntity<Map<String, Object>> getAdminOverview() {
        Map<String, Object> overview = new HashMap<>();
        overview.put("attendance", attendanceService.getTodayStats());
        overview.put("leaves", leaveService.getLeaveStats());
        overview.put("payroll", payrollService.getPayrollMetrics());
        overview.put("totalEmployees", employeeService.getAllEmployees().size());
        return ResponseEntity.ok(overview);
    }
}
