package com.dayflow.hrms.controller;

import com.dayflow.hrms.dto.*;
import com.dayflow.hrms.model.User;
import com.dayflow.hrms.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<?>> signup(@Valid @RequestBody SignupRequest request) {
        ApiResponse<Map<String, Object>> response = authService.register(request);
        if (!response.isSuccess()) {
            HttpStatus status = response.getMessage().contains("already exists") ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(response);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestParam("token") String token) {
        ApiResponse<String> response = authService.verifyEmail(token);
        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signin")
    public ResponseEntity<ApiResponse<?>> signin(@Valid @RequestBody SigninRequest request) {
        ApiResponse<AuthResponse> response = authService.login(request);
        if (!response.isSuccess()) {
            HttpStatus status = HttpStatus.UNAUTHORIZED;
            if (response.getMessage().contains("Account not verified")) {
                status = HttpStatus.FORBIDDEN;
            }
            return ResponseEntity.status(status).body(response);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileDto>> getMe(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Authentication required."));
        }
        return ResponseEntity.ok(authService.getUserProfile(user));
    }
}
