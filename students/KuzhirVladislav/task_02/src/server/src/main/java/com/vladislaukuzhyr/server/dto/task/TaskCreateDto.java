package com.vladislaukuzhyr.server.dto.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record TaskCreateDto(@NotBlank String title, String description,
		@NotNull LocalDateTime dueDate, boolean completed, Long dealId, Long userId) {
}
