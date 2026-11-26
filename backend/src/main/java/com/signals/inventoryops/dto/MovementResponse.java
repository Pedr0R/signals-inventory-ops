package com.signals.inventoryops.dto;

import com.signals.inventoryops.domain.entity.MovementEntity;
import com.signals.inventoryops.domain.enums.MovementCategory;
import com.signals.inventoryops.domain.enums.MovementDirection;
import com.signals.inventoryops.domain.enums.MovementSource;
import java.time.Instant;

public record MovementResponse(
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

  public static MovementResponse fromEntity(MovementEntity entity) {
    return new MovementResponse(
        entity.getId(),
        entity.getOccurredAt(),
        entity.getCategory(),
        entity.getDirection(),
        entity.getTitle(),
        entity.getDetails(),
        entity.getSku(),
        entity.getOrderId(),
        entity.getQuantityDelta(),
        entity.getAmountCents(),
        entity.getSource());
  }
}
