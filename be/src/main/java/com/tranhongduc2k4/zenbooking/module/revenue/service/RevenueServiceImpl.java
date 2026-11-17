package com.tranhongduc2k4.zenbooking.module.revenue.service;

import com.tranhongduc2k4.zenbooking.module.appointment.entity.Appointment;
import com.tranhongduc2k4.zenbooking.module.appointment.entity.AppointmentStatus;
import com.tranhongduc2k4.zenbooking.module.appointment.repository.AppointmentRepository;
import com.tranhongduc2k4.zenbooking.module.revenue.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RevenueServiceImpl implements RevenueService {

    private final AppointmentRepository appointmentRepository;

    @Override
    @Transactional(readOnly = true)
    public RevenueReportResponse getRevenueReport(LocalDate startDate, LocalDate endDate, Long doctorId, Long serviceId) {
        List<Appointment> list = appointmentRepository.findForRevenueReport(startDate, endDate, doctorId, serviceId);

        BigDecimal actualRevenue = BigDecimal.ZERO;
        BigDecimal projectedRevenue = BigDecimal.ZERO;
        long completedCount = 0;
        long confirmedCount = 0;
        long pendingCount = 0;
        long cancelledCount = 0;

        // Grouping maps
        Map<String, ServiceAgg> serviceMap = new HashMap<>();
        Map<String, DoctorAgg> doctorMap = new HashMap<>();
        Map<LocalDate, DailyAgg> dailyMap = new TreeMap<>();

        for (Appointment apt : list) {
            BigDecimal price = apt.getServicePrice() != null ? apt.getServicePrice() : BigDecimal.ZERO;
            AppointmentStatus status = apt.getStatus();

            if (status == AppointmentStatus.COMPLETED) {
                actualRevenue = actualRevenue.add(price);
                completedCount++;
            } else if (status == AppointmentStatus.CONFIRMED) {
                projectedRevenue = projectedRevenue.add(price);
                confirmedCount++;
            } else if (status == AppointmentStatus.PENDING) {
                projectedRevenue = projectedRevenue.add(price);
                pendingCount++;
            } else if (status == AppointmentStatus.CANCELLED) {
                cancelledCount++;
            }

            // Dịch vụ aggregation (Tính cho các ca COMPLETED và CONFIRMED)
            if (status == AppointmentStatus.COMPLETED || status == AppointmentStatus.CONFIRMED) {
                String sName = apt.getServiceName() != null ? apt.getServiceName() : "Dịch vụ khác";
                ServiceAgg sAgg = serviceMap.computeIfAbsent(sName, k -> new ServiceAgg(k));
                sAgg.revenue = sAgg.revenue.add(price);
                sAgg.totalCases++;
                if (status == AppointmentStatus.COMPLETED) {
                    sAgg.completedCases++;
                }

                // Bác sĩ aggregation
                String dName = apt.getDoctorName() != null ? apt.getDoctorName() : "Bác sĩ phân công";
                Long dId = apt.getDoctor() != null ? apt.getDoctor().getId() : null;
                DoctorAgg dAgg = doctorMap.computeIfAbsent(dName, k -> new DoctorAgg(dId, k));
                dAgg.revenue = dAgg.revenue.add(price);
                dAgg.totalCases++;
                if (status == AppointmentStatus.COMPLETED) {
                    dAgg.completedCases++;
                }
            }

            // Biểu đồ ngày (Daily breakdown)
            LocalDate d = apt.getAppointmentDate();
            if (d != null) {
                DailyAgg dayAgg = dailyMap.computeIfAbsent(d, k -> new DailyAgg(k));
                dayAgg.totalCount++;
                if (status == AppointmentStatus.COMPLETED) {
                    dayAgg.actualRevenue = dayAgg.actualRevenue.add(price);
                } else if (status == AppointmentStatus.CONFIRMED) {
                    dayAgg.projectedRevenue = dayAgg.projectedRevenue.add(price);
                }
            }
        }

        // 1. Tính KPI
        BigDecimal averageTicket = completedCount > 0 
                ? actualRevenue.divide(BigDecimal.valueOf(completedCount), 0, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        long processedCount = completedCount + cancelledCount;
        double completionRate = processedCount > 0 
                ? Math.round(((double) completedCount / processedCount) * 1000.0) / 10.0
                : 100.0;

        RevenueKpiDTO kpi = RevenueKpiDTO.builder()
                .actualRevenue(actualRevenue)
                .projectedRevenue(projectedRevenue)
                .completedCount(completedCount)
                .confirmedCount(confirmedCount)
                .pendingCount(pendingCount)
                .cancelledCount(cancelledCount)
                .totalCount(list.size())
                .averageTicket(averageTicket)
                .completionRate(completionRate)
                .build();

        // 2. Service breakdown
        BigDecimal totalServiceRev = serviceMap.values().stream()
                .map(s -> s.revenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<ServiceRevenueDTO> serviceBreakdown = serviceMap.values().stream()
                .sorted((a, b) -> b.revenue.compareTo(a.revenue))
                .map(s -> {
                    double pct = totalServiceRev.compareTo(BigDecimal.ZERO) > 0
                            ? Math.round(s.revenue.multiply(BigDecimal.valueOf(100)).divide(totalServiceRev, 1, RoundingMode.HALF_UP).doubleValue() * 10.0) / 10.0
                            : 0.0;
                    return ServiceRevenueDTO.builder()
                            .serviceName(s.serviceName)
                            .revenue(s.revenue)
                            .totalCases(s.totalCases)
                            .completedCases(s.completedCases)
                            .percentage(pct)
                            .build();
                })
                .collect(Collectors.toList());

        // 3. Doctor breakdown
        BigDecimal totalDoctorRev = doctorMap.values().stream()
                .map(d -> d.revenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<DoctorRevenueDTO> doctorBreakdown = doctorMap.values().stream()
                .sorted((a, b) -> b.revenue.compareTo(a.revenue))
                .map(d -> {
                    double pct = totalDoctorRev.compareTo(BigDecimal.ZERO) > 0
                            ? Math.round(d.revenue.multiply(BigDecimal.valueOf(100)).divide(totalDoctorRev, 1, RoundingMode.HALF_UP).doubleValue() * 10.0) / 10.0
                            : 0.0;
                    BigDecimal avgCase = d.completedCases > 0
                            ? d.revenue.divide(BigDecimal.valueOf(d.completedCases), 0, RoundingMode.HALF_UP)
                            : d.revenue;

                    return DoctorRevenueDTO.builder()
                            .doctorId(d.doctorId)
                            .doctorName(d.doctorName)
                            .revenue(d.revenue)
                            .totalCases(d.totalCases)
                            .completedCases(d.completedCases)
                            .avgPerCase(avgCase)
                            .percentage(pct)
                            .build();
                })
                .collect(Collectors.toList());

        // 4. Daily trend
        BigDecimal maxDaily = BigDecimal.valueOf(1000000); // Tối thiểu 1 triệu để scale chart đẹp
        List<DailyRevenueDTO> dailyTrend = new ArrayList<>();
        for (DailyAgg day : dailyMap.values()) {
            BigDecimal dayTotal = day.actualRevenue.add(day.projectedRevenue);
            if (dayTotal.compareTo(maxDaily) > 0) {
                maxDaily = dayTotal;
            }
            dailyTrend.add(DailyRevenueDTO.builder()
                    .date(day.date)
                    .actualRevenue(day.actualRevenue)
                    .projectedRevenue(day.projectedRevenue)
                    .totalCount(day.totalCount)
                    .build());
        }

        return RevenueReportResponse.builder()
                .kpi(kpi)
                .serviceBreakdown(serviceBreakdown)
                .doctorBreakdown(doctorBreakdown)
                .dailyTrend(dailyTrend)
                .maxDailyRevenue(maxDaily)
                .build();
    }

    // Lớp hỗ trợ tính toán trung gian nội bộ
    private static class ServiceAgg {
        String serviceName;
        BigDecimal revenue = BigDecimal.ZERO;
        long totalCases = 0;
        long completedCases = 0;

        ServiceAgg(String serviceName) {
            this.serviceName = serviceName;
        }
    }

    private static class DoctorAgg {
        Long doctorId;
        String doctorName;
        BigDecimal revenue = BigDecimal.ZERO;
        long totalCases = 0;
        long completedCases = 0;

        DoctorAgg(Long doctorId, String doctorName) {
            this.doctorId = doctorId;
            this.doctorName = doctorName;
        }
    }

    private static class DailyAgg {
        LocalDate date;
        BigDecimal actualRevenue = BigDecimal.ZERO;
        BigDecimal projectedRevenue = BigDecimal.ZERO;
        long totalCount = 0;

        DailyAgg(LocalDate date) {
            this.date = date;
        }
    }
}
