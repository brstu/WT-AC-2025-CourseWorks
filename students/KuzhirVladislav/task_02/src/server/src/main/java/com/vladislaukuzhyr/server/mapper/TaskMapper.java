package com.vladislaukuzhyr.server.mapper;

import com.vladislaukuzhyr.server.dto.task.TaskCreateDto;
import com.vladislaukuzhyr.server.dto.task.TaskReadDto;
import com.vladislaukuzhyr.server.dto.task.TaskUpdateDto;
import com.vladislaukuzhyr.server.entity.Task;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TaskMapper {
  @Mapping(target = "dealId", expression = "java(task.getDeal() == null ? null : task.getDeal().getId())")
  @Mapping(target = "userId", expression = "java(task.getUser() == null ? null : task.getUser().getId())")
  TaskReadDto toReadDto(Task task);
  Task toEntity(TaskCreateDto dto);
  void updateFromDto(TaskUpdateDto dto, @MappingTarget Task entity);
}
