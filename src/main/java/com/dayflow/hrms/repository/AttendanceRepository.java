package com.dayflow.hrms.repository;

import com.dayflow.hrms.model.Attendance;
import com.dayflow.hrms.model.AttendanceStatus;
import com.dayflow.hrms.model.EmployeeProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByEmployeeOrderByDateDesc(EmployeeProfile employee);
    Optional<Attendance> findByEmployeeAndDate(EmployeeProfile employee, LocalDate date);
    List<Attendance> findByDate(LocalDate date);
    List<Attendance> findByDateBetween(LocalDate startDate, LocalDate endDate);
    List<Attendance> findByEmployeeAndDateBetweenOrderByDateAsc(EmployeeProfile employee, LocalDate startDate, LocalDate endDate);
    long countByDateAndStatus(LocalDate date, AttendanceStatus status);
}
