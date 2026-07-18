package com.credx.match.controller;

import com.credx.match.dto.ApplicationDTO;
import com.credx.match.dto.ApplicationRequestDTO;
import com.credx.match.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping("/applications")
    public ResponseEntity<ApplicationDTO> applyToJob(@AuthenticationPrincipal UserDetails userDetails,
                                                    @Valid @RequestBody ApplicationRequestDTO dto) {
        String email = userDetails != null ? userDetails.getUsername() : "student@credx.com";
        ApplicationDTO response = applicationService.applyToJob(email, dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/applications/me")
    public ResponseEntity<List<ApplicationDTO>> getMyApplications(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : "student@credx.com";
        List<ApplicationDTO> applications = applicationService.getStudentApplications(email);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/recruiter/applications")
    public ResponseEntity<List<ApplicationDTO>> getAllApplicationsForRecruiter() {
        List<ApplicationDTO> applications = applicationService.getAllApplications();
        return ResponseEntity.ok(applications);
    }

    @PatchMapping("/recruiter/applications/{id}/status")
    public ResponseEntity<ApplicationDTO> updateApplicationStatus(@PathVariable Long id,
                                                                 @RequestBody Map<String, String> payload) {
        String newStatus = payload.getOrDefault("status", "reviewing");
        ApplicationDTO updated = applicationService.updateApplicationStatus(id, newStatus);
        return ResponseEntity.ok(updated);
    }
}


//final change
