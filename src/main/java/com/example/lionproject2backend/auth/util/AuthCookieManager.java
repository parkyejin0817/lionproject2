package com.example.lionproject2backend.auth.util;

import com.example.lionproject2backend.auth.cookie.CookieProperties;
import com.example.lionproject2backend.auth.cookie.CookieUtil;
import com.example.lionproject2backend.global.security.jwt.JwtProperties;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthCookieManager {

    private final CookieProperties cookieProperties;
    private final JwtProperties jwtProperties;

    public void addRefreshToken(HttpServletResponse response, String refreshToken) {
        response.addHeader(
                HttpHeaders.SET_COOKIE,
                CookieUtil.createRefreshCookie(
                        cookieProperties,
                        refreshToken,
                        jwtProperties.getRefreshExpMs()
                ).toString()
        );
    }

    public void deleteRefreshToken(HttpServletResponse response) {
        response.addHeader(
                HttpHeaders.SET_COOKIE,
                CookieUtil.deleteRefreshCookie(cookieProperties).toString()
        );
    }
}
