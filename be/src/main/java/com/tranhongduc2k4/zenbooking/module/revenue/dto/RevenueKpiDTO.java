package com.tranhongduc2k4.zenbooking.module.revenue.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueKpiDTO {
    private BigDecimal actualRevenue;       // Tiền từ COMPLETED
    private BigDecimal projectedRevenue;    // Tiền từ CONFIRMED + PENDING
    private long completedCount;
    private long confirmedCount;
    private long pendingCount;
    private long cancelledCount;
    private long totalCount;
    private BigDecimal averageTicket;       // Doanh thu TB / ca khám
    private double completionRate;          // Tỷ lệ hoàn thành %
}
