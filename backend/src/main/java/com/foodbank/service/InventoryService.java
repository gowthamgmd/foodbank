package com.foodbank.service;

import com.foodbank.model.InventoryItem;
import com.foodbank.model.enums.QualityStatus;
import com.foodbank.repository.InventoryItemRepository;
import com.foodbank.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryItemRepository inventoryRepo;
    private final UserRepository userRepo;

    public List<InventoryItem> getAll() {
        return inventoryRepo.findAll();
    }

    public List<InventoryItem> getExpiringSoon() {
        return inventoryRepo.findExpiringSoon(LocalDate.now().plusDays(3));
    }

    public InventoryItem create(Map<String, Object> dto) {
        InventoryItem item = buildFromMap(dto, new InventoryItem());
        return inventoryRepo.save(item);
    }

    public InventoryItem update(Long id, Map<String, Object> dto) {
        InventoryItem item = inventoryRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + id));
        return inventoryRepo.save(buildFromMap(dto, item));
    }

    public void delete(Long id) {
        inventoryRepo.deleteById(id);
    }

    private InventoryItem buildFromMap(Map<String, Object> dto, InventoryItem item) {
        if (dto.containsKey("name"))
            item.setName((String) dto.get("name"));
        if (dto.containsKey("category"))
            item.setCategory((String) dto.get("category"));
        if (dto.containsKey("imageUrl"))
            item.setImageUrl((String) dto.get("imageUrl"));
        if (dto.containsKey("quantity"))
            item.setQuantity(((Number) dto.get("quantity")).doubleValue());
        if (dto.containsKey("expiryDate"))
            item.setExpiryDate(LocalDate.parse((String) dto.get("expiryDate")));
        if (dto.containsKey("qualityStatus"))
            item.setQualityStatus(QualityStatus.valueOf((String) dto.get("qualityStatus")));
        if (dto.containsKey("donorId")) {
            Long donorId = ((Number) dto.get("donorId")).longValue();
            userRepo.findById(donorId).ifPresent(item::setDonor);
        }
        return item;
    }
}
