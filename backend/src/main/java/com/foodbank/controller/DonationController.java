package com.foodbank.controller;

import com.foodbank.dto.ApiResponse;
import com.foodbank.model.Donation;
import com.foodbank.model.User;
import com.foodbank.model.enums.DonationStatus;
import com.foodbank.repository.DonationRepository;
import com.foodbank.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
public class DonationController {

    private final DonationRepository donationRepo;
    private final UserRepository userRepo;

    @GetMapping
    public ResponseEntity<?> getMyDonations(@AuthenticationPrincipal UserDetails principal) {
        User user = userRepo.findByEmail(principal.getUsername()).orElseThrow();
        List<Donation> list = donationRepo.findByDonorIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(donationRepo.findAll()));
    }

    @PostMapping
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<?> create(
            @RequestBody Map<String, Object> dto,
            @AuthenticationPrincipal UserDetails principal) {
        User donor = userRepo.findByEmail(principal.getUsername()).orElseThrow();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) dto.get("items");
        Donation donation = Donation.builder()
                .donor(donor)
                .items(items)
                .pickupAddress((String) dto.get("pickupAddress"))
                .pickupTimeSlot((String) dto.get("pickupTimeSlot"))
                .status(DonationStatus.PENDING)
                .build();
        return ResponseEntity.status(201).body(ApiResponse.ok(donationRepo.save(donation)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Donation d = donationRepo.findById(id).orElseThrow();
        d.setStatus(DonationStatus.valueOf(body.get("status")));
        return ResponseEntity.ok(ApiResponse.ok(donationRepo.save(d)));
    }
}
