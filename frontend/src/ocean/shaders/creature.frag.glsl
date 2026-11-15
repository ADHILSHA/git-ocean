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
varying float vBodyX;
varying float vId;

void main() {
  vec3 n = normalize(vNormal);
  // Light from the surface above, plus a soft rim so silhouettes read against dark water.
  float down = 0.5 + 0.5 * n.y;
  float rim = pow(1.0 - abs(n.z), 2.0);
  vec3 base = vColor * (0.18 + 0.62 * down) + vColor * rim * 0.25;

  // Bioluminescence (PRD §5): active repos pulse bright, dormant ones stay dim and slow.
  float rate = 0.6 + 3.2 * vActivity;
  float pulse = 0.55 + 0.45 * sin(uTime * rate + vPhase * 31.0);
  float glow = vActivity * vActivity * pulse;
  // Dormant fish are visibly duller.
  base *= 0.55 + 0.45 * vActivity;
  vec3 col = base + vColor * glow * 1.9;
  // Brighter head end, like a photophore.
  col += vColor * smoothstep(0.25, 0.48, vBodyX) * glow * 0.8;

  if (abs(vId - uSelected) < 0.5) col += vec3(0.06, 0.12, 0.14) + vColor * 0.5;

  float fog = smoothstep(uFogNear, uFogFar, vFog);
  gl_FragColor = vec4(mix(col, uFogColor, fog), 1.0);
}
