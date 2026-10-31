package com.tranhongduc2k4.zenbooking.module.appointment.entity;

public enum AppointmentStatus {
    PENDING,    // Chờ phòng khám tiếp nhận & xác nhận
    CONFIRMED,  // Lịch hẹn đã được xác nhận
    COMPLETED,  // Ca khám đã hoàn thành
    CANCELLED   // Đã hủy lịch hẹn
}
