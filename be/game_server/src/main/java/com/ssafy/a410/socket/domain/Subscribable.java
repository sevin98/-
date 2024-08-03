package com.ssafy.a410.socket.domain;

// 상태 변화를 비동기적으로 수신할 수 있는 객체임을 의미함
public interface Subscribable {
    String getTopic();
}
