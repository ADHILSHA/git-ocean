#include ./swim.glsl

uniform vec2 uCursor;   // NDC
uniform float uFlee;    // 0..1, rises while the pointer moves
uniform float uAspect;
uniform float uTanHalfFov;
attribute vec3 aColor;
attribute float aId;

varying vec3 vColor;
varying vec3 vNormal;
varying float vActivity;
varying float vPhase;
varying float vFog;
varying float vBodyX;
varying float vId;

void main() {
  vec3 tangent;
  vec3 centre = swimCentre(tangent);

  // Cursor flee (PRD Flow 2): small fish scatter away from the pointer, large ones ignore it.
  vec4 cc = projectionMatrix * viewMatrix * vec4(centre, 1.0);
  vec2 ndc = cc.xy / cc.w;
  vec2 away = (ndc - uCursor) * vec2(uAspect, 1.0);
  float d = length(away);
  float skittish = 1.0 - smoothstep(30.0, 70.0, aSize);
  float push = uFlee * skittish * (1.0 - smoothstep(0.0, 0.42, d)) * (0.42 - min(d, 0.42));
  centre.xy += normalize(away + vec2(1e-4)) * vec2(1.0 / uAspect, 1.0) * push * cc.w * uTanHalfFov * 2.2;

  mat3 rot;
  vec3 world = centre + swimBody(position, tangent, rot);
  vec4 mv = viewMatrix * vec4(world, 1.0);
  gl_Position = projectionMatrix * mv;

  vColor = aColor;
  vNormal = normalize(rot * normal);
  vActivity = aActivity;
  vPhase = aPhase;
  vBodyX = position.x;
  vId = aId;
  vFog = -mv.z;
}
