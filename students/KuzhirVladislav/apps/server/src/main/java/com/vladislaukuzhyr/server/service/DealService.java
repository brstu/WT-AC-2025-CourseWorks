package com.vladislaukuzhyr.server.service;

import com.vladislaukuzhyr.server.dto.deal.DealCreateDto;
import com.vladislaukuzhyr.server.dto.deal.DealReadDto;
import com.vladislaukuzhyr.server.dto.deal.DealUpdateDto;
import com.vladislaukuzhyr.server.entity.Deal;
import com.vladislaukuzhyr.server.mapper.DealMapper;
import com.vladislaukuzhyr.server.repository.DealRepository;
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

  public List<Deal> findAll() {
    return repository.findAll();
  }

  public List<DealReadDto> findAllDto() {
    return repository.findAll().stream().map(mapper::toReadDto).collect(Collectors.toList());
  }

  public Optional<Deal> findById(Long id) {
    return repository.findById(id);
  }

  public Optional<DealReadDto> findByIdDto(Long id) {
    return repository.findById(id).map(mapper::toReadDto);
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
    if (dto.stageId() == null) {
      throw new IllegalArgumentException("Этап (stageId) является обязательным полем");
    }
    Deal deal = mapper.toEntity(dto);
    if (dto.clientId() != null) {
      clientService.findById(dto.clientId()).ifPresent(deal::setClient);
    }
    stageService.findById(dto.stageId()).ifPresent(deal::setStage);
    if (dto.userId() != null) {
      userService.findById(dto.userId()).ifPresent(deal::setUser);
    }
    Deal saved = repository.save(deal);
    return mapper.toReadDto(saved);
  }

  public DealReadDto update(Long id, @Valid DealUpdateDto dto) {
    Deal deal = repository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Deal not found with id: " + id));
    mapper.updateFromDto(dto, deal);
    if (dto.clientId() != null) {
      clientService.findById(dto.clientId()).ifPresent(deal::setClient);
    }
    if (dto.stageId() != null) {
      stageService.findById(dto.stageId()).ifPresent(deal::setStage);
    }
    if (dto.userId() != null) {
      userService.findById(dto.userId()).ifPresent(deal::setUser);
    }
    Deal updated = repository.save(deal);
    return mapper.toReadDto(updated);
  }

  public List<DealReadDto> search(String query) {
    if (query == null || query.isBlank()) {
      return findAllDto();
    }
    return repository.findByTitleContainingIgnoreCase(query).stream()
        .map(mapper::toReadDto)
        .collect(Collectors.toList());
  }
}
