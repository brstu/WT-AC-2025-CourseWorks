package com.vladislaukuzhyr.server.controller;

import com.vladislaukuzhyr.server.dto.client.ClientCreateDto;
import com.vladislaukuzhyr.server.dto.client.ClientReadDto;
import com.vladislaukuzhyr.server.dto.client.ClientUpdateDto;
import com.vladislaukuzhyr.server.service.ClientService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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
@RequestMapping("/api/v1/clients")
@SecurityRequirement(name = "bearerAuth")
public class ClientController {
  private final ClientService service;

  @GetMapping
  public List<ClientReadDto> getAll() {
    return service.findAllDto();
  }

  @GetMapping("/{id}")
  public ResponseEntity<ClientReadDto> getById(@PathVariable Long id) {
    Optional<ClientReadDto> dto = service.findByIdDto(id);
    return dto.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PostMapping
  public ClientReadDto create(@RequestBody ClientCreateDto dto) {
    return service.create(dto);
  }

  @PutMapping("/{id}")
  public ResponseEntity<ClientReadDto> update(@PathVariable Long id, @RequestBody ClientUpdateDto dto) {
    return ResponseEntity.ok(service.update(id, dto));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    service.delete(id);
    return ResponseEntity.noContent().build();
  }
}
