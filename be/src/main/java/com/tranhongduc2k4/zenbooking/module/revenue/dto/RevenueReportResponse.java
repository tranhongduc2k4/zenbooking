package com.tranhongduc2k4.zenbooking.module.revenue.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueReportResponse {
    private RevenueKpiDTO kpi;
    private List<ServiceRevenueDTO> serviceBreakdown;
    private List<DoctorRevenueDTO> doctorBreakdown;
    private List<DailyRevenueDTO> dailyTrend;
    private BigDecimal maxDailyRevenue;
}
