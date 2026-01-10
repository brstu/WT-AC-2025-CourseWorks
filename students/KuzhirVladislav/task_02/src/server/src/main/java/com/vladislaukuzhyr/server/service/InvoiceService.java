package com.vladislaukuzhyr.server.service;

import com.vladislaukuzhyr.server.dto.invoice.InvoiceCreateDto;
import com.vladislaukuzhyr.server.dto.invoice.InvoiceReadDto;
import com.vladislaukuzhyr.server.dto.invoice.InvoiceUpdateDto;
import com.vladislaukuzhyr.server.entity.Invoice;
import com.vladislaukuzhyr.server.mapper.InvoiceMapper;
import com.vladislaukuzhyr.server.repository.InvoiceRepository;
import com.vladislaukuzhyr.server.security.SecurityUtils;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@Service
@RequiredArgsConstructor
@Validated
public class InvoiceService {
  private final InvoiceRepository repository;
  private final InvoiceMapper mapper;
  private final DealService dealService;
  private final UserService userService;

  private Long getCurrentUserId() {
    return SecurityUtils.getCurrentUserId();
  }

  public List<Invoice> findAll() {
    Long userId = getCurrentUserId();
    return repository.findByUserId(userId);
  }

  public List<InvoiceReadDto> findAllDto() {
    Long userId = getCurrentUserId();
    return repository.findByUserId(userId).stream().map(mapper::toReadDto).collect(Collectors.toList());
  }

  public Optional<Invoice> findById(Long id) {
    Long userId = getCurrentUserId();
    return repository.findById(id)
        .filter(invoice -> invoice.getUser() != null && invoice.getUser().getId().equals(userId));
  }

  public Optional<InvoiceReadDto> findByIdDto(Long id) {
    return findById(id).map(mapper::toReadDto);
  }

  public Invoice save(Invoice invoice) {
    return repository.save(invoice);
  }

  public Invoice update(Long id, Invoice invoice) {
    invoice.setId(id);
    return repository.save(invoice);
  }

  public void delete(Long id) {
    repository.deleteById(id);
  }

  public InvoiceReadDto create(@Valid InvoiceCreateDto dto) {
    Long userId = getCurrentUserId();
    Invoice invoice = mapper.toEntity(dto);
    if (dto.dealId() != null) dealService.findById(dto.dealId()).ifPresent(invoice::setDeal);
    userService.findById(userId).ifPresent(invoice::setUser);
    invoice.setIssueDate(LocalDateTime.now());
    Invoice saved = repository.save(invoice);
    return mapper.toReadDto(saved);
  }

  public InvoiceReadDto update(Long id, @Valid InvoiceUpdateDto dto) {
    Long userId = getCurrentUserId();
    Invoice invoice = repository.findById(id)
        .filter(i -> i.getUser() != null && i.getUser().getId().equals(userId))
        .orElseThrow(() -> new IllegalArgumentException("Invoice not found or access denied"));
    mapper.updateFromDto(dto, invoice);
    if (dto.dealId() != null) dealService.findById(dto.dealId()).ifPresent(invoice::setDeal);
    Invoice updated = repository.save(invoice);
    return mapper.toReadDto(updated);
  }

  public List<InvoiceReadDto> search(String query) {
    Long userId = getCurrentUserId();
    if (query == null || query.isBlank()) {
      return findAllDto();
    }
    return repository.findByUserIdAndNumberContainingIgnoreCase(userId, query).stream()
        .map(mapper::toReadDto)
        .collect(Collectors.toList());
  }

  public long countByDealId(Long dealId) {
    Long userId = getCurrentUserId();
    return repository.findByDealId(dealId).stream()
        .filter(invoice -> invoice.getUser() != null && invoice.getUser().getId().equals(userId))
        .count();
  }
}
