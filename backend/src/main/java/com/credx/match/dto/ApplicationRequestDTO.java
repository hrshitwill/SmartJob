package com.credx.match.dto;

import jakarta.validation.constraints.NotNull;

public class ApplicationRequestDTO {

    @NotNull(message = "jobId is required")
    private Long jobId;

    public ApplicationRequestDTO() {}

    public ApplicationRequestDTO(Long jobId) {
        this.jobId = jobId;
    }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
}
