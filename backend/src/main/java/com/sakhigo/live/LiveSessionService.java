package com.sakhigo.live;

import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
public class LiveSessionService {
    private final LiveSessionRepository repository;

    public LiveSessionService(LiveSessionRepository repository) {
        this.repository = repository;
    }

    public LiveSession create(int minutes) {
        int safeMinutes = Math.max(5, Math.min(minutes, 240));

        LiveSession s = new LiveSession();
        s.setId(UUID.randomUUID());
        s.setShareToken(UUID.randomUUID().toString().replace("-", ""));
        s.setCreatedAt(Instant.now());
        s.setExpiresAt(Instant.now().plus(Duration.ofMinutes(safeMinutes)));
        s.setActive(true);
        return repository.save(s);
    }

    public LiveSession getActive(String token) {
        LiveSession s = repository.findByShareToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tracking session not found"));

        if (!s.isActive() || s.getExpiresAt().isBefore(Instant.now())) {
            s.setActive(false);
            repository.save(s);
            throw new ResponseStatusException(HttpStatus.GONE, "Tracking session has ended");
        }
        return s;
    }

    public LiveSession updateLocation(String token, LocationRequest request) {
        LiveSession s = getActive(token);
        s.setLatitude(request.latitude());
        s.setLongitude(request.longitude());
        s.setAccuracy(request.accuracy());
        s.setLocationUpdatedAt(Instant.now());
        return repository.save(s);
    }

    public void stop(String token) {
        LiveSession s = getActive(token);
        s.setActive(false);
        repository.save(s);
    }

    @Scheduled(fixedDelay = 60000)
    public void expireOldSessions() {
        repository.findAll().stream()
                .filter(s -> s.isActive() && s.getExpiresAt().isBefore(Instant.now()))
                .forEach(s -> {
                    s.setActive(false);
                    repository.save(s);
                });
    }
}
