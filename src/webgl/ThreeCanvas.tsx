import { Canvas } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import { useData } from '../state';
import { AttributeNames } from '../modelDefinition/enums/attributeNames';
import { parserObjects } from '../modelDefinition/model';
import { ShaderMaterial } from 'three';
import fsSource from 'src/Shaders/spiralFragmentShader.glsl?raw';
import vsSource from 'src/Shaders/spiralVertexShader.glsl?raw';
import { getFragmentShader } from './shaderConstructor';

const size = 1000;

// prettier-ignore
const vertices = new Float32Array([
  -size, -size, 0,
  size, -size, 0,
  size, size, 0,
  size, size, 0,
  -size, size, 0, 
  -size, -size, 0
]);

// prettier-ignore
const uvs = new Float32Array([
  -size, -size,
  size, -size,
  size, size,
  size, size,
  -size, size, 
  -size, -size
]);

const Plane = (...props: any) => {
  const fShader = getFragmentShader(props[0].data);

  const materialRef = useRef<ShaderMaterial>(null);

  useEffect(() => {
    if (materialRef.current) materialRef.current.needsUpdate = true;
  }, [props[0].data]);

  return (
    <mesh scale={props[0].scale} rotateZ={props[0].rotation} {...props}>
      <bufferGeometry>
        <bufferAttribute attach='attributes-position' count={6} array={vertices} itemSize={3} />
        <bufferAttribute attach='attributes-uv' count={6} array={uvs} itemSize={2} />
      </bufferGeometry>
      <shaderMaterial needsUpdate={true} ref={materialRef} fragmentShader={fShader} vertexShader={vsSource} />
    </mesh>
  );
};

export const ThreeCanvas: React.FC = () => {
  const data = useData((s) => s.data);

  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('100%');

  const handleZoomAndRotation = (zoomScale?: number, rotateAngle?: number) => {
    const zoomEntry = (useData.getState().data[AttributeNames.Viewport] as any)[AttributeNames.MousePosition][AttributeNames.ZoomLevel];
    const rotateEntry = (useData.getState().data[AttributeNames.Viewport] as any)[AttributeNames.MousePosition][AttributeNames.Rotation];

    if (zoomScale) useData.getState().setData(parserObjects.updater(useData.getState().data, { ...zoomEntry, value: zoomEntry.value * zoomScale }));
    if (rotateAngle)
      useData
        .getState()
        .setData(
          parserObjects.updater(useData.getState().data, { ...rotateEntry, value: (rotateEntry.value + rotateAngle + rotateEntry.max) % rotateEntry.max })
        );
  };

  const handleWidthHeight = () => {
    const data = useData.getState().data[AttributeNames.Viewport];
    const hasCanvasDimensionsDefined = !(data as any)[AttributeNames.CanvasFullScreen].s.value;

    setWidth(hasCanvasDimensionsDefined ? (data as any)[AttributeNames.CanvasFullScreen].v[AttributeNames.CanvasWidth].value : '100%');
    setHeight(hasCanvasDimensionsDefined ? (data as any)[AttributeNames.CanvasFullScreen].v[AttributeNames.CanvasHeight].value : '100%');
  };

  useEffect(() => {
    handleWidthHeight();
  }, [data]);

  useEffect(() => {
    handleWidthHeight();
    handleZoomAndRotation();

    const onResize = () => handleWidthHeight();
    const onWheel = (e: WheelEvent) => {
      if (e.shiftKey) handleZoomAndRotation(undefined, (e.deltaX < 0 ? 0.5 : -0.5) * (e.altKey ? 0.1 : 1));
      else if (e.deltaY) handleZoomAndRotation(1 + (e.deltaY < 0 ? 0.15 : -0.15) * (e.altKey ? 0.1 : 1));
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('wheel', onWheel);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('wheel', onWheel);
    };
  }, []);

  return (
    <Canvas orthographic camera={{ zoom: 100, position: [0, 0, 1] }} style={{ width, height }}>
      <Plane data={data} />
    </Canvas>
  );
};
