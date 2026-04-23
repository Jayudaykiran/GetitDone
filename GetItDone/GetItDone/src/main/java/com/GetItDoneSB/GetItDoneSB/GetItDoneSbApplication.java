package com.GetItDoneSB.GetItDoneSB;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ComponentScan(basePackages = { "com.getitdone", "com.GetItDoneSB" })
@EntityScan(basePackages = { "com.getitdone" })
@EnableJpaRepositories(basePackages = { "com.getitdone" })
@EnableScheduling
public class GetItDoneSbApplication {

	public static void main(String[] args) {
		SpringApplication.run(GetItDoneSbApplication.class, args);
	}

}
