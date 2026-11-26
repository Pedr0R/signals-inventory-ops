package com.signals.inventoryops.controller;

import com.signals.inventoryops.domain.enums.MovementCategory;
import com.signals.inventoryops.domain.enums.MovementDirection;
import com.signals.inventoryops.dto.CreateMovementRequest;
import com.signals.inventoryops.dto.MovementResponse;
import com.signals.inventoryops.service.MovementService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/movements")
public class MovementController {

  private final MovementService movementService;

  public MovementController(MovementService movementService) {
    this.movementService = movementService;
  }

  @GetMapping
  public ResponseEntity<List<MovementResponse>> listMovements(
      @RequestParam(required = false) MovementCategory category,
      @RequestParam(required = false) MovementDirection direction) {
    return ResponseEntity.ok(movementService.listMovements(category, direction));
  }

  @PostMapping
  public ResponseEntity<MovementResponse> createMovement(
      @Valid @RequestBody CreateMovementRequest request) {
    MovementResponse created = movementService.registerMovement(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }
}
