uniform sampler2D map;
uniform vec3 ambientLightColor;
varying vec2 texture_uv;

void main() {
    vec4 diffuse = texture(map, texture_uv);
    gl_FragColor = vec4(diffuse.rgb * ambientLightColor.rgb, 1.0);
}
