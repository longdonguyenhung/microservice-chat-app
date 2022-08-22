package notificationservice.chatproject.model;

public class MailSend {
	
	private String mailFrom;
	
	private String mailTo;
	
	private String subject;
	
	private String body;
	
	public String getMailTo() {
		return mailTo;
	}

	public MailSend(String mailFrom, String mailTo, String subject, String body) {
		super();
		this.mailFrom = mailFrom;
		this.mailTo = mailTo;
		this.subject = subject;
		this.body = body;
	}

	public String getMailFrom() {
		return mailFrom;
	}

	public void setMailFrom(String mailFrom) {
		this.mailFrom = mailFrom;
	}

	public void setMailTo(String mailTo) {
		this.mailTo = mailTo;
	}
	
	public String getSubject() {
		return subject;
	}
	
	public void setSubject(String subject) {
		this.subject = subject;
	}
	
	public String getBody() {
		return body;
	}
	
	public void setBody(String body) {
		this.body = body;
	}
	
}
