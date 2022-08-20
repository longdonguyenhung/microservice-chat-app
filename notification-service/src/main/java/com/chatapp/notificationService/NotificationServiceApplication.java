package com.chatapp.notificationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

import com.chatapp.notificationService.controller.EmailSenderController;

@SpringBootApplication
public class NotificationServiceApplication {
	
	@Autowired
	private EmailSenderController emailSenderController;

	public static void main(String[] args) {
		SpringApplication.run(NotificationServiceApplication.class, args);
	}
	
	@EventListener(ApplicationReadyEvent.class)
	public void triggerMail() {
		emailSenderController.sendMail();
	}

}
