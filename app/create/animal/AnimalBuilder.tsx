"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Text as KonvaText,
  Transformer,
  Rect,
} from "react-konva";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { TabBar } from "@/app/_components/TabBar";
import { ANIMALS, ANIMAL_LABEL, animalSrc, type AnimalId } from "@/lib/assets";

/** 캔버스 좌표계(4:5 인쇄 비율, A4 친화). 화면에 맞춰 CSS로 스케일. */
const STAGE_W = 400;
const STAGE_H = 500;
const ITEM_SIZE = 160;

type AnimalItem = {
  id: string;
  kind: "animal";
  src: string;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
};
type TextItem = {
  id: string;
  kind: "text";
  text: string;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
};
type Item = AnimalItem | TextItem;

export default function AnimalBuilder() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // 선택 변경 시 transformer 부착
  useEffect(() => {
    const layer = layerRef.current;
    const tr = transformerRef.current;
    if (!layer || !tr) return;
    if (!selectedId) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }
    const node = layer.findOne(`#${selectedId}`);
    if (node) {
      tr.nodes([node]);
      tr.getLayer()?.batchDraw();
    }
  }, [selectedId, items]);

  function addAnimal(id: AnimalId) {
    const newItem: AnimalItem = {
      id: `a${Date.now()}`,
      kind: "animal",
      src: animalSrc(id),
      x: STAGE_W / 2 - ITEM_SIZE / 2,
      y: STAGE_H / 2 - ITEM_SIZE / 2,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
    };
    setItems((s) => [...s, newItem]);
    setSelectedId(newItem.id);
  }

  function addText() {
    const text = window.prompt("어떤 글자를 넣을까요?", "");
    const trimmed = text?.trim() ?? "";
    if (!trimmed) return;
    const newItem: TextItem = {
      id: `t${Date.now()}`,
      kind: "text",
      text: trimmed.slice(0, 30),
      x: STAGE_W / 2 - 80,
      y: STAGE_H / 2 - 20,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
    };
    setItems((s) => [...s, newItem]);
    setSelectedId(newItem.id);
  }

  function deleteSelected() {
    if (!selectedId) return;
    setItems((s) => s.filter((i) => i.id !== selectedId));
    setSelectedId(null);
  }

  function updateItem(id: string, patch: Partial<Item>) {
    setItems((s) =>
      s.map((it) => (it.id === id ? ({ ...it, ...patch } as Item) : it)),
    );
  }

  function checkDeselect(e: KonvaEventObject<MouseEvent | TouchEvent>) {
    // 배경(Stage 또는 흰 사각형)을 탭하면 선택 해제
    const target = e.target;
    if (target === target.getStage() || target.name() === "bg") {
      setSelectedId(null);
    }
  }

  async function onDownload() {
    setSelectedId(null);
    await new Promise((r) => requestAnimationFrame(r));
    const stage = stageRef.current;
    if (!stage) return;
    const dataUrl = stage.toDataURL({ pixelRatio: 2, mimeType: "image/png" });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "그림자유-도안.png";
    a.click();
  }

  return (
    <>
      <header className="flex items-center justify-between px-5 pt-6">
        <Link href="/create" className="text-sm font-medium text-stone-500">
          ← 만들기
        </Link>
        <div className="flex items-center gap-2">
          {selectedId && (
            <button
              type="button"
              onClick={deleteSelected}
              aria-label="삭제"
              className="grid size-9 place-items-center rounded-full bg-stone-100 text-stone-700"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={onDownload}
            disabled={items.length === 0}
            className="rounded-full bg-stone-900 px-4 py-1.5 text-sm font-bold text-white disabled:bg-stone-400"
          >
            받기
          </button>
        </div>
      </header>

      {/* 캔버스 */}
      <section className="px-5 pt-4">
        <div className="mx-auto w-full max-w-sm rounded-2xl bg-white ring-1 ring-stone-200">
          <Stage
            ref={stageRef}
            width={STAGE_W}
            height={STAGE_H}
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}
            // 캔버스를 컨테이너 폭에 맞춰 비례 축소. 좌표계는 원본 유지.
            style={{ width: "100%", height: "auto", aspectRatio: `${STAGE_W} / ${STAGE_H}` }}
          >
            <Layer ref={layerRef}>
              <Rect
                name="bg"
                x={0}
                y={0}
                width={STAGE_W}
                height={STAGE_H}
                fill="white"
              />
              {items.map((item) =>
                item.kind === "animal" ? (
                  <AnimalNode
                    key={item.id}
                    item={item}
                    onSelect={() => setSelectedId(item.id)}
                    onChange={(patch) => updateItem(item.id, patch)}
                  />
                ) : (
                  <TextNode
                    key={item.id}
                    item={item}
                    onSelect={() => setSelectedId(item.id)}
                    onChange={(patch) => updateItem(item.id, patch)}
                  />
                ),
              )}
              <Transformer
                ref={transformerRef}
                rotateEnabled
                anchorSize={14}
                borderStroke="#1f1b16"
                anchorStroke="#1f1b16"
                anchorFill="#fffaf3"
                boundBoxFunc={(_, newBox) => {
                  // 너무 작아지는 거 방지
                  if (Math.abs(newBox.width) < 30 || Math.abs(newBox.height) < 30) {
                    return _;
                  }
                  return newBox;
                }}
              />
            </Layer>
          </Stage>
        </div>
        <p className="mt-2 text-center text-xs text-stone-500">
          탭해서 골라요 · 두 손가락으로 크기·회전
        </p>
      </section>

      {/* 도구 트레이: 동물 + 글자 */}
      <section className="px-5 pt-6">
        <h2 className="text-sm font-bold text-stone-700">동물 골라 넣기</h2>
        <ul className="mt-2 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {ANIMALS.map((id) => (
            <li key={id} className="shrink-0">
              <button
                type="button"
                onClick={() => addAnimal(id)}
                className="flex flex-col items-center gap-1 rounded-2xl bg-white px-3 py-2 ring-1 ring-stone-200 active:bg-stone-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={animalSrc(id)}
                  alt=""
                  aria-hidden
                  className="size-12"
                  draggable={false}
                />
                <span className="text-[11px] font-semibold text-stone-700">
                  {ANIMAL_LABEL[id]}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={addText}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-stone-800 ring-1 ring-stone-200 active:bg-stone-50"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 6h16M8 6v14M16 6v14" />
          </svg>
          글자 넣기
        </button>
      </section>

      <TabBar />
    </>
  );
}

/* ---------- 개별 노드 ---------- */

function useHtmlImage(src: string) {
  const [image, setImage] = useState<HTMLImageElement | undefined>();
  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    const onLoad = () => setImage(img);
    img.addEventListener("load", onLoad);
    return () => img.removeEventListener("load", onLoad);
  }, [src]);
  return image;
}

function AnimalNode({
  item,
  onSelect,
  onChange,
}: {
  item: AnimalItem;
  onSelect: () => void;
  onChange: (patch: Partial<AnimalItem>) => void;
}) {
  const image = useHtmlImage(item.src);
  const ref = useRef<Konva.Image>(null);
  if (!image) return null;
  return (
    <KonvaImage
      id={item.id}
      ref={ref}
      image={image}
      x={item.x}
      y={item.y}
      width={ITEM_SIZE}
      height={ITEM_SIZE}
      scaleX={item.scaleX}
      scaleY={item.scaleY}
      rotation={item.rotation}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
      onTransformEnd={() => {
        const node = ref.current;
        if (!node) return;
        onChange({
          x: node.x(),
          y: node.y(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
          rotation: node.rotation(),
        });
      }}
    />
  );
}

function TextNode({
  item,
  onSelect,
  onChange,
}: {
  item: TextItem;
  onSelect: () => void;
  onChange: (patch: Partial<TextItem>) => void;
}) {
  const ref = useRef<Konva.Text>(null);
  return (
    <KonvaText
      id={item.id}
      ref={ref}
      text={item.text}
      fontSize={32}
      fontStyle="bold"
      fontFamily="sans-serif"
      fill="#1f1b16"
      x={item.x}
      y={item.y}
      scaleX={item.scaleX}
      scaleY={item.scaleY}
      rotation={item.rotation}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
      onTransformEnd={() => {
        const node = ref.current;
        if (!node) return;
        onChange({
          x: node.x(),
          y: node.y(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
          rotation: node.rotation(),
        });
      }}
    />
  );
}
