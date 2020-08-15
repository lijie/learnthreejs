#if NUM_DIR_LIGHTS > 0
struct DirectionalLight {
    vec3 direction;
    vec3 color;
};
uniform DirectionalLight directionalLights[NUM_DIR_LIGHTS];
uniform mat4 directionalShadowMatrix[NUM_DIR_LIGHTS];
struct DirectionalLightShadow {
    float shadowBias;
    float shadowNormalBias;
    vec2 shadowMapSize;
};
DirectionalLightShadow directionalLightShadows[NUM_DIR_LIGHTS];
#endif

varying vec2 v_uv;
varying vec3 v_normal;
varying vec4 v_position;
varying vec4 v_positionInShadowSpaces[NUM_DIR_LIGHTS];

vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
    return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
  
void main() {
    v_uv = uv;
    v_normal = normalize(normalMatrix * normal);
    v_position = modelViewMatrix * vec4(position, 1.0);

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vec3 shadowWorldNormal = inverseTransformDirection(normal, viewMatrix);
    vec4 shadowWorldPosition = worldPosition + vec4(shadowWorldNormal * directionalLightShadows[0].shadowNormalBias, 0);
    v_positionInShadowSpaces[0] = directionalShadowMatrix[0] * shadowWorldPosition;

    // for (int i = 0; i < directionalLights.length(); i++) {
    //     v_positionInShadowSpaces[i] = directionalShadowMatrix[i] * vec4(position, 1.0);
    // }

    gl_Position = projectionMatrix * v_position;
}
