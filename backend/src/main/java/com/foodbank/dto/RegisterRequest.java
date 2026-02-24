package com.foodbank.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class RegisterRequest {

    // Common
    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 6)
    private String password;

    // Beneficiary
    private String name;
    private Integer familySize;
    private List<String> dietaryRestrictions;

    // Donor
    private String organizationName;
    private String contactPerson;
    private String typicalDonationItems;

    // Common optional
    private String address;
    private String phone;
}
