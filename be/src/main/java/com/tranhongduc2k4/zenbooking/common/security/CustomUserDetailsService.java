package com.tranhongduc2k4.zenbooking.common.security;

import com.tranhongduc2k4.zenbooking.module.user.entity.User;
import com.tranhongduc2k4.zenbooking.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = userRepository.findByPhoneOrEmail(identifier, identifier)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với tài khoản: " + identifier));
        return new CustomUserDetails(user);
    }
}
