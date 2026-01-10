package com.vladislaukuzhyr.server.mapper;

import com.vladislaukuzhyr.server.dto.client.ClientCreateDto;
import com.vladislaukuzhyr.server.dto.client.ClientReadDto;
import com.vladislaukuzhyr.server.dto.client.ClientUpdateDto;
import com.vladislaukuzhyr.server.entity.Client;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ClientMapper {
  @Mapping(target = "userId", expression = "java(client.getUser() == null ? null : client.getUser().getId())")
  ClientReadDto toReadDto(Client client);
  Client toEntity(ClientCreateDto dto);
  void updateFromDto(ClientUpdateDto dto, @MappingTarget Client entity);
}
