package com.vladislaukuzhyr.server.dto.client;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ClientCreateDto(@NotBlank String name, @Email String email, String phone, Long userId) {}
