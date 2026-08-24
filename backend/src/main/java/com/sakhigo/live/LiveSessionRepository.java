package com.sakhigo.live;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface LiveSessionRepository extends JpaRepository<LiveSession, UUID> {
    Optional<LiveSession> findByShareToken(String shareToken);
    long deleteByExpiresAtBefore(Instant time);
}
