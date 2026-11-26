package com.signals.inventoryops.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.signals.inventoryops.domain.entity.MovementEntity;
import com.signals.inventoryops.domain.enums.MovementCategory;
import com.signals.inventoryops.domain.enums.MovementDirection;
import com.signals.inventoryops.domain.enums.MovementSource;
import com.signals.inventoryops.dto.CreateMovementRequest;
import com.signals.inventoryops.dto.MovementResponse;
import com.signals.inventoryops.repository.MovementRepository;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MovementServiceTest {

  @Mock private MovementRepository movementRepository;
  @InjectMocks private MovementService movementService;

  @Test
  void deveListarMovimentacoesFiltradas() {
    MovementEntity entity =
        new MovementEntity(
            "mov-1",
            Instant.now(),
            MovementCategory.ESTOQUE,
            MovementDirection.ENTRADA,
            "Reposição",
            "Entrada na doca A-01",
            "ARM-NVME-2048",
            null,
            5,
            null,
            MovementSource.MANUAL);
    when(movementRepository.findFiltered(MovementCategory.ESTOQUE, MovementDirection.ENTRADA))
        .thenReturn(List.of(entity));

    List<MovementResponse> result =
        movementService.listMovements(MovementCategory.ESTOQUE, MovementDirection.ENTRADA);

    assertThat(result).hasSize(1);
    assertThat(result.getFirst().sku()).isEqualTo("ARM-NVME-2048");
  }

  @Test
  void deveRegistrarMovimentacaoComOrigemPadraoManual() {
    when(movementRepository.save(any(MovementEntity.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    MovementResponse created =
        movementService.registerMovement(
            new CreateMovementRequest(
                MovementCategory.PEDIDO,
                MovementDirection.SAIDA,
                "Pedido PED-2026-1050 emitido",
                "Cliente Teste",
                null,
                "PED-2026-1050",
                -2,
                150000L,
                null));

    assertThat(created.id()).startsWith("mov-");
    assertThat(created.source()).isEqualTo(MovementSource.MANUAL);
    assertThat(created.orderId()).isEqualTo("PED-2026-1050");
  }
}
