package com.vladislaukuzhyr.server.dto.invoice;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

public record InvoiceCreateDto(@Positive double amount, String status, @NotNull LocalDateTime issueDate, Long dealId, Long userId) {}
