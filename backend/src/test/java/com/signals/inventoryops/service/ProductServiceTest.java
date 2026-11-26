package com.signals.inventoryops.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.signals.inventoryops.domain.entity.ProductEntity;
import com.signals.inventoryops.domain.enums.MovementSource;
import com.signals.inventoryops.dto.CreateMovementRequest;
import com.signals.inventoryops.dto.ProductResponse;
import com.signals.inventoryops.dto.StockAdjustmentRequest;
import com.signals.inventoryops.exception.BusinessRuleException;
import com.signals.inventoryops.exception.ResourceNotFoundException;
import com.signals.inventoryops.repository.ProductRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

  @Mock private ProductRepository productRepository;
  @Mock private MovementService movementService;
  @InjectMocks private ProductService productService;

  @Test
  void deveAjustarEstoqueERegistrarMovimentacao() {
    ProductEntity entity =
        new ProductEntity(
            "prod-nvme-2tb",
            "ARM-NVME-2048",
            "SSD NVMe Enterprise 2TB Gen4",
            "armazenamento",
            129900L,
            10,
            4,
            "Corredor A-01");
    when(productRepository.findById("prod-nvme-2tb")).thenReturn(Optional.of(entity));
    when(productRepository.save(entity)).thenReturn(entity);

    ProductResponse response =
        productService.adjustStock(
            "prod-nvme-2tb", new StockAdjustmentRequest(5, MovementSource.MANUAL, null));

    assertThat(response.stockQuantity()).isEqualTo(15);
    verify(movementService).registerMovement(any(CreateMovementRequest.class));
  }

  @Test
  void deveLancarErroQuandoEstoqueResultarNegativo() {
    ProductEntity entity =
        new ProductEntity(
            "prod-ram-64gb",
            "HRD-ECC-64G",
            "Módulo RAM DDR5 ECC 64GB",
            "hardware",
            184000L,
            2,
            4,
            "Corredor H-02");
    when(productRepository.findById("prod-ram-64gb")).thenReturn(Optional.of(entity));

    assertThatThrownBy(
            () ->
                productService.adjustStock(
                    "prod-ram-64gb", new StockAdjustmentRequest(-5, MovementSource.MANUAL, null)))
        .isInstanceOf(BusinessRuleException.class)
        .hasMessageContaining("HRD-ECC-64G");
  }

  @Test
  void deveLancarNotFoundQuandoProdutoNaoExistir() {
    when(productRepository.findById("inexistente")).thenReturn(Optional.empty());

    assertThatThrownBy(
            () ->
                productService.adjustStock(
                    "inexistente", new StockAdjustmentRequest(2, MovementSource.MANUAL, null)))
        .isInstanceOf(ResourceNotFoundException.class);
  }
}
