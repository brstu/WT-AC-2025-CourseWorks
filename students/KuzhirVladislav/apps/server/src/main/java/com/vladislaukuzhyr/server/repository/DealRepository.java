package com.vladislaukuzhyr.server.repository;

import com.vladislaukuzhyr.server.entity.Deal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DealRepository extends JpaRepository<Deal, Long> {
}
