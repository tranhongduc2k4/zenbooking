package com.tranhongduc2k4.zenbooking.module.user.dto;

import com.tranhongduc2k4.zenbooking.module.user.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private Long id;
    private String fullName;
    private String phone;
    private String email;
    private Role role;
    private String token;
}
