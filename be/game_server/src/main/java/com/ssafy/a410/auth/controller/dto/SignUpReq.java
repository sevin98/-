package com.ssafy.a410.auth.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SignUpReq (

        @NotBlank(message = "Nickname is required")
        @Size(max = 8, message = "Nickname must be up to 8 characters")
        String nickname,

        @NotBlank(message = "Login ID is required")
        @Pattern(regexp = "^[a-zA-Z0-9]{5,20}$", message = "Login ID must be alphanumeric and up to 20 characters")
        String loginId,

        @NotBlank(message = "Password is required")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$",
                message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
        String password
){
}
