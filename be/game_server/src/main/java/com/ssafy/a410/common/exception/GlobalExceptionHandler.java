package com.ssafy.a410.common.exception;

import com.ssafy.a410.game.service.MessageBroadcastService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.security.Principal;
import java.util.Map;

@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {
    private final MessageBroadcastService messageBroadcastService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @ExceptionHandler(ResponseException.class)
    public ResponseEntity<Map<String, String>> handleResponseException(ResponseException e, Principal principal) {
        ErrorDetail errorDetail = e.getDetail();
        Map<String, String> body = Map.of(
                "detailCode", errorDetail.getDetailCode(),
                "detailMessage", errorDetail.getDetailMessage()
        );
        log.info("ResponseException: {}", errorDetail);
        return ResponseEntity.status(errorDetail.getStatus()).body(body);
    }
}
