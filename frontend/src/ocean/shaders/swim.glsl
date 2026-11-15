// Shared swim path + body deformation. Mirrors ocean/motion.ts exactly.
uniform float uTime;
attribute vec3 aHome;
attribute float aSize;     // body length, world units
attribute float aActivity; // 0 dormant .. 1 alive right now
attribute float aPhase;

const float TAU = 6.28318530718;

vec3 swimCentre(out vec3 tangent) {
  float lin = (3.0 + 22.0 * pow(aActivity, 1.5)) / (1.0 + aSize / 80.0);
  float A = 14.0 + aSize * 0.7;
  float w = lin / A;
  float theta = aPhase * TAU + w * uTime + (w / 1.9) * 0.8 * aActivity * sin(uTime * 1.9 + aPhase * 17.0);
  tangent = vec3(-sin(theta), 0.24 * cos(2.0 * theta), 0.3 * cos(theta));
  return aHome + vec3(A * cos(theta), A * 0.12 * sin(2.0 * theta) + sin(uTime * 0.6 + aPhase * 11.0) * 2.0, A * 0.3 * sin(theta));
}

// p: unit body space, head at +x, length 1. Returns world-space offset from the centre.
vec3 swimBody(vec3 p, vec3 tangent, out mat3 rot) {
  // Tail beat: faster for active fish, only behind the midline.
  float beat = sin(uTime * (2.0 + 7.0 * aActivity) + aPhase * 40.0 - p.x * 5.0);
  float tail = smoothstep(0.1, -0.5, p.x);
  p.z += beat * tail * 0.13;
  vec2 h = normalize(tangent.xz + vec2(1e-5, 0.0));
  float pitch = clamp(tangent.y, -0.5, 0.5);
  vec3 fx = normalize(vec3(h.x, pitch, h.y));
  vec3 fz = normalize(cross(fx, vec3(0.0, 1.0, 0.0)));
  vec3 fy = cross(fz, fx);
  rot = mat3(fx, fy, fz);
  return rot * (p * aSize);
}
