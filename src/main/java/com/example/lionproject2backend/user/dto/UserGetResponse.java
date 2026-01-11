package com.example.lionproject2backend.user.dto;

import com.example.lionproject2backend.user.domain.UserRole;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserGetResponse {

    private Long id;
    private String email;
    private String nickname;
    private UserRole role;
    private String introduction;
}
