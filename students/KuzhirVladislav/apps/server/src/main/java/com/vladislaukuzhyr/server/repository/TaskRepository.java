package com.vladislaukuzhyr.server.repository;

import com.vladislaukuzhyr.server.entity.Task;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
  List<Task> findByTitleContainingIgnoreCase(String title);
  List<Task> findByDescriptionContainingIgnoreCase(String description);
  List<Task> findByDealId(Long dealId);
  List<Task> findByUserId(Long userId);
  List<Task> findByUserIdAndTitleContainingIgnoreCase(Long userId, String title);
  long countByDealId(Long dealId);
}
