package com.credx.match.controller;

import com.credx.match.dto.ProfileStrengthDTO;
import com.credx.match.dto.StudentProfileDTO;
import com.credx.match.service.StudentProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    public StudentProfileController(StudentProfileService studentProfileService) {
        this.studentProfileService = studentProfileService;
    }

    @GetMapping("/me")
    public ResponseEntity<StudentProfileDTO> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : "student@credx.com";
        StudentProfileDTO profile = studentProfileService.getProfileByEmail(email);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<StudentProfileDTO> updateMyProfile(@AuthenticationPrincipal UserDetails userDetails,
                                                            @RequestBody StudentProfileDTO dto) {
        String email = userDetails != null ? userDetails.getUsername() : "student@credx.com";
        StudentProfileDTO updated = studentProfileService.updateProfile(email, dto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentProfileDTO> getStudentById(@PathVariable Long id) {
        StudentProfileDTO profile = studentProfileService.getProfileById(id);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/me/profile-strength")
    public ResponseEntity<ProfileStrengthDTO> getProfileStrength(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : "student@credx.com";
        ProfileStrengthDTO strength = studentProfileService.calculateProfileStrength(email);
        return ResponseEntity.ok(strength);
    }
}
