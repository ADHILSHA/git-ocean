uniform float uDim;
varying float vAlpha;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float d = length(p);
  float a = smoothstep(0.5, 0.0, d) * vAlpha;
  gl_FragColor = vec4(vec3(0.72, 0.93, 0.9) * uDim, a);
}
