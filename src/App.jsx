import { useMemo, useState, useRef, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, OrbitControls, Float, Text3D, Center, useMatcapTexture } from "@react-three/drei"
import { LayerMaterial, Base, Depth, Noise } from 'lamina'
import * as THREE from 'three'

function NameComponent() {
  const [matcap] = useMatcapTexture('6D1616_E6CDBA_DE2B24_230F0F')
  return (
    <Float>
    <Text3D scale={1.2} rotation={[0, -0.4, 0]} font={'./Kanadaka_Regular.json'} castShadow receiveShadow>
      Marj
      <meshMatcapMaterial matcap={matcap} />
    </Text3D>
    </Float>
  )
}

function HeartComponent({ onClick, position, scale }) {
  const heartShape = useMemo(() => {
    const shape = new THREE.Shape();
    const x = -2.5, y = -5;
    shape.moveTo(x + 2.5, y + 2.5);
    shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
    shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
    shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
    shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 5.5, x + 8, y + 3.5);
    shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
    shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    steps: 2, // Number of rendered segments along the extrusion depth, keep it low as it doesn't affect rounding
    depth: 1, // Adjust the depth for a less pronounced extrusion, which can help in making the object look more rounded
    bevelEnabled: true, // Enable bevel to create rounded edges
    bevelThickness: 0.5, // The distance the bevel extends into the shape, a smaller value can create a more subtle rounding
    bevelSize: 0.3, // The distance from the shape outline that the bevel extends, this controls the rounding radius
    bevelOffset: 0, // A negative offset will make the bevel extend into the shape, while a positive one extends it outward
    bevelSegments: 10, // Increase the number of segments to make the bevel smoother and more rounded
  }), []);  

  const geometry = useMemo(() => new THREE.ExtrudeGeometry(heartShape, extrudeSettings), [heartShape]);
  const [matcap] = useMatcapTexture('F77777_FBE1E1_FAB2B2_FBC4C4');

  return (
    <mesh geometry={geometry} position={position} rotation={[Math.PI, 0, 0]} scale={scale} onClick={onClick}>
      <meshMatcapMaterial matcap={matcap} />
    </mesh>
  );
}


function ExplodingHearts({ position, scale }) {
  const [isMoving, setIsMoving] = useState(true);
  const [smallHearts, setSmallHearts] = useState(() => Array.from({ length: 5 }, () => ({
    position: [...position],
    velocity: [Math.random() * 0.15 - 0.05, Math.random() * 0.15 - 0.05, 0],
  })));

  useFrame(() => {
    if (isMoving) {
      setSmallHearts((currentHearts) =>
        currentHearts.map((heart) => ({
          ...heart,
          position: heart.position.map((p, i) => p + heart.velocity[i]),
        }))
      );
      if (Math.abs(smallHearts[0].position[0] - position[0]) > 3 || Math.abs(smallHearts[0].position[1] - position[1]) > 3) {
        setIsMoving(false);
      }
    }
  });

  return isMoving ? (
    <group>
      {smallHearts.map((heart, index) => (
        <HeartComponent
          key={index}
          position={heart.position}
          scale={0.5 * scale}
        />
      ))}
    </group>
  ) : null;
}

function HeartsComponent() {
  const [hearts, setHearts] = useState(() => Array.from({ length: 55 }, (_, i) => ({
    id: i,
    position: [Math.random() * 12 - 6, Math.random() * 12 - 6, Math.random() * -1.5 - 1],
    scale: Math.random() * 0.15,
  })));

  const [explodedHearts, setExplodedHearts] = useState([]);

  const explodeHeart = useCallback((id, position, scale) => {
    setHearts((currHearts) => currHearts.filter((heart) => heart.id !== id));
    setExplodedHearts((currExploded) => [...currExploded, { id, position, scale }]);
  }, []);

  return (
    <group>
      {hearts.map((heart) => (
        <HeartComponent
          key={heart.id}
          position={heart.position}
          scale={heart.scale}
          onClick={() => explodeHeart(heart.id, heart.position, heart.scale)}
        />
      ))}
      {explodedHearts.map((exploded, index) => (
        <ExplodingHearts key={index} scale={exploded.scale} position={exploded.position} />
      ))}
    </group>
  );
}


function BackgroundComponent() {
  return (
    <Environment background resolution={64}>
      <mesh scale={100}>
        <sphereGeometry args={[1, 64, 64]} />
        <LayerMaterial side={THREE.BackSide}>
          <Base color="#FF69B4" alpha={1} mode="normal" />
          <Depth colorA="#ffffff" colorB="#8B0000" alpha={0.4} mode="normal" near={0} far={300} origin={[100, 100, 100]} />
          <Noise mapping="local" type="cell" scale={0.6} mode="softlight" />
        </LayerMaterial>
      </mesh>
    </Environment>
  )
}


export default function App() {

  return (
    <>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, window.innerWidth < 700 ? 7 : 5] }} style={{ position: 'absolute', width: '100%', height: '100dvh' }}>
        <OrbitControls minPolarAngle={Math.PI / 1.8} maxPolarAngle={Math.PI / 1.8} />
        <pointLight position={[0, 2, 2]} intensity={2} />
        <ambientLight intensity={1} />
        <Center>
          <NameComponent />
        </Center>
        <HeartsComponent />
        <BackgroundComponent />
      </Canvas>
    </>
  )
}