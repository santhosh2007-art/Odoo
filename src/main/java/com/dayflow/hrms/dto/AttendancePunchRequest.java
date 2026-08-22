package com.dayflow.hrms.dto;

public class AttendancePunchRequest {

    private String remarks;

    public AttendancePunchRequest() {
    }

    public AttendancePunchRequest(String remarks) {
        this.remarks = remarks;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
