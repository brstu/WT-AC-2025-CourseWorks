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
public class Task {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String title;
  private String description;
  private LocalDateTime dueDate;
  private boolean completed;

  @ManyToOne
  private Deal deal;

  @ManyToOne
  private User user;

  public Task setId(Long id) {
    this.id = id;
    return this;
  }

  public Task setTitle(String title) {
    this.title = title;
    return this;
  }

  public Task setDescription(String description) {
    this.description = description;
    return this;
  }

  public Task setDueDate(LocalDateTime dueDate) {
    this.dueDate = dueDate;
    return this;
  }

  public Task setCompleted(boolean completed) {
    this.completed = completed;
    return this;
  }

  public Task setDeal(Deal deal) {
    this.deal = deal;
    return this;
  }

  public Task setUser(User user) {
    this.user = user;
    return this;
  }
}
