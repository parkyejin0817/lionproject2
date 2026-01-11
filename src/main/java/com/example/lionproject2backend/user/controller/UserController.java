package com.example.lionproject2backend.user.controller;

import com.example.lionproject2backend.global.response.ApiResponse;
import com.example.lionproject2backend.user.dto.UserGetResponse;
import com.example.lionproject2backend.user.dto.UserUpdateRequest;
import com.example.lionproject2backend.user.dto.UserUpdateResponse;
import com.example.lionproject2backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


// jwt 구현 후 userId 수정!

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserGetResponse>> getUser() {
        Long userId = 1L;
        UserGetResponse response = userService.getUser(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me")
public ResponseEntity<ApiResponse<UserUpdateResponse>> updateUser(@RequestBody UserUpdateRequest userUpdateRequest) {
    Long userId = 1L;
    UserUpdateResponse response = userService.updateUser(userId, userUpdateRequest);
    return ResponseEntity.ok(ApiResponse.success(response));
    }
}

