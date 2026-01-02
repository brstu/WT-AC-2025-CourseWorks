package com.vladislaukuzhyr.server.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.List;

@Entity
@Table(name = "users")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String username;
  private String password;
  private String email;
  private String roles = "ROLE_USER";

  @OneToMany(mappedBy = "user")
  private List<Client> clients;

  @OneToMany(mappedBy = "user")
  private List<Deal> deals;

  @OneToMany(mappedBy = "user")
  private List<Task> tasks;

  @OneToMany(mappedBy = "user")
  private List<Invoice> invoices;

  public User setId(Long id) {
    this.id = id;
    return this;
  }

  public User setUsername(String username) {
    this.username = username;
    return this;
  }

  public User setPassword(String password) {
    this.password = password;
    return this;
  }

  public User setEmail(String email) {
    this.email = email;
    return this;
  }

  public User setRoles(String roles) {
    this.roles = roles;
    return this;
  }

  public User setClients(List<Client> clients) {
    this.clients = clients;
    return this;
  }

  public User setDeals(List<Deal> deals) {
    this.deals = deals;
    return this;
  }

  public User setTasks(List<Task> tasks) {
    this.tasks = tasks;
    return this;
  }

  public User setInvoices(List<Invoice> invoices) {
    this.invoices = invoices;
    return this;
  }

  public Long getId() { return id; }
  public String getUsername() { return username; }
  public String getPassword() { return password; }
  public String getEmail() { return email; }
  public String getRoles() { return roles; }
}
