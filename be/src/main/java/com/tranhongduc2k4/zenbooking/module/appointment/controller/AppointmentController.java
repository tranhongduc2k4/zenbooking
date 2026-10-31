package com.tranhongduc2k4.zenbooking.module.appointment.controller;

import com.tranhongduc2k4.zenbooking.common.security.CustomUserDetails;
import com.tranhongduc2k4.zenbooking.module.appointment.dto.AppointmentBookingRequest;
import com.tranhongduc2k4.zenbooking.module.appointment.dto.AppointmentResponse;
import com.tranhongduc2k4.zenbooking.module.appointment.dto.AppointmentStatusUpdateRequest;
import com.tranhongduc2k4.zenbooking.module.appointment.entity.AppointmentStatus;
import com.tranhongduc2k4.zenbooking.module.appointment.service.AppointmentService;
import com.tranhongduc2k4.zenbooking.module.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    // 1. Đặt lịch khám mới (Hỗ trợ cả bệnh nhân đã login lẫn khách vãng lai)
    @PostMapping
    public ResponseEntity<AppointmentResponse> bookAppointment(
            @Valid @RequestBody AppointmentBookingRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User currentUser = userDetails != null ? userDetails.getUser() : null;
        AppointmentResponse response = appointmentService.bookAppointment(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 2. Bệnh nhân xem danh sách lịch khám của chính mình
    @GetMapping("/my-appointments")
    public ResponseEntity<List<AppointmentResponse>> getMyAppointments(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User currentUser = userDetails != null ? userDetails.getUser() : null;
        List<AppointmentResponse> list = appointmentService.getMyAppointments(currentUser);
        return ResponseEntity.ok(list);
    }

    // 3. Admin & Bác sĩ xem toàn bộ lịch khám (kèm lọc trạng thái, ngày, bác sĩ, từ khóa)
    @GetMapping("/admin")
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments(
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) String search
    ) {
        List<AppointmentResponse> list = appointmentService.getAllAppointments(status, date, doctorId, search);
        return ResponseEntity.ok(list);
    }

    // 4. Admin & Bác sĩ lấy số liệu thống kê lịch hẹn
    @GetMapping("/admin/stats")
    public ResponseEntity<Map<String, Object>> getAppointmentStats() {
        return ResponseEntity.ok(appointmentService.getAppointmentStats());
    }

    // 5. Chi tiết 1 lịch hẹn theo ID
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    // 6. Admin & Bác sĩ cập nhật trạng thái lịch hẹn (Xác nhận, Hoàn thành, Hủy)
    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, request));
    }

    // 7. Bệnh nhân tự hủy lịch khám của mình
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<AppointmentResponse> cancelMyAppointment(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User currentUser = userDetails != null ? userDetails.getUser() : null;
        return ResponseEntity.ok(appointmentService.cancelMyAppointment(id, reason, currentUser));
    }
}
