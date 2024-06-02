import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center, useTexture } from '@react-three/drei';
import { Vector3 } from 'three';

const Character = ({ jump, setJump }) => {
    const texture = useTexture('/obsidian_cat_nobg.png');
    const [position, setPosition] = useState(new Vector3(0, -1, 0));
    const [velocity, setVelocity] = useState(0);
    const ref = useRef();

    useEffect(() => {
        if (jump && position.y === -1) {
            setVelocity(0.18);
            setJump(false);
        }
    }, [jump, position.y, setJump]);

    useFrame(() => {
        if (position.y > -1 || velocity !== 0) {
            setVelocity((v) => v - 0.007); // Gravity effect
            setPosition((pos) => new Vector3(pos.x, pos.y + velocity, pos.z));
        }

        if (position.y < -1) {
            setPosition(new Vector3(position.x, -1, position.z));
            setVelocity(0);
        }
    });

    return (
        <Center>
            <mesh ref={ref} position={position.toArray()} scale={1.5}>
                <planeGeometry attach="geometry" args={[1, 1]} />
                <meshBasicMaterial attach="material" map={texture} transparent />
            </mesh>
        </Center>
    );
};

const Obstacle = ({ position }) => {
    const texture = useTexture('/fishfood.png');
    const ref = useRef();

    useFrame(() => {
        ref.current.position.x -= 0.05;
        ref.current.position.y = -0.2;
        if (ref.current.position.x < -10) {
            ref.current.position.x = 10;
        }
    });

    return (
        <mesh ref={ref} position={position}>
            <planeGeometry attach="geometry" args={[0.9, 0.9]} />
            <meshBasicMaterial attach="material" map={texture} transparent />
        </mesh>
    );
};

const JumperGame = () => {
    const [jump, setJump] = useState(false);
    const obstacles = Array.from({ length: 5 }, (_, i) => <Obstacle key={i} position={[i * 5 + 10, -1, 0]} />);

    const handleJump = () => {
        setJump(true);
    };

    return (
        <div className="game-container" onClick={handleJump}>
            <Canvas
                orthographic
                dpr={[1, 2]}
                camera={{ position: [0, 0, 5], zoom: 50 }}
            >
                <pointLight position={[0, 2, 2]} intensity={2} />
                <ambientLight intensity={1} />
                <Center>
                    <Character jump={jump} setJump={setJump} />
                </Center>
                {obstacles}
            </Canvas>
        </div>
    );
};

export default JumperGame;
