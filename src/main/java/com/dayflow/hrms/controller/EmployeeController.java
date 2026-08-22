package com.dayflow.hrms.controller;

import com.dayflow.hrms.dto.ProfileUpdateRequest;
import com.dayflow.hrms.model.EmployeeProfile;
import com.dayflow.hrms.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/employee")
@CrossOrigin(origins = "*")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    /**
     * Get logged-in employee profile
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getMyProfile(@RequestParam String email) {
        return employeeService.getEmployeeByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Self-service profile update (Limited to phone, address, profilePicUrl, about)
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateMyProfile(@RequestParam String email,
                                             @RequestBody ProfileUpdateRequest request) {
        try {
            EmployeeProfile updated = employeeService.updateSelfProfile(email, request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
