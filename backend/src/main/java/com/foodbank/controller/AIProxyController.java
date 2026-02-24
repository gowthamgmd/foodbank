package com.foodbank.controller;

import com.foodbank.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.http.client.MultipartBodyBuilder;
import reactor.core.publisher.Mono;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AIProxyController {

    private final WebClient.Builder webClientBuilder;

    @Value("${app.ai.base-url}")
    private String aiBaseUrl;

    private WebClient client() {
        return webClientBuilder.baseUrl(aiBaseUrl).build();
    }

    @PostMapping("/forecast")
    public ResponseEntity<?> forecast(@RequestBody Map<String, Object> payload) {
        try {
            var result = client().post().uri("/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(Object.class)
                    .block();
            return ResponseEntity.ok(ApiResponse.ok(result));
        } catch (Exception e) {
            return ResponseEntity.status(503).body(ApiResponse.error("AI service unavailable: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/assess-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> assessImage(@RequestParam("image") MultipartFile image) {
        try {
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("image", image.getResource());
            var result = client().post().uri("/assess")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(Object.class)
                    .block();
            return ResponseEntity.ok(ApiResponse.ok(result));
        } catch (Exception e) {
            return ResponseEntity.status(503).body(ApiResponse.error("Vision service unavailable"));
        }
    }

    @GetMapping("/match-donations")
    public ResponseEntity<?> matchDonations() {
        try {
            var result = client().get().uri("/match")
                    .retrieve()
                    .bodyToMono(Object.class)
                    .block();
            return ResponseEntity.ok(ApiResponse.ok(result));
        } catch (Exception e) {
            return ResponseEntity.status(503).body(ApiResponse.error("Match service unavailable"));
        }
    }

    @GetMapping("/sentiment")
    public ResponseEntity<?> getSentiment() {
        try {
            var result = client().get().uri("/analyze")
                    .retrieve()
                    .bodyToMono(Object.class)
                    .block();
            return ResponseEntity.ok(ApiResponse.ok(result));
        } catch (Exception e) {
            return ResponseEntity.status(503).body(ApiResponse.error("Sentiment service unavailable"));
        }
    }
}
