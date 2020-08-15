#if NUM_DIR_LIGHTS > 0
struct DirectionalLight {
    vec3 direction;
    vec3 color;
};
uniform DirectionalLight directionalLights[NUM_DIR_LIGHTS];
uniform mat4 directionalShadowMatrix[NUM_DIR_LIGHTS];
#endif

varying vec2 v_uv;
varying vec3 v_normal;
varying vec4 v_position;
varying vec4 v_positionInShadowSpaces[NUM_DIR_LIGHTS];
  
void main() {
    v_uv = uv;
    v_normal = normalize(normalMatrix * normal);
    v_position = modelViewMatrix * vec4(position, 1.0);

    for (int i = 0; i < directionalLights.length(); i++) {
        v_positionInShadowSpaces[i] = directionalShadowMatrix[i] * vec4(position, 1.0);
    }

    gl_Position = projectionMatrix * v_position;
}
