package com.tranhongduc2k4.zenbooking.module.notification.repository;

import com.tranhongduc2k4.zenbooking.module.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n LEFT JOIN FETCH n.recipient WHERE n.recipient.id = :userId OR n.recipientRole = com.tranhongduc2k4.zenbooking.module.user.entity.Role.ADMIN ORDER BY n.createdAt DESC")
    List<Notification> findAllForAdmin(@Param("userId") Long userId);

    @Query("SELECT n FROM Notification n LEFT JOIN FETCH n.recipient WHERE n.recipient.id = :userId ORDER BY n.createdAt DESC")
    List<Notification> findAllForUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE (n.recipient.id = :userId OR n.recipientRole = com.tranhongduc2k4.zenbooking.module.user.entity.Role.ADMIN) AND n.read = false")
    long countUnreadForAdmin(@Param("userId") Long userId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipient.id = :userId AND n.read = false")
    long countUnreadForUser(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true, n.readAt = CURRENT_TIMESTAMP WHERE (n.recipient.id = :userId OR n.recipientRole = com.tranhongduc2k4.zenbooking.module.user.entity.Role.ADMIN) AND n.read = false")
    int markAllAsReadForAdmin(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true, n.readAt = CURRENT_TIMESTAMP WHERE n.recipient.id = :userId AND n.read = false")
    int markAllAsReadForUser(@Param("userId") Long userId);
}
