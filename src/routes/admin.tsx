import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, EyeOff, LogOut, Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { ButterflyLoader } from "@/components/ButterflyLoader";
import { PageShell } from "@/components/PageShell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { fetchMe, hasToken, login, logout, register } from "@/lib/auth";
import {
  createGiftItem,
  fetchCategories,
  fetchCommitments,
  fetchItems,
  fetchPeopleList,
  itemLabel,
  updateGiftItem,
  type GiftItem,
} from "@/lib/gifts";
import { createUser, fetchUsers, updateUserRole, type AdminUserRow } from "@/lib/users";
import { ApiError } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Área da mamãe — Chá da Maya" },
      { name: "description", content: "Resumo dos presentes do Chá da Maya." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [authed, setAuthed] = useState<boolean | undefined>(undefined);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!hasToken()) {
      setAuthed(false);
      return;
    }
    fetchMe()
      .then(() => setAuthed(true))
      .catch(() => {
        logout();
        queryClient.removeQueries({ queryKey: ["admin-me"] });
        setAuthed(false);
      });
  }, [queryClient]);

  if (authed === undefined) {
    return (
      <PageShell>
        <ButterflyLoader />
      </PageShell>
    );
  }

  if (authed === false) {
    return (
      <LoginCard
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["admin-me"] });
          setAuthed(true);
        }}
      />
    );
  }

  return <AdminDashboard onSignOut={() => setAuthed(false)} />;
}

function LoginCard({ onSuccess }: { onSuccess: () => void }) {
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "entrar") {
        await login(identifier, password);
      } else {
        await register(email, username, password);
      }
      onSuccess();
    } catch {
      setError(
        mode === "entrar"
          ? "E-mail/usuário ou senha não conferem."
          : "Não foi possível criar o acesso. Tente outro e-mail/usuário ou uma senha mais longa.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <div className="mx-auto mt-10 w-full rounded-3xl border border-border bg-card p-6 shadow-petal">
        <h1 className="text-center text-3xl font-medium">Área da mamãe 💕</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Entre para ver o resumo dos presentes do Chá da Maya.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "entrar" ? (
            <div>
              <label htmlFor="identifier" className="text-sm font-semibold">
                E-mail ou usuário
              </label>
              <Input
                id="identifier"
                type="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className="mt-1 h-12 rounded-2xl bg-background text-base"
              />
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="email" className="text-sm font-semibold">
                  E-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 h-12 rounded-2xl bg-background text-base"
                />
              </div>
              <div>
                <label htmlFor="username" className="text-sm font-semibold">
                  Nome de usuário{" "}
                  <span className="font-normal text-muted-foreground">(opcional)</span>
                </label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  minLength={3}
                  maxLength={40}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Para entrar sem digitar o e-mail"
                  className="mt-1 h-12 rounded-2xl bg-background text-base"
                />
              </div>
            </>
          )}
          <div>
            <label htmlFor="password" className="text-sm font-semibold">
              Senha
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "entrar" ? "current-password" : "new-password"}
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 h-12 rounded-2xl bg-background pr-12 text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute top-1/2 right-3 mt-0.5 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="h-14 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
          >
            {busy ? "Aguarde…" : mode === "entrar" ? "Entrar" : "Criar meu acesso"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "entrar" ? "criar" : "entrar");
            setError(null);
          }}
          className="mt-4 w-full text-sm font-semibold text-primary"
        >
          {mode === "entrar"
            ? "Primeiro acesso? Criar minha senha"
            : "Já tenho acesso, quero entrar"}
        </button>
      </div>
    </PageShell>
  );
}

function AdminDashboard({ onSignOut }: { onSignOut: () => void }) {
  const queryClient = useQueryClient();
  const [openItem, setOpenItem] = useState<GiftItem | null>(null);
  const [editing, setEditing] = useState<GiftItem | "new" | null>(null);
  const [view, setView] = useState<"itens" | "pessoas" | "usuarios" | "gerenciar">("itens");
  const [creatingUser, setCreatingUser] = useState(false);

  const me = useQuery({ queryKey: ["admin-me"], queryFn: fetchMe });

  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const items = useQuery({
    queryKey: ["gift-items", "all"],
    queryFn: () => fetchItems(true),
    enabled: me.data?.is_admin === true,
  });
  const commitments = useQuery({
    queryKey: ["commitments"],
    queryFn: fetchCommitments,
    enabled: me.data?.is_admin === true,
  });
  const people = useQuery({
    queryKey: ["lista-pessoas"],
    queryFn: fetchPeopleList,
    enabled: me.data?.is_admin === true && view === "pessoas",
  });
  const users = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchUsers,
    enabled: me.data?.is_admin === true && view === "usuarios",
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    logout();
    onSignOut();
  }

  if (
    me.isLoading ||
    (me.data?.is_admin === true &&
      (categories.isLoading || items.isLoading || commitments.isLoading))
  ) {
    return (
      <PageShell>
        <ButterflyLoader label="Carregando resumo…" />
      </PageShell>
    );
  }

  if (me.data?.is_admin !== true) {
    return (
      <PageShell>
        <div className="mt-12 rounded-3xl border border-border bg-card p-6 text-center shadow-petal">
          <h1 className="text-2xl font-medium">Acesso restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta conta não tem permissão para ver o resumo dos presentes.
          </p>
          <button
            type="button"
            onClick={signOut}
            className="mt-6 h-12 w-full rounded-full bg-primary font-semibold text-primary-foreground"
          >
            Sair
          </button>
        </div>
      </PageShell>
    );
  }

  const all = items.data ?? [];
  const rows = commitments.data ?? [];
  const totalsByItem: Record<string, number> = {};
  for (const row of rows) {
    totalsByItem[row.gift_item_id] = (totalsByItem[row.gift_item_id] ?? 0) + row.quantity;
  }
  const totalUnits = rows.reduce((sum, row) => sum + row.quantity, 0);
  const participants = new Set(
    rows.map((row) => (row.guest_name?.trim() ? row.guest_name.trim().toLowerCase() : row.id)),
  ).size;
  const maxTotal = Math.max(1, ...Object.values(totalsByItem));

  return (
    <PageShell>
      <div className="rounded-3xl border border-border bg-card p-4 shadow-petal">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-medium">Chá da Maya 💕</h1>
            <p className="truncate text-sm text-muted-foreground">Resumo dos presentes</p>
          </div>
          <button
            type="button"
            onClick={signOut}
            aria-label="Sair"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-background text-muted-foreground"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {me.data.email && (
          <p className="mt-1 truncate text-xs text-muted-foreground">{me.data.email}</p>
        )}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <SummaryCard label="Presentes prometidos" value={rows.length} />
        <SummaryCard label="Unidades no total" value={totalUnits} />
        <SummaryCard label="Participantes" value={participants} />
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setView("itens")}
          className={`h-10 shrink-0 rounded-full border px-5 text-sm font-semibold whitespace-nowrap transition-colors ${
            view === "itens"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground"
          }`}
        >
          Por item
        </button>
        <button
          type="button"
          onClick={() => setView("pessoas")}
          className={`h-10 shrink-0 rounded-full border px-5 text-sm font-semibold whitespace-nowrap transition-colors ${
            view === "pessoas"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground"
          }`}
        >
          Lista de pessoas
        </button>
        <button
          type="button"
          onClick={() => setView("usuarios")}
          className={`h-10 shrink-0 rounded-full border px-5 text-sm font-semibold whitespace-nowrap transition-colors ${
            view === "usuarios"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground"
          }`}
        >
          Usuários
        </button>
        <button
          type="button"
          onClick={() => setView("gerenciar")}
          className={`h-10 shrink-0 rounded-full border px-5 text-sm font-semibold whitespace-nowrap transition-colors ${
            view === "gerenciar"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground"
          }`}
        >
          Gerenciar listinha
        </button>
      </div>

      {view === "gerenciar" && (
        <section className="mt-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="min-w-0 truncate font-sans text-xs font-bold tracking-widest text-muted-foreground uppercase">
              Gerenciar a listinha
            </h2>
            <button
              type="button"
              onClick={() => setEditing("new")}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Novo item
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {[...all]
              .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
              .map((item) => (
                <ManageRow key={item.id} item={item} onEdit={() => setEditing(item)} />
              ))}
          </div>
        </section>
      )}

      {view === "usuarios" && (
        <section className="mt-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="min-w-0 truncate font-sans text-xs font-bold tracking-widest text-muted-foreground uppercase">
              Usuários cadastrados
            </h2>
            <button
              type="button"
              onClick={() => setCreatingUser(true)}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Novo usuário
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {users.isLoading && <ButterflyLoader />}
            {users.isError && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Não conseguimos carregar os usuários.
              </p>
            )}
            {!users.isLoading && !users.isError && (users.data ?? []).length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Nenhum usuário cadastrado ainda.
              </p>
            )}
            {(users.data ?? []).map((row) => (
              <UserRow key={row.id} user={row} isSelf={row.id === me.data?.id} />
            ))}
          </div>
        </section>
      )}

      <UserFormDialog open={creatingUser} onClose={() => setCreatingUser(false)} />

      {view === "pessoas" && (
        <section className="mt-6">
          {people.isLoading && <ButterflyLoader />}
          {people.isError && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Não conseguimos carregar a lista de pessoas.
            </p>
          )}
          {!people.isLoading && !people.isError && (people.data ?? []).length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Ninguém escolheu um presente ainda.
            </p>
          )}
          <div className="space-y-2">
            {(people.data ?? []).map((row, index) => (
              <div
                key={`${row.guest_name}-${index}`}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{row.guest_name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {row.item_name}
                    {row.item_size ? ` — tamanho ${row.item_size}` : ""}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
                  {row.quantity}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {view === "itens" && (
        <>
          {(categories.data ?? []).map((category) => {
            const categoryItems = all
              .filter((item) => item.category_id === category.id)
              .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
            if (categoryItems.length === 0) return null;
            return (
              <section key={category.id} className="mt-8">
                <h2 className="font-sans text-xs font-bold tracking-widest text-muted-foreground uppercase">
                  {category.name}
                </h2>
                <div className="mt-3 space-y-2">
                  {categoryItems.map((item) => {
                    const total = totalsByItem[item.id] ?? 0;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setOpenItem(item)}
                        className="w-full rounded-2xl border border-border bg-card p-4 text-left shadow-petal"
                      >
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                          <span className="min-w-0 truncate text-sm font-semibold">
                            {itemLabel(item)}
                            {!item.active && (
                              <span className="ml-2 text-xs font-normal text-muted-foreground">
                                (desativado)
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 text-base font-semibold text-primary">
                            {total}
                          </span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary/70"
                            style={{ width: `${(total / maxTotal) * 100}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </>
      )}

      <Dialog open={openItem !== null} onOpenChange={(open) => !open && setOpenItem(null)}>
        <DialogContent className="max-w-[520px] rounded-3xl bg-card">
          {openItem && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl font-medium">
                  {itemLabel(openItem)}
                </DialogTitle>
                <DialogDescription>
                  Total: {totalsByItem[openItem.id] ?? 0}{" "}
                  {(totalsByItem[openItem.id] ?? 0) === 1 ? "unidade" : "unidades"}
                </DialogDescription>
              </DialogHeader>
              <ul className="max-h-72 space-y-2 overflow-y-auto">
                {rows.filter((row) => row.gift_item_id === openItem.id).length === 0 && (
                  <li className="text-sm text-muted-foreground">Ninguém escolheu ainda.</li>
                )}
                {rows
                  .filter((row) => row.gift_item_id === openItem.id)
                  .map((row) => (
                    <li
                      key={row.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-2xl bg-secondary/50 px-4 py-3 text-sm"
                    >
                      <span className="min-w-0 truncate">
                        {row.guest_name?.trim() || "Não identificado"}
                      </span>
                      <span className="shrink-0 font-semibold">{row.quantity}</span>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ItemFormDialog
        editing={editing}
        onClose={() => setEditing(null)}
        categories={categories.data ?? []}
      />
    </PageShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-petal">
      <p className="text-2xl font-semibold text-primary">{value}</p>
      <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{label}</p>
    </div>
  );
}

function UserRow({ user, isSelf }: { user: AdminUserRow; isSelf: boolean }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const toggle = useMutation({
    mutationFn: (isAdmin: boolean) => updateUserRole(user.id, isAdmin),
    onMutate: () => setError(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Não foi possível atualizar a permissão.");
    },
  });

  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.username || user.email}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            {user.is_admin ? "Admin" : "Usuário"}
          </span>
          <Switch
            checked={user.is_admin}
            disabled={toggle.isPending || isSelf}
            onCheckedChange={(value) => toggle.mutate(value)}
            aria-label={`Alternar permissão de admin para ${user.email}`}
          />
        </div>
      </div>
      {isSelf && (
        <p className="mt-2 text-xs text-muted-foreground">
          Você não pode alterar sua própria permissão.
        </p>
      )}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function UserFormDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  function reset() {
    setEmail("");
    setUsername("");
    setPassword("");
    setShowPassword(false);
    setIsAdmin(false);
  }

  const save = useMutation({
    mutationFn: () =>
      createUser({
        email: email.trim(),
        username: username.trim() ? username.trim() : null,
        password,
        isAdmin,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      reset();
      onClose();
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-[520px] rounded-3xl bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-medium">Novo usuário</DialogTitle>
          <DialogDescription>Crie um acesso para outra pessoa entrar na área da mamãe.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="new-user-email" className="text-sm font-semibold">
              E-mail
            </label>
            <Input
              id="new-user-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 h-12 rounded-2xl bg-background text-base"
            />
          </div>
          <div>
            <label htmlFor="new-user-username" className="text-sm font-semibold">
              Nome de usuário <span className="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <Input
              id="new-user-username"
              type="text"
              minLength={3}
              maxLength={40}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-1 h-12 rounded-2xl bg-background text-base"
            />
          </div>
          <div>
            <label htmlFor="new-user-password" className="text-sm font-semibold">
              Senha
            </label>
            <div className="relative">
              <Input
                id="new-user-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 h-12 rounded-2xl bg-background pr-12 text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute top-1/2 right-3 mt-0.5 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3">
            <span className="text-sm font-semibold">Conceder acesso de admin</span>
            <Switch checked={isAdmin} onCheckedChange={setIsAdmin} aria-label="Conceder acesso de admin" />
          </div>

          {save.isError && (
            <p className="text-sm text-destructive">
              {save.error instanceof ApiError
                ? save.error.message
                : "Não foi possível criar o usuário."}
            </p>
          )}

          <button
            type="submit"
            disabled={save.isPending}
            className="h-14 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
          >
            {save.isPending ? "Criando…" : "Criar usuário"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ManageRow({ item, onEdit }: { item: GiftItem; onEdit: () => void }) {
  const queryClient = useQueryClient();

  const toggle = useMutation({
    mutationFn: (active: boolean) => updateGiftItem(item.id, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gift-items"] });
    },
  });

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
      <span className="min-w-0 truncate text-sm">{itemLabel(item)}</span>
      <div className="flex shrink-0 items-center gap-2">
        <Switch
          checked={item.active}
          onCheckedChange={(value) => toggle.mutate(value)}
          aria-label="Mostrar este item para os convidados"
        />
        <button
          type="button"
          onClick={onEdit}
          aria-label="Editar item"
          className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function ItemFormDialog({
  editing,
  onClose,
  categories,
}: {
  editing: GiftItem | "new" | null;
  onClose: () => void;
  categories: { id: string; name: string }[];
}) {
  const queryClient = useQueryClient();
  const isNew = editing === "new";
  const item = editing && editing !== "new" ? editing : null;

  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [desiredQuantity, setDesiredQuantity] = useState("1");

  useEffect(() => {
    if (!editing) return;
    setName(item?.name ?? "");
    setSize(item?.size ?? "");
    setDescription(item?.description ?? "");
    setCategoryId(item?.category_id ?? categories[0]?.id ?? "");
    setDesiredQuantity(String(item?.desired_quantity ?? 1));
  }, [editing, item, categories]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        size: size.trim() ? size.trim() : null,
        description: description.trim() ? description.trim() : null,
        categoryId,
        desiredQuantity: Math.min(999, Math.max(1, Number(desiredQuantity) || 1)),
      };
      if (isNew) {
        await createGiftItem(payload);
      } else if (item) {
        await updateGiftItem(item.id, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gift-items"] });
      onClose();
    },
  });

  return (
    <Dialog open={editing !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[520px] rounded-3xl bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-medium">
            {isNew ? "Novo item" : "Editar item"}
          </DialogTitle>
          <DialogDescription>
            Os convidados verão este mimo na listinha do Chá da Maya.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="item-name" className="text-sm font-semibold">
              Nome
            </label>
            <Input
              id="item-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 h-12 rounded-2xl bg-background text-base"
            />
          </div>
          <div>
            <label htmlFor="item-size" className="text-sm font-semibold">
              Tamanho <span className="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <Input
              id="item-size"
              value={size}
              onChange={(event) => setSize(event.target.value)}
              className="mt-1 h-12 rounded-2xl bg-background text-base"
            />
          </div>
          <div>
            <label htmlFor="item-description" className="text-sm font-semibold">
              Observação <span className="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <Input
              id="item-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-1 h-12 rounded-2xl bg-background text-base"
            />
          </div>
          <div>
            <label htmlFor="item-category" className="text-sm font-semibold">
              Categoria
            </label>
            <select
              id="item-category"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="mt-1 h-12 w-full rounded-2xl border border-input bg-background px-3 text-base"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="item-desired-quantity" className="text-sm font-semibold">
              Quantidade desejada
            </label>
            <p className="text-xs text-muted-foreground">
              Quantas unidades você quer receber. Os convidados só podem escolher até esse limite.
            </p>
            <Input
              id="item-desired-quantity"
              type="number"
              inputMode="numeric"
              min={1}
              max={999}
              value={desiredQuantity}
              onChange={(event) => setDesiredQuantity(event.target.value)}
              className="mt-1 h-12 rounded-2xl bg-background text-base"
            />
          </div>

          {save.isError && (
            <p className="text-sm text-destructive">Não conseguimos salvar. Tente novamente.</p>
          )}

          <button
            type="button"
            disabled={save.isPending || name.trim().length === 0 || !categoryId}
            onClick={() => save.mutate()}
            className="h-14 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground disabled:opacity-60"
          >
            {save.isPending ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
