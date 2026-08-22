package com.dayflow.hrms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DayflowApplication {

    public static void main(String[] args) {
        SpringApplication.run(DayflowApplication.class, args);
        System.out.println("==================================================");
        System.out.println("🚀 Dayflow HRMS Spring Boot Backend running on port 5000");
        System.out.println("👉 Health check: http://localhost:5000/health");
        System.out.println("👉 Auth Signup:  http://localhost:5000/api/auth/signup");
        System.out.println("👉 Auth Signin:  http://localhost:5000/api/auth/signin");
        System.out.println("==================================================");
    }
}
