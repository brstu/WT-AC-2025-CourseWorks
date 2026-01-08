package com.vladislaukuzhyr.server.controller;

import com.vladislaukuzhyr.server.dto.task.TaskCreateDto;
import com.vladislaukuzhyr.server.dto.task.TaskReadDto;
import com.vladislaukuzhyr.server.dto.task.TaskUpdateDto;
import com.vladislaukuzhyr.server.service.TaskService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/tasks")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {
  private final TaskService service;

  @GetMapping
  public List<TaskReadDto> getAll(@RequestParam(required = false) String search,
                                   @RequestParam(required = false) Long dealId) {
    if (dealId != null) {
      return service.findByDealId(dealId);
    }
    if (search != null && !search.isBlank()) {
      return service.search(search);
    }
    return service.findAllDto();
  }

  @GetMapping("/{id}")
  public ResponseEntity<TaskReadDto> getById(@PathVariable Long id) {
    Optional<TaskReadDto> dto = service.findByIdDto(id);
    return dto.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PostMapping
  public TaskReadDto create(@Valid @RequestBody TaskCreateDto dto) {
    return service.create(dto);
  }

  @PutMapping("/{id}")
  public ResponseEntity<TaskReadDto> update(@PathVariable Long id, @Valid @RequestBody TaskUpdateDto dto) {
    return ResponseEntity.ok(service.update(id, dto));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    service.delete(id);
    return ResponseEntity.noContent().build();
  }
}
