package com.smartcampus.model.enums;

/**
 * Defines who must approve a booking request for a given resource.
 *
 *  HOD   – Department booking requests go to the Head of Department first.
 *  ADMIN – Common/shared resources are approved directly by the Admin.
 *  AUTO  – No approval required; booking is instantly confirmed upon submission.
 */
public enum ApprovalAuthority {
    HOD,
    ADMIN,
    AUTO
}
