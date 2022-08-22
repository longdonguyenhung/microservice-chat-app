package notificationservice.chatproject.controller;

import notificationservice.chatproject.model.MailSend;
import notificationservice.chatproject.service.EmailSenderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

@Controller
public class EmailSenderController {

	@Autowired
	private EmailSenderService emailSenderService;
	
	public void sendMail() {
		MailSend mailSend = new MailSend("ajavaguy96@gmail.com", "pcnhatvu@gmail.com", "subject", "body");
		emailSenderService.sendEmail(mailSend);
	}
}
