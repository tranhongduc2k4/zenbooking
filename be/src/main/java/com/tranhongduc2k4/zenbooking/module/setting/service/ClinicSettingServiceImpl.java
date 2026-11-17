package com.tranhongduc2k4.zenbooking.module.setting.service;

import com.tranhongduc2k4.zenbooking.common.exception.CustomException;
import com.tranhongduc2k4.zenbooking.module.setting.dto.ChangePasswordRequest;
import com.tranhongduc2k4.zenbooking.module.setting.dto.ClinicSettingDTO;
import com.tranhongduc2k4.zenbooking.module.setting.entity.ClinicSetting;
import com.tranhongduc2k4.zenbooking.module.setting.repository.ClinicSettingRepository;
import com.tranhongduc2k4.zenbooking.module.user.entity.User;
import com.tranhongduc2k4.zenbooking.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClinicSettingServiceImpl implements ClinicSettingService {

    private final ClinicSettingRepository clinicSettingRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public ClinicSettingDTO getSettings() {
        ClinicSetting setting = clinicSettingRepository.findFirstByOrderByIdAsc()
                .orElseGet(this::createDefaultSettings);
        return toDTO(setting);
    }

    @Override
    @Transactional
    public ClinicSettingDTO updateSettings(ClinicSettingDTO dto) {
        ClinicSetting setting = clinicSettingRepository.findFirstByOrderByIdAsc()
                .orElseGet(this::createDefaultSettings);

        if (dto.getClinicName() != null && !dto.getClinicName().isBlank()) {
            setting.setClinicName(dto.getClinicName().trim());
        }
        if (dto.getMedicalLicense() != null) setting.setMedicalLicense(dto.getMedicalLicense().trim());
        if (dto.getHotlineEmergency() != null) setting.setHotlineEmergency(dto.getHotlineEmergency().trim());
        if (dto.getHotlineConsulting() != null) setting.setHotlineConsulting(dto.getHotlineConsulting().trim());
        if (dto.getEmail() != null) setting.setEmail(dto.getEmail().trim());
        if (dto.getAddressMain() != null) setting.setAddressMain(dto.getAddressMain().trim());
        if (dto.getAddressBranch() != null) setting.setAddressBranch(dto.getAddressBranch().trim());
        if (dto.getDescription() != null) setting.setDescription(dto.getDescription().trim());

        if (dto.getOpenTime() != null) setting.setOpenTime(dto.getOpenTime().trim());
        if (dto.getCloseTime() != null) setting.setCloseTime(dto.getCloseTime().trim());
        if (dto.getBreakStartTime() != null) setting.setBreakStartTime(dto.getBreakStartTime().trim());
        if (dto.getBreakEndTime() != null) setting.setBreakEndTime(dto.getBreakEndTime().trim());

        if (dto.getSlotDurationMinutes() != null && dto.getSlotDurationMinutes() > 0) {
            setting.setSlotDurationMinutes(dto.getSlotDurationMinutes());
        }
        if (dto.getTotalDentalChairs() != null && dto.getTotalDentalChairs() > 0) {
            setting.setTotalDentalChairs(dto.getTotalDentalChairs());
        }
        if (dto.getCancelAdvanceHours() != null && dto.getCancelAdvanceHours() >= 0) {
            setting.setCancelAdvanceHours(dto.getCancelAdvanceHours());
        }
        if (dto.getWorkingDays() != null) setting.setWorkingDays(dto.getWorkingDays().trim());

        if (dto.getSterilizationStandard() != null) setting.setSterilizationStandard(dto.getSterilizationStandard().trim());
        if (dto.getAutoReminderSms() != null) setting.setAutoReminderSms(dto.getAutoReminderSms());
        if (dto.getAutoReminderEmail() != null) setting.setAutoReminderEmail(dto.getAutoReminderEmail());

        ClinicSetting saved = clinicSettingRepository.save(setting);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin tài khoản người dùng!"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra lại!");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Xác nhận mật khẩu mới không khớp!");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Mật khẩu mới không được trùng với mật khẩu hiện tại!");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private ClinicSetting createDefaultSettings() {
        ClinicSetting defaultSetting = ClinicSetting.builder()
                .clinicName("Nha khoa Quốc tế ZenBooking Dental")
                .medicalLicense("GP-10824/BYT-CCHN")
                .hotlineEmergency("1900 8989")
                .hotlineConsulting("0909 999 999")
                .email("contact@zenbooking.dental")
                .addressMain("124 Pasteur, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh")
                .addressBranch("45 Hoàng Hoa Thám, Phường 6, Quận Bình Thạnh, TP. Hồ Chí Minh")
                .description("Hệ thống nha khoa kỹ thuật cao tiêu chuẩn Thụy Sĩ, ứng dụng công nghệ Piezotome, CT Cone Beam 3D và phòng mổ vô trùng chuẩn quốc tế.")
                .openTime("08:00")
                .closeTime("20:00")
                .breakStartTime("12:00")
                .breakEndTime("13:30")
                .slotDurationMinutes(30)
                .totalDentalChairs(3)
                .cancelAdvanceHours(2)
                .workingDays("Thứ 2 - Chủ Nhật (Không nghỉ trưa)")
                .sterilizationStandard("Khử trùng Autoclave 134°C chu kỳ Class B - Đóng gói niêm phong 1 khay/bệnh nhân")
                .autoReminderSms(true)
                .autoReminderEmail(true)
                .build();

        return clinicSettingRepository.save(defaultSetting);
    }

    private ClinicSettingDTO toDTO(ClinicSetting s) {
        return ClinicSettingDTO.builder()
                .id(s.getId())
                .clinicName(s.getClinicName())
                .medicalLicense(s.getMedicalLicense())
                .hotlineEmergency(s.getHotlineEmergency())
                .hotlineConsulting(s.getHotlineConsulting())
                .email(s.getEmail())
                .addressMain(s.getAddressMain())
                .addressBranch(s.getAddressBranch())
                .description(s.getDescription())
                .openTime(s.getOpenTime())
                .closeTime(s.getCloseTime())
                .breakStartTime(s.getBreakStartTime())
                .breakEndTime(s.getBreakEndTime())
                .slotDurationMinutes(s.getSlotDurationMinutes())
                .totalDentalChairs(s.getTotalDentalChairs())
                .cancelAdvanceHours(s.getCancelAdvanceHours())
                .workingDays(s.getWorkingDays())
                .sterilizationStandard(s.getSterilizationStandard())
                .autoReminderSms(s.getAutoReminderSms())
                .autoReminderEmail(s.getAutoReminderEmail())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
