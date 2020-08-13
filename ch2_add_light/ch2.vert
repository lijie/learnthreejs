varying vec2 v_uv;
varying vec3 v_normal;
  
void main() {
    v_uv = uv;
    v_normal = normalize(normalMatrix * normal);
  
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
}
