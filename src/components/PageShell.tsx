import type { ReactNode } from "react";

import garland from "@/assets/floral-garland.png";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <img
        src={garland}
        alt=""
        aria-hidden="true"
        width={1536}
        height={768}
        className="pointer-events-none absolute -top-6 left-1/2 w-[130%] max-w-[820px] -translate-x-1/2 opacity-55"
      />
      <img
        src={garland}
        alt=""
        aria-hidden="true"
        loading="lazy"
        width={1536}
        height={768}
        className="pointer-events-none absolute -bottom-10 left-1/2 w-[130%] max-w-[820px] -translate-x-1/2 rotate-180 opacity-35"
      />
      <div className="relative mx-auto w-full max-w-[600px] px-5 pb-16 pt-14">{children}</div>
    </div>
  );
}
