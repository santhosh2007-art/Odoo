package com.dayflow.hrms.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payslips")
public class Payslip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private EmployeeProfile employee;

    @Column(nullable = false, length = 20)
    private String month;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Double basicPay;

    @Column(nullable = false)
    private Double hra;

    @Column(nullable = false)
    private Double specialAllowance;

    @Column(nullable = false)
    private Double conveyanceAllowance;

    @Column(nullable = false)
    private Double providentFund;

    @Column(nullable = false)
    private Double professionalTax;

    @Column(nullable = false)
    private Double incomeTaxTds;

    @Column(nullable = false)
    private Double grossPay;

    @Column(nullable = false)
    private Double totalDeductions;

    @Column(nullable = false)
    private Double netPay;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PayslipStatus status = PayslipStatus.GENERATED;

    private LocalDate paymentDate;

    @Column(nullable = false)
    private LocalDateTime generatedAt;

    public Payslip() {
        this.generatedAt = LocalDateTime.now();
    }

    public Payslip(EmployeeProfile employee, String month, Integer year, SalaryStructure salaryStructure,
                   PayslipStatus status, LocalDate paymentDate) {
        this.employee = employee;
        this.month = month;
        this.year = year;
        this.basicPay = salaryStructure.getBasicPay();
        this.hra = salaryStructure.getHra();
        this.specialAllowance = salaryStructure.getSpecialAllowance();
        this.conveyanceAllowance = salaryStructure.getConveyanceAllowance();
        this.providentFund = salaryStructure.getProvidentFund();
        this.professionalTax = salaryStructure.getProfessionalTax();
        this.incomeTaxTds = salaryStructure.getIncomeTaxTds();
        this.grossPay = salaryStructure.getGrossSalary();
        this.totalDeductions = salaryStructure.getTotalDeductions();
        this.netPay = salaryStructure.getNetSalary();
        this.status = status;
        this.paymentDate = paymentDate;
        this.generatedAt = LocalDateTime.now();
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

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Double getBasicPay() {
        return basicPay;
    }

    public void setBasicPay(Double basicPay) {
        this.basicPay = basicPay;
    }

    public Double getHra() {
        return hra;
    }

    public void setHra(Double hra) {
        this.hra = hra;
    }

    public Double getSpecialAllowance() {
        return specialAllowance;
    }

    public void setSpecialAllowance(Double specialAllowance) {
        this.specialAllowance = specialAllowance;
    }

    public Double getConveyanceAllowance() {
        return conveyanceAllowance;
    }

    public void setConveyanceAllowance(Double conveyanceAllowance) {
        this.conveyanceAllowance = conveyanceAllowance;
    }

    public Double getProvidentFund() {
        return providentFund;
    }

    public void setProvidentFund(Double providentFund) {
        this.providentFund = providentFund;
    }

    public Double getProfessionalTax() {
        return professionalTax;
    }

    public void setProfessionalTax(Double professionalTax) {
        this.professionalTax = professionalTax;
    }

    public Double getIncomeTaxTds() {
        return incomeTaxTds;
    }

    public void setIncomeTaxTds(Double incomeTaxTds) {
        this.incomeTaxTds = incomeTaxTds;
    }

    public Double getGrossPay() {
        return grossPay;
    }

    public void setGrossPay(Double grossPay) {
        this.grossPay = grossPay;
    }

    public Double getTotalDeductions() {
        return totalDeductions;
    }

    public void setTotalDeductions(Double totalDeductions) {
        this.totalDeductions = totalDeductions;
    }

    public Double getNetPay() {
        return netPay;
    }

    public void setNetPay(Double netPay) {
        this.netPay = netPay;
    }

    public PayslipStatus getStatus() {
        return status;
    }

    public void setStatus(PayslipStatus status) {
        this.status = status;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }
}
