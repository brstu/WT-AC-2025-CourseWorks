package com.vladislaukuzhyr.server.service;

import com.vladislaukuzhyr.server.dto.user.UserCreateDto;
import com.vladislaukuzhyr.server.dto.user.UserReadDto;
import com.vladislaukuzhyr.server.dto.user.UserUpdateDto;
import com.vladislaukuzhyr.server.entity.User;
import com.vladislaukuzhyr.server.mapper.UserMapper;
import com.vladislaukuzhyr.server.repository.UserRepository;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@Service
@RequiredArgsConstructor
@Validated
public class UserService {
  private final UserRepository repository;
  private final PasswordEncoder passwordEncoder;
  private final UserMapper mapper;

  public List<User> findAll() {
    return repository.findAll();
  }

  public List<UserReadDto> findAllDto() {
    return repository.findAll().stream().map(mapper::toReadDto).collect(Collectors.toList());
  }

  public Optional<User> findById(Long id) {
    return repository.findById(id);
  }

  public Optional<User> findByUsername(String username) {
    return repository.findByUsername(username);
  }

  public Optional<UserReadDto> findByIdDto(Long id) {
    return repository.findById(id).map(mapper::toReadDto);
  }

  public User save(User user) {
    user.setPassword(passwordEncoder.encode(user.getPassword()));
    return repository.save(user);
  }

  public User update(Long id, User user) {
    user.setId(id);
    return repository.save(user);
  }

  public void delete(Long id) {
    repository.deleteById(id);
  }

  // DTO-based
  public UserReadDto create(@Valid UserCreateDto dto) {
    User user = mapper.toEntity(dto);
    user.setPassword(passwordEncoder.encode(user.getPassword()));
    if (user.getRoles() == null) user.setRoles("ROLE_USER");
    User saved = repository.save(user);
    return mapper.toReadDto(saved);
  }

  public UserReadDto update(Long id, @Valid UserUpdateDto dto) {
    User user = new User();
    mapper.updateFromDto(dto, user);
    user.setId(id);
    User updated = repository.save(user);
    return mapper.toReadDto(updated);
  }
}
