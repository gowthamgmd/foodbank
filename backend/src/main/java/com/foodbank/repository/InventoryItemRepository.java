package com.foodbank.repository;

import com.foodbank.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    @Query("SELECT i FROM InventoryItem i WHERE i.expiryDate <= :threshold ORDER BY i.expiryDate ASC")
    List<InventoryItem> findExpiringSoon(LocalDate threshold);

    List<InventoryItem> findByDonorId(Long donorId);
}
