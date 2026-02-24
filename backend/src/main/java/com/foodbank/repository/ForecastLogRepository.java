package com.foodbank.repository;

import com.foodbank.model.ForecastLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ForecastLogRepository extends JpaRepository<ForecastLog, Long> {
}
