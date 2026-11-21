package com.tranhongduc2k4.zenbooking.module.notification.controller;

import com.tranhongduc2k4.zenbooking.common.security.CustomUserDetails;
import com.tranhongduc2k4.zenbooking.module.notification.dto.NotificationDTO;
import com.tranhongduc2k4.zenbooking.module.notification.dto.NotificationStatsDTO;
import com.tranhongduc2k4.zenbooking.module.notification.service.NotificationService;
import com.tranhongduc2k4.zenbooking.module.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // 1. Luồng SSE thời gian thực cho Client (Browser EventSource)
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails != null ? userDetails.getUser() : null;
        return notificationService.createStream(user);
    }

    // 2. Lấy danh sách thông báo và số lượng chưa đọc của người dùng hiện tại
    @GetMapping
    public ResponseEntity<NotificationStatsDTO> getMyNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User user = userDetails != null ? userDetails.getUser() : null;
        NotificationStatsDTO stats = notificationService.getNotificationsForUser(user);
        return ResponseEntity.ok(stats);
    }

    // 3. Đánh dấu một thông báo là đã đọc
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User user = userDetails != null ? userDetails.getUser() : null;
        NotificationDTO dto = notificationService.markAsRead(id, user);
        return ResponseEntity.ok(dto);
    }

    // 4. Đánh dấu tất cả thông báo là đã đọc
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User user = userDetails != null ? userDetails.getUser() : null;
        int count = notificationService.markAllAsRead(user);
        return ResponseEntity.ok(Map.of(
                "message", "Đã đánh dấu tất cả thông báo là đã đọc!",
                "updatedCount", count
        ));
    }

    // 5. Xóa thông báo
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User user = userDetails != null ? userDetails.getUser() : null;
        notificationService.deleteNotification(id, user);
        return ResponseEntity.noContent().build();
    }
}
