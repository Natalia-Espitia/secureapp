package com.arep.secureapp.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class AuthServiceTests {

    @Test
    void registerCreatesUser() {
        AuthService service = new AuthService();
        service.register(new AuthRequest("alice", "secure-pass"));
        assertEquals(1, service.userCount());
    }

    @Test
    void registerRejectsDuplicateUser() {
        AuthService service = new AuthService();
        service.register(new AuthRequest("alice", "secure-pass"));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.register(new AuthRequest("alice", "another-pass")));

        assertEquals("User already exists", exception.getMessage());
    }

    @Test
    void loginWithInvalidPasswordFails() {
        AuthService service = new AuthService();
        service.register(new AuthRequest("alice", "secure-pass"));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.login(new AuthRequest("alice", "wrong-pass")));

        assertEquals("Invalid credentials", exception.getMessage());
    }
}
