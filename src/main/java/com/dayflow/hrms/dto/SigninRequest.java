package com.dayflow.hrms.dto;

import jakarta.validation.constraints.NotBlank;

public class SigninRequest {
    @NotBlank(message = "Email address or Employee ID is required.")
    private String email;

    @NotBlank(message = "Password is required.")
    private String password;

    public SigninRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
