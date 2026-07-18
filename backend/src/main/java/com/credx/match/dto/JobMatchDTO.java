package com.credx.match.dto;

import java.util.List;

public class JobMatchDTO {

    private JobDTO job;
    private int score;
    private List<String> matchingSkills;
    private List<String> missingSkills;
    private String explanation;
    private List<String> learningResources;

    public JobMatchDTO() {}

    public JobMatchDTO(JobDTO job, int score, List<String> matchingSkills, List<String> missingSkills, String explanation, List<String> learningResources) {
        this.job = job;
        this.score = score;
        this.matchingSkills = matchingSkills;
        this.missingSkills = missingSkills;
        this.explanation = explanation;
        this.learningResources = learningResources;
    }

    public JobDTO getJob() { return job; }
    public void setJob(JobDTO job) { this.job = job; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public List<String> getMatchingSkills() { return matchingSkills; }
    public void setMatchingSkills(List<String> matchingSkills) { this.matchingSkills = matchingSkills; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public List<String> getLearningResources() { return learningResources; }
    public void setLearningResources(List<String> learningResources) { this.learningResources = learningResources; }
}
