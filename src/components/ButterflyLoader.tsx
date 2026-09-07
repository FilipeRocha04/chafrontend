import butterfly from "@/assets/butterfly.png";

export function ButterflyLoader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <img
        src={butterfly}
        alt=""
        aria-hidden="true"
        width={768}
        height={768}
        className="animate-butterfly w-12"
      />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );
}
