package com.tranhongduc2k4.zenbooking.module.user.service;

import com.tranhongduc2k4.zenbooking.common.exception.CustomException;
import com.tranhongduc2k4.zenbooking.common.security.CustomUserDetails;
import com.tranhongduc2k4.zenbooking.common.security.JwtUtil;
import com.tranhongduc2k4.zenbooking.module.user.dto.AuthResponse;
import com.tranhongduc2k4.zenbooking.module.user.dto.LoginRequest;
import com.tranhongduc2k4.zenbooking.module.user.dto.RegisterRequest;
import com.tranhongduc2k4.zenbooking.module.user.entity.Role;
import com.tranhongduc2k4.zenbooking.module.user.entity.User;
import com.tranhongduc2k4.zenbooking.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Số điện thoại đã được đăng ký trong hệ thống!");
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()
                && userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Email đã được đăng ký trong hệ thống!");
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
        String token = jwtUtil.generateToken(savedUser.getPhone());

        return AuthResponse.builder()
                .id(savedUser.getId())
                .fullName(savedUser.getFullName())
                .phone(savedUser.getPhone())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .token(token)
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getIdentifier(), request.getPassword())
            );

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            User user = userDetails.getUser();
            String token = jwtUtil.generateToken(authentication);

            return AuthResponse.builder()
                    .id(user.getId())
                    .fullName(user.getFullName())
                    .phone(user.getPhone())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .token(token)
                    .build();
        } catch (AuthenticationException ex) {
            throw new CustomException(HttpStatus.UNAUTHORIZED, "Số điện thoại/Email hoặc mật khẩu không chính xác!");
        }
    }
}
