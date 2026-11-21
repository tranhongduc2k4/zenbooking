package com.tranhongduc2k4.zenbooking.module.notification.dto;

import com.tranhongduc2k4.zenbooking.module.notification.entity.NotificationType;
import com.tranhongduc2k4.zenbooking.module.user.entity.Role;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private Long id;
    private Long recipientId;
    private String recipientName;
    private Role recipientRole;
    private String title;
    private String message;
    private NotificationType type;
    private Long referenceId;
    private String referenceCode;
    private boolean read;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}
