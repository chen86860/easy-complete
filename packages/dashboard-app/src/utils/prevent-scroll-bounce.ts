import type React from "react";

export function preventScrollBounce(event: React.WheelEvent<HTMLElement>) {
  const target = event.currentTarget;
  const canScroll = target.scrollHeight > target.clientHeight;

  if (!canScroll) {
    event.preventDefault();
    return;
  }

  const atTop = target.scrollTop <= 0;
  const atBottom =
    Math.ceil(target.scrollTop + target.clientHeight) >= target.scrollHeight;

  if ((event.deltaY < 0 && atTop) || (event.deltaY > 0 && atBottom)) {
    event.preventDefault();
  }
}
