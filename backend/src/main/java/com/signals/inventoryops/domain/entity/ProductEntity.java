package com.signals.inventoryops.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

@Entity
@Table(name = "products")
public class ProductEntity {

  @Id
  @Column(length = 64, nullable = false)
  private String id;

  @Column(length = 40, nullable = false, unique = true)
  private String sku;

  @Column(length = 160, nullable = false)
  private String name;

  @Column(length = 40, nullable = false)
  private String category;

  @Column(name = "unit_price_cents", nullable = false)
  private long unitPriceCents;

  @Column(name = "stock_quantity", nullable = false)
  private int stockQuantity;

  @Column(name = "low_stock_threshold", nullable = false)
  private int lowStockThreshold;

  @Column(name = "warehouse_zone", length = 60, nullable = false)
  private String warehouseZone;

  @Version
  @Column(nullable = false)
  private long version;

  protected ProductEntity() {}

  public ProductEntity(
      String id,
      String sku,
      String name,
      String category,
      long unitPriceCents,
      int stockQuantity,
      int lowStockThreshold,
      String warehouseZone) {
    this.id = id;
    this.sku = sku;
    this.name = name;
    this.category = category;
    this.unitPriceCents = unitPriceCents;
    this.stockQuantity = stockQuantity;
    this.lowStockThreshold = lowStockThreshold;
    this.warehouseZone = warehouseZone;
  }

  public String getId() {
    return id;
  }

  public String getSku() {
    return sku;
  }

  public String getName() {
    return name;
  }

  public String getCategory() {
    return category;
  }

  public long getUnitPriceCents() {
    return unitPriceCents;
  }

  public int getStockQuantity() {
    return stockQuantity;
  }

  public int getLowStockThreshold() {
    return lowStockThreshold;
  }

  public String getWarehouseZone() {
    return warehouseZone;
  }

  public long getVersion() {
    return version;
  }

  public void setStockQuantity(int stockQuantity) {
    this.stockQuantity = stockQuantity;
  }
}
