package com.foodbank.controller;

import com.foodbank.dto.ApiResponse;
import com.foodbank.model.Parcel;
import com.foodbank.model.User;
import com.foodbank.repository.ParcelRepository;
import com.foodbank.repository.UserRepository;
import com.foodbank.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class BeneficiaryParcelController {

    private final ParcelRepository parcelRepo;
    private final UserRepository userRepo;
    private final InventoryService inventoryService;

    // ── Beneficiary recommendations ─────────────────────────────
    @GetMapping("/api/beneficiaries/{id}/recommendations")
    public ResponseEntity<?> getRecommendations(@PathVariable Long id) {
        // Returns FRESH items — real impl would filter by dietary restrictions
        var items = inventoryService.getAll().stream()
                .filter(i -> i.getQualityStatus() != null &&
                        !i.getQualityStatus().name().equals("SPOILED"))
                .limit(10)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(items));
    }

    @GetMapping("/api/beneficiaries")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getBeneficiaries() {
        return ResponseEntity.ok(ApiResponse.ok(
                userRepo.findByRole(com.foodbank.model.enums.Role.BENEFICIARY)));
    }

    // ── Parcels ──────────────────────────────────────────────────
    @PostMapping("/api/parcels")
    public ResponseEntity<?> createParcel(@RequestBody Map<String, Object> dto) {
        Long beneficiaryId = ((Number) dto.get("beneficiaryId")).longValue();
        User beneficiary = userRepo.findById(beneficiaryId).orElseThrow();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) dto.get("items");
        Parcel parcel = Parcel.builder()
                .beneficiary(beneficiary)
                .items(items)
                .build();
        return ResponseEntity.status(201).body(ApiResponse.ok(parcelRepo.save(parcel)));
    }

    @GetMapping("/api/parcels/beneficiary/{id}")
    public ResponseEntity<?> getBeneficiaryParcels(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(
                parcelRepo.findByBeneficiaryIdOrderByCreatedAtDesc(id)));
    }

    @GetMapping("/api/parcels")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllParcels() {
        return ResponseEntity.ok(ApiResponse.ok(parcelRepo.findAll()));
    }

    // ── Donor list ───────────────────────────────────────────────
    @GetMapping("/api/users/donors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDonors() {
        return ResponseEntity.ok(ApiResponse.ok(
                userRepo.findByRole(com.foodbank.model.enums.Role.DONOR)));
    }

    @GetMapping("/api/users/beneficiaries")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getBeneficiariesList() {
        return ResponseEntity.ok(ApiResponse.ok(
                userRepo.findByRole(com.foodbank.model.enums.Role.BENEFICIARY)));
    }

    @PutMapping("/api/users/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody Map<String, Object> dto,
            @AuthenticationPrincipal UserDetails principal) {
        User user = userRepo.findByEmail(principal.getUsername()).orElseThrow();
        if (dto.containsKey("address"))
            user.setAddress((String) dto.get("address"));
        if (dto.containsKey("phone"))
            user.setPhone((String) dto.get("phone"));
        if (dto.containsKey("familySize"))
            user.setFamilySize(((Number) dto.get("familySize")).intValue());
        if (dto.containsKey("dietaryRestrictions")) {
            @SuppressWarnings("unchecked")
            List<String> diets = (List<String>) dto.get("dietaryRestrictions");
            user.setDietaryRestrictions(diets);
        }
        return ResponseEntity.ok(ApiResponse.ok(userRepo.save(user)));
    }
}
