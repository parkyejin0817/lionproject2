package com.example.lionproject2backend.auth.dto;


import com.example.lionproject2backend.user.domain.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PostAuthSignupResponse {

    private Long id;

    private String email;

    private String nickname;

    private String role;

    public static PostAuthSignupResponse from(User user) {
        return PostAuthSignupResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .role(user.getUserRole().name())
                .build();
    }
}

