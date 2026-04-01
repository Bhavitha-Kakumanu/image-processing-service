package com.imageservice.image.controller;

import com.imageservice.image.model.dto.ImageResponse;
import com.imageservice.image.service.ImageService;
import com.imageservice.image.service.TransformService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final ImageService imageService;
    private final TransformService transformService;

    public ImageController(ImageService imageService,
            TransformService transformService) {
        this.imageService = imageService;
        this.transformService = transformService;
    }

    @PostMapping("/upload")
    public ResponseEntity<ImageResponse> upload(
            @RequestParam("file") MultipartFile file,
            Authentication auth) throws IOException {
        return ResponseEntity.ok(
                imageService.uploadImage(file, auth.getName()));
    }

    @PostMapping("/upload/bulk")
    public ResponseEntity<List<ImageResponse>> bulkUpload(
            @RequestParam("files") List<MultipartFile> files,
            Authentication auth) throws IOException {
        List<ImageResponse> responses = new ArrayList<>();
        for (MultipartFile file : files) {
            responses.add(imageService.uploadImage(file, auth.getName()));
        }
        return ResponseEntity.ok(responses);
    }

    @GetMapping
    public ResponseEntity<List<ImageResponse>> list(Authentication auth) {
        return ResponseEntity.ok(imageService.listImages(auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id,
            Authentication auth) {
        imageService.deleteImage(id, auth.getName());
        return ResponseEntity.ok("Image deleted successfully");
    }

    @GetMapping("/{id}/resize")
    public ResponseEntity<byte[]> resize(@PathVariable Long id,
            @RequestParam int width, @RequestParam int height,
            Authentication auth) throws IOException {
        String path = imageService.getImagePath(id, auth.getName());
        return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG)
                .body(transformService.resize(path, width, height));
    }

    @GetMapping("/{id}/crop")
    public ResponseEntity<byte[]> crop(@PathVariable Long id,
            @RequestParam int x, @RequestParam int y,
            @RequestParam int width, @RequestParam int height,
            Authentication auth) throws IOException {
        String path = imageService.getImagePath(id, auth.getName());
        return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG)
                .body(transformService.crop(path, x, y, width, height));
    }

    @GetMapping("/{id}/rotate")
    public ResponseEntity<byte[]> rotate(@PathVariable Long id,
            @RequestParam double angle,
            Authentication auth) throws IOException {
        String path = imageService.getImagePath(id, auth.getName());
        return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG)
                .body(transformService.rotate(path, angle));
    }

    @GetMapping("/{id}/watermark")
    public ResponseEntity<byte[]> watermark(@PathVariable Long id,
            @RequestParam String text,
            Authentication auth) throws IOException {
        String path = imageService.getImagePath(id, auth.getName());
        return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG)
                .body(transformService.watermark(path, text));
    }

    @GetMapping("/{id}/convert")
    public ResponseEntity<byte[]> convert(@PathVariable Long id,
            @RequestParam String format,
            Authentication auth) throws IOException {
        String path = imageService.getImagePath(id, auth.getName());
        return ResponseEntity.ok()
                .body(transformService.convert(path, format));
    }

    @GetMapping("/{id}/retrieve")
    public ResponseEntity<byte[]> retrieve(@PathVariable Long id,
            Authentication auth) throws IOException {
        String path = imageService.getImagePath(id, auth.getName());
        return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG)
                .body(transformService.retrieve(path));
    }
}