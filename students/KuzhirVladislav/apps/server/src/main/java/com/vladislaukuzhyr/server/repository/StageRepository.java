package com.vladislaukuzhyr.server.repository;

import com.vladislaukuzhyr.server.entity.Stage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StageRepository extends JpaRepository<Stage, Long> {
  List<Stage> findByUserId(Long userId);
}
