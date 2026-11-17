package com.tranhongduc2k4.zenbooking.module.setting.repository;

import com.tranhongduc2k4.zenbooking.module.setting.entity.ClinicSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClinicSettingRepository extends JpaRepository<ClinicSetting, Long> {
    Optional<ClinicSetting> findFirstByOrderByIdAsc();
}
