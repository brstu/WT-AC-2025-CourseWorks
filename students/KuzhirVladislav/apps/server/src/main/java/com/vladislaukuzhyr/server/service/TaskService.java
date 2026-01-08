package com.vladislaukuzhyr.server.service;

import com.vladislaukuzhyr.server.dto.task.TaskCreateDto;
import com.vladislaukuzhyr.server.dto.task.TaskReadDto;
import com.vladislaukuzhyr.server.dto.task.TaskUpdateDto;
import com.vladislaukuzhyr.server.entity.Task;
import com.vladislaukuzhyr.server.mapper.TaskMapper;
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
public class TaskService {
  private final TaskRepository repository;
  private final TaskMapper mapper;
  private final DealService dealService;
  private final UserService userService;

  private Long getCurrentUserId() {
    return SecurityUtils.getCurrentUserId();
  }

  public List<Task> findAll() {
    Long userId = getCurrentUserId();
    return repository.findByUserId(userId);
  }

  public List<TaskReadDto> findAllDto() {
    Long userId = getCurrentUserId();
    return repository.findByUserId(userId).stream().map(mapper::toReadDto).collect(Collectors.toList());
  }

  public Optional<Task> findById(Long id) {
    Long userId = getCurrentUserId();
    return repository.findById(id)
        .filter(task -> task.getUser() != null && task.getUser().getId().equals(userId));
  }

  public Optional<TaskReadDto> findByIdDto(Long id) {
    return findById(id).map(mapper::toReadDto);
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
    Long userId = getCurrentUserId();
    Task task = mapper.toEntity(dto);
    if (dto.dealId() != null) dealService.findById(dto.dealId()).ifPresent(task::setDeal);
    userService.findById(userId).ifPresent(task::setUser);
    Task saved = repository.save(task);
    return mapper.toReadDto(saved);
  }

  public TaskReadDto update(Long id, @Valid TaskUpdateDto dto) {
    Long userId = getCurrentUserId();
    Task task = repository.findById(id)
        .filter(t -> t.getUser() != null && t.getUser().getId().equals(userId))
        .orElseThrow(() -> new IllegalArgumentException("Task not found or access denied"));
    mapper.updateFromDto(dto, task);
    if (dto.dealId() != null) dealService.findById(dto.dealId()).ifPresent(task::setDeal);
    Task updated = repository.save(task);
    return mapper.toReadDto(updated);
  }

  public List<TaskReadDto> search(String query) {
    Long userId = getCurrentUserId();
    if (query == null || query.isBlank()) {
      return findAllDto();
    }
    return repository.findByUserIdAndTitleContainingIgnoreCase(userId, query).stream()
        .map(mapper::toReadDto)
        .collect(Collectors.toList());
  }

  public List<TaskReadDto> findByDealId(Long dealId) {
    Long userId = getCurrentUserId();
    return repository.findByDealId(dealId).stream()
        .filter(task -> task.getUser() != null && task.getUser().getId().equals(userId))
        .map(mapper::toReadDto)
        .collect(Collectors.toList());
  }

  public long countByDealId(Long dealId) {
    Long userId = getCurrentUserId();
    return repository.findByDealId(dealId).stream()
        .filter(task -> task.getUser() != null && task.getUser().getId().equals(userId))
        .count();
  }
}
