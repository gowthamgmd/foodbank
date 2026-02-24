package com.foodbank.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "forecast_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForecastLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String category;

    @Column(name = "predicted_quantity")
    private Double predictedQuantity;

    @Column(name = "confidence_low")
    private Double confidenceLow;

    @Column(name = "confidence_high")
    private Double confidenceHigh;

    @Column(name = "forecast_date")
    private LocalDate forecastDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
