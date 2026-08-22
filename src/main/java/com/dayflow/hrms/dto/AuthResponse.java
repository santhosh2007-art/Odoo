package com.dayflow.hrms.dto;

import com.dayflow.hrms.model.Role;

public class AuthResponse {

    private boolean success;
    private String message;
    private Long id;
    private String employeeId;
    private String email;
    private String fullName;
    private Role role;
    private String jobTitle;
    private String department;
    private String profilePicUrl;

    public AuthResponse() {
    }

    public AuthResponse(boolean success, String message, Long id, String employeeId, String email,
                        String fullName, Role role, String jobTitle, String department, String profilePicUrl) {
        this.success = success;
        this.message = message;
        this.id = id;
        this.employeeId = employeeId;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.jobTitle = jobTitle;
        this.department = department;
        this.profilePicUrl = profilePicUrl;
    }

    public static AuthResponse failure(String message) {
        AuthResponse res = new AuthResponse();
        res.setSuccess(false);
        res.setMessage(message);
        return res;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getProfilePicUrl() {
        return profilePicUrl;
    }

    public void setProfilePicUrl(String profilePicUrl) {
        this.profilePicUrl = profilePicUrl;
    }
}
