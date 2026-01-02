package com.vladislaukuzhyr.server.service;

import com.vladislaukuzhyr.server.dto.client.ClientCreateDto;
import com.vladislaukuzhyr.server.dto.client.ClientReadDto;
import com.vladislaukuzhyr.server.dto.client.ClientUpdateDto;
import com.vladislaukuzhyr.server.entity.Client;
import com.vladislaukuzhyr.server.mapper.ClientMapper;
import com.vladislaukuzhyr.server.repository.ClientRepository;
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
public class ClientService {
  private final ClientRepository repository;
  private final ClientMapper mapper;
  private final UserService userService;

  public List<Client> findAll() {
    return repository.findAll();
  }

  public List<ClientReadDto> findAllDto() {
    return repository.findAll().stream().map(mapper::toReadDto).collect(Collectors.toList());
  }

  public Optional<Client> findById(Long id) {
    return repository.findById(id);
  }

  public Optional<ClientReadDto> findByIdDto(Long id) {
    return repository.findById(id).map(mapper::toReadDto);
  }

  public Client save(Client client) {
    return repository.save(client);
  }

  public Client update(Long id, Client client) {
    client.setId(id);
    return repository.save(client);
  }

  public void delete(Long id) {
    repository.deleteById(id);
  }

  // DTO-based API
  public ClientReadDto create(@Valid ClientCreateDto dto) {
    Client client = mapper.toEntity(dto);
    if (dto.userId() != null) userService.findById(dto.userId()).ifPresent(client::setUser);
    Client saved = repository.save(client);
    return mapper.toReadDto(saved);
  }

  public ClientReadDto update(Long id, @Valid ClientUpdateDto dto) {
    Client client = new Client();
    mapper.updateFromDto(dto, client);
    if (dto.userId() != null) userService.findById(dto.userId()).ifPresent(client::setUser);
    client.setId(id);
    Client updated = repository.save(client);
    return mapper.toReadDto(updated);
  }
}
