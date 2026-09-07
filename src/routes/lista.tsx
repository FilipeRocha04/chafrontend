import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Gift, Heart, Minus, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import butterfly from "@/assets/butterfly.png";
import { ButterflyLoader } from "@/components/ButterflyLoader";
import { PageShell } from "@/components/PageShell";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  addCommitmentsBulk,
  fetchCategories,
  fetchItems,
  fetchTotals,
  itemLabel,
  type GiftItem,
} from "@/lib/gifts";
import { useDragScroll } from "@/lib/useDragScroll";

export const Route = createFileRoute("/lista")({
  head: () => ({
    meta: [
      { title: "Listinha de presentes — Chá da Maya" },
      {
        name: "description",
        content:
          "Fraldas, mimos para a Maya e mimos para a mamãe Bella. Escolha o que você vai levar para o Chá da Maya.",
      },
      { property: "og:title", content: "Listinha de presentes — Chá da Maya" },
      {
        property: "og:description",
        content: "Escolha um mimo e diga quantas unidades você pretende levar.",
      },
    ],
  }),
  component: ListaPage,
});

type CartEntry = { item: GiftItem; quantity: number };
type FlowStep = "closed" | "picker" | "confirm" | "done";

function QuantityRow({
  item,
  quantity,
  remaining,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  item: GiftItem;
  quantity: number;
  remaining: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}) {
  const soldOut = remaining <= 0 && quantity === 0;
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2.5">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary">
        <Gift className="h-5 w-5 text-secondary-foreground" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
          <p className="min-w-0 flex-1 text-sm font-semibold text-foreground">{item.name}</p>
          {item.size && (
            <span className="inline-block shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-secondary-foreground">
              Tamanho {item.size}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {soldOut ? "Meta já atingida" : `Restam ${remaining}`}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          aria-label={`Remover ${item.name}`}
          onClick={onRemove}
          disabled={quantity === 0}
          className="grid h-8 w-8 place-items-center rounded-full text-destructive disabled:opacity-30"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={`Diminuir quantidade de ${item.name}`}
          onClick={onDecrement}
          disabled={quantity === 0}
          className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-foreground disabled:opacity-30"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="min-w-6 text-center text-sm font-bold">{quantity}</span>
        <button
          type="button"
          aria-label={`Aumentar quantidade de ${item.name}`}
          onClick={onIncrement}
          disabled={quantity >= remaining}
          className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-foreground disabled:opacity-30"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

function ListaPage() {
  const queryClient = useQueryClient();
  const tabsDrag = useDragScroll<HTMLDivElement>();
  const [activeCategory, setActiveCategory] = useState<string>("todos");
  const [search, setSearch] = useState("");

  const [cart, setCart] = useState<Record<string, number>>({});
  const [step, setStep] = useState<FlowStep>("closed");
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerCategory, setPickerCategory] = useState<string>("todos");

  const [guestName, setGuestName] = useState("");
  const [nameMissing, setNameMissing] = useState(false);
  const [confirmedEntries, setConfirmedEntries] = useState<CartEntry[]>([]);

  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const items = useQuery({ queryKey: ["gift-items"], queryFn: () => fetchItems() });
  const totals = useQuery({ queryKey: ["gift-totals"], queryFn: fetchTotals });

  const cartEntries: CartEntry[] = Object.entries(cart)
    .map(([id, quantity]) => {
      const item = (items.data ?? []).find((candidate) => candidate.id === id);
      return item ? { item, quantity } : null;
    })
    .filter((entry): entry is CartEntry => entry !== null);
  const cartUnits = cartEntries.reduce((sum, entry) => sum + entry.quantity, 0);

  const confirm = useMutation({
    mutationFn: () =>
      addCommitmentsBulk({
        guestName,
        items: cartEntries.map((entry) => ({
          giftItemId: entry.item.id,
          quantity: entry.quantity,
        })),
      }),
    onSuccess: () => {
      setConfirmedEntries(cartEntries);
      setStep("done");
      queryClient.invalidateQueries({ queryKey: ["gift-totals"] });
    },
  });

  function remainingFor(item: GiftItem) {
    const chosen = totals.data?.[item.id] ?? 0;
    return Math.max(0, item.desired_quantity - chosen);
  }

  function setItemQuantity(itemId: string, quantity: number, max = 99) {
    setCart((prev) => {
      if (quantity <= 0) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: Math.min(max, 99, quantity) };
    });
  }

  function openPicker() {
    setPickerSearch("");
    setPickerCategory("todos");
    setStep("picker");
  }

  function openConfirm() {
    setNameMissing(false);
    confirm.reset();
    setStep("confirm");
  }

  function closeFlow() {
    const wasDone = step === "done";
    setStep("closed");
    if (wasDone) {
      setCart({});
      setGuestName("");
    }
  }

  useEffect(() => {
    if (step !== "done") return;
    const timeout = setTimeout(() => {
      setStep("closed");
      setCart({});
      setGuestName("");
    }, 2600);
    return () => clearTimeout(timeout);
  }, [step]);

  const normalizedSearch = search.trim().toLowerCase();

  const visibleItems = (items.data ?? [])
    .filter((item) => {
      const matchesCategory = activeCategory === "todos" || item.category_id === activeCategory;
      const matchesSearch =
        normalizedSearch === "" ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.description?.toLowerCase().includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  const chosenItems = (items.data ?? [])
    .map((item) => ({ item, quantity: totals.data?.[item.id] ?? 0 }))
    .filter(({ quantity }) => quantity > 0)
    .sort((a, b) => a.item.name.localeCompare(b.item.name));

  const tabs = [
    { id: "todos", name: "Todos" },
    ...(categories.data ?? []).map((category) => ({
      id: category.id,
      name: category.name.replace("mamãe Bella", "mamãe"),
    })),
    ...(chosenItems.length > 0
      ? [{ id: "escolhidos", name: `Já escolhidos (${chosenItems.length})` }]
      : []),
  ];

  const showingChosen = activeCategory === "escolhidos";

  const normalizedPickerSearch = pickerSearch.trim().toLowerCase();
  const pickerItems = (items.data ?? [])
    .filter((item) => {
      const matchesCategory = pickerCategory === "todos" || item.category_id === pickerCategory;
      const matchesSearch =
        normalizedPickerSearch === "" ||
        item.name.toLowerCase().includes(normalizedPickerSearch) ||
        item.description?.toLowerCase().includes(normalizedPickerSearch);
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return (
    <PageShell>
      <Link
        to="/inicio"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar
      </Link>

      <header className="mt-4 text-center">
        <h1 className="text-3xl font-medium">Listinha de presentes</h1>
      </header>

      <div className="mt-4 rounded-3xl border border-border bg-card p-6 shadow-petal">
        <Heart className="mx-auto h-5 w-5 text-primary" aria-hidden="true" />
        <p className="mt-3 text-[15px] leading-relaxed text-foreground">
          Escolha quantos mimos quiser e diga quantas unidades pretende levar de cada um. Depois é
          só confirmar tudo de uma vez. 💕
        </p>
      </div>

      <div className="relative mt-6">
        <Search
          className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar um item…"
          aria-label="Buscar um item da listinha"
          className="h-12 rounded-full bg-card pl-11 text-base shadow-petal"
        />
      </div>

      <div
        {...tabsDrag}
        className="scrollbar-hide mt-5 -mx-5 flex cursor-grab gap-2 overflow-x-auto px-5 pb-1 select-none active:cursor-grabbing"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeCategory;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        {items.isLoading && <ButterflyLoader label="Carregando a listinha…" />}
        {items.isError && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Não conseguimos carregar a listinha agora. Tente novamente em instantes.
          </p>
        )}
        {showingChosen ? (
          <section className="rounded-3xl border border-border bg-card p-4 shadow-petal">
            <ul className="divide-y divide-border">
              {chosenItems
                .filter(
                  ({ item }) =>
                    normalizedSearch === "" ||
                    item.name.toLowerCase().includes(normalizedSearch) ||
                    item.description?.toLowerCase().includes(normalizedSearch),
                )
                .map(({ item, quantity }) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <span className="text-sm font-medium text-foreground">{itemLabel(item)}</span>
                    <span className="shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
                      {quantity}
                    </span>
                  </li>
                ))}
            </ul>
          </section>
        ) : (
          <>
            {!items.isLoading && !items.isError && visibleItems.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Nenhum item encontrado para essa busca.
              </p>
            )}
            {visibleItems.map((item) => {
              const chosen = totals.data?.[item.id] ?? 0;
              const inCart = cart[item.id] ?? 0;
              const remaining = Math.max(0, item.desired_quantity - chosen);
              return (
                <article
                  key={item.id}
                  className="rounded-3xl border border-border bg-card p-5 shadow-petal"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-sans text-[17px] leading-snug font-semibold text-foreground">
                      {item.name}
                    </h2>
                    {item.size && (
                      <span className="inline-block shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                        Tamanho {item.size}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {chosen > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        {chosen} {chosen === 1 ? "unidade já escolhida" : "unidades já escolhidas"}
                      </span>
                    )}
                    {inCart > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        Na sua seleção: {inCart}
                      </span>
                    )}
                    {remaining === 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                        Meta já atingida 🎉
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                        Restam {remaining}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </>
        )}
        <div className="h-24" aria-hidden="true" />
      </div>

      <div
        className="fixed inset-x-0 z-30 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] shadow-petal"
        style={{ bottom: "var(--admin-nav-h, 0px)" }}
      >
        <div className="mx-auto flex w-full max-w-[600px] items-center justify-between gap-3 px-5 py-3">
          {cartEntries.length > 0 ? (
            <button
              type="button"
              onClick={openConfirm}
              className="flex flex-1 items-center justify-between gap-3 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              <span>
                Confirmar {cartEntries.length} {cartEntries.length === 1 ? "item" : "itens"}
              </span>
              <span>{cartUnits} un.</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openPicker}
              className="flex-1 text-left text-sm font-semibold text-muted-foreground"
            >
              Selecionar itens
            </button>
          )}
          <button
            type="button"
            onClick={openPicker}
            aria-label="Adicionar produtos"
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-petal"
          >
            <Plus className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Drawer open={step === "picker"} onOpenChange={(open) => !open && closeFlow()}>
        <DrawerContent className="mx-auto flex h-[85vh] max-w-[600px] flex-col border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border px-6 py-4">
            <button
              type="button"
              onClick={closeFlow}
              aria-label="Voltar"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <DrawerHeader className="flex-1 p-0 text-left">
              <DrawerTitle className="font-display text-xl font-medium">
                Adicionar produtos
              </DrawerTitle>
            </DrawerHeader>
            <button
              type="button"
              disabled={cartEntries.length === 0}
              onClick={openConfirm}
              className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              Confirmar ({cartEntries.length})
            </button>
          </div>

          <div className="px-6 pt-4">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={pickerSearch}
                onChange={(event) => setPickerSearch(event.target.value)}
                placeholder="Buscar produto…"
                aria-label="Buscar produto"
                className="h-11 rounded-full bg-background pl-11 text-sm"
              />
            </div>

            <div className="scrollbar-hide -mx-6 mt-3 flex gap-2 overflow-x-auto px-6 pb-1">
              {[
                { id: "todos", name: "Todos" },
                ...(categories.data ?? []).map((category) => ({
                  id: category.id,
                  name: category.name.replace("mamãe Bella", "mamãe"),
                })),
              ].map((category) => {
                const isActive = category.id === pickerCategory;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setPickerCategory(category.id)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          <ul className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto px-6 pb-6">
            {pickerItems.length === 0 && (
              <li className="py-10 text-center text-sm text-muted-foreground">
                Nenhum item encontrado.
              </li>
            )}
            {pickerItems.map((item) => {
              const remaining = remainingFor(item);
              return (
                <QuantityRow
                  key={item.id}
                  item={item}
                  quantity={cart[item.id] ?? 0}
                  remaining={remaining}
                  onIncrement={() => setItemQuantity(item.id, (cart[item.id] ?? 0) + 1, remaining)}
                  onDecrement={() => setItemQuantity(item.id, (cart[item.id] ?? 0) - 1, remaining)}
                  onRemove={() => setItemQuantity(item.id, 0)}
                />
              );
            })}
          </ul>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={step === "confirm" || step === "done"}
        onOpenChange={(open) => !open && closeFlow()}
      >
        <DrawerContent className="mx-auto flex h-[85vh] max-w-[600px] flex-col border-border bg-card">
          {step === "confirm" ? (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
                <button
                  type="button"
                  onClick={openPicker}
                  aria-label="Voltar para os produtos"
                  className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground"
                >
                  <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <DrawerHeader className="flex-1 p-0 text-left">
                  <DrawerTitle className="font-display text-xl font-medium">
                    Confirmar seleção
                  </DrawerTitle>
                </DrawerHeader>
                <button
                  type="button"
                  onClick={closeFlow}
                  aria-label="Fechar"
                  className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                <label htmlFor="guest-name" className="block text-sm font-semibold">
                  Como podemos identificar você?
                </label>
                <Input
                  id="guest-name"
                  value={guestName}
                  onChange={(event) => {
                    setGuestName(event.target.value);
                    if (nameMissing) setNameMissing(false);
                  }}
                  placeholder="Seu nome"
                  maxLength={60}
                  required
                  aria-invalid={nameMissing}
                  className={`mt-2 h-12 rounded-2xl bg-background text-base ${
                    nameMissing ? "border-destructive" : ""
                  }`}
                />
                {nameMissing && (
                  <p className="mt-2 text-sm text-destructive">
                    Digite seu nome para confirmar os presentes.
                  </p>
                )}

                <ul className="mt-5 space-y-2">
                  {cartEntries.map(({ item, quantity }) => {
                    const remaining = remainingFor(item);
                    return (
                      <QuantityRow
                        key={item.id}
                        item={item}
                        quantity={quantity}
                        remaining={remaining}
                        onIncrement={() => setItemQuantity(item.id, quantity + 1, remaining)}
                        onDecrement={() => setItemQuantity(item.id, quantity - 1, remaining)}
                        onRemove={() => setItemQuantity(item.id, 0)}
                      />
                    );
                  })}
                  {cartEntries.length === 0 && (
                    <li className="py-10 text-center text-sm text-muted-foreground">
                      Sua seleção está vazia.
                    </li>
                  )}
                </ul>

                {confirm.isError && (
                  <p className="mt-3 text-sm text-destructive">
                    Não conseguimos registrar agora. Tente novamente, por favor.
                  </p>
                )}
              </div>

              <div className="mt-auto border-t border-border px-6 py-4">
                <div className="mb-3 flex items-center justify-between text-sm font-semibold text-foreground">
                  <span>Total</span>
                  <span>
                    {cartUnits} {cartUnits === 1 ? "unidade" : "unidades"}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={confirm.isPending || cartEntries.length === 0}
                  onClick={() => {
                    if (guestName.trim() === "") {
                      setNameMissing(true);
                      return;
                    }
                    confirm.mutate();
                  }}
                  className="h-14 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
                >
                  {confirm.isPending ? "Enviando…" : "Enviar 💕"}
                </button>
              </div>
            </>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-8 pb-10 text-center">
              <img
                src={butterfly}
                alt=""
                aria-hidden="true"
                loading="lazy"
                width={768}
                height={768}
                className="mx-auto w-24"
              />
              <h2 className="mt-2 text-3xl font-medium">Obrigada! 💕</h2>
              <p className="mt-2 text-[15px] text-muted-foreground">
                Seu carinho vai fazer parte desse momento tão especial.
              </p>
              <ul className="mt-4 space-y-2 text-left">
                {confirmedEntries.map(({ item, quantity }) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground"
                  >
                    <span className="min-w-0 truncate">{itemLabel(item)}</span>
                    <span className="shrink-0">{quantity}×</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </PageShell>
  );
}
