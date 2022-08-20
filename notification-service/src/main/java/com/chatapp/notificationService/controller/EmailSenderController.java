package com.chatapp.notificationService.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import com.chatapp.notificationService.model.MailSend;
import com.chatapp.notificationService.service.EmailSenderService;

@Controller
public class EmailSenderController {

	@Autowired
	private EmailSenderService emailSenderService;
	
	public void sendMail() {
		MailSend mailSend = new MailSend("ajavaguy96@gmail.com", "pcnhatvu@gmail.com", "subject", "body");
		emailSenderService.sendEmail(mailSend);
	}
}
