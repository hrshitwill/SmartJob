package com.credx.match.dto;

import java.util.List;

public class ProfileStrengthDTO {

    private int score;
    private String level;
    private String badgeClass;
    private List<String> suggestions;

    public ProfileStrengthDTO() {}

    public ProfileStrengthDTO(int score, String level, String badgeClass, List<String> suggestions) {
        this.score = score;
        this.level = level;
        this.badgeClass = badgeClass;
        this.suggestions = suggestions;
    }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getBadgeClass() { return badgeClass; }
    public void setBadgeClass(String badgeClass) { this.badgeClass = badgeClass; }

    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }
}
