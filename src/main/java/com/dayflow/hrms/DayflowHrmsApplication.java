package com.dayflow.hrms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DayflowHrmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(DayflowHrmsApplication.class, args);
        System.out.println("==================================================================");
        System.out.println("🚀 Dayflow HRMS Server started at: http://localhost:8080");
        System.out.println("🔑 Admin Login: admin@dayflow.com / admin123");
        System.out.println("👤 Employee (Pay User) Login: alex.morgan@dayflow.com / user123");
        System.out.println("📊 H2 Console: http://localhost:8080/h2-console (JDBC URL: jdbc:h2:mem:dayflowdb)");
        System.out.println("==================================================================");
    }
}
