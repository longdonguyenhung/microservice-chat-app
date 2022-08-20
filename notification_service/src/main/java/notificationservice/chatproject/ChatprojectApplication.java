package notificationservice.chatproject;

import notificationservice.chatproject.controller.EmailSenderController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

@SpringBootApplication
public class ChatprojectApplication {

	@Autowired
	private EmailSenderController emailSenderController;

	public static void main(String[] args) {
		SpringApplication.run(ChatprojectApplication.class, args);
	}

	@EventListener(ApplicationReadyEvent.class)
	public void triggerMail() {
		emailSenderController.sendMail();
	}

}
