'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uDarkMode;
varying vec2 vUv;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float time = uTime * 0.25;

  vec2 mouse = uMouse;

  float wave1 = sin(uv.x * 4.0 + time) * cos(uv.y * 3.0 + time * 0.7);
  float wave2 = sin(uv.y * 5.0 - time * 0.6) * cos(uv.x * 3.5 + time * 0.4);
  float wave3 = sin((uv.x + uv.y) * 3.0 + time * 0.9);
  float wave4 = sin(length(uv - 0.5) * 6.0 - time * 0.5);

  float dist = length(uv - mouse);
  float mouseInfluence = 0.15 * exp(-dist * 4.0);
  time += mouseInfluence;

  wave1 = sin(uv.x * 4.0 + time) * cos(uv.y * 3.0 + time * 0.7);
  wave2 = sin(uv.y * 5.0 - time * 0.6) * cos(uv.x * 3.5 + time * 0.4);
  wave3 = sin((uv.x + uv.y) * 3.0 + time * 0.9);
  wave4 = sin(length(uv - 0.5) * 6.0 - time * 0.5);

  float pattern = (wave1 + wave2 + wave3 + wave4) / 4.0;
  pattern = pattern * 0.5 + 0.5;

  vec3 color1 = vec3(0.0, 0.184, 0.204);
  vec3 color2 = vec3(0.0, 0.478, 0.510);
  vec3 color3 = vec3(0.0, 0.635, 0.604);

  vec3 dark1 = vec3(0.059, 0.102, 0.110);
  vec3 dark2 = vec3(0.0, 0.318, 0.341);
  vec3 dark3 = vec3(0.0, 0.478, 0.455);

  vec3 c1 = mix(color1, dark1, uDarkMode);
  vec3 c2 = mix(color2, dark2, uDarkMode);
  vec3 c3 = mix(color3, dark3, uDarkMode);

  vec3 color = mix(c1, c2, pattern);
  color = mix(color, c3, sin(pattern * 3.14159) * 0.4);

  float vignette = 1.0 - length(uv - 0.5) * 0.3;
  color *= vignette;

  gl_FragColor = vec4(color, 1.0);
}
`;

export default function HeroBackground() {
  const canvasRef = useRef(null);
  const darkCheckRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: true,
    });

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const getDarkMode = () =>
      document.documentElement.getAttribute('data-theme') === 'dark' ? 1 : 0;

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(canvas.clientWidth, canvas.clientHeight) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uDarkMode: { value: getDarkMode() },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const handleResize = () => {
      const parent = canvas.parentElement;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      renderer.setSize(w, h, false);
      uniforms.uResolution.value.set(w, h);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      uniforms.uMouse.value.set(x, y);
    };
    window.addEventListener('mousemove', handleMouse);

    darkCheckRef.current = setInterval(() => {
      uniforms.uDarkMode.value = getDarkMode();
    }, 500);

    let animationId;
    const clock = new THREE.Clock();
    const animate = () => {
      uniforms.uTime.value += clock.getDelta();
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouse);
      if (darkCheckRef.current) clearInterval(darkCheckRef.current);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-3d-canvas"
    />
  );
}
