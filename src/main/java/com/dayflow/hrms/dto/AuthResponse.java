package com.dayflow.hrms.dto;

import com.dayflow.hrms.model.Role;

public class AuthResponse {
    private String token;
    private UserSummary user;

    public AuthResponse() {}

    public AuthResponse(String token, UserSummary user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public UserSummary getUser() { return user; }
    public void setUser(UserSummary user) { this.user = user; }

    public static class UserSummary {
        private Long id;
        private String employeeId;
        private String email;
        private String name;
        private Role role;
        private boolean isVerified;

        public UserSummary() {}

        public UserSummary(Long id, String employeeId, String email, String name, Role role, boolean isVerified) {
            this.id = id;
            this.employeeId = employeeId;
            this.email = email;
            this.name = name;
            this.role = role;
            this.isVerified = isVerified;
        }

        public Long getId() { return id; }
        public String getEmployeeId() { return employeeId; }
        public String getEmail() { return email; }
        public String getName() { return name; }
        public Role getRole() { return role; }
        public boolean isVerified() { return isVerified; }
    }
}
