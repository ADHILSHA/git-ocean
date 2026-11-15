// Diagonal mesh overlay, clipped to the body (PRD §5 netting row).
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
varying vec3 vBody;
varying float vFog;

float line(float v) {
  float f = abs(fract(v) - 0.5);
  float w = fwidth(v) * 1.2;
  return 1.0 - smoothstep(0.0, w + 0.03, f);
}

void main() {
  float k = 9.0;
  float a = line((vBody.x + vBody.y + vBody.z * 0.5) * k);
  float b = line((vBody.x - vBody.y - vBody.z * 0.5) * k);
  float mesh = max(a, b);
  if (mesh < 0.05) discard;
  vec3 rope = vec3(0.62, 0.55, 0.42);
  float fog = smoothstep(uFogNear, uFogFar, vFog);
  gl_FragColor = vec4(mix(rope, uFogColor, fog), mesh * 0.92);
}
