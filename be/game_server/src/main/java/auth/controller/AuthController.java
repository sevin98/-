package auth.controller;

import auth.controller.dto.GuestSignUpRequest;
import auth.controller.dto.GuestSignUpResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @PostMapping("/guest/sign-up")
    public GuestSignUpResponse guestSignUp(GuestSignUpRequest requestDTO) {
        return null;
    }
}
