// 200-300 plankton motes drifting upward, wrapped in a box that follows the camera.
attribute float aSeed;
uniform float uTime;
uniform vec3 uCam;
uniform float uBox;
uniform float uPixelRatio;
varying float vAlpha;

void main() {
  vec3 drift = vec3(sin(uTime * 0.13 + aSeed * 40.0) * 6.0, uTime * (3.0 + aSeed * 4.0), cos(uTime * 0.11 + aSeed * 23.0) * 6.0);
  vec3 rel = mod(position + drift - uCam + uBox * 0.5, uBox) - uBox * 0.5;
  vec4 mv = modelViewMatrix * vec4(uCam + rel, 1.0);
  gl_Position = projectionMatrix * mv;
  float edge = 1.0 - smoothstep(0.32, 0.5, max(abs(rel.x), max(abs(rel.y), abs(rel.z))) / uBox);
  float twinkle = 0.45 + 0.55 * pow(0.5 + 0.5 * sin(uTime * (1.2 + aSeed * 2.5) + aSeed * 60.0), 3.0);
  vAlpha = edge * twinkle;
  gl_PointSize = (2.2 + aSeed * 3.6) * uPixelRatio * (260.0 / -mv.z);
}
