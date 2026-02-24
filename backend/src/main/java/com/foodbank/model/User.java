package com.foodbank.model;

import com.foodbank.model.enums.Role;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // — Beneficiary fields
    @Column(name = "family_size")
    private Integer familySize;

    @Type(JsonType.class)
    @Column(name = "dietary_restrictions", columnDefinition = "jsonb")
    private List<String> dietaryRestrictions;

    // — Donor fields
    @Column(name = "organization_name")
    private String organizationName;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(name = "typical_donation_items")
    private String typicalDonationItems;

    // — Common
    private String address;
    private String phone;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
