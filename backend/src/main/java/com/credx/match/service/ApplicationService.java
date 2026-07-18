package com.credx.match.service;

import com.credx.match.dto.ApplicationDTO;
import com.credx.match.dto.ApplicationRequestDTO;
import com.credx.match.dto.JobDTO;
import com.credx.match.dto.JobMatchDTO;
import com.credx.match.dto.StudentProfileDTO;
import com.credx.match.entity.Application;
import com.credx.match.entity.Job;
import com.credx.match.entity.StudentProfile;
import com.credx.match.repository.ApplicationRepository;
import com.credx.match.repository.JobRepository;
import com.credx.match.repository.StudentProfileRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final JobRepository jobRepository;
    private final StudentProfileService studentProfileService;
    private final MatchEngineService matchEngineService;
    private final JobService jobService;

    public ApplicationService(ApplicationRepository applicationRepository,
                              StudentProfileRepository studentProfileRepository,
                              JobRepository jobRepository,
                              StudentProfileService studentProfileService,
                              MatchEngineService matchEngineService,
                              JobService jobService) {
        this.applicationRepository = applicationRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.jobRepository = jobRepository;
        this.studentProfileService = studentProfileService;
        this.matchEngineService = matchEngineService;
        this.jobService = jobService;
    }

    @PostConstruct
    public void seedInitialApplications() {
        if (applicationRepository.count() == 0) {
            try {
                StudentProfile student = studentProfileRepository.findAll().stream().findFirst().orElse(null);
                List<Job> jobs = jobRepository.findAll();
                if (student != null && !jobs.isEmpty()) {
                    Job stripeJob = jobs.get(0);
                    Job airbnbJob = jobs.size() > 5 ? jobs.get(5) : jobs.get(0);

                    Application app1 = new Application(stripeJob, student, 85, "2026-07-16");
                    app1.setStatus("applied");
                    applicationRepository.save(app1);

                    Application app2 = new Application(airbnbJob, student, 90, "2026-07-12");
                    app2.setStatus("interviewing");
                    applicationRepository.save(app2);
                }
            } catch (Exception e) {
                // Ignore seeding error if missing initial data
            }
        }
    }

    @Transactional
    public ApplicationDTO applyToJob(String email, ApplicationRequestDTO dto) {
        StudentProfile profile = studentProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Student profile not found for email: " + email));

        Job job = jobRepository.findById(dto.getJobId())
                .orElseThrow(() -> new RuntimeException("Job posting not found with ID: " + dto.getJobId()));

        if (applicationRepository.existsByJobIdAndStudentId(job.getId(), profile.getId())) {
            throw new RuntimeException("You have already applied for this role.");
        }

        StudentProfileDTO studentDTO = studentProfileService.convertToDTO(profile);
        JobDTO jobDTO = jobService.getJobById(job.getId());
        JobMatchDTO match = matchEngineService.calculateMatch(studentDTO, jobDTO);

        Application application = new Application(
                job,
                profile,
                match.getScore(),
                LocalDate.now().toString()
        );

        Application saved = applicationRepository.save(application);
        return convertToDTO(saved);
    }

    public List<ApplicationDTO> getStudentApplications(String email) {
        StudentProfile profile = studentProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Student profile not found for email: " + email));

        return applicationRepository.findByStudentId(profile.getId())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ApplicationDTO> getAllApplications() {
        return applicationRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApplicationDTO updateApplicationStatus(Long applicationId, String newStatus) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with ID: " + applicationId));

        application.setStatus(newStatus.toLowerCase());
        Application saved = applicationRepository.save(application);
        return convertToDTO(saved);
    }

    private ApplicationDTO convertToDTO(Application app) {
        ApplicationDTO dto = new ApplicationDTO();
        dto.setId(app.getId().toString());
        dto.setJobId(app.getJob() != null ? app.getJob().getId().toString() : "job-stripe");
        dto.setJobTitle(app.getJob() != null ? app.getJob().getTitle() : "Frontend Engineer");
        dto.setCompanyName(app.getJob() != null ? app.getJob().getCompany() : "Stripe");
        dto.setCompanyLogo(app.getJob() != null ? app.getJob().getCompanyLogo() : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80");
        dto.setStudentId(app.getStudent() != null ? app.getStudent().getId().toString() : "prof-alex");
        dto.setAppliedDate(app.getAppliedDate() != null ? app.getAppliedDate() : LocalDate.now().toString());
        dto.setStatus(app.getStatus());
        dto.setMatchScore(app.getMatchScore());
        return dto;
    }
}
