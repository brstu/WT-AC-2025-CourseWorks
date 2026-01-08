package com.vladislaukuzhyr.server.controller;

import com.vladislaukuzhyr.server.dto.invoice.InvoiceCreateDto;
import com.vladislaukuzhyr.server.dto.invoice.InvoiceReadDto;
import com.vladislaukuzhyr.server.dto.invoice.InvoiceUpdateDto;
import com.vladislaukuzhyr.server.service.InvoiceService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.HashMap;
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
@RequestMapping("/api/v1/invoices")
@SecurityRequirement(name = "bearerAuth")
public class InvoiceController {
  private final InvoiceService service;

  @GetMapping
  public List<InvoiceReadDto> getAll(@RequestParam(required = false) String search) {
    if (search != null && !search.isBlank()) {
      return service.search(search);
    }
    return service.findAllDto();
  }

  @GetMapping("/{id}")
  public ResponseEntity<InvoiceReadDto> getById(@PathVariable Long id) {
    Optional<InvoiceReadDto> dto = service.findByIdDto(id);
    return dto.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PostMapping
  public InvoiceReadDto create(@Valid @RequestBody InvoiceCreateDto dto) {
    return service.create(dto);
  }

  @PutMapping("/{id}")
  public ResponseEntity<InvoiceReadDto> update(@PathVariable Long id, @Valid @RequestBody InvoiceUpdateDto dto) {
    return ResponseEntity.ok(service.update(id, dto));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    service.delete(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/{id}/count-related")
  public ResponseEntity<Map<String, Long>> countRelated(@PathVariable Long id) {
    // Проверяем что счет принадлежит текущему пользователю
    service.findById(id).orElseThrow(() -> new IllegalArgumentException("Invoice not found or access denied"));
    
    Map<String, Long> counts = new HashMap<>();
    counts.put("items", 0L);
    return ResponseEntity.ok(counts);
  }
}
