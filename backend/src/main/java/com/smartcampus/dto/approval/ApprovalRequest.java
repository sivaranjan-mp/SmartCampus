package com.smartcampus.dto.approval;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ApprovalRequest {

    @NotNull(message = "Action is required")
    private Action action;

    @Size(max = 1000, message = "Remarks cannot exceed 1000 characters")
    private String remarks;

    public enum Action {
        APPROVE,
        REJECT,
        REQUEST_REVISION
    }
}
