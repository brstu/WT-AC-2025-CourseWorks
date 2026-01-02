package com.vladislaukuzhyr.server.dto.deal;

public record DealUpdateDto(String title, String description, Long clientId, Long stageId, Long userId) {}

