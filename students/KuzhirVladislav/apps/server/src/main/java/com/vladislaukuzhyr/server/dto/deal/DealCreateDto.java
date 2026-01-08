package com.vladislaukuzhyr.server.dto.deal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record DealCreateDto(@NotBlank String title, @Positive BigDecimal amount, String description, Long clientId, Long stageId, Long userId) {}
