package com.signals.inventoryops;

import static org.assertj.core.api.Assertions.assertThat;

import com.signals.inventoryops.domain.entity.ProductEntity;
import com.signals.inventoryops.domain.enums.MovementCategory;
import com.signals.inventoryops.domain.enums.MovementDirection;
import com.signals.inventoryops.domain.enums.MovementSource;
import com.signals.inventoryops.dto.MovementResponse;
import com.signals.inventoryops.dto.ProductResponse;
import com.signals.inventoryops.dto.StockAdjustmentRequest;
import com.signals.inventoryops.repository.ProductRepository;
import com.signals.inventoryops.service.MovementService;
import com.signals.inventoryops.service.ProductService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class InventoryOpsApplicationTests {

  @Autowired private ProductRepository productRepository;
  @Autowired private ProductService productService;
  @Autowired private MovementService movementService;

  @Test
  void devePersistirAjusteDeEstoqueEGerarHistoricoNoBancoH2() {
    productRepository.save(
        new ProductEntity(
            "prod-test-1",
            "TST-SKU-01",
            "Switch Teste 8P",
            "redes",
            89000L,
            4,
            2,
            "Corredor T-01"));

    ProductResponse updated =
        productService.adjustStock(
            "prod-test-1", new StockAdjustmentRequest(6, MovementSource.MANUAL, "Reposição teste"));

    List<MovementResponse> movements =
        movementService.listMovements(MovementCategory.ESTOQUE, MovementDirection.ENTRADA);

    assertThat(updated.stockQuantity()).isEqualTo(10);
    assertThat(movements).anyMatch(m -> "TST-SKU-01".equals(m.sku()) && m.quantityDelta() == 6);
  }
}
