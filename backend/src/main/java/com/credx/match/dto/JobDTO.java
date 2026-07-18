package com.credx.match.dto;

import java.util.List;

public class JobDTO {

    private String id;
    private String title;
    private String company;
    private String companyLogo;
    private String description;
    private String location;
    private String workMode;
    private Double gpaThreshold;
    private List<String> skillsRequired;
    private Boolean sponsorshipRequired;
    private String salaryRange;
    private String postedDate;
    private String category;

    public JobDTO() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

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

    public List<String> getSkillsRequired() { return skillsRequired; }
    public void setSkillsRequired(List<String> skillsRequired) { this.skillsRequired = skillsRequired; }

    public Boolean getSponsorshipRequired() { return sponsorshipRequired; }
    public void setSponsorshipRequired(Boolean sponsorshipRequired) { this.sponsorshipRequired = sponsorshipRequired; }

    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }

    public String getPostedDate() { return postedDate; }
    public void setPostedDate(String postedDate) { this.postedDate = postedDate; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
