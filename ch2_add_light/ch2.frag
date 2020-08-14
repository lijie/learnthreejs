#if NUM_DIR_LIGHTS > 0
struct DirectionalLight {
    vec3 direction;
    vec3 color;
};
uniform DirectionalLight directionalLights[NUM_DIR_LIGHTS];
#endif

uniform sampler2D map;
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
    vec4 diffuse = texture(map, v_uv);

    vec3 eyeDirection = -(v_position.xyz);
    vec3 halfwayDirection   = normalize(unitDirectionLight + eyeDirection);
    float specularIntensity = clamp(dot(v_normal, halfwayDirection), 0.0, 1.0);

    // 环境光
    vec3 ambient = ambientLightColor * diffuse.rgb * 1.0;

    // 计算最终输出
    vec3 diffuseColor = diffuse.rgb * lightColor * diffuseIntensity;
    vec3 ambientColor = ambient.rgb;
    // vec3 specularColor = lightColor * pow(specularIntensity, 128.0);
    vec3 specularColor = vec3(0, 0, 0);

    gl_FragColor = vec4(ambientColor + diffuseColor + specularColor, 1.0);
}
