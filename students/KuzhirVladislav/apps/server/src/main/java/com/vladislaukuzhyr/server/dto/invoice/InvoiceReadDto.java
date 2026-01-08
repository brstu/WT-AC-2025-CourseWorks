package com.vladislaukuzhyr.server.dto.invoice;

import java.time.LocalDateTime;
public record InvoiceReadDto(Long id, String number, double amount, String status, LocalDateTime issueDate, Long dealId, Long userId) {}

