package com.dayflow.hrms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "salary_structures")
public class SalaryStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", unique = true, nullable = false)
    private EmployeeProfile employee;

    @Column(nullable = false)
    private Double basicPay = 0.0;

    @Column(nullable = false)
    private Double hra = 0.0;

    @Column(nullable = false)
    private Double specialAllowance = 0.0;

    @Column(nullable = false)
    private Double conveyanceAllowance = 0.0;

    @Column(nullable = false)
    private Double providentFund = 0.0;

    @Column(nullable = false)
    private Double professionalTax = 0.0;

    @Column(nullable = false)
    private Double incomeTaxTds = 0.0;

    @Column(nullable = false)
    private Double grossSalary = 0.0;

    @Column(nullable = false)
    private Double totalDeductions = 0.0;

    @Column(nullable = false)
    private Double netSalary = 0.0;

    @Column(nullable = false, length = 10)
    private String currency = "USD";

    private LocalDateTime lastUpdated;

    public SalaryStructure() {
        this.lastUpdated = LocalDateTime.now();
    }

    public SalaryStructure(EmployeeProfile employee, Double basicPay, Double hra, Double specialAllowance,
                           Double conveyanceAllowance, Double providentFund, Double professionalTax, Double incomeTaxTds) {
        this.employee = employee;
        this.basicPay = basicPay != null ? basicPay : 0.0;
        this.hra = hra != null ? hra : 0.0;
        this.specialAllowance = specialAllowance != null ? specialAllowance : 0.0;
        this.conveyanceAllowance = conveyanceAllowance != null ? conveyanceAllowance : 0.0;
        this.providentFund = providentFund != null ? providentFund : 0.0;
        this.professionalTax = professionalTax != null ? professionalTax : 0.0;
        this.incomeTaxTds = incomeTaxTds != null ? incomeTaxTds : 0.0;
        this.currency = "USD";
        this.lastUpdated = LocalDateTime.now();
        calculateTotals();
    }

    public void calculateTotals() {
        this.grossSalary = (basicPay != null ? basicPay : 0.0) +
                           (hra != null ? hra : 0.0) +
                           (specialAllowance != null ? specialAllowance : 0.0) +
                           (conveyanceAllowance != null ? conveyanceAllowance : 0.0);

        this.totalDeductions = (providentFund != null ? providentFund : 0.0) +
                               (professionalTax != null ? professionalTax : 0.0) +
                               (incomeTaxTds != null ? incomeTaxTds : 0.0);

        this.netSalary = Math.max(0.0, this.grossSalary - this.totalDeductions);
        this.lastUpdated = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public EmployeeProfile getEmployee() {
        return employee;
    }

    public void setEmployee(EmployeeProfile employee) {
        this.employee = employee;
    }

    public Double getBasicPay() {
        return basicPay;
    }

    public void setBasicPay(Double basicPay) {
        this.basicPay = basicPay;
        calculateTotals();
    }

    public Double getHra() {
        return hra;
    }

    public void setHra(Double hra) {
        this.hra = hra;
        calculateTotals();
    }

    public Double getSpecialAllowance() {
        return specialAllowance;
    }

    public void setSpecialAllowance(Double specialAllowance) {
        this.specialAllowance = specialAllowance;
        calculateTotals();
    }

    public Double getConveyanceAllowance() {
        return conveyanceAllowance;
    }

    public void setConveyanceAllowance(Double conveyanceAllowance) {
        this.conveyanceAllowance = conveyanceAllowance;
        calculateTotals();
    }

    public Double getProvidentFund() {
        return providentFund;
    }

    public void setProvidentFund(Double providentFund) {
        this.providentFund = providentFund;
        calculateTotals();
    }

    public Double getProfessionalTax() {
        return professionalTax;
    }

    public void setProfessionalTax(Double professionalTax) {
        this.professionalTax = professionalTax;
        calculateTotals();
    }

    public Double getIncomeTaxTds() {
        return incomeTaxTds;
    }

    public void setIncomeTaxTds(Double incomeTaxTds) {
        this.incomeTaxTds = incomeTaxTds;
        calculateTotals();
    }

    public Double getGrossSalary() {
        return grossSalary;
    }

    public Double getTotalDeductions() {
        return totalDeductions;
    }

    public Double getNetSalary() {
        return netSalary;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
