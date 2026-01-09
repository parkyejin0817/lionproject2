package com.example.lionproject2backend.auth.repository;

import com.example.lionproject2backend.auth.domain.RefreshTokenStorage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenStorageRepository extends JpaRepository<RefreshTokenStorage, Long> {
}
