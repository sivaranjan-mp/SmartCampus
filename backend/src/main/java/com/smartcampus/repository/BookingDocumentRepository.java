package com.smartcampus.repository;

import com.smartcampus.model.BookingDocument;
import com.smartcampus.model.enums.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingDocumentRepository extends JpaRepository<BookingDocument, Long> {

    List<BookingDocument> findByBookingId(Long bookingId);

    Optional<BookingDocument> findByBookingIdAndDocumentType(Long bookingId, DocumentType type);

    Optional<BookingDocument> findByStoredFileName(String storedFileName);
}
