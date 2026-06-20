package com.smartcampus.model.enums;

/**
 * Defines whether a resource belongs to a specific department or is shared campus-wide.
 *
 *  DEPARTMENT – Owned by one department; bookings approved by that department's HOD.
 *  COMMON     – Shared across all departments; bookings approved by Admin.
 */
public enum ResourceScope {
    DEPARTMENT,
    COMMON
}
