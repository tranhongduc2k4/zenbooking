package com.tranhongduc2k4.zenbooking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ZenBookingApplication {

    public static void main(String[] args) {
        SpringApplication.run(ZenBookingApplication.class, args);
    }

}
