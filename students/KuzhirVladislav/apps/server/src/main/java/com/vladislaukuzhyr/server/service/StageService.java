package com.vladislaukuzhyr.server.service;

import com.vladislaukuzhyr.server.dto.stage.StageCreateDto;
import com.vladislaukuzhyr.server.dto.stage.StageReadDto;
import com.vladislaukuzhyr.server.dto.stage.StageUpdateDto;
import com.vladislaukuzhyr.server.entity.Stage;
import com.vladislaukuzhyr.server.mapper.StageMapper;
import com.vladislaukuzhyr.server.repository.StageRepository;
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
public class StageService {
  private final StageRepository repository;
  private final StageMapper mapper;
  private final UserService userService;

  private Long getCurrentUserId() {
    return SecurityUtils.getCurrentUserId();
  }

  public List<Stage> findAll() {
    Long userId = getCurrentUserId();
    return repository.findByUserId(userId);
  }

  public List<StageReadDto> findAllDto() {
    Long userId = getCurrentUserId();
    return repository.findByUserId(userId).stream().map(mapper::toReadDto).collect(Collectors.toList());
  }

  public Optional<Stage> findById(Long id) {
    Long userId = getCurrentUserId();
    return repository.findById(id)
        .filter(stage -> stage.getUser() != null && stage.getUser().getId().equals(userId));
  }

  public Optional<StageReadDto> findByIdDto(Long id) {
    return findById(id).map(mapper::toReadDto);
  }

  public Stage save(Stage stage) {
    return repository.save(stage);
  }

  public Stage update(Long id, Stage stage) {
    stage.setId(id);
    return repository.save(stage);
  }

  public void delete(Long id) {
    repository.deleteById(id);
  }

  public StageReadDto create(@Valid StageCreateDto dto) {
    Long userId = getCurrentUserId();
    Stage stage = mapper.toEntity(dto);
    userService.findById(userId).ifPresent(stage::setUser);
    Stage saved = repository.save(stage);
    return mapper.toReadDto(saved);
  }

  public StageReadDto update(Long id, @Valid StageUpdateDto dto) {
    Long userId = getCurrentUserId();
    Stage stage = repository.findById(id)
        .filter(s -> s.getUser() != null && s.getUser().getId().equals(userId))
        .orElseThrow(() -> new IllegalArgumentException("Stage not found or access denied"));
    mapper.updateFromDto(dto, stage);
    Stage updated = repository.save(stage);
    return mapper.toReadDto(updated);
  }
}
