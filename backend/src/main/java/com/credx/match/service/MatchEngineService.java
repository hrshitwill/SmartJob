package com.credx.match.service;

import com.credx.match.dto.JobDTO;
import com.credx.match.dto.JobMatchDTO;
import com.credx.match.dto.StudentProfileDTO;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MatchEngineService {

    private final Map<String, String> SKILL_ROADMAPS = Map.of(
            "Angular", "https://angular.dev/tutorials",
            "Spring Boot", "https://spring.academy/courses",
            "TypeScript", "https://www.typescriptlang.org/docs/",
            "RxJS", "https://rxjs.dev/guide/overview",
            "SQL", "https://sqlbolt.com/",
            "Docker", "https://docs.docker.com/get-started/",
            "Figma", "https://help.figma.com/hc/en-us"
    );

    public JobMatchDTO calculateMatch(StudentProfileDTO student, JobDTO job) {
        List<String> required = job.getSkillsRequired() != null ? job.getSkillsRequired() : Collections.emptyList();
        List<String> studentSkills = student.getSkills() != null ? student.getSkills() : Collections.emptyList();

        List<String> matchingSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String req : required) {
            boolean hasSkill = studentSkills.stream().anyMatch(s -> s.equalsIgnoreCase(req));
            if (hasSkill) {
                matchingSkills.add(req);
            } else {
                missingSkills.add(req);
            }
        }

        // 1. Skill Score (50%)
        double skillRatio = required.isEmpty() ? 1.0 : (double) matchingSkills.size() / required.size();
        double skillScore = skillRatio * 50.0;

        // 2. GPA Score (30%)
        double gpaThreshold = job.getGpaThreshold() != null ? job.getGpaThreshold() : 0.0;
        double studentGpa = student.getGpa() != null ? student.getGpa() : 0.0;
        double gpaScore = 30.0;
        if (gpaThreshold > 0 && studentGpa < gpaThreshold) {
            gpaScore = (studentGpa / gpaThreshold) * 30.0;
        }

        // 3. Work Authorization Score (20%)
        boolean jobSponsors = Boolean.TRUE.equals(job.getSponsorshipRequired());
        boolean studentAuthorized = "authorized".equalsIgnoreCase(student.getWorkAuthorization());
        double workAuthScore = 20.0;

        if (!studentAuthorized && !jobSponsors) {
            workAuthScore = 0.0;
        }

        int overallScore = (int) Math.round(skillScore + gpaScore + workAuthScore);
        overallScore = Math.min(Math.max(overallScore, 35), 98); // Clamp between 35 and 98

        String explanation;
        if (overallScore >= 85) {
            explanation = "Exceptional fit! High technical skill alignment (" + matchingSkills.size() + "/" + required.size() + " skills) and meets GPA threshold (" + studentGpa + "/" + gpaThreshold + ").";
        } else if (overallScore >= 65) {
            explanation = "Moderate compatibility. Meets academic and work auth criteria. Acquire " + missingSkills.stream().collect(Collectors.joining(", ")) + " to maximize score.";
        } else {
            explanation = "Low compatibility. Requires additional technical skill alignment in " + missingSkills.stream().collect(Collectors.joining(", ")) + ".";
        }

        List<String> learningResources = missingSkills.stream()
                .map(skill -> skill + " Guide: " + SKILL_ROADMAPS.getOrDefault(skill, "https://developer.mozilla.org/"))
                .collect(Collectors.toList());

        return new JobMatchDTO(job, overallScore, matchingSkills, missingSkills, explanation, learningResources);
    }
}
