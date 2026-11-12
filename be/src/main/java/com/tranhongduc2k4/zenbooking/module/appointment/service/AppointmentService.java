package com.tranhongduc2k4.zenbooking.module.appointment.service;

import com.tranhongduc2k4.zenbooking.module.appointment.dto.AppointmentBookingRequest;
import com.tranhongduc2k4.zenbooking.module.appointment.dto.AppointmentResponse;
import com.tranhongduc2k4.zenbooking.module.appointment.dto.AppointmentStatusUpdateRequest;
import com.tranhongduc2k4.zenbooking.module.appointment.entity.AppointmentStatus;
import com.tranhongduc2k4.zenbooking.module.user.entity.User;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface AppointmentService {

    AppointmentResponse bookAppointment(AppointmentBookingRequest request, User currentUser);

    List<AppointmentResponse> getMyAppointments(User currentUser);

    List<AppointmentResponse> getAllAppointments(AppointmentStatus status, LocalDate date, Long doctorId, String search);

    AppointmentResponse getAppointmentById(Long id);

    AppointmentResponse updateStatus(Long id, AppointmentStatusUpdateRequest request);

    AppointmentResponse cancelMyAppointment(Long id, String reason, User currentUser);

    Map<String, Object> getAppointmentStats();
}

