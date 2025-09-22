package com.andrekj.ghostwriter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GhostwriterApplication {

	public static void main(String[] args) {
		SpringApplication.run(GhostwriterApplication.class, args);
		System.out.println("Ghostwriter server started");
	}

}
