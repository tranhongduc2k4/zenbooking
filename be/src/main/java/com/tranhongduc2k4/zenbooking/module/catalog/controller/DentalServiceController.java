package com.tranhongduc2k4.zenbooking.module.catalog.controller;

import com.tranhongduc2k4.zenbooking.module.catalog.dto.ServiceRequest;
import com.tranhongduc2k4.zenbooking.module.catalog.dto.ServiceResponse;
import com.tranhongduc2k4.zenbooking.module.catalog.service.DentalServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/services")
@RequiredArgsConstructor
public class DentalServiceController {

    private final DentalServiceService dentalServiceService;

    // Public API: Lấy danh sách dịch vụ đang hoạt động (dành cho bệnh nhân xem & đặt lịch)
    @GetMapping
    public ResponseEntity<List<ServiceResponse>> getAllActiveServices() {
        return ResponseEntity.ok(dentalServiceService.getAllActiveServices());
    }

    // Public API: Chi tiết một dịch vụ
    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponse> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(dentalServiceService.getServiceById(id));
    }

    // Admin/Doctor API: Lấy toàn bộ dịch vụ (cả active & inactive) cho trang quản trị
    @GetMapping("/admin")
    public ResponseEntity<List<ServiceResponse>> getAllServicesForAdmin() {
        return ResponseEntity.ok(dentalServiceService.getAllServicesForAdmin());
    }

    // Admin API: Thêm mới dịch vụ
    @PostMapping
    public ResponseEntity<ServiceResponse> createService(@RequestBody ServiceRequest request) {
        ServiceResponse response = dentalServiceService.createService(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Admin API: Cập nhật thông tin dịch vụ
    @PutMapping("/{id}")
    public ResponseEntity<ServiceResponse> updateService(@PathVariable Long id, @RequestBody ServiceRequest request) {
        return ResponseEntity.ok(dentalServiceService.updateService(id, request));
    }

    // Admin API: Bật/tắt trạng thái hoạt động dịch vụ
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ServiceResponse> toggleServiceStatus(@PathVariable Long id) {
        return ResponseEntity.ok(dentalServiceService.toggleServiceStatus(id));
    }

    // Admin API: Xóa dịch vụ
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        dentalServiceService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
