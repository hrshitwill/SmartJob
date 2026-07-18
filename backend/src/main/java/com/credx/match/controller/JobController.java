package com.credx.match.controller;

import com.credx.match.dto.JobDTO;
import com.credx.match.dto.JobMatchDTO;
import com.credx.match.dto.StudentProfileDTO;
import com.credx.match.service.JobService;
import com.credx.match.service.StudentProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;
    private final StudentProfileService studentProfileService;

    public JobController(JobService jobService, StudentProfileService studentProfileService) {
        this.jobService = jobService;
        this.studentProfileService = studentProfileService;
    }

    @GetMapping
    public ResponseEntity<List<JobDTO>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDTO> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @PostMapping
    public ResponseEntity<JobDTO> createJob(@RequestBody JobDTO dto) {
        return ResponseEntity.ok(jobService.createJob(dto));
    }

    @GetMapping("/recommended")
    public ResponseEntity<List<JobMatchDTO>> getRecommendedJobs(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : "student@credx.com";
        StudentProfileDTO student = studentProfileService.getProfileByEmail(email);
        List<JobMatchDTO> recommended = jobService.getRecommendedJobs(student);
        return ResponseEntity.ok(recommended);
    }

    @GetMapping("/{id}/match")
    public ResponseEntity<JobMatchDTO> getJobMatch(@PathVariable Long id,
                                                   @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : "student@credx.com";
        StudentProfileDTO student = studentProfileService.getProfileByEmail(email);
        JobMatchDTO match = jobService.getJobMatchForStudent(id, student);
        return ResponseEntity.ok(match);
    }
}
