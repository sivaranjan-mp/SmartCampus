package com.smartcampus.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    @Value("${app.name}")             private String appName;
    @Value("${spring.mail.username}") private String fromEmail;

    @Async
    public void sendRegistrationOtp(String to, String name, String otp) {
        send(to, appName + " - Verify Your Email",
             otpHtml(name, otp, "Complete Your Registration",
                     "Thank you for registering. Use the code below to verify your email address and activate your account.",
                     "#1565C0"));
    }

    @Async
    public void sendPasswordResetOtp(String to, String name, String otp) {
        send(to, appName + " - Password Reset",
             otpHtml(name, otp, "Reset Your Password",
                     "We received a request to reset your SmartCampus password. Use the code below to proceed.",
                     "#C62828"));
    }

    @Async
    public void sendWelcome(String to, String name, String role) {
        send(to, "Welcome to " + appName + "!", welcomeHtml(name, role));
    }

    @Async
    public void sendManagedUserCredentials(String to, String name, String role, String tmpPwd) {
        send(to, appName + " - Account Created", credHtml(name, role, tmpPwd));
    }

    private void send(String to, String subject, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setFrom(fromEmail); h.setTo(to); h.setSubject(subject); h.setText(html, true);
            mailSender.send(msg);
            log.info("Email sent -> {} [{}]", to, subject);
        } catch (MessagingException ex) {
            log.error("Email failed -> {}: {}", to, ex.getMessage());
        }
    }

    private String s(String raw) { return raw.replace("\"", "&quot;"); }

    private String otpHtml(String name, String otp, String heading, String body, String color) {
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"/>"
            + "<style>body{background:#F0F4FF;font-family:'Segoe UI',Arial,sans-serif;margin:0}"
            + ".w{max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(21,101,192,.10)}"
            + ".hd{background:" + color + ";padding:36px 48px;text-align:center}"
            + ".hd h1{color:#fff;font-size:22px;font-weight:700;margin:0}"
            + ".hd p{color:rgba(255,255,255,.75);font-size:13px;margin-top:4px}"
            + ".bd{padding:40px 48px}"
            + ".gr{font-size:17px;font-weight:600;color:#0D1B2A;margin-bottom:12px}"
            + ".tx{font-size:14px;color:#546E7A;line-height:1.7;margin-bottom:28px}"
            + ".ow{background:#F0F4FF;border:2px dashed " + color + ";border-radius:14px;padding:28px;text-align:center;margin-bottom:28px}"
            + ".ol{font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#8A9BBF;margin-bottom:14px}"
            + ".oc{font-size:44px;font-weight:800;letter-spacing:14px;color:" + color + ";font-family:'Courier New',monospace}"
            + ".oe{font-size:12px;color:#E53935;margin-top:14px;font-weight:600}"
            + ".ft{background:#F8FAFF;padding:20px 48px;text-align:center;font-size:11px;color:#8A9BBF;border-top:1px solid #E3EAF4}"
            + "</style></head><body><div class=\"w\">"
            + "<div class=\"hd\"><h1>SmartCampus</h1><p>" + s(heading) + "</p></div>"
            + "<div class=\"bd\">"
            + "<p class=\"gr\">Hello, " + s(name) + "</p>"
            + "<p class=\"tx\">" + s(body) + "</p>"
            + "<div class=\"ow\"><div class=\"ol\">Your Verification Code</div>"
            + "<div class=\"oc\">" + otp + "</div>"
            + "<div class=\"oe\">Expires in 10 minutes &bull; Do not share this code</div></div>"
            + "</div><div class=\"ft\">&copy; 2024 SmartCampus</div></div></body></html>";
    }

    private String welcomeHtml(String name, String role) {
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"/>"
            + "<style>body{background:#F0F4FF;font-family:'Segoe UI',Arial,sans-serif;margin:0}"
            + ".w{max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(21,101,192,.10)}"
            + ".hd{background:linear-gradient(135deg,#2E7D32,#1B5E20);padding:36px 48px;text-align:center}"
            + ".hd h1{color:#fff;font-size:22px;font-weight:700;margin:0}"
            + ".bd{padding:40px 48px}.tx{font-size:14px;color:#546E7A;line-height:1.7;margin-bottom:16px}"
            + ".badge{display:inline-block;background:#E8F5E9;color:#2E7D32;padding:6px 18px;border-radius:6px;font-weight:700;font-size:13px}"
            + ".ft{background:#F8FAFF;padding:20px 48px;text-align:center;font-size:11px;color:#8A9BBF;border-top:1px solid #E3EAF4}"
            + "</style></head><body><div class=\"w\">"
            + "<div class=\"hd\"><h1>Welcome to SmartCampus!</h1></div>"
            + "<div class=\"bd\"><p class=\"tx\">Hello <strong>" + s(name) + "</strong>,</p>"
            + "<p class=\"tx\">Your account is verified. You are registered as:</p>"
            + "<span class=\"badge\">" + s(role) + "</span>"
            + "</div><div class=\"ft\">&copy; 2024 SmartCampus</div></div></body></html>";
    }

    private String credHtml(String name, String role, String pwd) {
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"/>"
            + "<style>body{background:#F0F4FF;font-family:'Segoe UI',Arial,sans-serif;margin:0}"
            + ".w{max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(21,101,192,.10)}"
            + ".hd{background:linear-gradient(135deg,#1565C0,#0D47A1);padding:36px 48px;text-align:center}"
            + ".hd h1{color:#fff;font-size:22px;font-weight:700;margin:0}"
            + ".bd{padding:40px 48px}.tx{font-size:14px;color:#546E7A;line-height:1.7;margin-bottom:16px}"
            + ".cb{background:#F0F4FF;border:2px dashed #1565C0;border-radius:12px;padding:20px;margin:16px 0}"
            + ".cr{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #E3EAF4;font-size:13px}"
            + ".cr:last-child{border-bottom:none}.cl{color:#8A9BBF;font-weight:600}"
            + ".cv{color:#0D47A1;font-weight:700;font-family:'Courier New',monospace}"
            + ".ft{background:#F8FAFF;padding:20px 48px;text-align:center;font-size:11px;color:#8A9BBF;border-top:1px solid #E3EAF4}"
            + "</style></head><body><div class=\"w\">"
            + "<div class=\"hd\"><h1>Account Created</h1></div>"
            + "<div class=\"bd\"><p class=\"tx\">Hello <strong>" + s(name) + "</strong>, your SmartCampus account has been created.</p>"
            + "<div class=\"cb\"><div class=\"cr\"><span class=\"cl\">Role</span><span class=\"cv\">" + s(role) + "</span></div>"
            + "<div class=\"cr\"><span class=\"cl\">Temp Password</span><span class=\"cv\">" + s(pwd) + "</span></div></div>"
            + "<p class=\"tx\" style=\"color:#E65100;font-weight:600\">Please change your password immediately upon first login.</p>"
            + "</div><div class=\"ft\">&copy; 2024 SmartCampus</div></div></body></html>";
    }
}
