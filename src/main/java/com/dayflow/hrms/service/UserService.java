package com.dayflow.hrms.service;

import com.dayflow.hrms.dto.AuthRequest;
import com.dayflow.hrms.dto.AuthResponse;
import com.dayflow.hrms.dto.SignUpRequest;
import com.dayflow.hrms.model.EmployeeProfile;
import com.dayflow.hrms.model.Role;
import com.dayflow.hrms.model.SalaryStructure;
import com.dayflow.hrms.model.User;
import com.dayflow.hrms.repository.EmployeeProfileRepository;
import com.dayflow.hrms.repository.SalaryStructureRepository;
import com.dayflow.hrms.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final SalaryStructureRepository salaryStructureRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       EmployeeProfileRepository employeeProfileRepository,
                       SalaryStructureRepository salaryStructureRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.employeeProfileRepository = employeeProfileRepository;
        this.salaryStructureRepository = salaryStructureRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse register(SignUpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return AuthResponse.failure("Email is already registered: " + request.getEmail());
        }

        if (userRepository.existsByEmployeeId(request.getEmployeeId())) {
            return AuthResponse.failure("Employee ID is already in use: " + request.getEmployeeId());
        }

        Role role = request.getRole() != null ? request.getRole() : Role.ROLE_EMPLOYEE;

        User user = new User();
        user.setEmployeeId(request.getEmployeeId());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setEnabled(true);
        user = userRepository.save(user);

        EmployeeProfile profile = new EmployeeProfile();
        profile.setUser(user);
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setPhone(request.getPhone());
        profile.setAddress(request.getAddress());
        profile.setJobTitle(request.getJobTitle() != null ? request.getJobTitle() : (role == Role.ROLE_ADMIN ? "HR Manager" : "Software Engineer"));
        profile.setDepartment(request.getDepartment() != null ? request.getDepartment() : (role == Role.ROLE_ADMIN ? "Human Resources" : "Engineering"));
        profile.setDateOfJoining(LocalDate.now());
        profile.setProfilePicUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
        profile = employeeProfileRepository.save(profile);

        // Initial default salary structure for new employees
        SalaryStructure salary = new SalaryStructure(
                profile,
                5000.0, // Basic
                2000.0, // HRA
                1000.0, // Special Allowance
                300.0,  // Conveyance
                600.0,  // PF
                200.0,  // Prof Tax
                500.0   // TDS
        );
        salaryStructureRepository.save(salary);

        return new AuthResponse(
                true,
                "Registration successful! Welcome to Dayflow HRMS.",
                user.getId(),
                user.getEmployeeId(),
                user.getEmail(),
                profile.getFullName(),
                user.getRole(),
                profile.getJobTitle(),
                profile.getDepartment(),
                profile.getProfilePicUrl()
        );
    }

    public AuthResponse authenticate(AuthRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail().trim().toLowerCase());
        if (userOpt.isEmpty()) {
            return AuthResponse.failure("Invalid email or password");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return AuthResponse.failure("Invalid email or password");
        }

        if (!user.isEnabled()) {
            return AuthResponse.failure("Your account is currently disabled. Please contact your HR administrator.");
        }

        Optional<EmployeeProfile> profileOpt = employeeProfileRepository.findByUser(user);
        EmployeeProfile profile = profileOpt.orElse(null);

        return new AuthResponse(
                true,
                "Authentication successful",
                user.getId(),
                user.getEmployeeId(),
                user.getEmail(),
                profile != null ? profile.getFullName() : user.getEmail(),
                user.getRole(),
                profile != null ? profile.getJobTitle() : "",
                profile != null ? profile.getDepartment() : "",
                profile != null ? profile.getProfilePicUrl() : ""
        );
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email.trim().toLowerCase());
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
}
