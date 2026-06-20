package com.smartcampus.service;

import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingApproval;
import com.smartcampus.model.User;
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
public class ApprovalNotificationService {

    private final JavaMailSender mailSender;

    @Value("${app.name}")                 private String appName;
    @Value("${spring.mail.username}")     private String fromEmail;
    @Value("${app.frontend-url}")         private String frontendUrl;

    // ── Notify approver that a booking needs review ──────────────────────────

    @Async
    public void notifyApproverPendingReview(Booking booking, User approver) {
        String subject = appName + " — New Booking Requires Your Approval";
        String html = buildApproverNotificationHtml(booking, approver);
        sendEmail(approver.getEmail(), subject, html);
        log.info("Approval notification sent to {} for booking {}", approver.getEmail(), booking.getBookingReference());
    }

    // ── Notify organizer: booking approved ───────────────────────────────────

    @Async
    public void notifyOrganizerApproved(Booking booking) {
        String subject = appName + " — Booking Approved: " + booking.getBookingReference();
        String html    = buildApprovedHtml(booking);
        sendEmail(booking.getBookedBy().getEmail(), subject, html);
        log.info("Approval success notification sent to {} for booking {}", booking.getBookedBy().getEmail(), booking.getBookingReference());
    }

    // ── Notify organizer: booking rejected ───────────────────────────────────

    @Async
    public void notifyOrganizerRejected(Booking booking, String reason) {
        String subject = appName + " — Booking Rejected: " + booking.getBookingReference();
        String html    = buildRejectedHtml(booking, reason);
        sendEmail(booking.getBookedBy().getEmail(), subject, html);
        log.info("Rejection notification sent to {} for booking {}", booking.getBookedBy().getEmail(), booking.getBookingReference());
    }

    // ── Notify organizer: revision requested ─────────────────────────────────

    @Async
    public void notifyOrganizerRevisionRequested(Booking booking, String remarks) {
        String subject = appName + " — Revision Requested: " + booking.getBookingReference();
        String html    = buildRevisionHtml(booking, remarks);
        sendEmail(booking.getBookedBy().getEmail(), subject, html);
    }

    // ── Notify a lower-priority organizer of potential pre-emption ───────────

    @Async
    public void notifyPriorityPreemption(Booking lowPriorityBooking, Booking highPriorityBooking) {
        String subject = appName + " — Priority Notice: " + lowPriorityBooking.getBookingReference();
        String html    = buildPreemptionHtml(lowPriorityBooking, highPriorityBooking);
        sendEmail(lowPriorityBooking.getBookedBy().getEmail(), subject, html);
        log.info("Priority preemption notice sent to {} (low={}, high={})",
                lowPriorityBooking.getBookedBy().getEmail(),
                lowPriorityBooking.getBookingReference(),
                highPriorityBooking.getBookingReference());
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private void sendEmail(String to, String subject, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setFrom(fromEmail); h.setTo(to); h.setSubject(subject); h.setText(html, true);
            mailSender.send(msg);
        } catch (MessagingException ex) {
            log.error("Email failed to {}: {}", to, ex.getMessage());
        }
    }

    private String wrap(String title, String accentColor, String bodyHtml) {
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"/>"
            + "<style>body{background:#F0F4FF;font-family:'Segoe UI',Arial,sans-serif;margin:0}"
            + ".w{max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(21,101,192,.10)}"
            + ".h{background:" + accentColor + ";padding:28px 40px}"
            + ".h h1{color:#fff;font-size:20px;font-weight:700;margin:0}"
            + ".h p{color:rgba(255,255,255,.75);font-size:13px;margin:4px 0 0}"
            + ".b{padding:32px 40px}"
            + ".t{font-size:14px;color:#546E7A;line-height:1.7;margin-bottom:16px}"
            + ".detail-box{background:#F8FAFF;border-radius:10px;padding:18px;margin:16px 0;border:1px solid #E3EAF4}"
            + ".row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #E3EAF4;font-size:13px}"
            + ".row:last-child{border-bottom:none}"
            + ".label{color:#8A9BBF;font-weight:600}"
            + ".value{color:#0D1B2A;font-weight:600}"
            + ".btn{display:inline-block;background:linear-gradient(135deg,#1565C0,#0D47A1);color:#fff;padding:11px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin-top:16px}"
            + ".ft{background:#F8FAFF;padding:16px 40px;text-align:center;font-size:11px;color:#8A9BBF;border-top:1px solid #E3EAF4}"
            + "</style></head><body><div class=\"w\">"
            + "<div class=\"h\"><h1>" + title + "</h1><p>" + appName + "</p></div>"
            + "<div class=\"b\">" + bodyHtml + "</div>"
            + "<div class=\"ft\">&copy; 2024 " + appName + " &middot; All rights reserved</div>"
            + "</div></body></html>";
    }

    private String bookingRows(Booking b) {
        return "<div class=\"detail-box\">"
            + row("Reference",  b.getBookingReference())
            + row("Event",      b.getEventName())
            + row("Resource",   b.getResource().getName() + " (" + b.getResource().getResourceCode() + ")")
            + row("Date",       b.getBookingDate().toString())
            + row("Time",       b.getStartTime() + " – " + b.getEndTime())
            + row("Organizer",  b.getBookedBy().getFullName())
            + row("Priority",   b.getPriority())
            + "</div>";
    }

    private String row(String label, String value) {
        return "<div class=\"row\"><span class=\"label\">" + label + "</span>"
             + "<span class=\"value\">" + value + "</span></div>";
    }

    private String buildApproverNotificationHtml(Booking booking, User approver) {
        String body = "<p class=\"t\">Hello " + approver.getFullName() + ",</p>"
            + "<p class=\"t\">A new booking request requires your approval. Please review the details below:</p>"
            + bookingRows(booking)
            + "<p class=\"t\">Please log in to the SmartCampus portal to approve or reject this request.</p>"
            + "<a class=\"btn\" href=\"" + frontendUrl + "/approvals\">Review Now</a>";
        return wrap("New Booking Requires Approval", "#1565C0", body);
    }

    private String buildApprovedHtml(Booking booking) {
        String body = "<p class=\"t\">Hello " + booking.getBookedBy().getFullName() + ",</p>"
            + "<p class=\"t\">Great news! Your booking request has been <strong>approved</strong>.</p>"
            + bookingRows(booking)
            + "<p class=\"t\">Please ensure the venue is used as per the approved schedule.</p>"
            + "<a class=\"btn\" href=\"" + frontendUrl + "/bookings/my\">View My Bookings</a>";
        return wrap("Booking Approved", "#2E7D32", body);
    }

    private String buildRejectedHtml(Booking booking, String reason) {
        String body = "<p class=\"t\">Hello " + booking.getBookedBy().getFullName() + ",</p>"
            + "<p class=\"t\">We regret to inform you that your booking has been <strong>rejected</strong>.</p>"
            + bookingRows(booking)
            + "<div class=\"detail-box\"><div class=\"row\"><span class=\"label\">Rejection Reason</span></div>"
            + "<p style=\"color:#546E7A;font-size:13px;margin:8px 0 0\">" + reason + "</p></div>"
            + "<p class=\"t\">You may submit a new request with the required changes.</p>"
            + "<a class=\"btn\" href=\"" + frontendUrl + "/bookings/new\" style=\"background:linear-gradient(135deg,#C62828,#B71C1C)\">Submit New Request</a>";
        return wrap("Booking Rejected", "#C62828", body);
    }

    private String buildRevisionHtml(Booking booking, String remarks) {
        String body = "<p class=\"t\">Hello " + booking.getBookedBy().getFullName() + ",</p>"
            + "<p class=\"t\">The approver has requested revisions to your booking before it can be processed.</p>"
            + bookingRows(booking)
            + "<div class=\"detail-box\"><div class=\"row\"><span class=\"label\">Revision Notes</span></div>"
            + "<p style=\"color:#546E7A;font-size:13px;margin:8px 0 0\">" + remarks + "</p></div>"
            + "<a class=\"btn\" href=\"" + frontendUrl + "/bookings/my\">View My Bookings</a>";
        return wrap("Revision Requested", "#F57C00", body);
    }

    private String buildPreemptionHtml(Booking low, Booking high) {
        String body = "<p class=\"t\">Hello " + low.getBookedBy().getFullName() + ",</p>"
            + "<p class=\"t\">A higher-priority booking has been submitted for the same resource and time slot as your request. "
            + "Your booking may be affected pending review by the approver.</p>"
            + "<div class=\"detail-box\">"
            + "<p style=\"font-weight:700;color:#0D1B2A;margin-bottom:8px\">Your Booking</p>"
            + bookingRows(low)
            + "<p style=\"font-weight:700;color:#0D1B2A;margin:12px 0 8px\">Higher Priority Booking</p>"
            + row("Reference", high.getBookingReference())
            + row("By", high.getBookedBy().getFullName() + " [" + high.getBookedBy().getRole() + "]")
            + "</div>"
            + "<a class=\"btn\" href=\"" + frontendUrl + "/bookings/my\">View My Bookings</a>";
        return wrap("Priority Notice for Your Booking", "#F57C00", body);
    }
}
