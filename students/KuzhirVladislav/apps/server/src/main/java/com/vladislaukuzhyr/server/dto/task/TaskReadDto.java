package com.vladislaukuzhyr.server.dto.task;

import java.time.LocalDateTime;
public record TaskReadDto(Long id, String title, String description, LocalDateTime dueDate, boolean completed, Long dealId, Long userId) {}
