package com.smartcampus.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class FileUploadResponse {
    private String fileId;
    private String originalFileName;
    private String contentType;
    private Long   fileSizeBytes;
    private String message;
}
