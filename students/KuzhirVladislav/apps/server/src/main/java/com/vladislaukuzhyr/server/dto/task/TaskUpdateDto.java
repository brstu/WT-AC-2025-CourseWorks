package com.vladislaukuzhyr.server.dto.task;

import java.time.LocalDateTime;
public record TaskUpdateDto(String title, String description, LocalDateTime dueDate, Boolean completed, Long dealId, Long userId) {}

