package com.vladislaukuzhyr.server.repository;

import com.vladislaukuzhyr.server.entity.Client;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
  List<Client> findByNameContainingIgnoreCase(String name);
  List<Client> findByEmailContainingIgnoreCase(String email);
  List<Client> findByUserId(Long userId);
  List<Client> findByUserIdAndNameContainingIgnoreCase(Long userId, String name);
}
