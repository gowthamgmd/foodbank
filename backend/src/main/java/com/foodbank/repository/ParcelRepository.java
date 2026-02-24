package com.foodbank.repository;

import com.foodbank.model.Parcel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ParcelRepository extends JpaRepository<Parcel, Long> {
    List<Parcel> findByBeneficiaryIdOrderByCreatedAtDesc(Long beneficiaryId);
}
