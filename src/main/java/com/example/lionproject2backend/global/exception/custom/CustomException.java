package com.example.lionproject2backend.global.exception.custom;

import lombok.Getter;

@Getter
public class CustomException extends RuntimeException {

    private final ErrorCode errorCode;

    public CustomException(ErrorCode errorCode) {
        super(errorCode.getMessage()); // 부모에도 넣어야 로그를 찍힐 때 좋다.
        this.errorCode = errorCode;
    }
}
