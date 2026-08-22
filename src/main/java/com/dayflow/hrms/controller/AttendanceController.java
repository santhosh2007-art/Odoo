package com.dayflow.hrms.controller;

import com.dayflow.hrms.dto.AttendanceAdminUpdateRequest;
import com.dayflow.hrms.dto.AttendancePunchRequest;
import com.dayflow.hrms.model.Attendance;
import com.dayflow.hrms.service.AttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    /**
     * Check-in punch
     */
    @PostMapping("/punch-in")
    public ResponseEntity<?> checkIn(@RequestParam String email,
                                     @RequestBody(required = false) AttendancePunchRequest request) {
        try {
            Attendance attendance = attendanceService.checkIn(email, request);
            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Check-out punch
     */
    @PostMapping("/punch-out")
    public ResponseEntity<?> checkOut(@RequestParam String email,
                                      @RequestBody(required = false) AttendancePunchRequest request) {
        try {
            Attendance attendance = attendanceService.checkOut(email, request);
            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Personal attendance history
     */
    @GetMapping("/my-logs")
    public ResponseEntity<?> getMyAttendanceLogs(@RequestParam String email) {
        try {
            List<Attendance> logs = attendanceService.getEmployeeAttendance(email);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Company-wide attendance records (Admin)
     */
    @GetMapping("/company-logs")
    public ResponseEntity<List<Attendance>> getCompanyAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (startDate != null && endDate != null) {
            return ResponseEntity.ok(attendanceService.getCompanyAttendanceBetween(startDate, endDate));
        }

        LocalDate targetDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(attendanceService.getCompanyAttendanceForDate(targetDate));
    }

    /**
     * Admin override / update attendance record
     */
    @PutMapping("/{id}/update")
    public ResponseEntity<?> adminUpdateAttendance(@PathVariable Long id,
                                                   @RequestBody AttendanceAdminUpdateRequest request) {
        try {
            Attendance updated = attendanceService.adminUpdateAttendance(id, request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Today attendance statistics
     */
    @GetMapping("/today-stats")
    public ResponseEntity<Map<String, Object>> getTodayStats() {
        return ResponseEntity.ok(attendanceService.getTodayStats());
    }
}
