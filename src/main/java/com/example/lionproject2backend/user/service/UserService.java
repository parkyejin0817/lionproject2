package com.example.lionproject2backend.user.service;

import com.example.lionproject2backend.global.exception.custom.CustomException;
import com.example.lionproject2backend.global.exception.custom.ErrorCode;
import com.example.lionproject2backend.user.domain.User;
import com.example.lionproject2backend.user.dto.GetUserDetailResponse;
import com.example.lionproject2backend.user.dto.PutUserUpdateRequest;
import com.example.lionproject2backend.user.dto.PutUserUpdateResponse;
import com.example.lionproject2backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    /**
     * 내 정보 조회
     * GET /api/user/me
     */
    public GetUserDetailResponse getUser(Long userId) {
        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return new GetUserDetailResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getUserRole(),
                user.getIntroduction());

    }

    /**
     * 내 정보 수정
     * PUT /api/user/me
     */

    @Transactional
    public PutUserUpdateResponse updateUser(Long userId, PutUserUpdateRequest putUserUpdateRequest) {
        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 닉네임 중복 체크
        if (putUserUpdateRequest.getNickname() != null && !putUserUpdateRequest.getNickname().equals(user.getNickname())) {
            if (userRepository.existsByNickname(putUserUpdateRequest.getNickname())) {
                throw new CustomException(ErrorCode.DUPLICATE_NICKNAME);
            }
        }

        // 프로필 업데이트
        user.updateProfile(putUserUpdateRequest.getNickname(), putUserUpdateRequest.getIntroduction());

        return new PutUserUpdateResponse(
                user.getId(),
                user.getNickname(),
                user.getIntroduction());

    }

}
