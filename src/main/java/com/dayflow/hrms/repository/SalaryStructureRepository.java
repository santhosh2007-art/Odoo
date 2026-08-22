package com.dayflow.hrms.repository;

import com.dayflow.hrms.model.EmployeeProfile;
import com.dayflow.hrms.model.SalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SalaryStructureRepository extends JpaRepository<SalaryStructure, Long> {
    Optional<SalaryStructure> findByEmployee(EmployeeProfile employee);
    Optional<SalaryStructure> findByEmployeeId(Long employeeProfileId);
    Optional<SalaryStructure> findByEmployeeUserEmail(String email);
    Optional<SalaryStructure> findByEmployeeUserEmployeeId(String employeeId);
}
