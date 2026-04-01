package com.imageservice.image.model.dto;

import java.time.LocalDateTime;

public class ImageResponse {
    private Long id;
    private String filename;
    private String originalName;
    private String contentType;
    private Long fileSize;
    private LocalDateTime uploadedAt;

    public ImageResponse() {}

    public ImageResponse(Long id, String filename, String originalName,
                         String contentType, Long fileSize, LocalDateTime uploadedAt) {
        this.id = id;
        this.filename = filename;
        this.originalName = originalName;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() { return id; }
    public String getFilename() { return filename; }
    public String getOriginalName() { return originalName; }
    public String getContentType() { return contentType; }
    public Long getFileSize() { return fileSize; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
}
