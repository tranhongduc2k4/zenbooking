package com.tranhongduc2k4.zenbooking.module.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponse {
    private Long id;
    private String patientCode;
    private String fullName;
    private String phone;
    private String email;
    private int totalVisits;
    private int completedVisits;
    private LocalDate lastVisitDate;
    private String lastServiceName;
    private String lastDoctorName;
    private String bloodType;
    private String allergies;
    private String membershipTier;
}
