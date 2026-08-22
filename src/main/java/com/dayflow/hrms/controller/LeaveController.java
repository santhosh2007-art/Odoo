package com.dayflow.hrms.controller;

import com.dayflow.hrms.dto.LeaveApplicationRequest;
import com.dayflow.hrms.dto.LeaveApprovalRequest;
import com.dayflow.hrms.model.LeaveRequest;
import com.dayflow.hrms.model.LeaveStatus;
import com.dayflow.hrms.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "*")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    /**
     * Apply for leave (Employee)
     */
    @PostMapping("/apply")
    public ResponseEntity<?> applyForLeave(@RequestParam String email,
                                           @Valid @RequestBody LeaveApplicationRequest request) {
        try {
            LeaveRequest leave = leaveService.applyForLeave(email, request);
            return ResponseEntity.ok(leave);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get employee's own leave requests
     */
    @GetMapping("/my-leaves")
    public ResponseEntity<?> getMyLeaves(@RequestParam String email) {
        try {
            List<LeaveRequest> leaves = leaveService.getEmployeeLeaves(email);
            return ResponseEntity.ok(leaves);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Admin view: Get all leave requests
     */
    @GetMapping("/all")
    public ResponseEntity<List<LeaveRequest>> getAllLeaves(@RequestParam(required = false) LeaveStatus status) {
        if (status != null) {
            return ResponseEntity.ok(leaveService.getLeaveRequestsByStatus(status));
        }
        return ResponseEntity.ok(leaveService.getAllLeaveRequests());
    }

    /**
     * Admin: Approve or Reject leave request
     */
    @PutMapping("/{id}/review")
    public ResponseEntity<?> reviewLeave(@PathVariable Long id,
                                         @RequestParam String reviewerEmail,
                                         @Valid @RequestBody LeaveApprovalRequest request) {
        try {
            LeaveRequest reviewed = leaveService.reviewLeaveRequest(id, reviewerEmail, request);
            return ResponseEntity.ok(reviewed);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Leave statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getLeaveStats() {
        return ResponseEntity.ok(leaveService.getLeaveStats());
    }
}
