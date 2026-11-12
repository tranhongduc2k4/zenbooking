package com.tranhongduc2k4.zenbooking.module.appointment.service;

import com.tranhongduc2k4.zenbooking.common.exception.CustomException;
import com.tranhongduc2k4.zenbooking.module.appointment.dto.AppointmentBookingRequest;
import com.tranhongduc2k4.zenbooking.module.appointment.dto.AppointmentResponse;
import com.tranhongduc2k4.zenbooking.module.appointment.dto.AppointmentStatusUpdateRequest;
import com.tranhongduc2k4.zenbooking.module.appointment.entity.Appointment;
import com.tranhongduc2k4.zenbooking.module.appointment.entity.AppointmentStatus;
import com.tranhongduc2k4.zenbooking.module.appointment.repository.AppointmentRepository;
import com.tranhongduc2k4.zenbooking.module.catalog.entity.DentalService;
import com.tranhongduc2k4.zenbooking.module.catalog.repository.DentalServiceRepository;
import com.tranhongduc2k4.zenbooking.module.user.entity.Role;
import com.tranhongduc2k4.zenbooking.module.user.entity.User;
import com.tranhongduc2k4.zenbooking.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DentalServiceRepository dentalServiceRepository;
    private final UserRepository userRepository;
    private static final SecureRandom RANDOM = new SecureRandom();

    @Override
    @Transactional
    public AppointmentResponse bookAppointment(AppointmentBookingRequest request, User currentUser) {
        log.info("Đặt lịch khám mới cho: {} vào ngày {} lúc {}", 
                request.getPatientName(), request.getAppointmentDate(), request.getAppointmentTime());

        // Kiểm tra ràng buộc thời gian: thời gian đặt > thời gian hiện tại và phải trước tối thiểu 2 giờ
        validateAppointmentTime(request.getAppointmentDate(), request.getAppointmentTime());

        // 1. Kiểm tra ràng buộc thời gian đặt lịch:
        // - Thời gian đặt phải > thời gian hiện tại
        // - Phải đặt trước tối thiểu 2 giờ
        validateAppointmentTime(request.getAppointmentDate(), request.getAppointmentTime());

        // 2. Xác định thông tin bệnh nhân
        User patient = currentUser;
        if (patient == null && request.getPatientPhone() != null) {
            patient = userRepository.findByPhone(request.getPatientPhone()).orElse(null);
        }

        // 3. Xác định dịch vụ điều trị & đơn giá
        DentalService dentalService = null;
        BigDecimal servicePrice = BigDecimal.ZERO;
        if (request.getServiceId() != null) {
            dentalService = dentalServiceRepository.findById(request.getServiceId()).orElse(null);
            if (dentalService != null && dentalService.getPrice() != null) {
                servicePrice = dentalService.getPrice();
            }
        }

        // 4. Xác định bác sĩ khám (nếu có chỉ định)
        User doctor = null;
        if (request.getDoctorId() != null) {
            doctor = userRepository.findById(request.getDoctorId()).orElse(null);
        }

        // 5. Sinh mã lịch hẹn duy nhất (ZB-AP-XXXX)
        String appointmentCode = generateUniqueAppointmentCode();

        Appointment appointment = Appointment.builder()
                .appointmentCode(appointmentCode)
                .patient(patient)
                .patientName(request.getPatientName().trim())
                .patientPhone(request.getPatientPhone().trim())
                .doctor(doctor)
                .doctorName(request.getDoctorName() != null ? request.getDoctorName().trim() : "Bác sĩ bất kỳ")
                .service(dentalService)
                .serviceName(dentalService != null ? dentalService.getName() : request.getServiceName().trim())
                .servicePrice(servicePrice)
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime().trim())
                .status(AppointmentStatus.PENDING)
                .notes(request.getNotes())
                .build();

        Appointment saved = appointmentRepository.save(appointment);
        log.info("Đã tạo lịch hẹn thành công với mã: {}", saved.getAppointmentCode());

        return mapToResponse(saved);
    }

    /**
     * Xác thực khung giờ hẹn: Phải trong tương lai và trước thời điểm khám ít nhất 2 giờ.
     */
    private void validateAppointmentTime(LocalDate appointmentDate, String appointmentTimeStr) {
        if (appointmentDate == null || appointmentTimeStr == null || appointmentTimeStr.trim().isEmpty()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Ngày và giờ khám không được để trống!");
        }

        LocalTime time;
        try {
            time = LocalTime.parse(appointmentTimeStr.trim(), DateTimeFormatter.ofPattern("HH:mm"));
        } catch (Exception e) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Định dạng giờ hẹn không hợp lệ (yêu cầu HH:mm)!");
        }

        LocalDateTime requestedDateTime = LocalDateTime.of(appointmentDate, time);
        LocalDateTime now = LocalDateTime.now();

        // 1. Không được đặt giờ trong quá khứ
        if (!requestedDateTime.isAfter(now)) {
            throw new CustomException(HttpStatus.BAD_REQUEST, 
                    "Thời gian khám phải lớn hơn thời gian hiện tại!");
        }

        // 2. Quy định: Phải đặt trước tối thiểu 2 giờ
        LocalDateTime minimumAllowedTime = now.plusHours(2);
        if (requestedDateTime.isBefore(minimumAllowedTime)) {
            throw new CustomException(HttpStatus.BAD_REQUEST, 
                    "Bạn vui lòng đặt lịch khám trước giờ hẹn tối thiểu 2 tiếng để phòng khám kịp chuẩn bị chu đáo!");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getMyAppointments(User currentUser) {
        if (currentUser == null) {
            throw new CustomException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để xem lịch hẹn của mình!");
        }

        List<Appointment> list;
        if (currentUser.getRole() == Role.DOCTOR) {
            list = appointmentRepository.findByDoctorIdOrderByAppointmentDateDescAppointmentTimeDesc(currentUser.getId());
        } else {
            list = appointmentRepository.findByPatientIdOrderByAppointmentDateDescAppointmentTimeDesc(currentUser.getId());
            // Dự phòng nếu đặt trước đó bằng SĐT khi chưa gán ID
            if (list.isEmpty() && currentUser.getPhone() != null) {
                list = appointmentRepository.findByPatientPhoneOrderByAppointmentDateDescAppointmentTimeDesc(currentUser.getPhone());
            }
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments(AppointmentStatus status, LocalDate date, Long doctorId, String search) {
        List<Appointment> list = appointmentRepository.searchAppointments(status, date, doctorId, search);
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(Long id) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn với mã ID: " + id));
        return mapToResponse(apt);
    }

    @Override
    @Transactional
    public AppointmentResponse updateStatus(Long id, AppointmentStatusUpdateRequest request) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn để cập nhật!"));

        apt.setStatus(request.getStatus());
        if (request.getCancellationReason() != null) {
            apt.setCancellationReason(request.getCancellationReason());
        }

        // Nếu admin/bác sĩ gán bác sĩ phụ trách ca
        if (request.getDoctorId() != null) {
            User doctor = userRepository.findById(request.getDoctorId()).orElse(null);
            if (doctor != null) {
                apt.setDoctor(doctor);
                apt.setDoctorName(doctor.getFullName());
            }
        }

        Appointment updated = appointmentRepository.save(apt);
        log.info("Cập nhật trạng thái lịch hẹn {} sang {}", apt.getAppointmentCode(), request.getStatus());
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public AppointmentResponse cancelMyAppointment(Long id, String reason, User currentUser) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn!"));

        // Kiểm tra quyền: chỉ chính chủ bệnh nhân mới được hủy
        boolean isOwner = (apt.getPatient() != null && apt.getPatient().getId().equals(currentUser.getId()))
                || (currentUser.getPhone() != null && currentUser.getPhone().equals(apt.getPatientPhone()));

        if (!isOwner && currentUser.getRole() != Role.ADMIN) {
            throw new CustomException(HttpStatus.FORBIDDEN, "Bạn không có quyền hủy lịch hẹn này!");
        }

        if (apt.getStatus() == AppointmentStatus.COMPLETED) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Ca khám đã hoàn thành, không thể hủy!");
        }

        apt.setStatus(AppointmentStatus.CANCELLED);
        apt.setCancellationReason(reason != null && !reason.trim().isEmpty() ? reason.trim() : "Bệnh nhân tự hủy ca khám");

        Appointment cancelled = appointmentRepository.save(apt);
        log.info("Bệnh nhân {} đã hủy lịch hẹn {}", currentUser.getFullName(), apt.getAppointmentCode());
        return mapToResponse(cancelled);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getAppointmentStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", appointmentRepository.count());
        stats.put("pending", appointmentRepository.countByStatus(AppointmentStatus.PENDING));
        stats.put("confirmed", appointmentRepository.countByStatus(AppointmentStatus.CONFIRMED));
        stats.put("completed", appointmentRepository.countByStatus(AppointmentStatus.COMPLETED));
        stats.put("cancelled", appointmentRepository.countByStatus(AppointmentStatus.CANCELLED));
        stats.put("today", appointmentRepository.countByAppointmentDate(LocalDate.now()));
        return stats;
    }

    private String generateUniqueAppointmentCode() {
        String code;
        int attempts = 0;
        do {
            int randomNum = 1000 + RANDOM.nextInt(9000); // 1000 - 9999
            code = "ZB-AP-" + randomNum;
            attempts++;
            if (attempts > 50) {
                code = "ZB-AP-" + System.currentTimeMillis() % 100000;
                break;
            }
        } while (appointmentRepository.existsByAppointmentCode(code));

        return code;
    }

    private AppointmentResponse mapToResponse(Appointment apt) {
        return AppointmentResponse.builder()
                .id(apt.getId())
                .appointmentCode(apt.getAppointmentCode())
                .patientId(apt.getPatient() != null ? apt.getPatient().getId() : null)
                .patientName(apt.getPatientName())
                .patientPhone(apt.getPatientPhone())
                .doctorId(apt.getDoctor() != null ? apt.getDoctor().getId() : null)
                .doctorName(apt.getDoctorName())
                .serviceId(apt.getService() != null ? apt.getService().getId() : null)
                .serviceName(apt.getServiceName())
                .servicePrice(apt.getServicePrice())
                .appointmentDate(apt.getAppointmentDate())
                .appointmentTime(apt.getAppointmentTime())
                .status(apt.getStatus())
                .notes(apt.getNotes())
                .cancellationReason(apt.getCancellationReason())
                .createdAt(apt.getCreatedAt())
                .updatedAt(apt.getUpdatedAt())
                .build();
    }
}
