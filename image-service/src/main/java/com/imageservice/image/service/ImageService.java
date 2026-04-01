package com.imageservice.image.service;

import com.imageservice.image.model.dto.ImageResponse;
import com.imageservice.image.model.entity.ImageMetadata;
import com.imageservice.image.repository.ImageRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ImageService {

    private final ImageRepository imageRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public ImageService(ImageRepository imageRepository) {
        this.imageRepository = imageRepository;
    }

    public ImageResponse uploadImage(MultipartFile file,
            String ownerEmail) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath))
            Files.createDirectories(uploadPath);

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        Files.write(filePath, file.getBytes());

        ImageMetadata image = new ImageMetadata();
        image.setFilename(filename);
        image.setOriginalName(file.getOriginalFilename());
        image.setContentType(file.getContentType());
        image.setFileSize(file.getSize());
        image.setStoragePath(filePath.toString());
        image.setOwnerEmail(ownerEmail);

        return toResponse(imageRepository.save(image));
    }

    public List<ImageResponse> listImages(String ownerEmail) {
        return imageRepository.findByOwnerEmail(ownerEmail)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public String getImagePath(Long id, String ownerEmail) {
        return imageRepository.findByIdAndOwnerEmail(id, ownerEmail)
                .orElseThrow(() -> new RuntimeException("Image not found"))
                .getStoragePath();
    }

    public void deleteImage(Long id, String ownerEmail) {
        ImageMetadata image = imageRepository
                .findByIdAndOwnerEmail(id, ownerEmail)
                .orElseThrow(() -> new RuntimeException("Image not found"));
        try {
            Files.deleteIfExists(Paths.get(image.getStoragePath()));
        } catch (IOException e) {
            System.out.println("Could not delete file: " + e.getMessage());
        }
        imageRepository.delete(image);
    }

    private ImageResponse toResponse(ImageMetadata image) {
        return new ImageResponse(image.getId(), image.getFilename(),
                image.getOriginalName(), image.getContentType(),
                image.getFileSize(), image.getUploadedAt());
    }
}