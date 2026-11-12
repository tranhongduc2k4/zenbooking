package com.tranhongduc2k4.zenbooking.module.catalog.service;

import com.tranhongduc2k4.zenbooking.common.exception.CustomException;
import com.tranhongduc2k4.zenbooking.module.catalog.dto.ServiceRequest;
import com.tranhongduc2k4.zenbooking.module.catalog.dto.ServiceResponse;
import com.tranhongduc2k4.zenbooking.module.catalog.entity.DentalService;
import com.tranhongduc2k4.zenbooking.module.catalog.repository.DentalServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class DentalServiceServiceImpl implements DentalServiceService {

    private final DentalServiceRepository serviceRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ServiceResponse> getAllActiveServices() {
        return serviceRepository.findByIsActiveTrueOrderByIdAsc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceResponse> getAllServicesForAdmin() {
        return serviceRepository.findAllByOrderByIdAsc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceResponse getServiceById(Long id) {
        DentalService service = serviceRepository.findById(id)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Không tìm thấy dịch vụ nha khoa với mã: " + id));
        return mapToResponse(service);
    }

    @Override
    @Transactional
    public ServiceResponse createService(ServiceRequest request) {
        String code = request.getCode() != null && !request.getCode().isBlank()
                ? request.getCode().trim().toUpperCase(Locale.ROOT)
                : generateCodeFromName(request.getName());

        if (serviceRepository.existsByCode(code)) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Mã dịch vụ [" + code + "] đã tồn tại!");
        }

        if (serviceRepository.existsByName(request.getName().trim())) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Tên dịch vụ [" + request.getName() + "] đã tồn tại!");
        }

        DentalService service = DentalService.builder()
                .name(request.getName().trim())
                .code(code)
                .category(request.getCategory() != null ? request.getCategory().trim() : "Nha khoa tổng quát")
                .description(request.getDescription())
                .price(request.getPrice())
                .estimatedDurationMinutes(request.getEstimatedDurationMinutes() != null ? request.getEstimatedDurationMinutes() : 30)
                .icon(request.getIcon() != null && !request.getIcon().isBlank() ? request.getIcon().trim() : "🦷")
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        DentalService saved = serviceRepository.save(service);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ServiceResponse updateService(Long id, ServiceRequest request) {
        DentalService service = serviceRepository.findById(id)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Không tìm thấy dịch vụ nha khoa với mã: " + id));

        if (request.getName() != null && !request.getName().isBlank()) {
            String newName = request.getName().trim();
            if (!newName.equalsIgnoreCase(service.getName()) && serviceRepository.existsByName(newName)) {
                throw new CustomException(HttpStatus.BAD_REQUEST, "Tên dịch vụ [" + newName + "] đã tồn tại!");
            }
            service.setName(newName);
        }

        if (request.getCode() != null && !request.getCode().isBlank()) {
            String newCode = request.getCode().trim().toUpperCase(Locale.ROOT);
            if (!newCode.equalsIgnoreCase(service.getCode()) && serviceRepository.existsByCode(newCode)) {
                throw new CustomException(HttpStatus.BAD_REQUEST, "Mã dịch vụ [" + newCode + "] đã tồn tại!");
            }
            service.setCode(newCode);
        }

        if (request.getCategory() != null) {
            service.setCategory(request.getCategory().trim());
        }
        if (request.getDescription() != null) {
            service.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            service.setPrice(request.getPrice());
        }
        if (request.getEstimatedDurationMinutes() != null) {
            service.setEstimatedDurationMinutes(request.getEstimatedDurationMinutes());
        }
        if (request.getIcon() != null) {
            service.setIcon(request.getIcon().trim());
        }
        if (request.getIsActive() != null) {
            service.setIsActive(request.getIsActive());
        }

        DentalService updated = serviceRepository.save(service);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public ServiceResponse toggleServiceStatus(Long id) {
        DentalService service = serviceRepository.findById(id)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Không tìm thấy dịch vụ nha khoa với mã: " + id));

        service.setIsActive(!Boolean.TRUE.equals(service.getIsActive()));
        DentalService updated = serviceRepository.save(service);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteService(Long id) {
        DentalService service = serviceRepository.findById(id)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "Không tìm thấy dịch vụ nha khoa với mã: " + id));
        serviceRepository.delete(service);
    }

    private ServiceResponse mapToResponse(DentalService service) {
        return ServiceResponse.builder()
                .id(service.getId())
                .name(service.getName())
                .code(service.getCode())
                .category(service.getCategory())
                .description(service.getDescription())
                .price(service.getPrice())
                .estimatedDurationMinutes(service.getEstimatedDurationMinutes())
                .icon(service.getIcon())
                .isActive(service.getIsActive())
                .createdAt(service.getCreatedAt())
                .updatedAt(service.getUpdatedAt())
                .build();
    }

    private String generateCodeFromName(String name) {
        if (name == null || name.isBlank()) {
            return "SRV_" + System.currentTimeMillis();
        }
        return "SRV_" + Math.abs(name.trim().hashCode());
    }
}
