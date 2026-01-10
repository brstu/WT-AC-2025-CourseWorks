package com.vladislaukuzhyr.server.dto.deal;

import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record DealReadDto(Long id, BigDecimal amount, String title, String description, Long clientId, Long stageId, Long userId) {}

