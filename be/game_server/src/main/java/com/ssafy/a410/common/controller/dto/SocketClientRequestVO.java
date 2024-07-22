package com.ssafy.a410.common.controller.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public class SocketClientRequestVO<T> {
    private final String requestId;
    @NotNull
    @Valid
    private final T data;
}
