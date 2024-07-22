package com.ssafy.a410.common;

import org.apache.commons.text.StringSubstitutor;

import java.util.Map;

public final class StringUtil {
    private StringUtil() {
    }

    // 중괄호로 둘러싸인 변수를 값으로 치환하여 topic URL을 반환
    public static String getTopicUrl(String destinationFormat, Map<String, String> values) {
        StringSubstitutor sub = new StringSubstitutor(values, "{", "}");
        return sub.replace("/topic" + destinationFormat);
    }
}
