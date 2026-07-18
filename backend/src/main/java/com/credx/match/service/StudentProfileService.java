package com.credx.match.service;

import com.credx.match.dto.ProfileStrengthDTO;
import com.credx.match.dto.StudentProfileDTO;
import com.credx.match.entity.Skill;
import com.credx.match.entity.StudentProfile;
import com.credx.match.entity.User;
import com.credx.match.repository.SkillRepository;
import com.credx.match.repository.StudentProfileRepository;
import com.credx.match.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    public StudentProfileService(StudentProfileRepository studentProfileRepository,
                                 UserRepository userRepository,
                                 SkillRepository skillRepository) {
        this.studentProfileRepository = studentProfileRepository;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
    }

    public StudentProfileDTO getProfileByEmail(String email) {
        StudentProfile profile = studentProfileRepository.findByUserEmail(email)
                .orElseGet(() -> createDefaultProfileForEmail(email));
        return convertToDTO(profile);
    }

    public StudentProfileDTO getProfileById(Long id) {
        StudentProfile profile = studentProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student profile not found with ID: " + id));
        return convertToDTO(profile);
    }

    @Transactional
    public StudentProfileDTO updateProfile(String email, StudentProfileDTO dto) {
        StudentProfile profile = studentProfileRepository.findByUserEmail(email)
                .orElseGet(() -> createDefaultProfileForEmail(email));

        if (dto.getGpa() != null) profile.setGpa(dto.getGpa());
        if (dto.getWorkAuthorization() != null) profile.setWorkAuthorization(dto.getWorkAuthorization());
        if (dto.getPreferredRole() != null) profile.setPreferredRole(dto.getPreferredRole());
        if (dto.getPreferredLocation() != null) profile.setPreferredLocation(dto.getPreferredLocation());
        if (dto.getPreferredWorkMode() != null) profile.setPreferredWorkMode(dto.getPreferredWorkMode());
        if (dto.getResumeName() != null) profile.setResumeName(dto.getResumeName());
        if (dto.getGithubUrl() != null) profile.setGithubUrl(dto.getGithubUrl());
        if (dto.getLinkedinUrl() != null) profile.setLinkedinUrl(dto.getLinkedinUrl());
        if (dto.getPortfolioUrl() != null) profile.setPortfolioUrl(dto.getPortfolioUrl());
        if (dto.getProjectsCount() != null) profile.setProjectsCount(dto.getProjectsCount());

        if (dto.getSkills() != null) {
            Set<Skill> skillEntities = new HashSet<>();
            for (String skillName : dto.getSkills()) {
                Skill skill = skillRepository.findByName(skillName)
                        .orElseGet(() -> skillRepository.save(new Skill(skillName)));
                skillEntities.add(skill);
            }
            profile.setSkills(skillEntities);
        }

        if (dto.getCertifications() != null) {
            profile.setCertifications(new ArrayList<>(dto.getCertifications()));
        }

        StudentProfile saved = studentProfileRepository.save(profile);
        return convertToDTO(saved);
    }

    public ProfileStrengthDTO calculateProfileStrength(String email) {
        StudentProfile profile = studentProfileRepository.findByUserEmail(email)
                .orElseGet(() -> createDefaultProfileForEmail(email));

        int score = 0;
        List<String> tips = new ArrayList<>();

        // 1. Basic Info (10%)
        if (profile.getUser() != null && profile.getUser().getFullName() != null) score += 10;

        // 2. Preferences (15%)
        if (profile.getPreferredRole() != null && profile.getPreferredLocation() != null) {
            score += 15;
        } else {
            tips.add("🎯 Specify your preferred role and location (+15% strength)");
        }

        // 3. GPA (15%)
        if (profile.getGpa() != null && profile.getGpa() > 0) {
            score += 15;
        } else {
            tips.add("🎓 Add your cumulative GPA (+15% strength)");
        }

        // 4. Skills (15%)
        int skillCount = profile.getSkills() != null ? profile.getSkills().size() : 0;
        if (skillCount > 0) {
            score += Math.min(skillCount * 3, 15);
        }
        if (skillCount < 5) {
            tips.add("⚡ Add " + (5 - skillCount) + " more skills to boost match rankings");
        }

        // 5. Work Auth (10%)
        if (profile.getWorkAuthorization() != null) score += 10;

        // 6. Resume (15%)
        if (profile.getResumeName() != null && !profile.getResumeName().isEmpty()) {
            score += 15;
        } else {
            tips.add("📄 Upload your resume (+15% strength)");
        }

        // 7. Socials (10%)
        if (profile.getGithubUrl() != null && !profile.getGithubUrl().isEmpty()) {
            score += 5;
        } else {
            tips.add("💻 Connect GitHub profile (+5% strength)");
        }
        if (profile.getLinkedinUrl() != null && !profile.getLinkedinUrl().isEmpty()) {
            score += 5;
        } else {
            tips.add("👔 Add LinkedIn profile (+5% strength)");
        }

        // 8. Projects & Certs (10%)
        if (profile.getProjectsCount() != null && profile.getProjectsCount() > 0) score += 5;
        if (profile.getCertifications() != null && !profile.getCertifications().isEmpty()) score += 5;

        int finalScore = Math.min(score, 100);

        String level;
        String badgeClass;
        if (finalScore < 30) {
            level = "Getting Started"; badgeClass = "badge-warning";
        } else if (finalScore < 60) {
            level = "Building Profile"; badgeClass = "badge-info";
        } else if (finalScore < 80) {
            level = "Recruiter Ready ⭐"; badgeClass = "badge-success";
        } else if (finalScore < 95) {
            level = "Strong Candidate 🚀"; badgeClass = "badge-primary";
        } else {
            level = "Complete Profile 🏆"; badgeClass = "badge-primary";
        }

        return new ProfileStrengthDTO(finalScore, level, badgeClass, tips);
    }

    private StudentProfile createDefaultProfileForEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        
        StudentProfile profile = new StudentProfile(user);
        profile.setPreferredRole("Frontend Developer");
        profile.setPreferredLocation("Chicago, IL");
        profile.setPreferredWorkMode("remote");
        return studentProfileRepository.save(profile);
    }

    public StudentProfileDTO convertToDTO(StudentProfile profile) {
        StudentProfileDTO dto = new StudentProfileDTO();
        dto.setId(profile.getId() != null ? profile.getId().toString() : "prof-alex");
        dto.setUserId(profile.getUser() != null ? profile.getUser().getId().toString() : "usr-student");
        dto.setName(profile.getUser() != null ? profile.getUser().getFullName() : "Alex Johnson");
        dto.setEmail(profile.getUser() != null ? profile.getUser().getEmail() : "student@credx.com");
        dto.setGpa(profile.getGpa() != null ? profile.getGpa() : 3.65);
        
        if (profile.getSkills() != null) {
            dto.setSkills(profile.getSkills().stream().map(Skill::getName).collect(Collectors.toList()));
        } else {
            dto.setSkills(Arrays.asList("Angular", "TypeScript", "SCSS", "RxJS", "Java", "Spring Boot", "SQL"));
        }

        dto.setResumeName(profile.getResumeName() != null ? profile.getResumeName() : "alex_johnson_resume.pdf");
        dto.setWorkAuthorization(profile.getWorkAuthorization() != null ? profile.getWorkAuthorization() : "authorized");
        dto.setPreferredRole(profile.getPreferredRole() != null ? profile.getPreferredRole() : "Frontend Developer");
        dto.setPreferredLocation(profile.getPreferredLocation() != null ? profile.getPreferredLocation() : "Chicago, IL");
        dto.setPreferredWorkMode(profile.getPreferredWorkMode() != null ? profile.getPreferredWorkMode() : "remote");
        dto.setGithubUrl(profile.getGithubUrl() != null ? profile.getGithubUrl() : "https://github.com/alexjohnson");
        dto.setLinkedinUrl(profile.getLinkedinUrl() != null ? profile.getLinkedinUrl() : "https://linkedin.com/in/alexjohnson");
        dto.setPortfolioUrl(profile.getPortfolioUrl() != null ? profile.getPortfolioUrl() : "https://alexjohnson.dev");
        dto.setCertifications(profile.getCertifications() != null ? profile.getCertifications() : Arrays.asList("Angular Developer Associate", "Spring Core Professional"));
        dto.setProjectsCount(profile.getProjectsCount() != null ? profile.getProjectsCount() : 3);

        return dto;
    }
}
