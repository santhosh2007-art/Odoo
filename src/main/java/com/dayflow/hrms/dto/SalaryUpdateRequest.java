package com.dayflow.hrms.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class SalaryUpdateRequest {

    @NotNull(message = "Basic pay is required")
    @PositiveOrZero(message = "Basic pay cannot be negative")
    private Double basicPay;

    @PositiveOrZero
    private Double hra;

    @PositiveOrZero
    private Double specialAllowance;

    @PositiveOrZero
    private Double conveyanceAllowance;

    @PositiveOrZero
    private Double providentFund;

    @PositiveOrZero
    private Double professionalTax;

    @PositiveOrZero
    private Double incomeTaxTds;

    public SalaryUpdateRequest() {
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
}
