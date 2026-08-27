package com.sakhigo.live;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/live-location")
public class LiveLocationController {
    private final LiveSessionService service;

    public LiveLocationController(LiveSessionService service) {
        this.service = service;
    }

    @PostMapping("/sessions")
    public LiveSessionResponse createSession(@Valid @RequestBody CreateSessionRequest request) {
        int duration = request.durationMinutes() == null ? 30 : request.durationMinutes();
        return LiveSessionResponse.from(service.create(duration));
    }

    @PutMapping("/sessions/{token}/location")
    public LiveSessionResponse updateLocation(
            @PathVariable String token,
            @Valid @RequestBody LocationRequest request) {
        return LiveSessionResponse.from(service.updateLocation(token, request));
    }

    @GetMapping("/sessions/{token}")
    public LiveSessionResponse getLocation(@PathVariable String token) {
        return LiveSessionResponse.from(service.getActive(token));
    }

    @DeleteMapping("/sessions/{token}")
    public ResponseEntity<Void> stop(@PathVariable String token) {
        service.stop(token);
        return ResponseEntity.noContent().build();
    }
}
