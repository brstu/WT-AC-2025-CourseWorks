package com.vladislaukuzhyr.server.service;

import com.vladislaukuzhyr.server.dto.client.ClientCreateDto;
import com.vladislaukuzhyr.server.dto.client.ClientReadDto;
import com.vladislaukuzhyr.server.dto.client.ClientUpdateDto;
import com.vladislaukuzhyr.server.entity.Client;
import com.vladislaukuzhyr.server.mapper.ClientMapper;
import com.vladislaukuzhyr.server.repository.ClientRepository;
import com.vladislaukuzhyr.server.repository.DealRepository;
import com.vladislaukuzhyr.server.repository.InvoiceRepository;
import com.vladislaukuzhyr.server.repository.TaskRepository;
import com.vladislaukuzhyr.server.security.SecurityUtils;
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
public class ClientService {
  private final ClientRepository repository;
  private final ClientMapper mapper;
  private final UserService userService;
  private final DealRepository dealRepository;
  private final TaskRepository taskRepository;
  private final InvoiceRepository invoiceRepository;

  private Long getCurrentUserId() {
    return SecurityUtils.getCurrentUserId();
  }

  public List<Client> findAll() {
    Long userId = getCurrentUserId();
    return repository.findByUserId(userId);
  }

  public List<ClientReadDto> findAllDto() {
    Long userId = getCurrentUserId();
    return repository.findByUserId(userId).stream().map(mapper::toReadDto).collect(Collectors.toList());
  }

  public Optional<Client> findById(Long id) {
    Long userId = getCurrentUserId();
    return repository.findById(id)
        .filter(client -> client.getUser() != null && client.getUser().getId().equals(userId));
  }

  public Optional<ClientReadDto> findByIdDto(Long id) {
    return findById(id).map(mapper::toReadDto);
  }

  public Client save(Client client) {
    return repository.save(client);
  }

  public Client update(Long id, Client client) {
    client.setId(id);
    return repository.save(client);
  }

  public void delete(Long id) {
    repository.deleteById(id);
  }

  public ClientReadDto create(@Valid ClientCreateDto dto) {
    Long userId = getCurrentUserId();
    Client client = mapper.toEntity(dto);
    userService.findById(userId).ifPresent(client::setUser);
    Client saved = repository.save(client);
    return mapper.toReadDto(saved);
  }

  public ClientReadDto update(Long id, @Valid ClientUpdateDto dto) {
    Long userId = getCurrentUserId();
    Client client = repository.findById(id)
        .filter(c -> c.getUser() != null && c.getUser().getId().equals(userId))
        .orElseThrow(() -> new IllegalArgumentException("Client not found or access denied"));
    mapper.updateFromDto(dto, client);
    Client updated = repository.save(client);
    return mapper.toReadDto(updated);
  }

  public List<ClientReadDto> search(String query) {
    Long userId = getCurrentUserId();
    if (query == null || query.isBlank()) {
      return findAllDto();
    }
    return repository.findByUserIdAndNameContainingIgnoreCase(userId, query).stream()
      .map(mapper::toReadDto)
      .collect(Collectors.toList());
  }

  public long countRelatedTasks(Long clientId) {
    Long userId = getCurrentUserId();
    List<Long> dealIds = dealRepository.findByClientId(clientId).stream()
        .filter(deal -> deal.getUser() != null && deal.getUser().getId().equals(userId))
        .map(deal -> deal.getId())
        .collect(Collectors.toList());
    
    return dealIds.stream()
        .mapToLong(dealId -> taskRepository.findByDealId(dealId).stream()
            .filter(task -> task.getUser() != null && task.getUser().getId().equals(userId))
            .count())
        .sum();
  }

  public long countRelatedInvoices(Long clientId) {
    Long userId = getCurrentUserId();
    List<Long> dealIds = dealRepository.findByClientId(clientId).stream()
        .filter(deal -> deal.getUser() != null && deal.getUser().getId().equals(userId))
        .map(deal -> deal.getId())
        .collect(Collectors.toList());
    
    return dealIds.stream()
        .mapToLong(dealId -> invoiceRepository.findByDealId(dealId).stream()
            .filter(invoice -> invoice.getUser() != null && invoice.getUser().getId().equals(userId))
            .count())
        .sum();
  }

  public long countByClientId(Long clientId) {
    Long userId = getCurrentUserId();
    return dealRepository.findByClientId(clientId).stream()
        .filter(deal -> deal.getUser() != null && deal.getUser().getId().equals(userId))
        .count();
  }
}
