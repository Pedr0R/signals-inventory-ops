package com.signals.inventoryops.service;

import com.signals.inventoryops.domain.entity.MovementEntity;
import com.signals.inventoryops.domain.enums.MovementCategory;
import com.signals.inventoryops.domain.enums.MovementDirection;
import com.signals.inventoryops.domain.enums.MovementSource;
import com.signals.inventoryops.dto.CreateMovementRequest;
import com.signals.inventoryops.dto.MovementResponse;
import com.signals.inventoryops.repository.MovementRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MovementService {

  private final MovementRepository movementRepository;

  public MovementService(MovementRepository movementRepository) {
    this.movementRepository = movementRepository;
  }

  @Transactional(readOnly = true)
  public List<MovementResponse> listMovements(
      MovementCategory category, MovementDirection direction) {
    return movementRepository.findFiltered(category, direction).stream()
        .map(MovementResponse::fromEntity)
        .toList();
  }

  @Transactional
  public MovementResponse registerMovement(CreateMovementRequest request) {
    MovementSource resolvedSource =
        request.source() == null ? MovementSource.MANUAL : request.source();
    MovementEntity entity =
        new MovementEntity(
            "mov-" + UUID.randomUUID(),
            Instant.now(),
            request.category(),
            request.direction(),
            request.title().trim(),
            request.details().trim(),
            request.sku(),
            request.orderId(),
            request.quantityDelta(),
            request.amountCents(),
            resolvedSource);
    MovementEntity saved = movementRepository.save(entity);
    return MovementResponse.fromEntity(saved);
  }
}
