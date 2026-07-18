package com.credx.match.entity;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String company;

    private String companyLogo;

    @Column(length = 2000)
    private String description;

    private String location;
    private String workMode; // "remote", "onsite", "hybrid"
    private Double gpaThreshold = 0.0;
    private Boolean sponsorshipRequired = false;
    private String salaryRange;
    private String postedDate;
    private String category;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "job_skills",
        joinColumns = @JoinColumn(name = "job_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private Set<Skill> skillsRequired = new HashSet<>();

    public Job() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getCompanyLogo() { return companyLogo; }
    public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getWorkMode() { return workMode; }
    public void setWorkMode(String workMode) { this.workMode = workMode; }

    public Double getGpaThreshold() { return gpaThreshold; }
    public void setGpaThreshold(Double gpaThreshold) { this.gpaThreshold = gpaThreshold; }

    public Boolean getSponsorshipRequired() { return sponsorshipRequired; }
    public void setSponsorshipRequired(Boolean sponsorshipRequired) { this.sponsorshipRequired = sponsorshipRequired; }

    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }

    public String getPostedDate() { return postedDate; }
    public void setPostedDate(String postedDate) { this.postedDate = postedDate; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Set<Skill> getSkillsRequired() { return skillsRequired; }
    public void setSkillsRequired(Set<Skill> skillsRequired) { this.skillsRequired = skillsRequired; }
}
