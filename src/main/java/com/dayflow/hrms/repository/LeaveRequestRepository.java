package com.dayflow.hrms.repository;

import com.dayflow.hrms.model.EmployeeProfile;
import com.dayflow.hrms.model.LeaveRequest;
import com.dayflow.hrms.model.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployeeOrderByAppliedAtDesc(EmployeeProfile employee);
    List<LeaveRequest> findAllByOrderByAppliedAtDesc();
    List<LeaveRequest> findByStatusOrderByAppliedAtDesc(LeaveStatus status);
    long countByStatus(LeaveStatus status);
}
