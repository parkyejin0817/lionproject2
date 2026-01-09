package com.example.lionproject2backend.global.exception;


import com.example.lionproject2backend.global.exception.custom.CustomException;
import com.example.lionproject2backend.global.exception.custom.ErrorCode;
import com.example.lionproject2backend.global.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiResponse<Void>> handleCustomException(CustomException e) {

        ErrorCode errorCode = e.getErrorCode();
        log.error("CustomException 발생: {}", errorCode.getMessage());

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ApiResponse.fail(errorCode.getCode(), errorCode.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException e) {

        FieldError fieldError = e.getBindingResult().getFieldError();

        String message = fieldError.getField() + " : " + fieldError.getDefaultMessage();

        return ResponseEntity
                .status(ErrorCode.INVALID_INPUT_VALUE.getStatus())
                .body(ApiResponse.fail(
                        ErrorCode.INVALID_INPUT_VALUE.getCode(),
                        message
                ));
    }


}
