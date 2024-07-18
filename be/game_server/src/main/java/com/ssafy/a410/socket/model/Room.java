package com.ssafy.a410.socket.model;

public class Room {
    private static final IdGeneratingStrategy idGeneratingStrategy = IdGeneratingStrategy.getNumericIdGenerator(4);

    private final String id;
    private final String name;
    private final String password;

    public Room(String name) {
        this(idGeneratingStrategy, name, null);
    }

    public Room(String name, String password) {
        this(idGeneratingStrategy, name, password);
    }

    public Room(IdGeneratingStrategy idGeneratingStrategy, String name, String password) {
        this.id = idGeneratingStrategy.generate();
        this.name = name;
        this.password = password;
    }

    public String getId() {
        return this.id;
    }

    public String getName() {
        return this.name;
    }

    public String getPassword() {
        return this.password;
    }
}
