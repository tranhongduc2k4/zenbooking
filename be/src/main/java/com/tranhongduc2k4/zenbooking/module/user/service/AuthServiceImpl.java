package com.tranhongduc2k4.zenbooking.module.user.service;

import com.tranhongduc2k4.zenbooking.module.user.dto.AuthResponse;
import com.tranhongduc2k4.zenbooking.module.user.dto.LoginRequest;
import com.tranhongduc2k4.zenbooking.module.user.dto.RegisterRequest;
import com.tranhongduc2k4.zenbooking.module.user.entity.Role;
import com.tranhongduc2k4.zenbooking.module.user.entity.User;
import com.tranhongduc2k4.zenbooking.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Số điện thoại đã được đăng ký trong hệ thống!");
        }

        if (request.getEmail() != null && !request.getEmail().isBlank() 
                && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được đăng ký trong hệ thống!");
        }

        Role userRole = request.getRole() != null ? request.getRole() : Role.PATIENT;

        User user = User.builder()
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .build();

        User savedUser = userRepository.save(user);

        return AuthResponse.builder()
                .id(savedUser.getId())
                .fullName(savedUser.getFullName())
                .phone(savedUser.getPhone())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .token("dummy-jwt-token")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByPhoneOrEmail(request.getIdentifier(), request.getIdentifier())
                .orElseThrow(() -> new RuntimeException("Số điện thoại/Email hoặc mật khẩu không chính xác!"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Số điện thoại/Email hoặc mật khẩu không chính xác!");
        }

        return AuthResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .role(user.getRole())
                .token("dummy-jwt-token")
                .build();
    }
}
