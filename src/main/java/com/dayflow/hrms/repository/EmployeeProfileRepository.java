package com.dayflow.hrms.repository;

import com.dayflow.hrms.model.EmployeeProfile;
import com.dayflow.hrms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeProfileRepository extends JpaRepository<EmployeeProfile, Long> {
    Optional<EmployeeProfile> findByUser(User user);
    Optional<EmployeeProfile> findByUserEmail(String email);
    Optional<EmployeeProfile> findByUserEmployeeId(String employeeId);

    @Query("SELECT e FROM EmployeeProfile e WHERE " +
           "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.jobTitle) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.department) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.user.employeeId) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<EmployeeProfile> searchEmployees(@Param("query") String query);

    List<EmployeeProfile> findByDepartmentIgnoreCase(String department);
}
