import { useRef } from "react";

export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const state = useRef({ dragging: false, startX: 0, startScrollLeft: 0, moved: false });

  function onPointerDown(event: React.PointerEvent<T>) {
    if (event.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;
    state.current = {
      dragging: true,
      startX: event.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false,
    };

    function onMove(moveEvent: PointerEvent) {
      if (!el || !state.current.dragging) return;
      const delta = moveEvent.clientX - state.current.startX;
      if (Math.abs(delta) > 3) state.current.moved = true;
      el.scrollLeft = state.current.startScrollLeft - delta;
    }

    function onUp() {
      state.current.dragging = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function onClickCapture(event: React.MouseEvent<T>) {
    if (state.current.moved) {
      event.preventDefault();
      event.stopPropagation();
      state.current.moved = false;
    }
  }

  function onWheel(event: React.WheelEvent<T>) {
    const el = ref.current;
    if (!el) return;
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      el.scrollLeft += event.deltaY;
    }
  }

  return {
    ref,
    onPointerDown,
    onClickCapture,
    onWheel,
  };
}
