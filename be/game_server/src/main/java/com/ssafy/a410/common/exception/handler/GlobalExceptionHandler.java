package com.ssafy.a410.exception;

import com.ssafy.a410.common.exception.handler.GameException;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(GameException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleGameException(GameException e) {
        return e.getMessage();
    }

    @MessageExceptionHandler(GameException.class)
    public String handleWebSocketGameException(GameException e) {
        return e.getMessage();
    }
}
