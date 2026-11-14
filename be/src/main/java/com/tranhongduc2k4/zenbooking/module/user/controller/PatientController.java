package com.tranhongduc2k4.zenbooking.module.user.controller;

import com.tranhongduc2k4.zenbooking.module.appointment.dto.AppointmentResponse;
import com.tranhongduc2k4.zenbooking.module.appointment.entity.Appointment;
import com.tranhongduc2k4.zenbooking.module.appointment.entity.AppointmentStatus;
import com.tranhongduc2k4.zenbooking.module.appointment.repository.AppointmentRepository;
import com.tranhongduc2k4.zenbooking.module.user.dto.PatientResponse;
import com.tranhongduc2k4.zenbooking.module.user.entity.Role;
import com.tranhongduc2k4.zenbooking.module.user.entity.User;
import com.tranhongduc2k4.zenbooking.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientController {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;

    /**
     * Lấy danh sách toàn bộ bệnh nhân của phòng khám kèm số liệu lịch sử ca khám
     */
    @GetMapping
    public ResponseEntity<List<PatientResponse>> getAllPatients() {
        // 1. Lấy danh sách bệnh nhân đã có tài khoản
        List<User> registeredPatients = userRepository.findByRoleOrderByIdAsc(Role.PATIENT);
        Map<String, PatientResponse> patientMap = new LinkedHashMap<>();

        for (User u : registeredPatients) {
            String phone = u.getPhone();
            List<Appointment> apts = appointmentRepository.findByPatientPhoneOrderByAppointmentDateDescAppointmentTimeDesc(phone);
            
            int total = apts.size();
            long completed = apts.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).count();
            Appointment latest = !apts.isEmpty() ? apts.get(0) : null;

            String tier = total >= 5 ? "Hội viên VIP" : total >= 2 ? "Bệnh nhân thân thiết" : "Bệnh nhân mới";

            PatientResponse response = PatientResponse.builder()
                    .id(u.getId())
                    .patientCode("BN-" + phone)
                    .fullName(u.getFullName())
                    .phone(phone)
                    .email(u.getEmail())
                    .totalVisits(total)
                    .completedVisits((int) completed)
                    .lastVisitDate(latest != null ? latest.getAppointmentDate() : null)
                    .lastServiceName(latest != null ? latest.getServiceName() : "Khám tổng quát")
                    .lastDoctorName(latest != null ? latest.getDoctorName() : "Đội ngũ chuyên khoa")
                    .bloodType("O+")
                    .allergies("Không ghi nhận")
                    .membershipTier(tier)
                    .build();

            patientMap.put(phone, response);
        }

        // 2. Bổ sung các bệnh nhân đặt lịch vãng lai từ bảng appointments
        List<Appointment> allAppointments = appointmentRepository.findAllByOrderByAppointmentDateDescAppointmentTimeDesc();
        for (Appointment a : allAppointments) {
            String phone = a.getPatientPhone();
            if (phone != null && !patientMap.containsKey(phone)) {
                List<Appointment> apts = appointmentRepository.findByPatientPhoneOrderByAppointmentDateDescAppointmentTimeDesc(phone);
                int total = apts.size();
                long completed = apts.stream().filter(apt -> apt.getStatus() == AppointmentStatus.COMPLETED).count();
                Appointment latest = !apts.isEmpty() ? apts.get(0) : a;

                PatientResponse response = PatientResponse.builder()
                        .id(a.getPatient() != null ? a.getPatient().getId() : null)
                        .patientCode("BN-" + phone)
                        .fullName(a.getPatientName())
                        .phone(phone)
                        .email(null)
                        .totalVisits(total)
                        .completedVisits((int) completed)
                        .lastVisitDate(latest.getAppointmentDate())
                        .lastServiceName(latest.getServiceName())
                        .lastDoctorName(latest.getDoctorName())
                        .bloodType("A+")
                        .allergies("Không ghi nhận")
                        .membershipTier(total >= 2 ? "Bệnh nhân thân thiết" : "Bệnh nhân mới")
                        .build();

                patientMap.put(phone, response);
            }
        }

        return ResponseEntity.ok(new ArrayList<>(patientMap.values()));
    }

    /**
     * Lấy toàn bộ lịch sử ca khám của một bệnh nhân theo số điện thoại
     */
    @GetMapping("/{phone}/history")
    public ResponseEntity<List<AppointmentResponse>> getPatientHistory(@PathVariable String phone) {
        List<Appointment> apts = appointmentRepository.findByPatientPhoneOrderByAppointmentDateDescAppointmentTimeDesc(phone);
        List<AppointmentResponse> list = apts.stream().map(a -> AppointmentResponse.builder()
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
                .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }
}
