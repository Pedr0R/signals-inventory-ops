package com.signals.inventoryops.service;

import com.signals.inventoryops.domain.entity.ProductEntity;
import com.signals.inventoryops.domain.enums.MovementCategory;
import com.signals.inventoryops.domain.enums.MovementDirection;
import com.signals.inventoryops.domain.enums.MovementSource;
import com.signals.inventoryops.dto.CreateMovementRequest;
import com.signals.inventoryops.dto.ProductResponse;
import com.signals.inventoryops.dto.StockAdjustmentRequest;
import com.signals.inventoryops.exception.BusinessRuleException;
import com.signals.inventoryops.exception.ResourceNotFoundException;
import com.signals.inventoryops.repository.ProductRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

  private final ProductRepository productRepository;
  private final MovementService movementService;

  public ProductService(ProductRepository productRepository, MovementService movementService) {
    this.productRepository = productRepository;
    this.movementService = movementService;
  }

  @Transactional(readOnly = true)
  public List<ProductResponse> listAllProducts() {
    return productRepository.findAllByOrderByNameAsc().stream()
        .map(ProductResponse::fromEntity)
        .toList();
  }

  @Transactional
  public ProductResponse adjustStock(String productId, StockAdjustmentRequest request) {
    int delta = request.delta();
    if (delta == 0) {
      throw new BusinessRuleException(
          "Delta de estoque inválido: \"0\". Esperado inteiro diferente de zero.");
    }

    ProductEntity product =
        productRepository
            .findById(productId)
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Produto \"" + productId + "\" não encontrado."));

    int nextStock = product.getStockQuantity() + delta;
    if (nextStock < 0) {
      throw new BusinessRuleException(
          "Saldo insuficiente para \""
              + product.getSku()
              + "\": saldo atual "
              + product.getStockQuantity()
              + ", ajuste solicitado "
              + delta
              + ".");
    }

    product.setStockQuantity(nextStock);
    ProductEntity saved = productRepository.save(product);
    movementService.registerMovement(buildStockMovement(saved, request));
    return ProductResponse.fromEntity(saved);
  }

  private CreateMovementRequest buildStockMovement(
      ProductEntity product, StockAdjustmentRequest request) {
    int delta = request.delta();
    MovementDirection direction = delta > 0 ? MovementDirection.ENTRADA : MovementDirection.SAIDA;
    MovementSource source = request.source() == null ? MovementSource.MANUAL : request.source();
    String sign = delta > 0 ? "+" + delta : String.valueOf(delta);
    String details =
        (request.reason() != null && !request.reason().isBlank())
            ? request.reason().trim()
            : product.getWarehouseZone()
                + " · Saldo "
                + sign
                + " un. -> "
                + product.getStockQuantity()
                + " un.";

    return new CreateMovementRequest(
        MovementCategory.ESTOQUE,
        direction,
        "Ajuste de estoque · " + product.getName(),
        details,
        product.getSku(),
        null,
        delta,
        null,
        source);
  }
}
