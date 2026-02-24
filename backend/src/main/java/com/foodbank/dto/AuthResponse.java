package com.foodbank.dto;

import com.foodbank.model.User;
import com.foodbank.model.enums.Role;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AuthResponse {
    private String token;
    private UserDto user;

    @Data
    @Builder
    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private Role role;
        private String organizationName;
        private String contactPerson;
        private Integer familySize;
        private List<String> dietaryRestrictions;
        private String address;
        private String phone;
    }

    public static AuthResponse from(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .user(UserDto.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .organizationName(user.getOrganizationName())
                        .contactPerson(user.getContactPerson())
                        .familySize(user.getFamilySize())
                        .dietaryRestrictions(user.getDietaryRestrictions())
                        .address(user.getAddress())
                        .phone(user.getPhone())
                        .build())
                .build();
    }
}
