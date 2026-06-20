package com.smartcampus.event;

import com.smartcampus.model.Booking;
import com.smartcampus.service.ApprovalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingEventListener {

    private final ApprovalService approvalService;

    /**
     * Fires AFTER the booking transaction commits successfully.
     * Creates the appropriate approval record(s) and dispatches
     * email notifications to the relevant approver(s).
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void onBookingCreated(BookingCreatedEvent event) {
        Booking booking = event.getBooking();
        log.info("BookingCreatedEvent received for {} — initiating approval workflow",
                booking.getBookingReference());
        try {
            approvalService.createApprovalRecords(booking);
        } catch (Exception ex) {
            log.error("Failed to create approval records for booking {}: {}",
                    booking.getBookingReference(), ex.getMessage(), ex);
        }
    }
}
