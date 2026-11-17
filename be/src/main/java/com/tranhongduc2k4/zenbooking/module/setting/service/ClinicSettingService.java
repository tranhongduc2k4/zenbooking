package com.tranhongduc2k4.zenbooking.module.setting.service;

import com.tranhongduc2k4.zenbooking.module.setting.dto.ChangePasswordRequest;
import com.tranhongduc2k4.zenbooking.module.setting.dto.ClinicSettingDTO;

public interface ClinicSettingService {
    ClinicSettingDTO getSettings();
    ClinicSettingDTO updateSettings(ClinicSettingDTO dto);
    void changePassword(Long userId, ChangePasswordRequest request);
}
