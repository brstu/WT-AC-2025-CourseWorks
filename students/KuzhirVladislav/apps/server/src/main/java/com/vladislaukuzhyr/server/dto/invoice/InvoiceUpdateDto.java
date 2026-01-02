package com.vladislaukuzhyr.server.dto.invoice;

import java.time.LocalDateTime;
public record InvoiceUpdateDto(double amount, String status, LocalDateTime issueDate, Long dealId, Long userId) {}

