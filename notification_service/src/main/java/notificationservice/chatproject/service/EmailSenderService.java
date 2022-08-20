package notificationservice.chatproject.service;

import notificationservice.chatproject.model.MailSend;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailSenderService {

	@Autowired
	private JavaMailSender mailSender;
	
	public void sendEmail(MailSend mailSend) {
		SimpleMailMessage message = new SimpleMailMessage();
		
		message.setFrom(mailSend.getMailFrom());
		message.setTo(mailSend.getMailTo());
		message.setText(mailSend.getBody());
		message.setSubject(mailSend.getSubject());
		
		mailSender.send(message);
		System.out.println("Mail sent!");
	}
}
