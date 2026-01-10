package com.vladislaukuzhyr.server.mapper;

import com.vladislaukuzhyr.server.dto.stage.StageCreateDto;
import com.vladislaukuzhyr.server.dto.stage.StageReadDto;
import com.vladislaukuzhyr.server.dto.stage.StageUpdateDto;
import com.vladislaukuzhyr.server.entity.Stage;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface StageMapper {
  StageReadDto toReadDto(Stage stage);
  Stage toEntity(StageCreateDto dto);
  void updateFromDto(StageUpdateDto dto, @MappingTarget Stage entity);
}
