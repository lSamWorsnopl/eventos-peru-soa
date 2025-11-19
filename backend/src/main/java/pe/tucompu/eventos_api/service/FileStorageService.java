package pe.tucompu.eventos_api.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private final Path rootDir;

    public FileStorageService(@Value("${app.uploads.dir:uploads}") String uploadDir) throws IOException {
        this.rootDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(this.rootDir);
    }

    public String store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Archivo vacío");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new IllegalArgumentException("Solo se permiten imágenes");
        }
        String extension = getExtension(file.getOriginalFilename(), contentType);
        String filename = UUID.randomUUID().toString().replaceAll("-", "") + extension;
        Path target = rootDir.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        return filename;
    }

    private String getExtension(String originalName, String contentType) {
        String ext = "";
        if (StringUtils.hasText(originalName) && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf(".")).toLowerCase(Locale.ROOT);
        } else if (contentType.contains("/")) {
            ext = "." + contentType.substring(contentType.indexOf('/') + 1);
        }
        if (!ext.startsWith(".")) {
            ext = "." + ext;
        }
        return ext.replaceAll("[^a-zA-Z0-9.]", "");
    }
}
