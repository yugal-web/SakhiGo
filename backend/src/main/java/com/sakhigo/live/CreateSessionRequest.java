package com.sakhigo.live;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record CreateSessionRequest(
        @Min(5) @Max(240) Integer durationMinutes
) {}
