package com.tranhongduc2k4.zenbooking.module.user.controller;

import com.tranhongduc2k4.zenbooking.module.user.dto.DoctorResponse;
import com.tranhongduc2k4.zenbooking.module.user.entity.Role;
import com.tranhongduc2k4.zenbooking.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<DoctorResponse>> getDoctors() {
        List<DoctorResponse> list = userRepository.findByRoleOrderByIdAsc(Role.DOCTOR).stream()
                .map(u -> DoctorResponse.builder()
                        .id(u.getId())
                        .fullName(u.getFullName())
                        .phone(u.getPhone())
                        .email(u.getEmail())
                        .specialty(u.getSpecialty() != null ? u.getSpecialty() : "Đội ngũ chuyên khoa")
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }
}

