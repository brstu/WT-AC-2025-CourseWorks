package com.vladislaukuzhyr.server.controller;

import com.vladislaukuzhyr.server.dto.user.UserCreateDto;
import com.vladislaukuzhyr.server.dto.user.UserReadDto;
import com.vladislaukuzhyr.server.dto.user.UserUpdateDto;
import com.vladislaukuzhyr.server.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
@SecurityRequirement(name = "bearerAuth")
public class UserController {
  private final UserService service;

  @GetMapping
  public List<UserReadDto> getAll() {
    return service.findAllDto();
  }

  @GetMapping("/{id}")
  public ResponseEntity<UserReadDto> getById(@PathVariable Long id) {
    Optional<UserReadDto> dto = service.findByIdDto(id);
    return dto.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PostMapping
  public UserReadDto create(@Valid @RequestBody UserCreateDto dto) {
    return service.create(dto);
  }

  @PutMapping("/{id}")
  public ResponseEntity<UserReadDto> update(@PathVariable Long id, @Valid @RequestBody UserUpdateDto dto) {
    return ResponseEntity.ok(service.update(id, dto));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    service.delete(id);
    return ResponseEntity.noContent().build();
  }
}
