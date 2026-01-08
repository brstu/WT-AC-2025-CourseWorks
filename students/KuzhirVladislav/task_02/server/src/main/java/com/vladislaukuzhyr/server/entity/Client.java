package com.vladislaukuzhyr.server.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import java.util.List;
import lombok.Getter;

@Entity
@Getter
public class Client {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String name;
  private String email;
  private String phone;

  @ManyToOne
  private User user;

  @OneToMany(mappedBy = "client", cascade = CascadeType.REMOVE, orphanRemoval = true)
  private List<Deal> deals;

  public Client setUser(User user) {
    this.user = user;
    return this;
  }

  public Client setId(Long id) {
    this.id = id;
    return this;
  }

  public Client setName(String name) {
    this.name = name;
    return this;
  }

  public Client setEmail(String email) {
    this.email = email;
    return this;
  }

  public Client setPhone(String phone) {
    this.phone = phone;
    return this;
  }

  public Client setDeals(List<Deal> deals) {
    this.deals = deals;
    return this;
  }
}
