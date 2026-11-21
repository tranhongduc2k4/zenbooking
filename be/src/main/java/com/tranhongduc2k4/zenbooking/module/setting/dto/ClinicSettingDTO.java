package com.tranhongduc2k4.zenbooking.module.setting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClinicSettingDTO {
    private Long id;
    private String clinicName;
    private String medicalLicense;
    private String hotlineEmergency;
    private String hotlineConsulting;
    private String email;
    private String addressMain;
    private String addressBranch;
    private String description;
    private String openTime;
    private String closeTime;
    private String breakStartTime;
    private String breakEndTime;
    private Integer slotDurationMinutes;
    private Integer totalDentalChairs;
    private Integer cancelAdvanceHours;
    private String workingDays;
    private String sterilizationStandard;
    private Boolean autoReminderSms;
    private Boolean autoReminderEmail;
    private LocalDateTime updatedAt;
}
