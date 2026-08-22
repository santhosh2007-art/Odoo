package com.dayflow.hrms.controller;

import com.dayflow.hrms.dto.SalaryUpdateRequest;
import com.dayflow.hrms.model.Payslip;
import com.dayflow.hrms.model.SalaryStructure;
import com.dayflow.hrms.service.PayrollService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin(origins = "*")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    /**
     * Employee view: Read-only salary structure
     */
    @GetMapping("/my-salary")
    public ResponseEntity<?> getMySalaryStructure(@RequestParam String email) {
        try {
            SalaryStructure structure = payrollService.getSalaryStructureByEmail(email);
            return ResponseEntity.ok(structure);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Employee view: Read-only payslips list
     */
    @GetMapping("/my-payslips")
    public ResponseEntity<?> getMyPayslips(@RequestParam String email) {
        try {
            List<Payslip> payslips = payrollService.getEmployeePayslips(email);
            return ResponseEntity.ok(payslips);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Admin view: Get all salary structures
     */
    @GetMapping("/structures")
    public ResponseEntity<List<SalaryStructure>> getAllSalaryStructures() {
        return ResponseEntity.ok(payrollService.getAllSalaryStructures());
    }

    /**
     * Admin view: Get salary structure for specific employee
     */
    @GetMapping("/structures/{employeeId}")
    public ResponseEntity<?> getSalaryStructureByEmployee(@PathVariable Long employeeId) {
        try {
            SalaryStructure structure = payrollService.getSalaryStructureByEmployeeId(employeeId);
            return ResponseEntity.ok(structure);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Admin: Update salary structure for an employee
     */
    @PutMapping("/structures/{employeeId}")
    public ResponseEntity<?> updateSalaryStructure(@PathVariable Long employeeId,
                                                   @Valid @RequestBody SalaryUpdateRequest request) {
        try {
            SalaryStructure updated = payrollService.updateSalaryStructure(employeeId, request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Admin: Generate a monthly payslip for a single employee
     */
    @PostMapping("/generate/{employeeId}")
    public ResponseEntity<?> generatePayslip(@PathVariable Long employeeId,
                                             @RequestParam String month,
                                             @RequestParam Integer year) {
        try {
            Payslip payslip = payrollService.generatePayslip(employeeId, month, year);
            return ResponseEntity.ok(payslip);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Admin: Generate monthly payslips for all active employees
     */
    @PostMapping("/generate-batch")
    public ResponseEntity<?> generateBatchPayslips(@RequestParam(required = false) String month,
                                                   @RequestParam(required = false) Integer year) {
        try {
            String targetMonth = month != null ? month : LocalDate.now().getMonth().name();
            Integer targetYear = year != null ? year : LocalDate.now().getYear();
            List<Payslip> payslips = payrollService.generateBatchPayslips(targetMonth, targetYear);
            return ResponseEntity.ok(payslips);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Admin view: Get all payslips
     */
    @GetMapping("/all-payslips")
    public ResponseEntity<List<Payslip>> getAllPayslips() {
        return ResponseEntity.ok(payrollService.getAllPayslips());
    }

    /**
     * Admin view: Payroll analytics metrics
     */
    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getPayrollMetrics() {
        return ResponseEntity.ok(payrollService.getPayrollMetrics());
    }
}
