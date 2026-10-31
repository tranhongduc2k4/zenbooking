package com.tranhongduc2k4.zenbooking.module.catalog.repository;

import com.tranhongduc2k4.zenbooking.module.catalog.entity.DentalService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DentalServiceRepository extends JpaRepository<DentalService, Long> {
    List<DentalService> findByIsActiveTrueOrderByIdAsc();
    List<DentalService> findAllByOrderByIdAsc();
    Optional<DentalService> findByCode(String code);
    boolean existsByCode(String code);
    boolean existsByName(String name);
}
