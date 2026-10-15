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
public class RegisterRequest {
    private String fullName;
    private String phone;
    private String email;
    private String password;
    private Role role;
}
