// 6 animated light shafts falling from the surface (PRD §7.1), additive.
uniform float uTime;
uniform float uStrength; // fades out with depth
uniform float uAspect;
varying vec2 vUv;

float shaft(vec2 uv, float centre, float width, float slant, float speed, float seed) {
  float x = (uv.x - 0.5) * uAspect + (1.0 - uv.y) * slant;
  float sway = sin(uTime * speed + seed) * 0.06 + sin(uTime * speed * 0.37 + seed * 3.1) * 0.04;
  float d = abs(x - centre - sway);
  float w = width * (0.6 + 0.4 * (1.0 - uv.y)); // shafts widen as they fall
  float core = 1.0 - smoothstep(0.0, w, d);
  float flicker = 0.75 + 0.25 * sin(uTime * (0.8 + seed * 0.13) + seed * 7.0);
  return core * core * flicker;
}

void main() {
  vec2 uv = vUv;
  float a = 0.0;
  a += shaft(uv, -0.62, 0.07, 0.28, 0.21, 1.0);
  a += shaft(uv, -0.30, 0.04, 0.24, 0.17, 2.3) * 0.8;
  a += shaft(uv, -0.05, 0.10, 0.30, 0.13, 3.7);
  a += shaft(uv,  0.22, 0.05, 0.26, 0.19, 4.1) * 0.7;
  a += shaft(uv,  0.48, 0.08, 0.31, 0.15, 5.9) * 0.9;
  a += shaft(uv,  0.78, 0.035, 0.27, 0.23, 6.6) * 0.6;
  float fall = smoothstep(-0.15, 1.0, uv.y); // brightest near the surface
  vec3 col = vec3(0.25, 0.65, 0.85) * a * fall * uStrength * 0.07;
  gl_FragColor = vec4(col, 1.0);
}
