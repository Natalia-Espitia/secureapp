package com.arep.secureapp.auth;

import java.time.Instant;

public record UserRecord(String username, String passwordHash, Instant createdAt) {
}
