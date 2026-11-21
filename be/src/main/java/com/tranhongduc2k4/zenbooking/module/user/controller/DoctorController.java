package com.tranhongduc2k4.zenbooking.module.user.controller;

import com.tranhongduc2k4.zenbooking.module.appointment.dto.AppointmentResponse;
import com.tranhongduc2k4.zenbooking.module.appointment.entity.Appointment;
import com.tranhongduc2k4.zenbooking.module.appointment.entity.AppointmentStatus;
import com.tranhongduc2k4.zenbooking.module.appointment.repository.AppointmentRepository;
import com.tranhongduc2k4.zenbooking.module.user.dto.DoctorCreateRequest;
import com.tranhongduc2k4.zenbooking.module.user.dto.DoctorResponse;
import com.tranhongduc2k4.zenbooking.module.user.entity.Role;
import com.tranhongduc2k4.zenbooking.module.user.entity.User;
import com.tranhongduc2k4.zenbooking.module.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Lấy toàn bộ danh sách bác sĩ kèm thống kê số ca khám
     */
    @GetMapping
    public ResponseEntity<List<DoctorResponse>> getDoctors() {
        List<Appointment> allAppointments = appointmentRepository.findAll();
        List<DoctorResponse> list = userRepository.findByRoleOrderByIdAsc(Role.DOCTOR).stream()
                .map(u -> {
                    long total = allAppointments.stream()
                            .filter(a -> a.getDoctor() != null && a.getDoctor().getId().equals(u.getId()))
                            .count();
                    long completed = allAppointments.stream()
                            .filter(a -> a.getDoctor() != null && a.getDoctor().getId().equals(u.getId()) && a.getStatus() == AppointmentStatus.COMPLETED)
                            .count();

                    return DoctorResponse.builder()
                            .id(u.getId())
                            .fullName(u.getFullName())
                            .phone(u.getPhone())
                            .email(u.getEmail())
                            .specialty(u.getSpecialty() != null ? u.getSpecialty() : "Chuyên khoa nha khoa")
                            .totalAppointments(total)
                            .completedAppointments(completed)
                            .build();
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    /**
     * Thêm bác sĩ mới vào hệ thống phòng khám
     */
    @PostMapping
    public ResponseEntity<?> createDoctor(@Valid @RequestBody DoctorCreateRequest request) {
        if (userRepository.existsByPhone(request.getPhone())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Số điện thoại này đã được sử dụng bởi một tài khoản khác!"));
        }

        if (request.getEmail() != null && !request.getEmail().isBlank() && userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Địa chỉ email này đã được sử dụng!"));
        }

        String rawPassword = (request.getPassword() != null && !request.getPassword().isBlank()) 
                ? request.getPassword() 
                : "123456";

        User doctor = User.builder()
                .fullName(request.getFullName().trim())
                .phone(request.getPhone().trim())
                .email(request.getEmail() != null ? request.getEmail().trim() : null)
                .specialty(request.getSpecialty().trim())
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(Role.DOCTOR)
                .build();

        userRepository.save(doctor);

        return ResponseEntity.status(HttpStatus.CREATED).body(DoctorResponse.builder()
                .id(doctor.getId())
                .fullName(doctor.getFullName())
                .phone(doctor.getPhone())
                .email(doctor.getEmail())
                .specialty(doctor.getSpecialty())
                .totalAppointments(0)
                .completedAppointments(0)
                .build());
    }

    /**
     * Chỉnh sửa thông tin bác sĩ
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDoctor(@PathVariable Long id, @Valid @RequestBody DoctorCreateRequest request) {
        User doctor = userRepository.findById(id).orElse(null);
        if (doctor == null || doctor.getRole() != Role.DOCTOR) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy thông tin bác sĩ trong hệ thống!"));
        }

        // Kiểm tra trùng SĐT nếu thay đổi
        if (!doctor.getPhone().equals(request.getPhone().trim()) && userRepository.existsByPhone(request.getPhone().trim())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Số điện thoại mới đã tồn tại trên hệ thống!"));
        }

        doctor.setFullName(request.getFullName().trim());
        doctor.setPhone(request.getPhone().trim());
        if (request.getEmail() != null) {
            doctor.setEmail(request.getEmail().trim());
        }
        doctor.setSpecialty(request.getSpecialty().trim());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            doctor.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        userRepository.save(doctor);

        return ResponseEntity.ok(DoctorResponse.builder()
                .id(doctor.getId())
                .fullName(doctor.getFullName())
                .phone(doctor.getPhone())
                .email(doctor.getEmail())
                .specialty(doctor.getSpecialty())
                .build());
    }

    /**
     * Xóa bác sĩ (hoặc kiểm tra an toàn nếu đã có ca khám gắn với bác sĩ này)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id) {
        User doctor = userRepository.findById(id).orElse(null);
        if (doctor == null || doctor.getRole() != Role.DOCTOR) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy thông tin bác sĩ cần xóa!"));
        }

        List<Appointment> doctorAppointments = appointmentRepository.findByDoctorIdOrderByAppointmentDateDescAppointmentTimeDesc(id);
        if (!doctorAppointments.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Không thể xóa bác sĩ đã có lịch hẹn/ca khám trong hệ thống! Vui lòng thay đổi thông tin hoặc giữ lại hồ sơ."));
        }

        userRepository.delete(doctor);
        return ResponseEntity.ok(Map.of("message", "Đã xóa bác sĩ khỏi hệ thống thành công!"));
    }

    /**
     * Lấy danh sách lịch hẹn/ca khám của riêng bác sĩ này
     */
    @GetMapping("/{id}/appointments")
    public ResponseEntity<List<AppointmentResponse>> getDoctorAppointments(@PathVariable Long id) {
        List<AppointmentResponse> list = appointmentRepository
                .findByDoctorIdOrderByAppointmentDateDescAppointmentTimeDesc(id).stream()
                .map(a -> AppointmentResponse.builder()
                        .id(a.getId())
                        .appointmentCode(a.getAppointmentCode())
                        .patientId(a.getPatient() != null ? a.getPatient().getId() : null)
                        .patientName(a.getPatientName())
                        .patientPhone(a.getPatientPhone())
                        .doctorId(a.getDoctor() != null ? a.getDoctor().getId() : null)
                        .doctorName(a.getDoctorName())
                        .serviceId(a.getService() != null ? a.getService().getId() : null)
                        .serviceName(a.getServiceName())
                        .servicePrice(a.getServicePrice())
                        .appointmentDate(a.getAppointmentDate())
                        .appointmentTime(a.getAppointmentTime())
                        .status(a.getStatus())
                        .notes(a.getNotes())
                        .cancellationReason(a.getCancellationReason())
                        .createdAt(a.getCreatedAt())
                        .updatedAt(a.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }
}
