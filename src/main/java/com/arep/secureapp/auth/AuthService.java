package com.arep.secureapp.auth;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final BCryptPasswordEncoder passwordEncoder;
    private final Map<String, UserRecord> users;

    public AuthService() {
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.users = new ConcurrentHashMap<>();
    }

    public void register(AuthRequest request) {
        validateRequest(request);
        String username = request.username().trim().toLowerCase();

        if (users.containsKey(username)) {
            throw new IllegalArgumentException("User already exists");
        }

        String passwordHash = passwordEncoder.encode(request.password());
        UserRecord record = new UserRecord(username, passwordHash, Instant.now());
        users.put(username, record);
    }

    public void login(AuthRequest request) {
        validateRequest(request);
        String username = request.username().trim().toLowerCase();

        UserRecord record = users.get(username);
        if (record == null) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        boolean matches = passwordEncoder.matches(request.password(), record.passwordHash());
        if (!matches) {
            throw new IllegalArgumentException("Invalid credentials");
        }
    }

    public int userCount() {
        return users.size();
    }

    private static void validateRequest(AuthRequest request) {
        if (request == null || isBlank(request.username()) || isBlank(request.password())) {
            throw new IllegalArgumentException("Username and password are required");
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
