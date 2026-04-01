package com.imageservice.image.service;

import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;
import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;

@Service
public class TransformService {

    public byte[] resize(String path, int width, int height) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Thumbnails.of(new File(path)).size(width, height).toOutputStream(out);
        return out.toByteArray();
    }

    public byte[] crop(String path, int x, int y, int width, int height) throws IOException {
        BufferedImage src = ImageIO.read(new File(path));
        BufferedImage cropped = src.getSubimage(x, y, width, height);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(cropped, "png", out);
        return out.toByteArray();
    }

    public byte[] rotate(String path, double angle) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Thumbnails.of(new File(path)).scale(1.0).rotate(angle).toOutputStream(out);
        return out.toByteArray();
    }

    public byte[] watermark(String path, String text) throws IOException {
        BufferedImage img = ImageIO.read(new File(path));
        Graphics2D g = img.createGraphics();
        g.setFont(new Font("Arial", Font.BOLD, 36));
        g.setColor(new Color(255, 255, 255, 180));
        g.drawString(text, 20, img.getHeight() - 30);
        g.dispose();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(img, "png", out);
        return out.toByteArray();
    }

    public byte[] convert(String path, String format) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Thumbnails.of(new File(path)).scale(1.0).outputFormat(format).toOutputStream(out);
        return out.toByteArray();
    }

    public byte[] retrieve(String path) throws IOException {
        return Files.readAllBytes(Paths.get(path));
    }
}
