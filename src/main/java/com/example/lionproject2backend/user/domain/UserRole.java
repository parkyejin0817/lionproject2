package com.example.lionproject2backend.user.domain;

public enum UserRole {
    MENTOR,
    MENTEE,
    ADMIN

    ;

    public String getAuthority() {
        return "ROLE_" + name();
    }
}
