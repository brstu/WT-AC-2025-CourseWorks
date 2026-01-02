package com.vladislaukuzhyr.server.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserCreateDto(@NotBlank String username, @NotBlank String password, @Email String email) {}
