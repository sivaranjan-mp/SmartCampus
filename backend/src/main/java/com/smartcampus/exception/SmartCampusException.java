package com.smartcampus.exception;

import org.springframework.http.HttpStatus;

public class SmartCampusException extends RuntimeException {
    private final HttpStatus status;
    public SmartCampusException(String message, HttpStatus status) { super(message); this.status = status; }
    public HttpStatus getStatus() { return status; }

    public static class BadRequestException     extends SmartCampusException { public BadRequestException(String m)     { super(m, HttpStatus.BAD_REQUEST); } }
    public static class ConflictException       extends SmartCampusException { public ConflictException(String m)       { super(m, HttpStatus.CONFLICT); } }
    public static class NotFoundException       extends SmartCampusException { public NotFoundException(String m)       { super(m, HttpStatus.NOT_FOUND); } }
    public static class UnauthorizedException   extends SmartCampusException { public UnauthorizedException(String m)   { super(m, HttpStatus.UNAUTHORIZED); } }
    public static class ForbiddenException      extends SmartCampusException { public ForbiddenException(String m)      { super(m, HttpStatus.FORBIDDEN); } }
    public static class TooManyRequestsException extends SmartCampusException { public TooManyRequestsException(String m) { super(m, HttpStatus.TOO_MANY_REQUESTS); } }
}
