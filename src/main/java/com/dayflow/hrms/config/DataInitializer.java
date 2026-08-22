package com.dayflow.hrms.config;

import com.dayflow.hrms.model.EmployeeProfile;
import com.dayflow.hrms.model.Role;
import com.dayflow.hrms.model.User;
import com.dayflow.hrms.repository.EmployeeProfileRepository;
import com.dayflow.hrms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeProfileRepository employeeProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Seed HR Manager account
        if (!userRepository.existsByEmail("hr@dayflow.com")) {
            User hrUser = new User(
                    "EMP-HR-001",
                    "hr@dayflow.com",
                    passwordEncoder.encode("Admin@1234"),
                    "Sarah Jenkins (HR Manager)",
                    Role.HR,
                    true,
                    null
            );
            User savedHr = userRepository.save(hrUser);

            EmployeeProfile hrProfile = new EmployeeProfile(savedHr, "HR Manager", "Human Resources", LocalDate.now());
            hrProfile.setPhone("+1-555-0192");
            hrProfile.setAddress("100 Executive Way, Suite 400");
            hrProfile.setSalaryBase(85000.0);
            employeeProfileRepository.save(hrProfile);

            System.out.println("✅ Seeded HR Account: hr@dayflow.com / Admin@1234");
        }

        // Seed Employee account
        if (!userRepository.existsByEmail("employee@dayflow.com")) {
            User empUser = new User(
                    "EMP-DEV-101",
                    "employee@dayflow.com",
                    passwordEncoder.encode("Employee@1234"),
                    "Alex Rivera",
                    Role.Employee,
                    true,
                    null
            );
            User savedEmp = userRepository.save(empUser);

            EmployeeProfile empProfile = new EmployeeProfile(savedEmp, "Senior Software Engineer", "Engineering", LocalDate.now());
            empProfile.setPhone("+1-555-0144");
            empProfile.setAddress("42 Innovation Drive");
            empProfile.setSalaryBase(75000.0);
            employeeProfileRepository.save(empProfile);

            System.out.println("✅ Seeded Employee Account: employee@dayflow.com / Employee@1234");
        }
    }
}
