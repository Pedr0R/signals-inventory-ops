package com.signals.inventoryops.dto;

import com.signals.inventoryops.domain.entity.ProductEntity;

public record ProductResponse(
    String id,
    String sku,
    String name,
    String category,
    long unitPriceCents,
    int stockQuantity,
    int lowStockThreshold,
    String warehouseZone) {

  public static ProductResponse fromEntity(ProductEntity entity) {
    return new ProductResponse(
        entity.getId(),
        entity.getSku(),
        entity.getName(),
        entity.getCategory(),
        entity.getUnitPriceCents(),
        entity.getStockQuantity(),
        entity.getLowStockThreshold(),
        entity.getWarehouseZone());
  }
}
