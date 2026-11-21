package com.tranhongduc2k4.zenbooking.module.notification.service;

import com.tranhongduc2k4.zenbooking.common.exception.CustomException;
import com.tranhongduc2k4.zenbooking.module.notification.dto.NotificationDTO;
import com.tranhongduc2k4.zenbooking.module.notification.dto.NotificationStatsDTO;
import com.tranhongduc2k4.zenbooking.module.notification.entity.Notification;
import com.tranhongduc2k4.zenbooking.module.notification.entity.NotificationType;
import com.tranhongduc2k4.zenbooking.module.notification.repository.NotificationRepository;
import com.tranhongduc2k4.zenbooking.module.user.entity.Role;
import com.tranhongduc2k4.zenbooking.module.user.entity.User;
import com.tranhongduc2k4.zenbooking.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationStreamService streamService;
    private final UserRepository userRepository;

    @Override
    public SseEmitter createStream(User user) {
        if (user == null) {
            throw new CustomException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để kết nối luồng thông báo!");
        }
        return streamService.subscribe(user);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationStatsDTO getNotificationsForUser(User user) {
        if (user == null) {
            throw new CustomException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để xem thông báo!");
        }

        List<Notification> list;
        long unreadCount;

        if (user.getRole() == Role.ADMIN) {
            list = notificationRepository.findAllForAdmin(user.getId());
            unreadCount = notificationRepository.countUnreadForAdmin(user.getId());
        } else {
            list = notificationRepository.findAllForUser(user.getId());
            unreadCount = notificationRepository.countUnreadForUser(user.getId());
        }

        List<NotificationDTO> dtos = list.stream().map(this::toDTO).collect(Collectors.toList());

        return NotificationStatsDTO.builder()
                .total(list.size())
                .unread(unreadCount)
                .notifications(dtos)
                .build();
    }

    @Override
    @Transactional
    public NotificationDTO markAsRead(Long id, User user) {
        if (user == null) {
            throw new CustomException(HttpStatus.UNAUTHORIZED, "Chưa xác thực người dùng!");
        }

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo!"));

        boolean isAuthorized = user.getRole() == Role.ADMIN
                || (notification.getRecipient() != null && notification.getRecipient().getId().equals(user.getId()));

        if (!isAuthorized) {
            throw new CustomException(HttpStatus.FORBIDDEN, "Bạn không có quyền thao tác trên thông báo này!");
        }

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
        }

        return toDTO(notification);
    }

    @Override
    @Transactional
    public int markAllAsRead(User user) {
        if (user == null) {
            throw new CustomException(HttpStatus.UNAUTHORIZED, "Chưa xác thực người dùng!");
        }

        if (user.getRole() == Role.ADMIN) {
            return notificationRepository.markAllAsReadForAdmin(user.getId());
        } else {
            return notificationRepository.markAllAsReadForUser(user.getId());
        }
    }

    @Override
    @Transactional
    public void deleteNotification(Long id, User user) {
        if (user == null) {
            throw new CustomException(HttpStatus.UNAUTHORIZED, "Chưa xác thực người dùng!");
        }

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo!"));

        boolean isAuthorized = user.getRole() == Role.ADMIN
                || (notification.getRecipient() != null && notification.getRecipient().getId().equals(user.getId()));

        if (!isAuthorized) {
            throw new CustomException(HttpStatus.FORBIDDEN, "Không có quyền xóa thông báo!");
        }

        notificationRepository.delete(notification);
    }

    @Override
    @Transactional
    public NotificationDTO createAndSend(Notification notification) {
        Notification saved = notificationRepository.save(notification);
        NotificationDTO dto = toDTO(saved);

        // Đẩy thời gian thực qua SSE
        if (saved.getRecipientRole() == Role.ADMIN) {
            streamService.sendToAdmins(dto);
        } else if (saved.getRecipient() != null) {
            streamService.sendToUser(saved.getRecipient().getId(), dto);
        } else {
            streamService.broadcast(dto);
        }

        return dto;
    }

    @Override
    @Transactional
    public void initSampleNotificationsIfEmpty() {
        if (notificationRepository.count() > 0) {
            return;
        }

        log.info("Khởi tạo danh sách thông báo mẫu cho hệ thống...");
        User samplePatient = userRepository.findByPhone("0792275635").orElse(null);

        // 1. Thông báo cho Admin: Lịch hẹn mới từ bệnh nhân
        Notification adminNotif1 = Notification.builder()
                .title("Lịch khám mới cần duyệt")
                .message("Bệnh nhân Trần Hồng Đức vừa đặt lịch khám Cấy ghép Implant thẩm mỹ lúc 19:00 ngày 14/11/2026.")
                .type(NotificationType.APPOINTMENT_NEW)
                .recipientRole(Role.ADMIN)
                .referenceCode("ZB-AP-8838")
                .read(false)
                .createdAt(LocalDateTime.now().minusMinutes(15))
                .build();
        notificationRepository.save(adminNotif1);

        Notification adminNotif2 = Notification.builder()
                .title("Lịch khám cần kiểm tra")
                .message("Bệnh nhân Lê Tấn Tài đã đặt lịch Niềng răng mắc cài lúc 19:00 ngày 14/11/2026.")
                .type(NotificationType.APPOINTMENT_NEW)
                .recipientRole(Role.ADMIN)
                .referenceCode("ZB-AP-7218")
                .read(false)
                .createdAt(LocalDateTime.now().minusHours(2))
                .build();
        notificationRepository.save(adminNotif2);

        Notification adminNotif3 = Notification.builder()
                .title("Bệnh nhân hủy ca khám")
                .message("Bệnh nhân Trần Hồng Đức đã hủy lịch hẹn ZB-AP-6020. Lý do: Bận việc đột xuất.")
                .type(NotificationType.APPOINTMENT_CANCELLED)
                .recipientRole(Role.ADMIN)
                .referenceCode("ZB-AP-6020")
                .read(true)
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();
        notificationRepository.save(adminNotif3);

        // 2. Thông báo cho Bệnh nhân mẫu
        if (samplePatient != null) {
            Notification patNotif1 = Notification.builder()
                    .recipient(samplePatient)
                    .title("Lịch hẹn đã được xác nhận")
                    .message("Lịch khám Cấy ghép Implant thẩm mỹ (Mã: ZB-AP-8838) vào lúc 19:00 ngày 14/11/2026 đã được phòng khám xác nhận.")
                    .type(NotificationType.APPOINTMENT_CONFIRMED)
                    .referenceCode("ZB-AP-8838")
                    .read(false)
                    .createdAt(LocalDateTime.now().minusMinutes(20))
                    .build();
            notificationRepository.save(patNotif1);

            Notification patNotif2 = Notification.builder()
                    .recipient(samplePatient)
                    .title("Lời dặn chăm sóc sau điều trị")
                    .message("Bác sĩ CKI Trần Minh Tuấn gửi lời dặn: Nhớ súc miệng nước muối ấm nhẹ sau khi cạo vôi răng nhé!")
                    .type(NotificationType.SYSTEM_REMINDER)
                    .referenceCode("ZB-AP-7028")
                    .read(true)
                    .createdAt(LocalDateTime.now().minusDays(2))
                    .build();
            notificationRepository.save(patNotif2);
        }

        log.info("Khởi tạo thông báo mẫu thành công!");
    }

    private NotificationDTO toDTO(Notification n) {
        if (n == null) return null;
        return NotificationDTO.builder()
                .id(n.getId())
                .recipientId(n.getRecipient() != null ? n.getRecipient().getId() : null)
                .recipientName(n.getRecipient() != null ? n.getRecipient().getFullName() : null)
                .recipientRole(n.getRecipientRole())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .referenceId(n.getReferenceId())
                .referenceCode(n.getReferenceCode())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .readAt(n.getReadAt())
                .build();
    }
}
