package com.example.lionproject2backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PutUserUpdateResponse {

    private Long id;
    private String nickname;
    private String introduction;
}
