// Depth gradient (PRD §7.1): #0d4a68 at the surface -> #00060f in the abyss.
uniform float uDepthFrac;
uniform float uTime;
varying vec2 vUv;

const vec3 SURFACE = vec3(0.051, 0.290, 0.408); // #0d4a68
const vec3 ABYSS   = vec3(0.0, 0.024, 0.059);   // #00060f

void main() {
  float f = pow(uDepthFrac, 0.55);
  vec3 base = mix(SURFACE, ABYSS, f);
  // Light falls from above: the top of the frame is brighter in shallow water.
  float skyward = smoothstep(0.0, 1.0, vUv.y);
  vec3 lit = base * (0.62 + 0.75 * skyward * (1.0 - f * 0.85));
  // A faint caustic shimmer near the top, gone by mid-depth.
  float shimmer = sin(vUv.x * 23.0 + uTime * 0.6) * sin(vUv.x * 9.0 - uTime * 0.35 + vUv.y * 4.0);
  lit += vec3(0.02, 0.05, 0.06) * shimmer * skyward * skyward * (1.0 - f);
  gl_FragColor = vec4(lit, 1.0);
}
