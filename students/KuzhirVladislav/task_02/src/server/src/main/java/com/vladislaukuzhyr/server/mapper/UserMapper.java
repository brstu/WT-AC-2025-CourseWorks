package com.vladislaukuzhyr.server.mapper;

import com.vladislaukuzhyr.server.dto.user.UserCreateDto;
import com.vladislaukuzhyr.server.dto.user.UserReadDto;
import com.vladislaukuzhyr.server.dto.user.UserUpdateDto;
import com.vladislaukuzhyr.server.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {
  UserReadDto toReadDto(User user);
  User toEntity(UserCreateDto dto);
  void updateFromDto(UserUpdateDto dto, @MappingTarget User entity);
}
