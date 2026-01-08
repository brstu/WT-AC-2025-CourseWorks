package com.vladislaukuzhyr.server.entity;

import jakarta.persistence.Column;
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
public class Stage {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String name;
  @Column(name = "stage_order")
  private Integer stageOrder;

  @ManyToOne
  private User user;

  @OneToMany(mappedBy = "stage")
  private List<Deal> deals;

  public Stage setId(Long id) {
    this.id = id;
    return this;
  }

  public Stage setName(String name) {
    this.name = name;
    return this;
  }

  public Stage setStageOrder(Integer stageOrder) {
    this.stageOrder = stageOrder;
    return this;
  }

  public Stage setUser(User user) {
    this.user = user;
    return this;
  }

  public Stage setDeals(List<Deal> deals) {
    this.deals = deals;
    return this;
  }
}
