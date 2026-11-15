uniform float uTime;
uniform float uSelected;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;

varying vec3 vColor;
varying vec3 vNormal;
varying float vActivity;
varying float vPhase;
varying float vFog;
varying vec3 vBody;
varying float vApparent;
varying float vId;

void main() {
  vec3 n = normalize(vNormal);
  // Light from the surface above, plus a soft rim so silhouettes read against dark water.
  float down = 0.5 + 0.5 * n.y;
  float rim = pow(1.0 - abs(n.z), 2.5);
  float countershade = smoothstep(-0.12, 0.12, vBody.y); // darker back, paler belly reads inverted underwater
  vec3 base = vColor * (0.16 + 0.55 * down) * mix(1.0, 0.82, countershade) + vColor * rim * 0.22;

  // Bioluminescence (PRD §5): active repos pulse bright, dormant ones stay dim and slow.
  float rate = 0.6 + 3.2 * vActivity;
  float pulse = 0.55 + 0.45 * sin(uTime * rate + vPhase * 31.0 - vBody.x * 3.0);
  float glow = vActivity * vActivity * pulse;
  base *= 0.5 + 0.5 * vActivity;

  // Far away the whole fish glows (so a speck still reads as alive); up close the
  // light gathers into a lateral line of photophores instead of washing out the body.
  float near = smoothstep(0.04, 0.35, vApparent);
  vec2 g = vec2(fract(vBody.x * 15.0) - 0.5, (vBody.y + 0.035) * 15.0);
  float spot = (1.0 - smoothstep(0.16, 0.3, length(g))) * step(-0.36, vBody.x) * step(vBody.x, 0.4);
  float wash = mix(1.1, 0.22, near);
  vec3 col = base + vColor * glow * (wash + spot * 2.4 * near);

  // Eye.
  float eye = 1.0 - smoothstep(0.011, 0.017, length(vec2(vBody.x - 0.39, vBody.y - 0.02)));
  col = mix(col, vec3(0.002, 0.004, 0.008), eye * step(0.02, abs(vBody.z)));

  if (abs(vId - uSelected) < 0.5) col += vColor * 0.18 + vec3(0.02, 0.05, 0.06) * (1.0 - near);

  float fog = smoothstep(uFogNear, uFogFar, vFog);
  gl_FragColor = vec4(mix(col, uFogColor, fog), 1.0);
}
