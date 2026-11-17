package com.tranhongduc2k4.zenbooking.module.setting.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "clinic_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClinicSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "clinic_name", nullable = false, length = 200)
    private String clinicName;

    @Column(name = "medical_license", length = 100)
    private String medicalLicense;

    @Column(name = "hotline_emergency", length = 50)
    private String hotlineEmergency;

    @Column(name = "hotline_consulting", length = 50)
    private String hotlineConsulting;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "address_main", length = 255)
    private String addressMain;

    @Column(name = "address_branch", length = 255)
    private String addressBranch;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "open_time", length = 10)
    private String openTime;

    @Column(name = "close_time", length = 10)
    private String closeTime;

    @Column(name = "break_start_time", length = 10)
    private String breakStartTime;

    @Column(name = "break_end_time", length = 10)
    private String breakEndTime;

    @Column(name = "slot_duration_minutes")
    private Integer slotDurationMinutes;

    @Column(name = "total_dental_chairs")
    private Integer totalDentalChairs;

    @Column(name = "cancel_advance_hours")
    private Integer cancelAdvanceHours;

    @Column(name = "working_days", length = 100)
    private String workingDays;

    @Column(name = "sterilization_standard", length = 255)
    private String sterilizationStandard;

    @Column(name = "auto_reminder_sms")
    private Boolean autoReminderSms;

    @Column(name = "auto_reminder_email")
    private Boolean autoReminderEmail;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
