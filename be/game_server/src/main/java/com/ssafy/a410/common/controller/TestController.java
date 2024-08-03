package com.ssafy.a410.common.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    @GetMapping("/test")
    public String reverseString(@RequestParam String message) {
        return new StringBuilder(message).reverse().toString();
    }
}
