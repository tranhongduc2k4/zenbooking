package com.tranhongduc2k4.zenbooking.module.revenue.service;

import com.tranhongduc2k4.zenbooking.module.revenue.dto.RevenueReportResponse;

import java.time.LocalDate;

public interface RevenueService {
    RevenueReportResponse getRevenueReport(LocalDate startDate, LocalDate endDate, Long doctorId, Long serviceId);
}
