package com.signals.inventoryops.domain.entity;

import com.signals.inventoryops.domain.enums.MovementCategory;
import com.signals.inventoryops.domain.enums.MovementDirection;
import com.signals.inventoryops.domain.enums.MovementSource;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "system_movements")
public class MovementEntity {

  @Id
  @Column(length = 64, nullable = false)
  private String id;

  @Column(name = "occurred_at", nullable = false)
  private Instant occurredAt;

  @Enumerated(EnumType.STRING)
  @Column(length = 24, nullable = false)
  private MovementCategory category;

  @Enumerated(EnumType.STRING)
  @Column(length = 24, nullable = false)
  private MovementDirection direction;

  @Column(length = 180, nullable = false)
  private String title;

  @Column(length = 500, nullable = false)
  private String details;

  @Column(length = 40)
  private String sku;

  @Column(name = "order_id", length = 64)
  private String orderId;

  @Column(name = "quantity_delta")
  private Integer quantityDelta;

  @Column(name = "amount_cents")
  private Long amountCents;

  @Enumerated(EnumType.STRING)
  @Column(length = 32, nullable = false)
  private MovementSource source;

  protected MovementEntity() {}

  public MovementEntity(
      String id,
      Instant occurredAt,
      MovementCategory category,
      MovementDirection direction,
      String title,
      String details,
      String sku,
      String orderId,
      Integer quantityDelta,
      Long amountCents,
      MovementSource source) {
    this.id = id;
    this.occurredAt = occurredAt;
    this.category = category;
    this.direction = direction;
    this.title = title;
    this.details = details;
    this.sku = sku;
    this.orderId = orderId;
    this.quantityDelta = quantityDelta;
    this.amountCents = amountCents;
    this.source = source;
  }

  public String getId() {
    return id;
  }

  public Instant getOccurredAt() {
    return occurredAt;
  }

  public MovementCategory getCategory() {
    return category;
  }

  public MovementDirection getDirection() {
    return direction;
  }

  public String getTitle() {
    return title;
  }

  public String getDetails() {
    return details;
  }

  public String getSku() {
    return sku;
  }

  public String getOrderId() {
    return orderId;
  }

  public Integer getQuantityDelta() {
    return quantityDelta;
  }

  public Long getAmountCents() {
    return amountCents;
  }

  public MovementSource getSource() {
    return source;
  }
}
