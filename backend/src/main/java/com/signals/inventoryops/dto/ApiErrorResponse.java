package com.signals.inventoryops.dto;

import java.time.Instant;
import java.util.List;

public record ApiErrorResponse(
    int status,
    String error,
    String message,
    List<String> details,
    Instant timestamp) {

  public static ApiErrorResponse of(int status, String error, String message, List<String> details) {
    List<String> safeDetails = details == null ? List.of() : List.copyOf(details);
    return new ApiErrorResponse(status, error, message, safeDetails, Instant.now());
  }
}
