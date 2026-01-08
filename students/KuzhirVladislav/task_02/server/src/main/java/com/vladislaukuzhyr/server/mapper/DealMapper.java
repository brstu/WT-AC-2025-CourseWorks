package com.vladislaukuzhyr.server.mapper;

import com.vladislaukuzhyr.server.dto.deal.DealCreateDto;
import com.vladislaukuzhyr.server.dto.deal.DealReadDto;
import com.vladislaukuzhyr.server.dto.deal.DealUpdateDto;
import com.vladislaukuzhyr.server.entity.Deal;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DealMapper {
  @Mapping(target = "clientId", expression = "java(deal.getClient() == null ? null : deal.getClient().getId())")
  @Mapping(target = "stageId", expression = "java(deal.getStage() == null ? null : deal.getStage().getId())")
  @Mapping(target = "userId", expression = "java(deal.getUser() == null ? null : deal.getUser().getId())")
  DealReadDto toReadDto(Deal deal);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "client", ignore = true)
  @Mapping(target = "stage", ignore = true)
  @Mapping(target = "user", ignore = true)
  @Mapping(target = "tasks", ignore = true)
  @Mapping(target = "invoices", ignore = true)
  Deal toEntity(DealCreateDto dto);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "client", ignore = true)
  @Mapping(target = "stage", ignore = true)
  @Mapping(target = "user", ignore = true)
  @Mapping(target = "tasks", ignore = true)
  @Mapping(target = "invoices", ignore = true)
  void updateFromDto(DealUpdateDto dto, @MappingTarget Deal entity);
}
