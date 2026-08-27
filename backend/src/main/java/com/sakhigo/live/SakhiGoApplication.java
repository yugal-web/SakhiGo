package com.sakhigo.live;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SakhiGoApplication {
    public static void main(String[] args) {
        SpringApplication.run(SakhiGoApplication.class, args);
    }
}
