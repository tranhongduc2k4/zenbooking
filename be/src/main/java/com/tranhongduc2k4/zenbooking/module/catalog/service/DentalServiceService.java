package com.tranhongduc2k4.zenbooking.module.catalog.service;

import com.tranhongduc2k4.zenbooking.module.catalog.dto.ServiceRequest;
import com.tranhongduc2k4.zenbooking.module.catalog.dto.ServiceResponse;

import java.util.List;

public interface DentalServiceService {
    List<ServiceResponse> getAllActiveServices();
    List<ServiceResponse> getAllServicesForAdmin();
    ServiceResponse getServiceById(Long id);
    ServiceResponse createService(ServiceRequest request);
    ServiceResponse updateService(Long id, ServiceRequest request);
    ServiceResponse toggleServiceStatus(Long id);
    void deleteService(Long id);
}
