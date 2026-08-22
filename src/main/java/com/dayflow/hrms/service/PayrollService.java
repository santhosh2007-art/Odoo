package com.dayflow.hrms.service;

import com.dayflow.hrms.dto.SalaryUpdateRequest;
import com.dayflow.hrms.model.EmployeeProfile;
import com.dayflow.hrms.model.Payslip;
import com.dayflow.hrms.model.PayslipStatus;
import com.dayflow.hrms.model.SalaryStructure;
import com.dayflow.hrms.repository.EmployeeProfileRepository;
import com.dayflow.hrms.repository.PayslipRepository;
import com.dayflow.hrms.repository.SalaryStructureRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class PayrollService {

    private final SalaryStructureRepository salaryStructureRepository;
    private final PayslipRepository payslipRepository;
    private final EmployeeProfileRepository employeeProfileRepository;

    public PayrollService(SalaryStructureRepository salaryStructureRepository,
                          PayslipRepository payslipRepository,
                          EmployeeProfileRepository employeeProfileRepository) {
        this.salaryStructureRepository = salaryStructureRepository;
        this.payslipRepository = payslipRepository;
        this.employeeProfileRepository = employeeProfileRepository;
    }

    /**
     * Read-only salary structure for employee
     */
    public SalaryStructure getSalaryStructureByEmail(String email) {
        return salaryStructureRepository.findByEmployeeUserEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Salary structure not found for user: " + email));
    }

    /**
     * Get salary structure by employee profile ID
     */
    public SalaryStructure getSalaryStructureByEmployeeId(Long employeeId) {
        return salaryStructureRepository.findByEmployeeId(employeeId)
                .orElseGet(() -> {
                    EmployeeProfile emp = employeeProfileRepository.findById(employeeId)
                            .orElseThrow(() -> new IllegalArgumentException("Employee not found with ID: " + employeeId));
                    SalaryStructure s = new SalaryStructure(emp, 4000.0, 1600.0, 800.0, 200.0, 480.0, 200.0, 400.0);
                    return salaryStructureRepository.save(s);
                });
    }

    /**
     * Admin view: Get all salary structures
     */
    public List<SalaryStructure> getAllSalaryStructures() {
        return salaryStructureRepository.findAll();
    }

    /**
     * Admin: Update salary structure for an employee
     */
    @Transactional
    public SalaryStructure updateSalaryStructure(Long employeeId, SalaryUpdateRequest request) {
        EmployeeProfile employee = employeeProfileRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with ID: " + employeeId));

        SalaryStructure salary = salaryStructureRepository.findByEmployee(employee)
                .orElseGet(() -> {
                    SalaryStructure s = new SalaryStructure();
                    s.setEmployee(employee);
                    return s;
                });

        if (request.getBasicPay() != null) salary.setBasicPay(request.getBasicPay());
        if (request.getHra() != null) salary.setHra(request.getHra());
        if (request.getSpecialAllowance() != null) salary.setSpecialAllowance(request.getSpecialAllowance());
        if (request.getConveyanceAllowance() != null) salary.setConveyanceAllowance(request.getConveyanceAllowance());
        if (request.getProvidentFund() != null) salary.setProvidentFund(request.getProvidentFund());
        if (request.getProfessionalTax() != null) salary.setProfessionalTax(request.getProfessionalTax());
        if (request.getIncomeTaxTds() != null) salary.setIncomeTaxTds(request.getIncomeTaxTds());

        salary.calculateTotals();
        return salaryStructureRepository.save(salary);
    }

    /**
     * Employee view: Get personal payslips
     */
    public List<Payslip> getEmployeePayslips(String email) {
        return payslipRepository.findByEmployeeUserEmailOrderByYearDescMonthDesc(email.trim().toLowerCase());
    }

    /**
     * Admin view: Get all payslips
     */
    public List<Payslip> getAllPayslips() {
        return payslipRepository.findAllByOrderByYearDescMonthDesc();
    }

    /**
     * Admin: Generate a new monthly payslip for an employee based on salary structure
     */
    @Transactional
    public Payslip generatePayslip(Long employeeId, String month, Integer year) {
        EmployeeProfile employee = employeeProfileRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with ID: " + employeeId));

        SalaryStructure salary = salaryStructureRepository.findByEmployee(employee)
                .orElseThrow(() -> new IllegalStateException("Cannot generate payslip without a salary structure for employee: " + employee.getFullName()));

        Optional<Payslip> existing = payslipRepository.findByEmployeeAndMonthAndYear(employee, month, year);
        if (existing.isPresent()) {
            Payslip p = existing.get();
            p.setBasicPay(salary.getBasicPay());
            p.setHra(salary.getHra());
            p.setSpecialAllowance(salary.getSpecialAllowance());
            p.setConveyanceAllowance(salary.getConveyanceAllowance());
            p.setProvidentFund(salary.getProvidentFund());
            p.setProfessionalTax(salary.getProfessionalTax());
            p.setIncomeTaxTds(salary.getIncomeTaxTds());
            p.setGrossPay(salary.getGrossSalary());
            p.setTotalDeductions(salary.getTotalDeductions());
            p.setNetPay(salary.getNetSalary());
            p.setStatus(PayslipStatus.GENERATED);
            return payslipRepository.save(p);
        }

        Payslip payslip = new Payslip(employee, month, year, salary, PayslipStatus.GENERATED, LocalDate.now());
        return payslipRepository.save(payslip);
    }

    /**
     * Admin: Generate monthly payslips for all active employees
     */
    @Transactional
    public List<Payslip> generateBatchPayslips(String month, Integer year) {
        List<EmployeeProfile> employees = employeeProfileRepository.findAll();
        List<Payslip> created = new ArrayList<>();
        for (EmployeeProfile emp : employees) {
            created.add(generatePayslip(emp.getId(), month, year));
        }
        return created;
    }

    /**
     * Payroll overview metrics
     */
    public Map<String, Object> getPayrollMetrics() {
        List<SalaryStructure> structures = salaryStructureRepository.findAll();
        double totalGrossPayroll = structures.stream().mapToDouble(SalaryStructure::getGrossSalary).sum();
        double totalNetPayroll = structures.stream().mapToDouble(SalaryStructure::getNetSalary).sum();
        double totalDeductions = structures.stream().mapToDouble(SalaryStructure::getTotalDeductions).sum();

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalEmployeesCovered", structures.size());
        metrics.put("totalMonthlyGross", Math.round(totalGrossPayroll * 100.0) / 100.0);
        metrics.put("totalMonthlyNet", Math.round(totalNetPayroll * 100.0) / 100.0);
        metrics.put("totalMonthlyDeductions", Math.round(totalDeductions * 100.0) / 100.0);
        metrics.put("averageSalary", structures.isEmpty() ? 0 : Math.round((totalNetPayroll / structures.size()) * 100.0) / 100.0);

        return metrics;
    }
}
