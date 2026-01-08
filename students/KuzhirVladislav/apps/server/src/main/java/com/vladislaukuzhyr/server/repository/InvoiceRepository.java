package com.vladislaukuzhyr.server.repository;

import com.vladislaukuzhyr.server.entity.Invoice;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
  List<Invoice> findByNumberContainingIgnoreCase(String number);
  List<Invoice> findByUserId(Long userId);
  List<Invoice> findByUserIdAndNumberContainingIgnoreCase(Long userId, String number);
  List<Invoice> findByDealId(Long dealId);
  long countByDealId(Long dealId);
}
