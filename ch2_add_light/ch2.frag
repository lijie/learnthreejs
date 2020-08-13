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

void main() {
    vec3 unitDirectionLight = normalize(directionalLights[0].direction);
    vec3 lightColor = directionalLights[0].color;
    float diffuseIntensity = dot(v_normal, unitDirectionLight);
    vec4 diffuse = texture(map, v_uv);
    gl_FragColor = vec4(diffuse.rgb * lightColor * diffuseIntensity, 1.0);
}
