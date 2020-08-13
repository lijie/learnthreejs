varying vec2 texture_uv;
  
void main() {
    texture_uv = uv;
  
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
}
