package com.vladislaukuzhyr.server.controller;

import com.vladislaukuzhyr.server.dto.stage.StageCreateDto;
import com.vladislaukuzhyr.server.dto.stage.StageReadDto;
import com.vladislaukuzhyr.server.dto.stage.StageUpdateDto;
import com.vladislaukuzhyr.server.service.StageService;
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
@RequestMapping("/api/v1/stages")
@SecurityRequirement(name = "bearerAuth")
public class StageController {
  private final StageService service;

  @GetMapping
  public List<StageReadDto> getAll() {
    return service.findAllDto();
  }

  @GetMapping("/{id}")
  public ResponseEntity<StageReadDto> getById(@PathVariable Long id) {
    Optional<StageReadDto> dto = service.findByIdDto(id);
    return dto.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PostMapping
  public StageReadDto create(@Valid @RequestBody StageCreateDto dto) {
    return service.create(dto);
  }

  @PutMapping("/{id}")
  public ResponseEntity<StageReadDto> update(@PathVariable Long id, @Valid @RequestBody StageUpdateDto dto) {
    return ResponseEntity.ok(service.update(id, dto));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    service.delete(id);
    return ResponseEntity.noContent().build();
  }
}
