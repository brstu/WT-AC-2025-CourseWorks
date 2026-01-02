package com.vladislaukuzhyr.server.service;

import com.vladislaukuzhyr.server.dto.invoice.InvoiceCreateDto;
import com.vladislaukuzhyr.server.dto.invoice.InvoiceReadDto;
import com.vladislaukuzhyr.server.dto.invoice.InvoiceUpdateDto;
import com.vladislaukuzhyr.server.entity.Invoice;
import com.vladislaukuzhyr.server.mapper.InvoiceMapper;
import com.vladislaukuzhyr.server.repository.InvoiceRepository;
import jakarta.validation.Valid;
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

  public List<Invoice> findAll() {
    return repository.findAll();
  }

  public List<InvoiceReadDto> findAllDto() {
    return repository.findAll().stream().map(mapper::toReadDto).collect(Collectors.toList());
  }

  public Optional<Invoice> findById(Long id) {
    return repository.findById(id);
  }

  public Optional<InvoiceReadDto> findByIdDto(Long id) {
    return repository.findById(id).map(mapper::toReadDto);
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

  // DTO-based
  public InvoiceReadDto create(@Valid InvoiceCreateDto dto) {
    Invoice invoice = mapper.toEntity(dto);
    if (dto.dealId() != null) dealService.findById(dto.dealId()).ifPresent(invoice::setDeal);
    if (dto.userId() != null) userService.findById(dto.userId()).ifPresent(invoice::setUser);
    Invoice saved = repository.save(invoice);
    return mapper.toReadDto(saved);
  }

  public InvoiceReadDto update(Long id, @Valid InvoiceUpdateDto dto) {
    Invoice invoice = new Invoice();
    mapper.updateFromDto(dto, invoice);
    if (dto.dealId() != null) dealService.findById(dto.dealId()).ifPresent(invoice::setDeal);
    if (dto.userId() != null) userService.findById(dto.userId()).ifPresent(invoice::setUser);
    invoice.setId(id);
    Invoice updated = repository.save(invoice);
    return mapper.toReadDto(updated);
  }
}
