package com.dayflow.hrms.dto;

import com.dayflow.hrms.model.LeaveStatus;
import jakarta.validation.constraints.NotNull;

public class LeaveApprovalRequest {

    @NotNull(message = "Decision status is required (APPROVED or REJECTED)")
    private LeaveStatus status;

    private String adminComments;

    public LeaveApprovalRequest() {
    }

    public LeaveApprovalRequest(LeaveStatus status, String adminComments) {
        this.status = status;
        this.adminComments = adminComments;
    }

    public LeaveStatus getStatus() {
        return status;
    }

    public void setStatus(LeaveStatus status) {
        this.status = status;
    }

    public String getAdminComments() {
        return adminComments;
    }

    public void setAdminComments(String adminComments) {
        this.adminComments = adminComments;
    }
}
