package com.vladislaukuzhyr.server.dto.invoice;

import java.time.LocalDateTime;
public record InvoiceReadDto(Long id, double amount, String status, LocalDateTime issueDate, Long dealId, Long userId) {}

