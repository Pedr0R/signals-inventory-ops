package com.signals.inventoryops.repository;

import com.signals.inventoryops.domain.entity.MovementEntity;
import com.signals.inventoryops.domain.enums.MovementCategory;
import com.signals.inventoryops.domain.enums.MovementDirection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MovementRepository extends JpaRepository<MovementEntity, String> {

  @Query(
      """
      SELECT m FROM MovementEntity m
      WHERE (:category IS NULL OR m.category = :category)
        AND (:direction IS NULL OR m.direction = :direction)
      ORDER BY m.occurredAt DESC
      """)
  List<MovementEntity> findFiltered(
      @Param("category") MovementCategory category,
      @Param("direction") MovementDirection direction);
}
