package com.example.lionproject2backend.global.bootstrap;

import com.example.lionproject2backend.user.domain.User;
import com.example.lionproject2backend.user.domain.UserRole;
import com.example.lionproject2backend.user.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("local")
@RequiredArgsConstructor
public class LocalUserSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void seed() {
        if (!userRepository.existsByEmail("local@test.com")) {
            userRepository.save(
                    User.create(
                            "local@test.com",
                            passwordEncoder.encode("test1234"),
                            "local_tester",
                            UserRole.MENTEE)
            );
        }
    }
}

