package com.vladislaukuzhyr.server.controller;

import com.vladislaukuzhyr.server.dto.client.ClientCreateDto;
import com.vladislaukuzhyr.server.dto.client.ClientReadDto;
import com.vladislaukuzhyr.server.dto.client.ClientUpdateDto;
import com.vladislaukuzhyr.server.service.ClientService;
import com.vladislaukuzhyr.server.service.DealService;
import com.vladislaukuzhyr.server.service.InvoiceService;
import com.vladislaukuzhyr.server.service.TaskService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.List;
import java.util.Map;
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
@RequestMapping("/api/v1/clients")
@SecurityRequirement(name = "bearerAuth")
public class ClientController {
  private final ClientService service;
  private final DealService dealService;
  private final TaskService taskService;
  private final InvoiceService invoiceService;

  @GetMapping
  public List<ClientReadDto> getAll(@RequestParam(required = false) String search) {
    if (search != null && !search.isBlank()) {
      return service.search(search);
    }
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

  @GetMapping("/{id}/count-related")
  public ResponseEntity<Map<String, Long>> countRelated(@PathVariable Long id) {
    service.findById(id).orElseThrow(() -> new IllegalArgumentException("Client not found or access denied"));
    
    Map<String, Long> counts = new java.util.HashMap<>();
    long dealsCount = service.countByClientId(id);
    long tasksCount = service.countRelatedTasks(id);
    long invoicesCount = service.countRelatedInvoices(id);
    
    counts.put("deals", dealsCount);
    counts.put("tasks", tasksCount);
    counts.put("invoices", invoicesCount);
    return ResponseEntity.ok(counts);
  }
}
