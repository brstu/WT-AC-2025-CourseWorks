package com.vladislaukuzhyr.server.dto.invoice;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

public record InvoiceCreateDto(@NotBlank String number, @Positive double amount, String status, Long dealId, Long userId) {}
