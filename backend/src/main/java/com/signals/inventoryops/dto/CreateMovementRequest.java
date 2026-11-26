package com.signals.inventoryops.dto;

import com.signals.inventoryops.domain.enums.MovementCategory;
import com.signals.inventoryops.domain.enums.MovementDirection;
import com.signals.inventoryops.domain.enums.MovementSource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateMovementRequest(
    @NotNull(message = "A categoria da movimentação é obrigatória.") MovementCategory category,
    @NotNull(message = "A direção da movimentação é obrigatória.") MovementDirection direction,
    @NotBlank(message = "O título da movimentação é obrigatório.")
        @Size(max = 180, message = "Título deve ter no máximo 180 caracteres.")
        String title,
    @NotBlank(message = "Os detalhes da movimentação são obrigatórios.")
        @Size(max = 500, message = "Detalhes devem ter no máximo 500 caracteres.")
        String details,
    @Size(max = 40) String sku,
    @Size(max = 64) String orderId,
    Integer quantityDelta,
    Long amountCents,
    MovementSource source) {}
