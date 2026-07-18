package com.credx.match.service;

import com.credx.match.dto.JobDTO;
import com.credx.match.dto.JobMatchDTO;
import com.credx.match.dto.StudentProfileDTO;
import com.credx.match.entity.Job;
import com.credx.match.entity.Skill;
import com.credx.match.repository.JobRepository;
import com.credx.match.repository.SkillRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final SkillRepository skillRepository;
    private final MatchEngineService matchEngineService;

    public JobService(JobRepository jobRepository, SkillRepository skillRepository, MatchEngineService matchEngineService) {
        this.jobRepository = jobRepository;
        this.skillRepository = skillRepository;
        this.matchEngineService = matchEngineService;
    }

    @PostConstruct
    public void initSeedJobs() {
        if (jobRepository.count() == 0) {
            seedInitialJobs();
        }
    }

    public List<JobDTO> getAllJobs() {
        return jobRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public JobDTO getJobById(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job posting not found with ID: " + id));
        return convertToDTO(job);
    }

    public List<JobMatchDTO> getRecommendedJobs(StudentProfileDTO student) {
        List<Job> jobs = jobRepository.findAll();
        List<JobMatchDTO> matches = new ArrayList<>();

        for (Job job : jobs) {
            JobDTO jobDTO = convertToDTO(job);
            matches.add(matchEngineService.calculateMatch(student, jobDTO));
        }

        // Sort descending by score
        matches.sort((a, b) -> Integer.compare(b.getScore(), a.getScore()));
        return matches;
    }

    public JobMatchDTO getJobMatchForStudent(Long jobId, StudentProfileDTO student) {
        JobDTO jobDTO = getJobById(jobId);
        return matchEngineService.calculateMatch(student, jobDTO);
    }

    @Transactional
    public JobDTO createJob(JobDTO dto) {
        Job job = new Job();
        job.setTitle(dto.getTitle());
        job.setCompany(dto.getCompany());
        job.setCompanyLogo(dto.getCompanyLogo() != null ? dto.getCompanyLogo() : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80");
        job.setDescription(dto.getDescription());
        job.setLocation(dto.getLocation());
        job.setWorkMode(dto.getWorkMode() != null ? dto.getWorkMode() : "remote");
        job.setGpaThreshold(dto.getGpaThreshold() != null ? dto.getGpaThreshold() : 3.0);
        job.setSponsorshipRequired(dto.getSponsorshipRequired() != null ? dto.getSponsorshipRequired() : false);
        job.setSalaryRange(dto.getSalaryRange() != null ? dto.getSalaryRange() : "$90,000 - $120,000");
        job.setPostedDate("Just now");
        job.setCategory(dto.getCategory() != null ? dto.getCategory() : "Frontend Engineering");

        if (dto.getSkillsRequired() != null) {
            Set<Skill> skillEntities = new HashSet<>();
            for (String skillName : dto.getSkillsRequired()) {
                Skill skill = skillRepository.findByName(skillName)
                        .orElseGet(() -> skillRepository.save(new Skill(skillName)));
                skillEntities.add(skill);
            }
            job.setSkillsRequired(skillEntities);
        }

        Job saved = jobRepository.save(job);
        return convertToDTO(saved);
    }

    private JobDTO convertToDTO(Job job) {
        JobDTO dto = new JobDTO();
        dto.setId(job.getId().toString());
        dto.setTitle(job.getTitle());
        dto.setCompany(job.getCompany());
        dto.setCompanyLogo(job.getCompanyLogo());
        dto.setDescription(job.getDescription());
        dto.setLocation(job.getLocation());
        dto.setWorkMode(job.getWorkMode());
        dto.setGpaThreshold(job.getGpaThreshold());
        dto.setSponsorshipRequired(job.getSponsorshipRequired());
        dto.setSalaryRange(job.getSalaryRange());
        dto.setPostedDate(job.getPostedDate());
        dto.setCategory(job.getCategory());
        dto.setSkillsRequired(job.getSkillsRequired().stream().map(Skill::getName).collect(Collectors.toList()));
        return dto;
    }

    private void seedInitialJobs() {
        createSeedJob("job-stripe", "Frontend Engineer - Payments UI", "Stripe", "Chicago, IL (Hybrid)", "hybrid", 3.5, Arrays.asList("Angular", "TypeScript", "SCSS", "RxJS"), true, "$110,000 - $135,000", "2 days ago", "Frontend Engineering", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80");
        createSeedJob("job-vercel", "Junior Angular Developer", "Vercel", "Remote", "remote", 3.2, Arrays.asList("Angular", "TypeScript", "SCSS", "Figma"), true, "$95,000 - $115,000", "1 day ago", "Frontend Engineering", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80");
        createSeedJob("job-google", "Software Engineer - Spring & Cloud", "Google", "Mountain View, CA", "onsite", 3.7, Arrays.asList("Java", "Spring Boot", "SQL", "Docker"), false, "$130,000 - $160,000", "3 days ago", "Backend Engineering", "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=128&h=128&fit=crop&q=80");
        createSeedJob("job-linear", "Full Stack Web Intern", "Linear", "Remote", "remote", 3.0, Arrays.asList("TypeScript", "Angular", "SQL", "REST API"), true, "$45 / hour", "4 days ago", "Full Stack", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80");
        createSeedJob("job-notion", "UI/UX Developer", "Notion", "San Francisco, CA", "hybrid", 3.4, Arrays.asList("TypeScript", "SCSS", "Figma", "Angular"), true, "$105,000 - $130,000", "5 days ago", "UI/UX Engineering", "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=128&h=128&fit=crop&q=80");
        createSeedJob("job-airbnb", "Junior UI Engineer", "Airbnb", "Chicago, IL", "hybrid", 3.3, Arrays.asList("Angular", "TypeScript", "SCSS", "RxJS"), true, "$100,000 - $125,000", "6 days ago", "Frontend Engineering", "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=128&h=128&fit=crop&q=80");
        createSeedJob("job-datadog", "Backend Microservices Associate", "Datadog", "New York, NY", "onsite", 3.5, Arrays.asList("Java", "Spring Boot", "Docker", "SQL"), false, "$120,000 - $145,000", "1 week ago", "Backend Engineering", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80");
        createSeedJob("job-figma", "Design Systems Specialist", "Figma", "Remote", "remote", 3.2, Arrays.asList("Figma", "TypeScript", "SCSS", "Angular"), true, "$115,000 - $140,000", "1 week ago", "UI/UX Engineering", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80");
    }

    private void createSeedJob(String idStr, String title, String company, String location, String mode, double gpa, List<String> skills, boolean sponsor, String salary, String date, String cat, String logo) {
        Job job = new Job();
        job.setTitle(title);
        job.setCompany(company);
        job.setCompanyLogo(logo);
        job.setDescription("Detailed role description for " + title + " at " + company + ". Join a high-growth team building modern software.");
        job.setLocation(location);
        job.setWorkMode(mode);
        job.setGpaThreshold(gpa);
        job.setSponsorshipRequired(sponsor);
        job.setSalaryRange(salary);
        job.setPostedDate(date);
        job.setCategory(cat);

        Set<Skill> skillEntities = new HashSet<>();
        for (String sName : skills) {
            Skill skill = skillRepository.findByName(sName)
                    .orElseGet(() -> skillRepository.save(new Skill(sName)));
            skillEntities.add(skill);
        }
        job.setSkillsRequired(skillEntities);

        jobRepository.save(job);
    }
}
