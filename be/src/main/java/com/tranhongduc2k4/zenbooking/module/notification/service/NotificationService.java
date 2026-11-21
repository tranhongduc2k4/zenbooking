package com.tranhongduc2k4.zenbooking.module.notification.service;

import com.tranhongduc2k4.zenbooking.module.notification.dto.NotificationDTO;
import com.tranhongduc2k4.zenbooking.module.notification.dto.NotificationStatsDTO;
import com.tranhongduc2k4.zenbooking.module.notification.entity.Notification;
import com.tranhongduc2k4.zenbooking.module.user.entity.User;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public interface NotificationService {

    SseEmitter createStream(User user);

    NotificationStatsDTO getNotificationsForUser(User user);

    NotificationDTO markAsRead(Long id, User user);

    int markAllAsRead(User user);

    void deleteNotification(Long id, User user);

    NotificationDTO createAndSend(Notification notification);

    void initSampleNotificationsIfEmpty();
}
