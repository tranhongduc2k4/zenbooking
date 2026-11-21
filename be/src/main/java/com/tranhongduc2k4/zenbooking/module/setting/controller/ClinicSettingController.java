package com.tranhongduc2k4.zenbooking.module.setting.controller;

import com.tranhongduc2k4.zenbooking.common.security.CustomUserDetails;
import com.tranhongduc2k4.zenbooking.module.setting.dto.ChangePasswordRequest;
import com.tranhongduc2k4.zenbooking.module.setting.dto.ClinicSettingDTO;
import com.tranhongduc2k4.zenbooking.module.setting.service.ClinicSettingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class ClinicSettingController {

    private final ClinicSettingService clinicSettingService;

    // 1. Lấy thông tin cài đặt phòng khám (Công khai cho cả bệnh nhân & Admin xem giờ làm việc/hotline)
    @GetMapping
    public ResponseEntity<ClinicSettingDTO> getSettings() {
        return ResponseEntity.ok(clinicSettingService.getSettings());
    }

    // 2. Admin cập nhật thông tin cài đặt phòng khám
    @PutMapping
    public ResponseEntity<ClinicSettingDTO> updateSettings(@Valid @RequestBody ClinicSettingDTO dto) {
        return ResponseEntity.ok(clinicSettingService.updateSettings(dto));
    }

    // 3. Đổi mật khẩu tài khoản đang đăng nhập
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        Long userId = userDetails.getUser().getId();
        clinicSettingService.changePassword(userId, request);
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công! Vui lòng sử dụng mật khẩu mới cho lần đăng nhập kế tiếp."));
    }
}
