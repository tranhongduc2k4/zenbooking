package com.tranhongduc2k4.zenbooking.module.appointment.dto;

import com.tranhongduc2k4.zenbooking.module.appointment.entity.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentStatusUpdateRequest {

    @NotNull(message = "Trạng thái lịch hẹn không được để trống")
    private AppointmentStatus status;

    private String cancellationReason;
}
