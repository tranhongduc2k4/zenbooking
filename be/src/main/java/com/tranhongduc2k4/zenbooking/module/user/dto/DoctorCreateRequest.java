package com.tranhongduc2k4.zenbooking.module.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorCreateRequest {

    @NotBlank(message = "Họ và tên bác sĩ không được để trống")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phone;

    private String email;

    @NotBlank(message = "Chuyên khoa và kinh nghiệm không được để trống")
    private String specialty;

    private String password;
}

