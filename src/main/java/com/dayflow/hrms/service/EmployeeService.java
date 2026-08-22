package com.dayflow.hrms.service;

import com.dayflow.hrms.dto.AdminEmployeeUpdateRequest;
import com.dayflow.hrms.dto.ProfileUpdateRequest;
import com.dayflow.hrms.model.EmployeeProfile;
import com.dayflow.hrms.repository.EmployeeProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {

    private final EmployeeProfileRepository employeeProfileRepository;

    public EmployeeService(EmployeeProfileRepository employeeProfileRepository) {
        this.employeeProfileRepository = employeeProfileRepository;
    }

    public List<EmployeeProfile> getAllEmployees() {
        return employeeProfileRepository.findAll();
    }

    public Optional<EmployeeProfile> getEmployeeById(Long id) {
        return employeeProfileRepository.findById(id);
    }

    public Optional<EmployeeProfile> getEmployeeByEmail(String email) {
        return employeeProfileRepository.findByUserEmail(email.trim().toLowerCase());
    }

    public Optional<EmployeeProfile> getEmployeeByEmployeeId(String employeeId) {
        return employeeProfileRepository.findByUserEmployeeId(employeeId);
    }

    public List<EmployeeProfile> searchEmployees(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllEmployees();
        }
        return employeeProfileRepository.searchEmployees(query.trim());
    }

    public List<EmployeeProfile> getEmployeesByDepartment(String department) {
        return employeeProfileRepository.findByDepartmentIgnoreCase(department);
    }

    /**
     * Limited edit by Employee (Phone, Address, Profile Picture, About)
     */
    @Transactional
    public EmployeeProfile updateSelfProfile(String email, ProfileUpdateRequest request) {
        EmployeeProfile profile = employeeProfileRepository.findByUserEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Employee profile not found for email: " + email));

        if (request.getPhone() != null) {
            profile.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            profile.setAddress(request.getAddress());
        }
        if (request.getProfilePicUrl() != null && !request.getProfilePicUrl().trim().isEmpty()) {
            profile.setProfilePicUrl(request.getProfilePicUrl());
        }
        if (request.getAbout() != null) {
            profile.setAbout(request.getAbout());
        }

        return employeeProfileRepository.save(profile);
    }

    /**
     * Full edit by Admin / HR Officer (All fields)
     */
    @Transactional
    public EmployeeProfile adminUpdateEmployee(Long employeeId, AdminEmployeeUpdateRequest request) {
        EmployeeProfile profile = employeeProfileRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee profile not found with ID: " + employeeId));

        if (request.getFirstName() != null) profile.setFirstName(request.getFirstName());
        if (request.getLastName() != null) profile.setLastName(request.getLastName());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getAddress() != null) profile.setAddress(request.getAddress());
        if (request.getJobTitle() != null) profile.setJobTitle(request.getJobTitle());
        if (request.getDepartment() != null) profile.setDepartment(request.getDepartment());
        if (request.getDateOfJoining() != null) profile.setDateOfJoining(request.getDateOfJoining());
        if (request.getProfilePicUrl() != null) profile.setProfilePicUrl(request.getProfilePicUrl());
        if (request.getDocuments() != null) profile.setDocuments(request.getDocuments());
        if (request.getAbout() != null) profile.setAbout(request.getAbout());

        return employeeProfileRepository.save(profile);
    }
}
