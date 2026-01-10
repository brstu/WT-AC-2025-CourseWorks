package com.vladislaukuzhyr.server.service;

import com.vladislaukuzhyr.server.dto.deal.DealCreateDto;
import com.vladislaukuzhyr.server.dto.deal.DealReadDto;
import com.vladislaukuzhyr.server.dto.deal.DealUpdateDto;
import com.vladislaukuzhyr.server.entity.Deal;
import com.vladislaukuzhyr.server.mapper.DealMapper;
import com.vladislaukuzhyr.server.repository.DealRepository;
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
public class DealService {
  private final DealRepository repository;
  private final DealMapper mapper;
  private final ClientService clientService;
  private final StageService stageService;
  private final UserService userService;

  private Long getCurrentUserId() {
    return SecurityUtils.getCurrentUserId();
  }

  public List<Deal> findAll() {
    Long userId = getCurrentUserId();
    return repository.findByUserId(userId);
  }

  public List<DealReadDto> findAllDto() {
    Long userId = getCurrentUserId();
    return repository.findByUserId(userId).stream().map(mapper::toReadDto).collect(Collectors.toList());
  }

  public Optional<Deal> findById(Long id) {
    Long userId = getCurrentUserId();
    return repository.findById(id)
        .filter(deal -> deal.getUser() != null && deal.getUser().getId().equals(userId));
  }

  public Optional<DealReadDto> findByIdDto(Long id) {
    return findById(id).map(mapper::toReadDto);
  }

  public Deal save(Deal deal) {
    return repository.save(deal);
  }

  public Deal update(Long id, Deal deal) {
    deal.setId(id);
    return repository.save(deal);
  }

  public void delete(Long id) {
    repository.deleteById(id);
  }

  public DealReadDto create(@Valid DealCreateDto dto) {
    Long userId = getCurrentUserId();
    if (dto.stageId() == null) {
      throw new IllegalArgumentException("Этап (stageId) является обязательным полем");
    }
    Deal deal = mapper.toEntity(dto);
    if (dto.clientId() != null) {
      clientService.findById(dto.clientId()).ifPresent(deal::setClient);
    }
    stageService.findById(dto.stageId()).ifPresent(deal::setStage);
    userService.findById(userId).ifPresent(deal::setUser);
    Deal saved = repository.save(deal);
    return mapper.toReadDto(saved);
  }

  public DealReadDto update(Long id, @Valid DealUpdateDto dto) {
    Long userId = getCurrentUserId();
    Deal deal = repository.findById(id)
        .filter(d -> d.getUser() != null && d.getUser().getId().equals(userId))
        .orElseThrow(() -> new IllegalArgumentException("Deal not found or access denied"));
    mapper.updateFromDto(dto, deal);
    if (dto.clientId() != null) {
      clientService.findById(dto.clientId()).ifPresent(deal::setClient);
    }
    if (dto.stageId() != null) {
      stageService.findById(dto.stageId()).ifPresent(deal::setStage);
    }
    Deal updated = repository.save(deal);
    return mapper.toReadDto(updated);
  }

  public List<DealReadDto> search(String query) {
    Long userId = getCurrentUserId();
    if (query == null || query.isBlank()) {
      return findAllDto();
    }
    return repository.findByUserIdAndTitleContainingIgnoreCase(userId, query).stream()
        .map(mapper::toReadDto)
        .collect(Collectors.toList());
  }

  public long countByClientId(Long clientId) {
    Long userId = getCurrentUserId();
    return repository.findByClientId(clientId).stream()
        .filter(deal -> deal.getUser() != null && deal.getUser().getId().equals(userId))
        .count();
  }
}
