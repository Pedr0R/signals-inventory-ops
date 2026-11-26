package com.signals.inventoryops.controller;

import com.signals.inventoryops.dto.ProductResponse;
import com.signals.inventoryops.dto.StockAdjustmentRequest;
import com.signals.inventoryops.service.ProductService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class ProductController {

  private final ProductService productService;

  public ProductController(ProductService productService) {
    this.productService = productService;
  }

  @GetMapping
  public ResponseEntity<List<ProductResponse>> listProducts() {
    return ResponseEntity.ok(productService.listAllProducts());
  }

  @PatchMapping("/{productId}/stock")
  public ResponseEntity<ProductResponse> adjustStock(
      @PathVariable String productId, @Valid @RequestBody StockAdjustmentRequest request) {
    return ResponseEntity.ok(productService.adjustStock(productId, request));
  }
}
