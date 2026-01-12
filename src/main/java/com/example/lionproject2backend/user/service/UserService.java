package com.example.lionproject2backend.user.service;

import com.example.lionproject2backend.user.domain.User;
import com.example.lionproject2backend.user.dto.UserGetResponse;
import com.example.lionproject2backend.user.dto.UserUpdateRequest;
import com.example.lionproject2backend.user.dto.UserUpdateResponse;
import com.example.lionproject2backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public UserGetResponse getUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return new UserGetResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getUserRole(),
                user.getIntroduction());

    }

    @Transactional
    public UserUpdateResponse updateUser(Long userId, UserUpdateRequest userUpdateRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (userUpdateRequest.getNickname() != null && !userUpdateRequest.getNickname().equals(user.getNickname())) {
            if (userRepository.existsByNickname(userUpdateRequest.getNickname())) {
                throw new IllegalArgumentException("이미 사용 중인 닉네임 입니다.");
            }
        }

        user.updateProfile(userUpdateRequest.getNickname(), userUpdateRequest.getIntroduction());

        return new UserUpdateResponse(
                user.getId(),
                user.getNickname(),
                user.getIntroduction());

    }

}
