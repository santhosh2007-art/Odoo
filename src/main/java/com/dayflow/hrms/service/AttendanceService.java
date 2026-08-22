package com.dayflow.hrms.service;

import com.dayflow.hrms.dto.AttendanceAdminUpdateRequest;
import com.dayflow.hrms.dto.AttendancePunchRequest;
import com.dayflow.hrms.model.Attendance;
import com.dayflow.hrms.model.AttendanceStatus;
import com.dayflow.hrms.model.EmployeeProfile;
import com.dayflow.hrms.repository.AttendanceRepository;
import com.dayflow.hrms.repository.EmployeeProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeProfileRepository employeeProfileRepository;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             EmployeeProfileRepository employeeProfileRepository) {
        this.attendanceRepository = attendanceRepository;
        this.employeeProfileRepository = employeeProfileRepository;
    }

    /**
     * Check-in punch for current employee
     */
    @Transactional
    public Attendance checkIn(String email, AttendancePunchRequest request) {
        EmployeeProfile employee = employeeProfileRepository.findByUserEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Employee not found for email: " + email));

        LocalDate today = LocalDate.now();
        Optional<Attendance> existingOpt = attendanceRepository.findByEmployeeAndDate(employee, today);

        Attendance attendance;
        if (existingOpt.isPresent()) {
            attendance = existingOpt.get();
            if (attendance.getCheckInTime() != null) {
                throw new IllegalStateException("You have already checked in today at " + attendance.getCheckInTime());
            }
            attendance.setCheckInTime(LocalTime.now());
            attendance.setStatus(AttendanceStatus.PRESENT);
        } else {
            attendance = new Attendance();
            attendance.setEmployee(employee);
            attendance.setDate(today);
            attendance.setCheckInTime(LocalTime.now());
            attendance.setStatus(AttendanceStatus.PRESENT);
            attendance.setWorkHours(0.0);
        }

        if (request != null && request.getRemarks() != null) {
            attendance.setRemarks(request.getRemarks());
        }

        return attendanceRepository.save(attendance);
    }

    /**
     * Check-out punch for current employee
     */
    @Transactional
    public Attendance checkOut(String email, AttendancePunchRequest request) {
        EmployeeProfile employee = employeeProfileRepository.findByUserEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Employee not found for email: " + email));

        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByEmployeeAndDate(employee, today)
                .orElseThrow(() -> new IllegalStateException("Cannot check out without checking in first today."));

        LocalTime now = LocalTime.now();
        attendance.setCheckOutTime(now);

        if (attendance.getCheckInTime() != null) {
            Duration duration = Duration.between(attendance.getCheckInTime(), now);
            double hours = (double) duration.toMinutes() / 60.0;
            // Round to 2 decimal places
            double roundedHours = Math.round(hours * 100.0) / 100.0;
            attendance.setWorkHours(roundedHours);

            if (roundedHours < 4.0) {
                attendance.setStatus(AttendanceStatus.HALF_DAY);
            } else {
                attendance.setStatus(AttendanceStatus.PRESENT);
            }
        }

        if (request != null && request.getRemarks() != null) {
            attendance.setRemarks(request.getRemarks());
        }

        return attendanceRepository.save(attendance);
    }

    /**
     * Get attendance history for employee
     */
    public List<Attendance> getEmployeeAttendance(String email) {
        EmployeeProfile employee = employeeProfileRepository.findByUserEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Employee not found for email: " + email));
        return attendanceRepository.findByEmployeeOrderByDateDesc(employee);
    }

    /**
     * Get weekly attendance for an employee
     */
    public List<Attendance> getWeeklyAttendanceForEmployee(String email, LocalDate startOfWeek, LocalDate endOfWeek) {
        EmployeeProfile employee = employeeProfileRepository.findByUserEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Employee not found for email: " + email));
        return attendanceRepository.findByEmployeeAndDateBetweenOrderByDateAsc(employee, startOfWeek, endOfWeek);
    }

    /**
     * Admin view: Get all attendance logs for a specific date
     */
    public List<Attendance> getCompanyAttendanceForDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }

    /**
     * Admin view: Get all attendance logs between dates
     */
    public List<Attendance> getCompanyAttendanceBetween(LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByDateBetween(startDate, endDate);
    }

    /**
     * Admin: Update or override employee attendance record
     */
    @Transactional
    public Attendance adminUpdateAttendance(Long attendanceId, AttendanceAdminUpdateRequest request) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found with ID: " + attendanceId));

        if (request.getStatus() != null) attendance.setStatus(request.getStatus());
        if (request.getCheckInTime() != null) attendance.setCheckInTime(request.getCheckInTime());
        if (request.getCheckOutTime() != null) attendance.setCheckOutTime(request.getCheckOutTime());
        if (request.getRemarks() != null) attendance.setRemarks(request.getRemarks());

        if (attendance.getCheckInTime() != null && attendance.getCheckOutTime() != null) {
            Duration duration = Duration.between(attendance.getCheckInTime(), attendance.getCheckOutTime());
            double hours = Math.max(0.0, (double) duration.toMinutes() / 60.0);
            attendance.setWorkHours(Math.round(hours * 100.0) / 100.0);
        }

        return attendanceRepository.save(attendance);
    }

    /**
     * Attendance Stats for today
     */
    public Map<String, Object> getTodayStats() {
        LocalDate today = LocalDate.now();
        long present = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.PRESENT);
        long absent = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.ABSENT);
        long halfDay = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.HALF_DAY);
        long onLeave = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.ON_LEAVE);
        long totalEmployees = employeeProfileRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("date", today);
        stats.put("totalEmployees", totalEmployees);
        stats.put("present", present);
        stats.put("absent", absent);
        stats.put("halfDay", halfDay);
        stats.put("onLeave", onLeave);
        stats.put("attendanceRate", totalEmployees > 0 ? Math.round(((double) present / totalEmployees) * 100.0) : 0);

        return stats;
    }
}
