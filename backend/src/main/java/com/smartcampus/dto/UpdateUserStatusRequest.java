package com.smartcampus.dto;

import lombok.Data;

@Data
public class UpdateUserStatusRequest {
    private Boolean isActive;
    private Boolean isVerified;
}
