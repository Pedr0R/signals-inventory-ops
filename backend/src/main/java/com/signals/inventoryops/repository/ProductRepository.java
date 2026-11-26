package com.signals.inventoryops.repository;

import com.signals.inventoryops.domain.entity.ProductEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<ProductEntity, String> {

  List<ProductEntity> findAllByOrderByNameAsc();
}
