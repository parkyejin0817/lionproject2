package com.example.lionproject2backend.user.repository;

import com.example.lionproject2backend.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
