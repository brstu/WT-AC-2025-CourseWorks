package com.vladislaukuzhyr.server.dto.deal;

import jakarta.validation.constraints.NotBlank;

public record DealCreateDto(@NotBlank String title, String description, Long clientId, Long stageId, Long userId) {}
