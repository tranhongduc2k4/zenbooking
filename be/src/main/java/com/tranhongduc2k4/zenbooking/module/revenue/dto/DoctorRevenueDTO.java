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
public class DoctorRevenueDTO {
    private Long doctorId;
    private String doctorName;
    private BigDecimal revenue;
    private long totalCases;
    private long completedCases;
    private BigDecimal avgPerCase;
    private double percentage;
}
