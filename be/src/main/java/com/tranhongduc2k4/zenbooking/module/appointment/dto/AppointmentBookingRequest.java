package com.tranhongduc2k4.zenbooking.module.appointment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentBookingRequest {

    private Long serviceId;

    @NotBlank(message = "Tên dịch vụ khám không được để trống")
    private String serviceName;

    private Long doctorId;

    private String doctorName;

    @NotNull(message = "Ngày hẹn không được để trống")
    private LocalDate appointmentDate;

    @NotBlank(message = "Giờ hẹn không được để trống")
    private String appointmentTime;

    @NotBlank(message = "Họ tên bệnh nhân không được để trống")
    private String patientName;

    @NotBlank(message = "Số điện thoại bệnh nhân không được để trống")
    private String patientPhone;

    private String notes;
}
