package com.foodbank.controller;

import com.foodbank.dto.ApiResponse;
import com.foodbank.model.Feedback;
import com.foodbank.model.Parcel;
import com.foodbank.model.enums.Sentiment;
import com.foodbank.repository.FeedbackRepository;
import com.foodbank.repository.ParcelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackRepository feedbackRepo;
    private final ParcelRepository parcelRepo;

    @PostMapping
    public ResponseEntity<?> submit(@RequestBody Map<String, Object> dto) {
        Long parcelId = ((Number) dto.get("parcelId")).longValue();
        Parcel parcel = parcelRepo.findById(parcelId).orElseThrow();

        int rating = ((Number) dto.get("rating")).intValue();
        String comment = (String) dto.getOrDefault("comment", "");

        // Simple rule-based sentiment (stubs for AI)
        Sentiment sentiment = rating >= 4 ? Sentiment.POSITIVE : rating == 3 ? Sentiment.NEUTRAL : Sentiment.NEGATIVE;

        Feedback feedback = Feedback.builder()
                .parcel(parcel)
                .rating(rating)
                .comment(comment)
                .sentiment(sentiment)
                .build();

        return ResponseEntity.status(201).body(ApiResponse.ok(feedbackRepo.save(feedback)));
    }

    @GetMapping("/sentiment")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllWithSentiment() {
        return ResponseEntity.ok(ApiResponse.ok(feedbackRepo.findAllByOrderByCreatedAtDesc()));
    }
}
