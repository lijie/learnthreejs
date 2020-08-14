varying vec2 v_uv;
varying vec3 v_normal;
varying vec4 v_position;
  
void main() {
    v_uv = uv;
    v_normal = normalize(normalMatrix * normal);
    v_position = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * v_position;
}
