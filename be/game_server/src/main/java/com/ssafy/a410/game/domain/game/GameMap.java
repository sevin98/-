package com.ssafy.a410.game.domain.game;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.ssafy.a410.game.domain.Pos;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.FileCopyUtils;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GameMap {
    private static final String TYPE_KEY = "type";
    private static final String NAME_KEY = "name";
    private static final String LAYER_KEY = "layers";
    private static final String OBJECTS_KEY = "objects";
    private static final String OBJECT_GROUP_KEY = "objectgroup";

    private static final String HP_LAYER_KEY = "HP";
    private static final String RACOON_START_LAYER_KEY = "Racoon-Start";
    private static final String FOX_START_LAYER_KEY = "Fox-Start";

    // 맵 파일의 이름 (경로 및 확장자 제외)
    private final String mapFileName;
    // HP 정보
    private final Map<String, HPObject> hpObjects = new HashMap<>();
    // 너구리 팀이 시작할 수 있는 초기 위치 정보
    private final List<Pos> raccoonStartPos = new ArrayList<>();
    // 여우 팀이 시작할 수 있는 초기 위치 정보
    private final List<Pos> foxStartPos = new ArrayList<>();
    // 읽어서 파싱해 놓은 원본 JSON 객체
    private JsonObject rawJsonObject;

    public GameMap(String mapFileName) throws IOException {
        this.mapFileName = mapFileName;
        setRawJsonObject();
        setFromLayers();
    }

    // 정적 파일로부터 맵 정보를 읽어와서 파싱
    private void setRawJsonObject() throws IOException {
        InputStream inputStream = new ClassPathResource(this.getMapFilePath()).getInputStream();
        String rawJson = FileCopyUtils.copyToString(new InputStreamReader(inputStream));
        this.rawJsonObject = JsonParser.parseString(rawJson).getAsJsonObject();
    }

    private void setFromLayers() {
        JsonArray layers = rawJsonObject.getAsJsonArray(LAYER_KEY);
        for (int layerIdx = 0; layerIdx < layers.size(); layerIdx++) {
            JsonObject layer = layers.get(layerIdx).getAsJsonObject();
            setFromLayerObject(layer);
        }
    }

    // 각 layer에 대해, 각각의 조건을 만족하면 해당 정보를 저장
    private void setFromLayerObject(JsonObject layer) {
        if (isHPLayer(layer)) {
            setHPObjects(layer);
        } else if (isRacoonStartPosLayer(layer)) {
            setRacoonStartPos(layer);
        } else if (isFoxStartPosLayer(layer)) {
            setFoxStartPos(layer);
        }
    }

    // 맵 파일의 경로를 반환
    private String getMapFilePath() {
        return String.format("static/game/maps/%s.json", mapFileName);
    }

    // 주어진 객체가 `objectgroup`인지 확인
    private boolean isObjectGroup(JsonObject layer) {
        return layer.get(TYPE_KEY).getAsString().equals(OBJECT_GROUP_KEY);
    }

    // 해당 layer의 `name` 프로퍼티가 주어진 `name`과 일치하는지 확인
    private boolean hasName(JsonObject layer, String name) {
        return layer.get(NAME_KEY).getAsString().equals(name);
    }

    // HP 정보가 담긴 layer인지 확인
    private boolean isHPLayer(JsonObject layer) {
        return isObjectGroup(layer) && hasName(layer, HP_LAYER_KEY);
    }

    // HP layer 정보를 읽어 HPObject로 변환, 저장
    private void setHPObjects(JsonObject layer) {
        for (JsonElement element : layer.getAsJsonArray(OBJECTS_KEY)) {
            HPObject gameObject = new HPObject(element.getAsJsonObject());
            hpObjects.put(gameObject.getId(), gameObject);
        }
    }

    // 너구리 팀이 시작할 수 있는 초기 위치 정보가 담긴 layer인지 확인
    private boolean isRacoonStartPosLayer(JsonObject layer) {
        return isObjectGroup(layer) && hasName(layer, RACOON_START_LAYER_KEY);
    }

    // 너구리 팀이 시작할 수 있는 초기 위치 정보를 읽어 저장
    private void setRacoonStartPos(JsonObject layer) {
        for (JsonElement element : layer.getAsJsonArray(OBJECTS_KEY)) {
            raccoonStartPos.add(new Pos(element.getAsJsonObject()));
        }
    }

    // 여우 팀이 시작할 수 있는 초기 위치 정보가 담긴 layer인지 확인
    private boolean isFoxStartPosLayer(JsonObject layer) {
        return isObjectGroup(layer) && hasName(layer, FOX_START_LAYER_KEY);
    }

    // 여우 팀이 시작할 수 있는 초기 위치 정보를 읽어 저장
    private void setFoxStartPos(JsonObject layer) {
        for (JsonElement element : layer.getAsJsonArray(OBJECTS_KEY)) {
            foxStartPos.add(new Pos(element.getAsJsonObject()));
        }
    }
}
