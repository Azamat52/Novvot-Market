import {
  ImageIcon,
  LoaderCircle,
  Minus,
  Plus,
  Printer,
  Save,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PageHeader } from "@/admin/components/page-header";
import { EmptyState } from "@/admin/components/empty-state";
import { isSaleProduct } from "@/admin/lib/stock";
import Receipt from "@/admin/components/Receipt";
import { fmtSum } from "@/admin/lib/format";
import { unitLabel, unitOf } from "@/admin/lib/units";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { selectProducts, selectSales } from "@/store/dataSlice";
import {
  addToCart,
  finishSale,
  removeFromCart,
  selectCartTotal,
  selectSale,
  setCustomer,
  setPhone,
  setItemPrice,
  setQty,
  setQuery,
} from "@/store/saleSlice";

function ProductPicker() {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const { query } = useSelector(selectSale);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => isSaleProduct(p) && (!q || p.name?.uz?.toLowerCase().includes(q)))
      .slice(0, 12);
  }, [products, query]);

  return (
    <section className="panel min-w-0 p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          autoFocus
          placeholder="Mahsulot nomini yozing..."
          value={query}
          onChange={(e) => dispatch(setQuery(e.target.value))}
        />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {!list.length && (
          <EmptyState
            className="col-span-full"
            title={query.trim() ? "Mahsulot topilmadi" : "Sotuvda mahsulot yo'q"}
          />
        )}
        {list.map((p) => (
          <Button
            variant="ghost"
            key={p.id}
            onClick={() => dispatch(addToCart(p))}
            className="pos-product group flex h-auto w-full items-center justify-start gap-3 whitespace-normal rounded-lg border p-2 text-left"
          >
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name?.uz}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <ImageIcon className="size-5 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <b className="block break-words">{p.name?.uz}</b>
              <div className="mt-1 text-sm text-muted-foreground">
                {fmtSum(p.price)} / {unitLabel(p.unit)} · Omborda bor: {p.stock ?? 0}{" "}
                {unitLabel(p.unit)}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </section>
  );
}

function CartItem({ item }) {
  const dispatch = useDispatch();
  const { step, fractional } = unitOf(item.unit);
  const products = useSelector(selectProducts);
  const stock = products.find((p) => p.id === item.id)?.stock ?? 0;
  const change = (qty) => dispatch(setQty({ id: item.id, qty }));

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-2">
        {item.image && <img src={item.image} alt="" className="size-10 rounded-md object-cover" />}
        <b className="mr-auto min-w-0 flex-1 break-words">{item.name}</b>
        <Button
          variant="ghost"
          size="icon"
          aria-label="O'chirish"
          onClick={() => dispatch(removeFromCart(item.id))}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button
          size="icon"
          variant="outline"
          aria-label="Kamaytirish"
          onClick={() => change(item.qty - step)}
        >
          <Minus className="size-4" />
        </Button>
        <Input
          type="number"
          step={fractional ? "0.01" : "1"}
          min={fractional ? 0.01 : 1}
          max={stock}
          aria-label={`${item.name} miqdori`}
          value={item.qty}
          onChange={(e) => change(e.target.value)}
          className="w-24"
        />
        <Button
          size="icon"
          variant="outline"
          aria-label="Ko'paytirish"
          onClick={() => change(item.qty + step)}
        >
          <Plus className="size-4" />
        </Button>
        <span className="text-sm text-muted-foreground">{unitLabel(item.unit)}</span>
        <b className="ml-auto">{fmtSum(Math.round(item.qty * item.price))}</b>
      </div>
      <label className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        Narx (1 {unitLabel(item.unit)}):
        <Input
          type="number"
          min={0}
          aria-label={`${item.name} narxi`}
          value={item.price}
          onChange={(e) => dispatch(setItemPrice({ id: item.id, price: e.target.value }))}
          className="w-32"
        />
        {item.basePrice != null && item.price !== item.basePrice && (
          <span className="line-through">{fmtSum(item.basePrice)}</span>
        )}
      </label>
    </div>
  );
}

function Cart() {
  const dispatch = useDispatch();
  const { cart, customer, phone, busy, busyAction } = useSelector(selectSale);
  const total = useSelector(selectCartTotal);
  const disabled = !cart.length || busy;
  const sales = useSelector(selectSales);
  const [open, setOpen] = useState(false);
  // Doimiy mijozlar: avvalgi savdolardagi oluvchilar (ism + oxirgi telefon).
  const regulars = useMemo(() => {
    const map = new Map();
    for (const s of sales || []) {
      const n = String(s.customer || "").trim();
      if (!n) continue;
      const key = n.toLowerCase();
      const cur = map.get(key) || { name: n, phone: "", count: 0 };
      cur.count += 1;
      if (!cur.phone && s.phone) cur.phone = String(s.phone);
      map.set(key, cur);
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [sales]);
  const matches = useMemo(() => {
    const q = customer.trim().toLowerCase();
    if (!q) return regulars.slice(0, 8);
    return regulars
      .filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q))
      .slice(0, 8);
  }, [regulars, customer]);

  return (
    <section className="panel min-w-0 p-4">
      <p className="text-sm">
        Sotuvchi: <b>Novvot Market</b>
      </p>
      <div className="relative mt-2">
        <Input
          aria-label="Oluvchi nomi"
          placeholder="Oluvchi nomi"
          maxLength={100}
          autoComplete="off"
          value={customer}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => {
            dispatch(setCustomer(e.target.value));
            setOpen(true);
          }}
        />
        {open && matches.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-auto rounded-md border bg-popover shadow-md">
            {matches.map((c) => (
              <button
                type="button"
                key={c.name + c.phone}
                className="flex w-full justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  dispatch(setCustomer(c.name));
                  if (c.phone) dispatch(setPhone(c.phone));
                  setOpen(false);
                }}
              >
                <b>{c.name}</b>
                <span className="text-muted-foreground">
                  {c.phone} · {c.count} ta
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <Input
        className="mt-2"
        type="tel"
        aria-label="Oluvchi raqami"
        placeholder="Oluvchi raqami"
        maxLength={30}
        value={phone}
        onChange={(e) => dispatch(setPhone(e.target.value))}
      />

      <div className="mt-3 space-y-3">
        {cart.length ? (
          cart.map((item) => <CartItem key={item.id} item={item} />)
        ) : (
          <EmptyState title="Mahsulot qo'shilmagan" />
        )}
      </div>

      <div className="mt-5 border-t pt-4 text-xl font-bold">Jami: {fmtSum(Math.round(total))}</div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Button
          variant="destructive"
          disabled={disabled}
          onClick={() => dispatch(finishSale("cancelled"))}
        >
          {busy && busyAction === "cancelled" ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <XCircle />
          )}{" "}
          Bekor qilish
        </Button>
        <Button disabled={disabled} onClick={() => dispatch(finishSale("saved"))}>
          {busy && busyAction === "saved" ? <LoaderCircle className="animate-spin" /> : <Save />}{" "}
          Saqlash
        </Button>
        <Button disabled={disabled} onClick={() => dispatch(finishSale("printed"))}>
          {busy && busyAction === "printed" ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Printer />
          )}{" "}
          Chop etish
        </Button>
      </div>
    </section>
  );
}

export default function NewSale() {
  const { receipt } = useSelector(selectSale);
  return (
    <>
      <PageHeader title="Yangi savdo" subtitle="Mahsulotni yozib toping va savdoni yakunlang" />
      <div className="grid items-start gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <ProductPicker />
        <Cart />
      </div>
      <Receipt sale={receipt} />
    </>
  );
}
