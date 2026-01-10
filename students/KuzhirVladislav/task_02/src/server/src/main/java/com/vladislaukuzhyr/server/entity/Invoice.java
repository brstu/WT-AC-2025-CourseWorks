package com.vladislaukuzhyr.server.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import java.time.LocalDateTime;
import lombok.Getter;

@Entity
@Getter
public class Invoice {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String number;
  private double amount;
  private String status;
  private LocalDateTime issueDate;

  @ManyToOne
  private Deal deal;

  @ManyToOne
  private User user;

  public Invoice setUser(User user) {
    this.user = user;
    return this;
  }

  public Invoice setNumber(String number) {
    this.number = number;
    return this;
  }

  public Invoice setDeal(Deal deal) {
    this.deal = deal;
    return this;
  }

  public Invoice setIssueDate(LocalDateTime issueDate) {
    this.issueDate = issueDate;
    return this;
  }

  public Invoice setStatus(String status) {
    this.status = status;
    return this;
  }

  public Invoice setAmount(double amount) {
    this.amount = amount;
    return this;
  }

  public Invoice setId(Long id) {
    this.id = id;
    return this;
  }
}
