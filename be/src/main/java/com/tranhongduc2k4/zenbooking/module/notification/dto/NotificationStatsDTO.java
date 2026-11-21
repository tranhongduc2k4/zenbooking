package com.tranhongduc2k4.zenbooking.module.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationStatsDTO {
    private long total;
    private long unread;
    private List<NotificationDTO> notifications;
}
