package com.credx.match.repository;

import com.credx.match.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudentId(Long studentId);
    Boolean existsByJobIdAndStudentId(Long jobId, Long studentId);
    Optional<Application> findByJobIdAndStudentId(Long jobId, Long studentId);
}
