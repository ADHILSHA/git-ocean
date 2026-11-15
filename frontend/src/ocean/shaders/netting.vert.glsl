#include ./swim.glsl

uniform vec2 uCursor;
uniform float uFlee;
uniform float uAspect;
uniform float uTanHalfFov;

varying vec3 vBody;
varying float vFog;

void main() {
  vec3 tangent;
  vec3 centre = swimCentre(tangent);
  // Same flee as the body so the net never slips off its creature.
  vec4 cc = projectionMatrix * viewMatrix * vec4(centre, 1.0);
  vec2 ndc = cc.xy / cc.w;
  vec2 away = (ndc - uCursor) * vec2(uAspect, 1.0);
  float d = length(away);
  float skittish = 1.0 - smoothstep(30.0, 70.0, aSize);
  float push = uFlee * skittish * (1.0 - smoothstep(0.0, 0.42, d)) * (0.42 - min(d, 0.42));
  centre.xy += normalize(away + vec2(1e-4)) * vec2(1.0 / uAspect, 1.0) * push * cc.w * uTanHalfFov * 2.2;

  mat3 rot;
  // Net shell sits just outside the body.
  vec3 world = centre + swimBody(position * 1.06, tangent, rot);
  vec4 mv = viewMatrix * vec4(world, 1.0);
  gl_Position = projectionMatrix * mv;
  vBody = position;
  vFog = -mv.z;
}
