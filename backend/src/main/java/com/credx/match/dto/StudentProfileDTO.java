package com.credx.match.dto;

import java.util.List;

public class StudentProfileDTO {

    private String id;
    private String userId;
    private String name;
    private String email;
    private Double gpa;
    private List<String> skills;
    private String resumeName;
    private String resumeUrl;
    private String workAuthorization;
    private String preferredRole;
    private String preferredLocation;
    private String preferredWorkMode;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private List<String> certifications;
    private Integer projectsCount;

    public StudentProfileDTO() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Double getGpa() { return gpa; }
    public void setGpa(Double gpa) { this.gpa = gpa; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public String getResumeName() { return resumeName; }
    public void setResumeName(String resumeName) { this.resumeName = resumeName; }

    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }

    public String getWorkAuthorization() { return workAuthorization; }
    public void setWorkAuthorization(String workAuthorization) { this.workAuthorization = workAuthorization; }

    public String getPreferredRole() { return preferredRole; }
    public void setPreferredRole(String preferredRole) { this.preferredRole = preferredRole; }

    public String getPreferredLocation() { return preferredLocation; }
    public void setPreferredLocation(String preferredLocation) { this.preferredLocation = preferredLocation; }

    public String getPreferredWorkMode() { return preferredWorkMode; }
    public void setPreferredWorkMode(String preferredWorkMode) { this.preferredWorkMode = preferredWorkMode; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }

    public List<String> getCertifications() { return certifications; }
    public void setCertifications(List<String> certifications) { this.certifications = certifications; }

    public Integer getProjectsCount() { return projectsCount; }
    public void setProjectsCount(Integer projectsCount) { this.projectsCount = projectsCount; }
}
