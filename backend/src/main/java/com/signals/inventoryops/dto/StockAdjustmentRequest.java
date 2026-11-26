package com.signals.inventoryops.dto;

import com.signals.inventoryops.domain.enums.MovementSource;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StockAdjustmentRequest(
    @NotNull(message = "O delta de estoque é obrigatório.") Integer delta,
    MovementSource source,
    @Size(max = 300, message = "Motivo deve ter no máximo 300 caracteres.") String reason) {}
