package com.smartcampus.model.enums;

public enum BookingStatus {
    DRAFT,            // Saved but not yet submitted
    PENDING,          // Submitted, awaiting approval
    PENDING_HOD,      // Routed to HOD for department resource
    PENDING_ADMIN,    // Routed to Admin for common resource
    APPROVED,         // Fully approved
    REJECTED,         // Rejected by approver
    CANCELLED,        // Cancelled by requester
    COMPLETED,        // Booking period passed and confirmed
    NO_SHOW           // Approved but organiser did not use the resource
}
