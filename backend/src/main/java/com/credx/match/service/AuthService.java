package com.credx.match.service;

import com.credx.match.dto.AuthRequestDTO;
import com.credx.match.dto.AuthResponseDTO;
import com.credx.match.dto.RegisterRequestDTO;
import com.credx.match.entity.StudentProfile;
import com.credx.match.entity.User;
import com.credx.match.repository.StudentProfileRepository;
import com.credx.match.repository.UserRepository;
import com.credx.match.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       StudentProfileRepository studentProfileRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email address already in use: " + dto.getEmail());
        }

        String role = dto.getRole() != null ? dto.getRole().toLowerCase() : "student";
        User user = new User(
                dto.getEmail(),
                passwordEncoder.encode(dto.getPassword()),
                dto.getName(),
                role
        );

        user = userRepository.save(user);

        // If registered as a student, initialize an associated StudentProfile
        if ("student".equalsIgnoreCase(role)) {
            StudentProfile profile = new StudentProfile(user);
            profile.setPreferredRole("Frontend Developer");
            profile.setPreferredLocation("Chicago, IL");
            profile.setPreferredWorkMode("remote");
            studentProfileRepository.save(profile);
        }

        String token = tokenProvider.generateTokenFromEmail(user.getEmail());

        return new AuthResponseDTO(
                user.getId().toString(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                token
        );
    }

    public AuthResponseDTO login(AuthRequestDTO dto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
        );

        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + dto.getEmail()));

        String token = tokenProvider.generateToken(authentication);

        return new AuthResponseDTO(
                user.getId().toString(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                token
        );
    }

    public AuthResponseDTO me(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        String token = tokenProvider.generateTokenFromEmail(email);

        return new AuthResponseDTO(
                user.getId().toString(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                token
        );
    }
}
