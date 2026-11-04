package com.tranhongduc2k4.zenbooking.module.appointment.repository;

import com.tranhongduc2k4.zenbooking.module.appointment.entity.Appointment;
import com.tranhongduc2k4.zenbooking.module.appointment.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    boolean existsByAppointmentCode(String appointmentCode);

    List<Appointment> findByPatientIdOrderByAppointmentDateDescAppointmentTimeDesc(Long patientId);

    List<Appointment> findByPatientPhoneOrderByAppointmentDateDescAppointmentTimeDesc(String patientPhone);

    List<Appointment> findByDoctorIdOrderByAppointmentDateDescAppointmentTimeDesc(Long doctorId);

    List<Appointment> findAllByOrderByAppointmentDateDescAppointmentTimeDesc();

    List<Appointment> findByStatusOrderByAppointmentDateDescAppointmentTimeDesc(AppointmentStatus status);

    List<Appointment> findByAppointmentDateOrderByAppointmentTimeAsc(LocalDate date);

    long countByStatus(AppointmentStatus status);

    long countByAppointmentDate(LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:date IS NULL OR a.appointmentDate = :date) AND " +
           "(:doctorId IS NULL OR (a.doctor IS NOT NULL AND a.doctor.id = :doctorId)) AND " +
           "(:search IS NULL OR LOWER(a.patientName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(a.patientPhone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(a.appointmentCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(a.serviceName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY a.appointmentDate DESC, a.appointmentTime DESC")
    List<Appointment> searchAppointments(
            @Param("status") AppointmentStatus status,
            @Param("date") LocalDate date,
            @Param("doctorId") Long doctorId,
            @Param("search") String search
    );
}

