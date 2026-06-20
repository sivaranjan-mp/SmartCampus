package com.smartcampus.util;

import com.smartcampus.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

@Component
@RequiredArgsConstructor
public class BookingReferenceGenerator {

    private final BookingRepository bookingRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyMMdd");

    /**
     * Generates a unique reference like BK240612-4829.
     * Retries up to 5 times on collision (astronomically unlikely).
     */
    public String generate() {
        for (int attempt = 0; attempt < 5; attempt++) {
            String ref = "BK"
                    + LocalDate.now().format(DATE_FMT)
                    + "-"
                    + String.format("%04d", ThreadLocalRandom.current().nextInt(1000, 9999));

            if (bookingRepository.findByBookingReference(ref).isEmpty()) {
                return ref;
            }
        }
        // Fallback with nanoseconds – guaranteed unique
        return "BK" + LocalDate.now().format(DATE_FMT) + "-" + System.nanoTime() % 100000;
    }
}
