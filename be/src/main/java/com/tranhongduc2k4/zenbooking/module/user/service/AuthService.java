package com.tranhongduc2k4.zenbooking.module.user.service;

import com.tranhongduc2k4.zenbooking.module.user.dto.AuthResponse;
import com.tranhongduc2k4.zenbooking.module.user.dto.LoginRequest;
import com.tranhongduc2k4.zenbooking.module.user.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
