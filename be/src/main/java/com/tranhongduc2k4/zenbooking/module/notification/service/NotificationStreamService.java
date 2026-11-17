package com.tranhongduc2k4.zenbooking.module.notification.service;

import com.tranhongduc2k4.zenbooking.module.notification.dto.NotificationDTO;
import com.tranhongduc2k4.zenbooking.module.user.entity.Role;
import com.tranhongduc2k4.zenbooking.module.user.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
public class NotificationStreamService {

    // Emitters theo userId
    private final Map<Long, List<SseEmitter>> userEmitters = new ConcurrentHashMap<>();

    // Emitters riêng cho toàn bộ quản trị viên đang online
    private final List<SseEmitter> adminEmitters = new CopyOnWriteArrayList<>();

    // Timeout: 30 phút
    private static final long SSE_TIMEOUT = 30 * 60 * 1000L;

    public SseEmitter subscribe(User user) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        Long userId = user.getId();

        // 1. Đăng ký emitter theo userId
        userEmitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        // 2. Nếu là ADMIN, bổ sung vào adminEmitters để nhận broadcast thông báo hệ thống
        if (user.getRole() == Role.ADMIN) {
            adminEmitters.add(emitter);
        }

        // Callbacks dọn dẹp tài nguyên
        Runnable cleanup = () -> {
            List<SseEmitter> list = userEmitters.get(userId);
            if (list != null) {
                list.remove(emitter);
                if (list.isEmpty()) {
                    userEmitters.remove(userId);
                }
            }
            if (user.getRole() == Role.ADMIN) {
                adminEmitters.remove(emitter);
            }
            log.debug("SSE Emitter cleaned up for user: {}", user.getPhone());
        };

        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        // Gửi event chào mừng ban đầu để xác nhận kết nối thành công
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("Connected to ZenBooking Real-time Notification Stream"));
        } catch (IOException e) {
            log.warn("Lỗi gửi event kết nối SSE cho user {}: {}", user.getPhone(), e.getMessage());
            cleanup.run();
        }

        log.info("User {} ({}) đã kết nối luồng thông báo thời gian thực SSE", user.getFullName(), user.getRole());
        return emitter;
    }

    public void sendToUser(Long userId, NotificationDTO dto) {
        List<SseEmitter> list = userEmitters.get(userId);
        if (list == null || list.isEmpty()) {
            return;
        }

        for (SseEmitter emitter : list) {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(dto));
            } catch (Exception e) {
                log.warn("Lỗi gửi thông báo thời gian thực tới user {}: {}", userId, e.getMessage());
                list.remove(emitter);
            }
        }
    }

    public void sendToAdmins(NotificationDTO dto) {
        log.info("Broadcast thông báo thời gian thực tới {} quản trị viên đang online: {}", adminEmitters.size(), dto.getTitle());
        for (SseEmitter emitter : adminEmitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(dto));
            } catch (Exception e) {
                log.warn("Lỗi gửi thông báo tới admin emitter: {}", e.getMessage());
                adminEmitters.remove(emitter);
            }
        }
    }

    public void broadcast(NotificationDTO dto) {
        sendToAdmins(dto);
        for (Map.Entry<Long, List<SseEmitter>> entry : userEmitters.entrySet()) {
            for (SseEmitter emitter : entry.getValue()) {
                try {
                    emitter.send(SseEmitter.event()
                            .name("notification")
                            .data(dto));
                } catch (Exception e) {
                    entry.getValue().remove(emitter);
                }
            }
        }
    }

    /**
     * Heartbeat ping mỗi 25 giây để giữ kết nối SSE mở qua các gateway/firewall/proxy
     */
    @Scheduled(fixedRate = 25000)
    public void sendHeartbeat() {
        for (Map.Entry<Long, List<SseEmitter>> entry : userEmitters.entrySet()) {
            for (SseEmitter emitter : entry.getValue()) {
                try {
                    emitter.send(SseEmitter.event().name("ping").data("ping"));
                } catch (Exception e) {
                    entry.getValue().remove(emitter);
                }
            }
        }
    }
}
