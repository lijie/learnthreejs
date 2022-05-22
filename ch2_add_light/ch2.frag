#if NUM_DIR_LIGHTS > 0
struct DirectionalLight {
    vec3 direction;
    vec3 color;
};
uniform DirectionalLight directionalLights[NUM_DIR_LIGHTS];
#endif

#ifdef USE_MAP
uniform sampler2D map;
#endif
#ifdef USE_COLOR
uniform vec3 color;
#endif
#ifdef USE_SPECULAR_MAP
uniform sampler2D specularMap;
#endif
uniform vec3 ambientLightColor;
varying vec2 v_uv;
varying vec3 v_normal;
varying vec4 v_position;

void main() {
    // 平行光的方向和颜色
    vec3 unitDirectionLight = normalize(directionalLights[0].direction);
    vec3 lightColor = directionalLights[0].color;

    // 漫反射强度和颜色
    float diffuseIntensity = dot(v_normal, unitDirectionLight);
#ifdef USE_MAP
    vec4 diffuse = texture(map, v_uv);
#endif
#ifdef USE_COLOR
    //vec4 diffuse = vec4(color, 1.0);
#endif

    vec3 eyeDirection = -(v_position.xyz);
    vec3 halfwayDirection   = normalize(unitDirectionLight + eyeDirection);
    float specularIntensity = clamp(dot(v_normal, halfwayDirection), 0.0, 1.0);

    // 环境光
    vec3 ambient = ambientLightColor * diffuse.rgb * 1.0;

    // 计算最终输出
    vec3 diffuseColor = diffuse.rgb * lightColor * diffuseIntensity;
    vec3 ambientColor = ambient.rgb;
#ifdef USE_SPECULAR_MAP
    float specularMask = texture(specularMap, v.uv).r;
    vec3 specularColor = mix(vec3(0, 0, 0), lightColor * pow(specularIntensity, 64.0), specularMask);
#else
    vec3 specularColor = vec3(0, 0, 0);
#endif

    gl_FragColor = vec4(ambientColor + diffuseColor + specularColor, 1.0);
}
