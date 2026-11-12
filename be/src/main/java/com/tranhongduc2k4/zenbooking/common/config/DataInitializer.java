package com.tranhongduc2k4.zenbooking.common.config;

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
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final DentalServiceRepository serviceRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initUsers();
        initServices();
        initAppointments();
    }

    private void initUsers() {
        if (userRepository.count() == 0) {
            log.info("Khởi tạo tài khoản mẫu (Bệnh nhân, Bác sĩ, Admin)...");
            String defaultPasswordHash = passwordEncoder.encode("123456");

            User patient = User.builder()
                    .fullName("Trần Hồng Đức")
                    .phone("0792275635")
                    .email("duc.patient@zenbooking.com")
                    .passwordHash(defaultPasswordHash)
                    .role(Role.PATIENT)
                    .build();

            User doctor = User.builder()
                    .fullName("BS. CKI Trần Minh Tuấn")
                    .phone("0988888888")
                    .email("tuan.doctor@zenbooking.com")
                    .passwordHash(defaultPasswordHash)
                    .role(Role.DOCTOR)
                    .build();

            User admin = User.builder()
                    .fullName("Admin Quản Trị Viên")
                    .phone("0909999999")
                    .email("admin@zenbooking.com")
                    .passwordHash(defaultPasswordHash)
                    .role(Role.ADMIN)
                    .build();

            userRepository.saveAll(List.of(patient, doctor, admin));
            log.info("Đã khởi tạo thành công 3 tài khoản mặc định (Mật khẩu: 123456)!");
        }
    }

    private void initServices() {
        if (serviceRepository.count() == 0) {
            log.info("Khởi tạo danh mục dịch vụ nha khoa tiêu chuẩn ban đầu...");
            List<DentalService> defaultServices = List.of(
                    DentalService.builder()
                            .name("Khám tổng quát & Tư vấn")
                            .code("GENERAL_EXAM")
                            .category("Nha khoa tổng quát")
                            .description("Khám chuyên sâu toàn diện khoang miệng, kiểm tra nướu, chụp phim X-Quang và tư vấn lộ trình điều trị miễn phí.")
                            .price(BigDecimal.ZERO)
                            .estimatedDurationMinutes(20)
                            .icon("🩺")
                            .isActive(true)
                            .build(),
                    DentalService.builder()
                            .name("Cạo vôi & Đánh bóng siêu âm")
                            .code("SCALING_POLISHING")
                            .category("Nha khoa tổng quát")
                            .description("Làm sạch mảng bám, vôi răng bằng công nghệ sóng siêu âm êm ái, bảo vệ men răng và giúp hơi thở thơm mát.")
                            .price(new BigDecimal("200000"))
                            .estimatedDurationMinutes(30)
                            .icon("✨")
                            .isActive(true)
                            .build(),
                    DentalService.builder()
                            .name("Tẩy trắng răng Laser Whitening")
                            .code("LASER_WHITENING")
                            .category("Nha khoa thẩm mỹ")
                            .description("Bật 2-3 tone răng nhanh chóng, an toàn không ê buốt với ánh sáng Laser lạnh chuẩn y khoa Hoa Kỳ.")
                            .price(new BigDecimal("1500000"))
                            .estimatedDurationMinutes(45)
                            .icon("💎")
                            .isActive(true)
                            .build(),
                    DentalService.builder()
                            .name("Nhổ răng khôn không đau Piezotome")
                            .code("PIEZOTOME_EXTRACTION")
                            .category("Tiểu phẫu")
                            .description("Nhổ răng khôn bằng bước sóng siêu âm Piezotome hiện đại, không rạch mổ lớn, lành thương nhanh.")
                            .price(new BigDecimal("1000000"))
                            .estimatedDurationMinutes(30)
                            .icon("🦷")
                            .isActive(true)
                            .build(),
                    DentalService.builder()
                            .name("Niềng răng mắc cài / Khay trong suốt")
                            .code("ORTHODONTICS_BRACES")
                            .category("Chỉnh nha")
                            .description("Chỉnh nha mắc cài sứ/kim loại và khay trong suốt Invisalign, phác đồ điều trị 3D rõ ràng.")
                            .price(new BigDecimal("18000000"))
                            .estimatedDurationMinutes(45)
                            .icon("😁")
                            .isActive(true)
                            .build(),
                    DentalService.builder()
                            .name("Cấy ghép Implant thẩm mỹ")
                            .code("DENTAL_IMPLANT")
                            .category("Cấy ghép chuyên sâu")
                            .description("Phục hồi răng mất trọn đời bằng trụ Implant Thụy Sĩ/Hàn Quốc, ăn nhai chắc chắn và thẩm mỹ tự nhiên.")
                            .price(new BigDecimal("12000000"))
                            .estimatedDurationMinutes(60)
                            .icon("🔩")
                            .isActive(true)
                            .build()
            );

            serviceRepository.saveAll(defaultServices);
            log.info("Đã khởi tạo thành công {} dịch vụ nha khoa!", defaultServices.size());
        }
    }

    private void initAppointments() {
        if (appointmentRepository.count() == 0) {
            log.info("Khởi tạo danh sách lịch hẹn mẫu ban đầu...");
            User patient = userRepository.findByPhone("0792275635").orElse(null);
            User doctor = userRepository.findByPhone("0988888888").orElse(null);
            DentalService service1 = serviceRepository.findByCode("GENERAL_EXAM").orElse(null);
            DentalService service2 = serviceRepository.findByCode("SCALING_POLISHING").orElse(null);
            DentalService service3 = serviceRepository.findByCode("LASER_WHITENING").orElse(null);

            LocalDate today = LocalDate.now();

            List<Appointment> sampleAppointments = List.of(
                    Appointment.builder()
                            .appointmentCode("ZB-AP-8801")
                            .patient(patient)
                            .patientName(patient != null ? patient.getFullName() : "Trần Hồng Đức")
                            .patientPhone(patient != null ? patient.getPhone() : "0792275635")
                            .doctor(doctor)
                            .doctorName(doctor != null ? doctor.getFullName() : "BS. CKI Trần Minh Tuấn")
                            .service(service1)
                            .serviceName(service1 != null ? service1.getName() : "Khám tổng quát & Tư vấn")
                            .servicePrice(service1 != null ? service1.getPrice() : BigDecimal.ZERO)
                            .appointmentDate(today)
                            .appointmentTime("09:00")
                            .status(AppointmentStatus.CONFIRMED)
                            .notes("Khám định kỳ 6 tháng/lần, kiểm tra răng số 8 hàm dưới.")
                            .build(),
                    Appointment.builder()
                            .appointmentCode("ZB-AP-8802")
                            .patient(patient)
                            .patientName(patient != null ? patient.getFullName() : "Trần Hồng Đức")
                            .patientPhone(patient != null ? patient.getPhone() : "0792275635")
                            .doctor(doctor)
                            .doctorName(doctor != null ? doctor.getFullName() : "BS. CKI Trần Minh Tuấn")
                            .service(service2)
                            .serviceName(service2 != null ? service2.getName() : "Cạo vôi & Đánh bóng siêu âm")
                            .servicePrice(service2 != null ? service2.getPrice() : new BigDecimal("200000"))
                            .appointmentDate(today.plusDays(2))
                            .appointmentTime("14:30")
                            .status(AppointmentStatus.PENDING)
                            .notes("Muốn làm sạch vôi răng và kiểm tra nướu hay chảy máu.")
                            .build(),
                    Appointment.builder()
                            .appointmentCode("ZB-AP-8750")
                            .patient(patient)
                            .patientName(patient != null ? patient.getFullName() : "Trần Hồng Đức")
                            .patientPhone(patient != null ? patient.getPhone() : "0792275635")
                            .doctor(doctor)
                            .doctorName(doctor != null ? doctor.getFullName() : "ThS. BS Lê Hoàng Yến")
                            .service(service3)
                            .serviceName(service3 != null ? service3.getName() : "Tẩy trắng răng Laser Whitening")
                            .servicePrice(service3 != null ? service3.getPrice() : new BigDecimal("1500000"))
                            .appointmentDate(today.minusDays(5))
                            .appointmentTime("10:00")
                            .status(AppointmentStatus.COMPLETED)
                            .notes("Đã thực hiện tẩy trắng răng, hiệu quả nâng 2 tone.")
                            .build(),
                    Appointment.builder()
                            .appointmentCode("ZB-AP-8640")
                            .patient(null)
                            .patientName("Nguyễn Thị Mai")
                            .patientPhone("0912345678")
                            .doctor(null)
                            .doctorName("Bác sĩ bất kỳ")
                            .service(service1)
                            .serviceName(service1 != null ? service1.getName() : "Khám tổng quát & Tư vấn")
                            .servicePrice(service1 != null ? service1.getPrice() : BigDecimal.ZERO)
                            .appointmentDate(today)
                            .appointmentTime("15:30")
                            .status(AppointmentStatus.PENDING)
                            .notes("Khách đặt trực tuyến từ website, kiểm tra răng ê buốt.")
                            .build()
            );

            appointmentRepository.saveAll(sampleAppointments);
            log.info("Đã khởi tạo thành công {} lịch hẹn mẫu!", sampleAppointments.size());
        }
    }
}
