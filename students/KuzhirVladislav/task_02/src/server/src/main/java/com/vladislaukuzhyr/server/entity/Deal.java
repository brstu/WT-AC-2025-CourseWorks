package com.vladislaukuzhyr.server.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import java.math.BigDecimal;
import java.util.List;
import lombok.Getter;

@Entity
@Getter
public class Deal {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private BigDecimal amount;
  private String title;
  private String description;

  @ManyToOne
  private Client client;

  @ManyToOne
  private Stage stage;

  @ManyToOne
  private User user;

  @OneToMany(mappedBy = "deal", cascade = CascadeType.REMOVE, orphanRemoval = true)
  private List<Task> tasks;

  @OneToMany(mappedBy = "deal", cascade = CascadeType.REMOVE, orphanRemoval = true)
  private List<Invoice> invoices;

  public Deal setId(Long id) {
    this.id = id;
    return this;
  }

  public Deal setAmount(BigDecimal amount) {
    this.amount = amount;
    return this;
  }

  public Deal setTitle(String title) {
    this.title = title;
    return this;
  }

  public Deal setDescription(String description) {
    this.description = description;
    return this;
  }

  public Deal setClient(Client client) {
    this.client = client;
    return this;
  }

  public Deal setStage(Stage stage) {
    this.stage = stage;
    return this;
  }

  public Deal setUser(User user) {
    this.user = user;
    return this;
  }

  public Deal setTasks(List<Task> tasks) {
    this.tasks = tasks;
    return this;
  }

  public Deal setInvoices(List<Invoice> invoices) {
    this.invoices = invoices;
    return this;
  }
}
