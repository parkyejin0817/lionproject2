package com.example.lionproject2backend.global.security.filter;

import com.example.lionproject2backend.global.exception.custom.ErrorCode;
import com.example.lionproject2backend.global.response.ApiResponse;
import com.example.lionproject2backend.global.security.jwt.JwtUtil;
import com.example.lionproject2backend.global.security.jwt.TokenType;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            try {
                jwtUtil.validate(token);
                jwtUtil.validateType(token, TokenType.ACCESS);

                Authentication auth = jwtUtil.getAuthentication(token);
                SecurityContextHolder.getContext().setAuthentication(auth);

            } catch (ExpiredJwtException e) {
                SecurityContextHolder.clearContext();
                writeError(response, ErrorCode.TOKEN_EXPIRED);
                return;

            } catch (JwtException e) {
                SecurityContextHolder.clearContext();
                writeError(response, ErrorCode.TOKEN_INVALID);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private void writeError(HttpServletResponse response, ErrorCode errorCode)
            throws IOException {

        response.setStatus(errorCode.getStatus().value());
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");

        new ObjectMapper().writeValue(
                response.getWriter(),
                ApiResponse.fail(errorCode)
        );
    }

}
