package com.signals.inventoryops.exception;

import com.signals.inventoryops.dto.ApiErrorResponse;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ApiErrorResponse> handleNotFound(ResourceNotFoundException ex) {
    ApiErrorResponse body =
        ApiErrorResponse.of(HttpStatus.NOT_FOUND.value(), "Not Found", ex.getMessage(), List.of());
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
  }

  @ExceptionHandler(BusinessRuleException.class)
  public ResponseEntity<ApiErrorResponse> handleBusinessRule(BusinessRuleException ex) {
    ApiErrorResponse body =
        ApiErrorResponse.of(
            HttpStatus.BAD_REQUEST.value(), "Business Rule Violation", ex.getMessage(), List.of());
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
  }

  @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
  public ResponseEntity<ApiErrorResponse> handleOptimisticLock(
      ObjectOptimisticLockingFailureException ex) {
    ApiErrorResponse body =
        ApiErrorResponse.of(
            HttpStatus.CONFLICT.value(),
            "Concurrent Modification",
            "O estoque deste produto foi atualizado simultaneamente por outra operação.",
            List.of());
    return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
  }

  @Override
  protected ResponseEntity<Object> handleMethodArgumentNotValid(
      MethodArgumentNotValidException ex,
      HttpHeaders headers,
      HttpStatusCode status,
      WebRequest request) {
    List<String> details =
        ex.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .toList();
    ApiErrorResponse body =
        ApiErrorResponse.of(
            HttpStatus.BAD_REQUEST.value(),
            "Validation Failed",
            "Dados inválidos na requisição.",
            details);
    return ResponseEntity.badRequest().body(body);
  }
}
