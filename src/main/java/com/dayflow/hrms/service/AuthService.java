package com.dayflow.hrms.service;

import com.dayflow.hrms.dto.*;
import com.dayflow.hrms.model.EmployeeProfile;
import com.dayflow.hrms.model.Role;
import com.dayflow.hrms.model.User;
import com.dayflow.hrms.repository.EmployeeProfileRepository;
import com.dayflow.hrms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeProfileRepository employeeProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public List<String> validatePassword(String password) {
        List<String> errors = new ArrayList<>();
        if (password == null || password.trim().isEmpty()) {
            errors.add("Password is required.");
            return errors;
        }

        if (password.length() < 8) {
            errors.add("Password must be at least 8 characters long.");
        }
        if (!Pattern.compile("[A-Z]").matcher(password).find()) {
            errors.add("Password must contain at least one uppercase letter.");
        }
        if (!Pattern.compile("[a-z]").matcher(password).find()) {
            errors.add("Password must contain at least one lowercase letter.");
        }
        if (!Pattern.compile("[0-9]").matcher(password).find()) {
            errors.add("Password must contain at least one number.");
        }
        if (!Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]").matcher(password).find()) {
            errors.add("Password must contain at least one special character.");
        }

        return errors;
    }

    public ApiResponse<Map<String, Object>> register(SignupRequest request) {
        // 1. Password security rules validation
        List<String> passwordErrors = validatePassword(request.getPassword());
        if (!passwordErrors.isEmpty()) {
            return new ApiResponse<>(false, "Password does not satisfy security rules.", passwordErrors);
        }

        // 2. Duplicate checks
        String cleanEmail = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(cleanEmail)) {
            return new ApiResponse<>(false, "An account with this email address already exists.");
        }
        if (userRepository.existsByEmployeeId(request.getEmployeeId())) {
            return new ApiResponse<>(false, "An account with this Employee ID already exists.");
        }

        // 3. Create user entity & verification token
        String verificationToken = UUID.randomUUID().toString();
        String passwordHash = passwordEncoder.encode(request.getPassword());

        User user = new User(
                request.getEmployeeId(),
                cleanEmail,
                passwordHash,
                request.getName(),
                request.getRole(),
                false,
                verificationToken
        );

        User savedUser = userRepository.save(user);

        // 4. Create default employee profile entry
        String defaultTitle = request.getRole() == Role.Employee ? "Software Engineer" : "HR Officer";
        EmployeeProfile profile = new EmployeeProfile(savedUser, defaultTitle, "General", LocalDate.now());
        employeeProfileRepository.save(profile);

        // 5. Response payload
        Map<String, Object> data = new HashMap<>();
        data.put("userId", savedUser.getId());
        data.put("employeeId", savedUser.getEmployeeId());
        data.put("email", savedUser.getEmail());
        data.put("name", savedUser.getName());
        data.put("role", savedUser.getRole());
        data.put("isVerified", false);
        data.put("verificationToken", verificationToken);
        data.put("verificationUrl", "/api/auth/verify-email?token=" + verificationToken);

        return new ApiResponse<>(true, "Registration successful! Please verify your email to activate your account.", data);
    }

    public ApiResponse<String> verifyEmail(String token) {
        if (token == null || token.trim().isEmpty()) {
            return new ApiResponse<>(false, "Verification token is missing from request.");
        }

        Optional<User> userOptional = userRepository.findByVerificationToken(token);
        if (userOptional.isEmpty()) {
            return new ApiResponse<>(false, "Invalid or expired verification token.");
        }

        User user = userOptional.get();
        if (user.isVerified()) {
            return new ApiResponse<>(true, "Email address is already verified. You can proceed to log in.");
        }

        user.setVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        return new ApiResponse<>(true, "Email successfully verified! Your account is now active.");
    }

    public ApiResponse<AuthResponse> login(SigninRequest request) {
        String input = request.getEmail().toLowerCase().trim();

        Optional<User> userOptional = userRepository.findByEmail(input);
        if (userOptional.isEmpty()) {
            userOptional = userRepository.findByEmployeeId(request.getEmail().trim());
        }

        if (userOptional.isEmpty()) {
            return new ApiResponse<>(false, "Invalid credentials. User does not exist.");
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return new ApiResponse<>(false, "Invalid credentials. Password incorrect.");
        }

        if (!user.isVerified()) {
            return new ApiResponse<>(false, "Account not verified. Please verify your email before logging in.");
        }

        String token = jwtService.generateToken(user);
        AuthResponse.UserSummary summary = new AuthResponse.UserSummary(
                user.getId(),
                user.getEmployeeId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                user.isVerified()
        );

        AuthResponse authResponse = new AuthResponse(token, summary);
        return new ApiResponse<>(true, "Sign in successful!", authResponse);
    }

    public ApiResponse<UserProfileDto> getUserProfile(User user) {
        Optional<EmployeeProfile> profileOpt = employeeProfileRepository.findByUser(user);

        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setEmployeeId(user.getEmployeeId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setRole(user.getRole());
        dto.setVerified(user.isVerified());
        dto.setCreatedAt(user.getCreatedAt());

        if (profileOpt.isPresent()) {
            EmployeeProfile profile = profileOpt.get();
            dto.setPhone(profile.getPhone());
            dto.setAddress(profile.getAddress());
            dto.setProfilePicture(profile.getProfilePicture());
            dto.setJobTitle(profile.getJobTitle());
            dto.setDepartment(profile.getDepartment());
            dto.setDateOfJoining(profile.getDateOfJoining());
            dto.setSalaryBase(profile.getSalaryBase());
        }

        return new ApiResponse<>(true, "Profile details fetched successfully.", dto);
    }
}
