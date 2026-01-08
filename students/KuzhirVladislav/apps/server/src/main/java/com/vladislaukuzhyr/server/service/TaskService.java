package com.vladislaukuzhyr.server.service;

import com.vladislaukuzhyr.server.dto.task.TaskCreateDto;
import com.vladislaukuzhyr.server.dto.task.TaskReadDto;
import com.vladislaukuzhyr.server.dto.task.TaskUpdateDto;
import com.vladislaukuzhyr.server.entity.Task;
import com.vladislaukuzhyr.server.mapper.TaskMapper;
import com.vladislaukuzhyr.server.repository.TaskRepository;
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
public class TaskService {
  private final TaskRepository repository;
  private final TaskMapper mapper;
  private final DealService dealService;
  private final UserService userService;

  public List<Task> findAll() {
    return repository.findAll();
  }

  public List<TaskReadDto> findAllDto() {
    return repository.findAll().stream().map(mapper::toReadDto).collect(Collectors.toList());
  }

  public Optional<Task> findById(Long id) {
    return repository.findById(id);
  }

  public Optional<TaskReadDto> findByIdDto(Long id) {
    return repository.findById(id).map(mapper::toReadDto);
  }

  public Task save(Task task) {
    return repository.save(task);
  }

  public Task update(Long id, Task task) {
    task.setId(id);
    return repository.save(task);
  }

  public void delete(Long id) {
    repository.deleteById(id);
  }

  public TaskReadDto create(@Valid TaskCreateDto dto) {
    Task task = mapper.toEntity(dto);
    if (dto.dealId() != null) dealService.findById(dto.dealId()).ifPresent(task::setDeal);
    if (dto.userId() != null) userService.findById(dto.userId()).ifPresent(task::setUser);
    Task saved = repository.save(task);
    return mapper.toReadDto(saved);
  }

  public TaskReadDto update(Long id, @Valid TaskUpdateDto dto) {
    Task task = new Task();
    mapper.updateFromDto(dto, task);
    if (dto.dealId() != null) dealService.findById(dto.dealId()).ifPresent(task::setDeal);
    if (dto.userId() != null) userService.findById(dto.userId()).ifPresent(task::setUser);
    task.setId(id);
    Task updated = repository.save(task);
    return mapper.toReadDto(updated);
  }

  public List<TaskReadDto> search(String query) {
    if (query == null || query.isBlank()) {
      return findAllDto();
    }
    return repository.findByTitleContainingIgnoreCase(query).stream()
        .map(mapper::toReadDto)
        .collect(Collectors.toList());
  }

  public List<TaskReadDto> findByDealId(Long dealId) {
    return repository.findByDealId(dealId).stream()
        .map(mapper::toReadDto)
        .collect(Collectors.toList());
  }
}
