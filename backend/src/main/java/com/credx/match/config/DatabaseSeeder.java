package com.credx.match.config;

import com.credx.match.entity.Skill;
import com.credx.match.entity.StudentProfile;
import com.credx.match.entity.User;
import com.credx.match.repository.SkillRepository;
import com.credx.match.repository.StudentProfileRepository;
import com.credx.match.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final SkillRepository skillRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository,
                          StudentProfileRepository studentProfileRepository,
                          SkillRepository skillRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.skillRepository = skillRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed Student User
        if (!userRepository.existsByEmail("student@credx.com")) {
            User studentUser = new User("student@credx.com", passwordEncoder.encode("password"), "Alex Johnson", "student");
            studentUser = userRepository.save(studentUser);

            StudentProfile profile = new StudentProfile(studentUser);
            profile.setGpa(3.65);
            profile.setWorkAuthorization("authorized");
            profile.setPreferredRole("Frontend Developer");
            profile.setPreferredLocation("Chicago, IL");
            profile.setPreferredWorkMode("remote");
            profile.setResumeName("alex_johnson_resume.pdf");
            profile.setGithubUrl("https://github.com/alexjohnson");
            profile.setLinkedinUrl("https://linkedin.com/in/alexjohnson");
            profile.setPortfolioUrl("https://alexjohnson.dev");
            profile.setProjectsCount(3);
            profile.setCertifications(Arrays.asList("Angular Developer Associate", "Spring Core Professional"));

            HashSet<Skill> skills = new HashSet<>();
            for (String sName : Arrays.asList("Angular", "TypeScript", "SCSS", "RxJS", "Java", "Spring Boot", "SQL")) {
                Skill skill = skillRepository.findByName(sName)
                        .orElseGet(() -> skillRepository.save(new Skill(sName)));
                skills.add(skill);
            }
            profile.setSkills(skills);

            studentProfileRepository.save(profile);
        }

        // Seed Recruiter User
        if (!userRepository.existsByEmail("recruiter@credx.com")) {
            User recruiterUser = new User("recruiter@credx.com", passwordEncoder.encode("password"), "Sarah Miller", "recruiter");
            userRepository.save(recruiterUser);
        }
    }
}
