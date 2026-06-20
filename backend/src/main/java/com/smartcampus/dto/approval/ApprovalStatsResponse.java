package com.smartcampus.dto.approval;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ApprovalStatsResponse {
    private long pendingHod;
    private long pendingAdmin;
    private long approvedToday;
    private long rejectedToday;
    private long totalPending;
    private long highPriorityPending;
}
