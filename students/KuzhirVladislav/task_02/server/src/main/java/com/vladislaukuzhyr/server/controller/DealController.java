package com.vladislaukuzhyr.server.controller;

import com.vladislaukuzhyr.server.dto.deal.DealCreateDto;
import com.vladislaukuzhyr.server.dto.deal.DealReadDto;
import com.vladislaukuzhyr.server.dto.deal.DealUpdateDto;
import com.vladislaukuzhyr.server.service.DealService;
import com.vladislaukuzhyr.server.service.InvoiceService;
import com.vladislaukuzhyr.server.service.TaskService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
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
@RequestMapping("/api/v1/deals")
@SecurityRequirement(name = "bearerAuth")
public class DealController {
  private final DealService service;
  private final TaskService taskService;
  private final InvoiceService invoiceService;

  @GetMapping
  public List<DealReadDto> getAll(@RequestParam(required = false) String search) {
    if (search != null && !search.isBlank()) {
      return service.search(search);
    }
    return service.findAllDto();
  }

  @GetMapping("/{id}")
  public ResponseEntity<DealReadDto> getById(@PathVariable Long id) {
    Optional<DealReadDto> dto = service.findByIdDto(id);
    return dto.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PostMapping
  public DealReadDto create(@Valid @RequestBody DealCreateDto dto) {
    return service.create(dto);
  }

  @PutMapping("/{id}")
  public ResponseEntity<DealReadDto> update(@PathVariable Long id, @Valid @RequestBody DealUpdateDto dto) {
    return ResponseEntity.ok(service.update(id, dto));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    service.delete(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/{id}/count-related")
  public ResponseEntity<Map<String, Long>> countRelated(@PathVariable Long id) {
    // Проверяем что сделка принадлежит текущему пользователю
    service.findById(id).orElseThrow(() -> new IllegalArgumentException("Deal not found or access denied"));
    
    Map<String, Long> counts = new java.util.HashMap<>();
    counts.put("tasks", taskService.countByDealId(id));
    counts.put("invoices", invoiceService.countByDealId(id));
    return ResponseEntity.ok(counts);
  }
}
