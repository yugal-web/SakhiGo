package com.sakhigo.live;

import java.time.Instant;

public record LiveSessionResponse(
        String shareToken,
        boolean active,
        Instant createdAt,
        Instant expiresAt,
        Double latitude,
        Double longitude,
        Double accuracy,
        Instant locationUpdatedAt
) {
    public static LiveSessionResponse from(LiveSession s) {
        return new LiveSessionResponse(
                s.getShareToken(), s.isActive(), s.getCreatedAt(), s.getExpiresAt(),
                s.getLatitude(), s.getLongitude(), s.getAccuracy(), s.getLocationUpdatedAt()
        );
    }
}
