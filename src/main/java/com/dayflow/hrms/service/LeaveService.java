package com.dayflow.hrms.service;

import com.dayflow.hrms.dto.LeaveApplicationRequest;
import com.dayflow.hrms.dto.LeaveApprovalRequest;
import com.dayflow.hrms.model.*;
import com.dayflow.hrms.repository.AttendanceRepository;
import com.dayflow.hrms.repository.EmployeeProfileRepository;
import com.dayflow.hrms.repository.LeaveRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final AttendanceRepository attendanceRepository;

    public LeaveService(LeaveRequestRepository leaveRequestRepository,
                        EmployeeProfileRepository employeeProfileRepository,
                        AttendanceRepository attendanceRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.employeeProfileRepository = employeeProfileRepository;
        this.attendanceRepository = attendanceRepository;
    }

    /**
     * Employee applies for leave
     */
    @Transactional
    public LeaveRequest applyForLeave(String email, LeaveApplicationRequest request) {
        EmployeeProfile employee = employeeProfileRepository.findByUserEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Employee not found for email: " + email));

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date.");
        }

        int totalDays = (int) ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;

        LeaveRequest leave = new LeaveRequest();
        leave.setEmployee(employee);
        leave.setLeaveType(request.getLeaveType());
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());
        leave.setTotalDays(totalDays);
        leave.setReason(request.getReason());
        leave.setStatus(LeaveStatus.PENDING);
        leave.setAppliedAt(LocalDateTime.now());

        return leaveRequestRepository.save(leave);
    }

    /**
     * Get leave requests for employee
     */
    public List<LeaveRequest> getEmployeeLeaves(String email) {
        EmployeeProfile employee = employeeProfileRepository.findByUserEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Employee not found for email: " + email));
        return leaveRequestRepository.findByEmployeeOrderByAppliedAtDesc(employee);
    }

    /**
     * Admin view: Get all leave requests
     */
    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findAllByOrderByAppliedAtDesc();
    }

    /**
     * Admin view: Get leave requests by status
     */
    public List<LeaveRequest> getLeaveRequestsByStatus(LeaveStatus status) {
        return leaveRequestRepository.findByStatusOrderByAppliedAtDesc(status);
    }

    /**
     * Admin: Approve or Reject leave request with comments
     */
    @Transactional
    public LeaveRequest reviewLeaveRequest(Long leaveId, String reviewerEmail, LeaveApprovalRequest request) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found with ID: " + leaveId));

        leave.setStatus(request.getStatus());
        leave.setAdminComments(request.getAdminComments());
        leave.setReviewedBy(reviewerEmail);
        leave.setReviewedAt(LocalDateTime.now());

        // If approved, create/update attendance records for those dates with ON_LEAVE status
        if (request.getStatus() == LeaveStatus.APPROVED) {
            LocalDate cur = leave.getStartDate();
            while (!cur.isAfter(leave.getEndDate())) {
                LocalDate date = cur;
                Attendance att = attendanceRepository.findByEmployeeAndDate(leave.getEmployee(), date)
                        .orElseGet(() -> {
                            Attendance newAtt = new Attendance();
                            newAtt.setEmployee(leave.getEmployee());
                            newAtt.setDate(date);
                            return newAtt;
                        });
                att.setStatus(AttendanceStatus.ON_LEAVE);
                att.setRemarks("Approved " + leave.getLeaveType() + " Leave: " + leave.getReason());
                att.setWorkHours(0.0);
                attendanceRepository.save(att);
                cur = cur.plusDays(1);
            }
        }

        return leaveRequestRepository.save(leave);
    }

    /**
     * Leave summary stats
     */
    public Map<String, Object> getLeaveStats() {
        long pending = leaveRequestRepository.countByStatus(LeaveStatus.PENDING);
        long approved = leaveRequestRepository.countByStatus(LeaveStatus.APPROVED);
        long rejected = leaveRequestRepository.countByStatus(LeaveStatus.REJECTED);

        Map<String, Object> stats = new HashMap<>();
        stats.put("pending", pending);
        stats.put("approved", approved);
        stats.put("rejected", rejected);
        stats.put("total", pending + approved + rejected);
        return stats;
    }
}
