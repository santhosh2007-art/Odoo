package com.dayflow.hrms.repository;

import com.dayflow.hrms.model.EmployeeProfile;
import com.dayflow.hrms.model.Payslip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayslipRepository extends JpaRepository<Payslip, Long> {
    List<Payslip> findByEmployeeOrderByYearDescMonthDesc(EmployeeProfile employee);
    List<Payslip> findByEmployeeUserEmailOrderByYearDescMonthDesc(String email);
    Optional<Payslip> findByEmployeeAndMonthAndYear(EmployeeProfile employee, String month, Integer year);
    List<Payslip> findAllByOrderByYearDescMonthDesc();
}
