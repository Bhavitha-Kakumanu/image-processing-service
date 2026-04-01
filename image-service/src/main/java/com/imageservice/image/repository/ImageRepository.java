package com.imageservice.image.repository;

import com.imageservice.image.model.entity.ImageMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ImageRepository extends JpaRepository<ImageMetadata, Long> {
    List<ImageMetadata> findByOwnerEmail(String ownerEmail);
    Optional<ImageMetadata> findByIdAndOwnerEmail(Long id, String ownerEmail);
}
