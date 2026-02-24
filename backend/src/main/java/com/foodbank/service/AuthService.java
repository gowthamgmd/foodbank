package com.foodbank.service;

import com.foodbank.dto.*;
import com.foodbank.model.User;
import com.foodbank.model.enums.Role;
import com.foodbank.repository.UserRepository;
import com.foodbank.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return AuthResponse.from(token, user);
    }

    public AuthResponse register(String roleStr, RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalStateException("Email already registered");
        }
        Role role = Role.valueOf(roleStr.toUpperCase());
        User user = User.builder()
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .name(req.getName())
                .organizationName(req.getOrganizationName())
                .contactPerson(req.getContactPerson())
                .familySize(req.getFamilySize())
                .dietaryRestrictions(req.getDietaryRestrictions())
                .address(req.getAddress())
                .phone(req.getPhone())
                .typicalDonationItems(req.getTypicalDonationItems())
                .build();
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return AuthResponse.from(token, user);
    }
}
