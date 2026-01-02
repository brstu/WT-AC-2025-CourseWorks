package com.vladislaukuzhyr.server.dto.deal;

public record DealReadDto(Long id, String title, String description, Long clientId, Long stageId, Long userId) {}

