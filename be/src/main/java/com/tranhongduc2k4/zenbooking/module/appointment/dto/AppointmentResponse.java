package com.tranhongduc2k4.zenbooking.module.appointment.dto;

import com.tranhongduc2k4.zenbooking.module.appointment.entity.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentResponse {

    private Long id;
    private String appointmentCode;

    private Long patientId;
    private String patientName;
    private String patientPhone;

    private Long doctorId;
    private String doctorName;

    private Long serviceId;
    private String serviceName;
    private BigDecimal servicePrice;

    private LocalDate appointmentDate;
    private String appointmentTime;
    private AppointmentStatus status;

    private String notes;
    private String cancellationReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

