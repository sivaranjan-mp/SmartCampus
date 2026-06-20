package com.smartcampus.dto.resource;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceStatsResponse {

    private long totalResources;
    private long activeResources;
    private long inactiveResources;
    private long underMaintenance;
    private long commonResources;
    private long departmentResources;

    /** Count per category e.g. { "LAB": 12, "CLASSROOM": 8, … } */
    private Map<String, Long> byCategory;

    /** Count per scope */
    private Map<String, Long> byScope;
}
