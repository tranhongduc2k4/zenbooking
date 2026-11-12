package com.tranhongduc2k4.zenbooking.module.user.repository;

import com.tranhongduc2k4.zenbooking.module.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByPhoneOrEmail(String phone, String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByEmail(String email);
    long countByRole(com.tranhongduc2k4.zenbooking.module.user.entity.Role role);
    java.util.List<User> findByRoleOrderByIdAsc(com.tranhongduc2k4.zenbooking.module.user.entity.Role role);
}
