package com.vladislaukuzhyr.server.service;

import com.vladislaukuzhyr.server.dto.stage.StageCreateDto;
import com.vladislaukuzhyr.server.dto.stage.StageReadDto;
import com.vladislaukuzhyr.server.dto.stage.StageUpdateDto;
import com.vladislaukuzhyr.server.entity.Stage;
import com.vladislaukuzhyr.server.mapper.StageMapper;
import com.vladislaukuzhyr.server.repository.StageRepository;
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

  public List<Stage> findAll() {
    return repository.findAll();
  }

  public List<StageReadDto> findAllDto() {
    return repository.findAll().stream().map(mapper::toReadDto).collect(Collectors.toList());
  }

  public Optional<Stage> findById(Long id) {
    return repository.findById(id);
  }

  public Optional<StageReadDto> findByIdDto(Long id) {
    return repository.findById(id).map(mapper::toReadDto);
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
    Stage stage = mapper.toEntity(dto);
    Stage saved = repository.save(stage);
    return mapper.toReadDto(saved);
  }

  public StageReadDto update(Long id, @Valid StageUpdateDto dto) {
    Stage stage = new Stage();
    mapper.updateFromDto(dto, stage);
    stage.setId(id);
    Stage updated = repository.save(stage);
    return mapper.toReadDto(updated);
  }
}
