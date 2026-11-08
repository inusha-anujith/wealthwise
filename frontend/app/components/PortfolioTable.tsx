"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "/api/assets";

type Asset = {
  id: number;
  tickerSymbol: string;
  sharesOwned: number;
  averagePurchasePrice: number;
  currentPrice: number | null;
  priceUpdatedOn: string | null;
  costValue: number;
  marketValue: number;
  unrealizedGain: number;
  unrealizedGainPercent: number;
  realizedGain: number;
  dividendsReceived: number;
};

type ActivePanel = { assetId: number; mode: "PRICE" | "SELL" } | null;

const today = () => new Date().toLocaleDateString("en-CA");

const formatLkr = (value: number) =>
  `LKR ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatGain = (value: number) => `${value > 0 ? "+" : ""}${formatLkr(value)}`;

const gainClass = (value: number) =>
  value > 0 ? "text-emerald-400" : value < 0 ? "text-rose-400" : "text-slate-300";

const inputClass =
  "w-full h-[38px] px-3 rounded-lg [color-scheme:dark] bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass = "block text-xs font-semibold text-slate-400 mb-1.5";
const actionClass =
  "px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-semibold transition-colors";

async function readErrorMessage(res: Response) {
  try {
    const body = await res.json();
    return String(body.message ?? Object.values(body)[0] ?? "Could not save this change.");
  } catch {
    return "Could not save this change.";
  }
}

export default function PortfolioTable({ assets }: { assets: Asset[] }) {
  const router = useRouter();

  const [panel, setPanel] = useState<ActivePanel>(null);
  const [price, setPrice] = useState("");
  const [sharesSold, setSharesSold] = useState("");
  const [saleDate, setSaleDate] = useState(today);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const openPanel = (asset: Asset, mode: "PRICE" | "SELL") => {
    setPanel({ assetId: asset.id, mode });
    setPrice(mode === "PRICE" && asset.currentPrice !== null ? String(asset.currentPrice) : "");
    setSharesSold("");
    setSaleDate(today());
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent, asset: Asset) => {
    e.preventDefault();
    if (!panel) return;

    setSaving(true);
    setError("");

    const isSale = panel.mode === "SELL";

    try {
      const res = await fetch(`${API_URL}/${asset.id}/${isSale ? "sales" : "price"}`, {
        method: isSale ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isSale
            ? { sharesSold: parseInt(sharesSold, 10), salePrice: parseFloat(price), saleDate }
            : { currentPrice: parseFloat(price) }
        ),
      });

      if (!res.ok) {
        setError(await readErrorMessage(res));
        return;
      }

      setPanel(null);
      router.refresh();
    } catch {
      setError("Network communication error.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (asset: Asset) => {
    const message = `Delete ${asset.tickerSymbol} and all its ledger entries? Use this only to correct a mistake.`;
    if (!window.confirm(message)) return;

    setError("");

    try {
      const res = await fetch(`${API_URL}/${asset.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        setError("Could not delete this stock.");
        return;
      }

      router.refresh();
    } catch {
      setError("Network communication error.");
    }
  };

  const totalValue = assets.reduce((sum, asset) => sum + asset.marketValue, 0);
  const salePreview = (parseInt(sharesSold, 10) || 0) * (parseFloat(price) || 0);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl backdrop-blur-sm">
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-bold text-white text-base">Your Stocks</h3>
        <div className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold">
          Current Value: {formatLkr(totalValue)}
        </div>
      </div>

      {error && !panel && (
        <div role="alert" className="m-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        {assets.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-500">No stocks added yet.</p>
        ) : (
          <table className="w-full min-w-[1040px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Shares</th>
                <th className="p-4 text-right">Average Cost</th>
                <th className="p-4 text-right">Current Price</th>
                <th className="p-4 text-right">Current Value</th>
                <th className="p-4 text-right">Unrealized</th>
                <th className="p-4 text-right">Realized</th>
                <th className="p-4 text-right">Dividends</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {assets.map((asset) => {
                const isSold = asset.sharesOwned === 0;
                const isOpen = panel?.assetId === asset.id;

                return (
                  <PortfolioRows
                    key={asset.id}
                    asset={asset}
                    isSold={isSold}
                    isOpen={isOpen}
                    onOpen={openPanel}
                    onDelete={handleDelete}
                  >
                    {isOpen && panel && (
                      <tr className="bg-slate-950/50">
                        <td colSpan={9} className="p-4">
                          {error && (
                            <div role="alert" className="mb-3 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
                              {error}
                            </div>
                          )}
                          <form
                            onSubmit={(e) => handleSubmit(e, asset)}
                            className="flex flex-wrap items-end gap-3"
                          >
                            {panel.mode === "SELL" && (
                              <div className="w-36">
                                <label htmlFor={`sharesSold-${asset.id}`} className={labelClass}>
                                  Shares to sell
                                </label>
                                <input
                                  id={`sharesSold-${asset.id}`}
                                  type="number"
                                  min="1"
                                  max={asset.sharesOwned}
                                  step="1"
                                  required
                                  value={sharesSold}
                                  onChange={(e) => setSharesSold(e.target.value)}
                                  placeholder={`Up to ${asset.sharesOwned}`}
                                  className={inputClass}
                                />
                              </div>
                            )}
                            <div className="w-44">
                              <label htmlFor={`price-${asset.id}`} className={labelClass}>
                                {panel.mode === "SELL" ? "Price per share after fees" : "Current price (LKR)"}
                              </label>
                              <input
                                id={`price-${asset.id}`}
                                type="number"
                                min="0.01"
                                step="0.01"
                                required
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className={inputClass}
                              />
                            </div>
                            {panel.mode === "SELL" && (
                              <div className="w-44">
                                <label htmlFor={`saleDate-${asset.id}`} className={labelClass}>
                                  Sale date
                                </label>
                                <input
                                  id={`saleDate-${asset.id}`}
                                  type="date"
                                  required
                                  max={today()}
                                  value={saleDate}
                                  onChange={(e) => setSaleDate(e.target.value)}
                                  className={inputClass}
                                />
                              </div>
                            )}
                            <button
                              type="submit"
                              disabled={saving}
                              className="h-[38px] px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all disabled:opacity-50"
                            >
                              {saving ? "Saving..." : panel.mode === "SELL" ? "Record Sale" : "Save Price"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setPanel(null)}
                              className="h-[38px] px-4 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 font-bold text-xs transition-all"
                            >
                              Cancel
                            </button>
                            {panel.mode === "SELL" && salePreview > 0 && (
                              <p className="h-[38px] flex items-center text-xs text-slate-300">
                                Adds {formatLkr(salePreview)} to cash
                              </p>
                            )}
                          </form>
                        </td>
                      </tr>
                    )}
                  </PortfolioRows>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {assets.length > 0 && (
        <p className="p-4 border-t border-slate-800 text-xs text-slate-500">
          You enter current prices yourself, so values are only as recent as your last update. A stock with no current
          price is valued at its cost.
        </p>
      )}
    </div>
  );
}

type PortfolioRowsProps = {
  asset: Asset;
  isSold: boolean;
  isOpen: boolean;
  onOpen: (asset: Asset, mode: "PRICE" | "SELL") => void;
  onDelete: (asset: Asset) => void;
  children: React.ReactNode;
};

function PortfolioRows({ asset, isSold, isOpen, onOpen, onDelete, children }: PortfolioRowsProps) {
  return (
    <>
      <tr className={isOpen ? "bg-slate-800/30" : "hover:bg-slate-800/30 transition-colors"}>
        <td className="p-4 text-sm font-bold text-blue-400 font-mono">
          {asset.tickerSymbol}
          {isSold && (
            <span className="ml-2 font-sans text-xs font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-300">
              Sold
            </span>
          )}
        </td>
        <td className="p-4 text-sm font-mono text-right text-slate-200">{asset.sharesOwned.toLocaleString()}</td>
        <td className="p-4 text-sm font-mono text-right text-slate-300 whitespace-nowrap">
          {formatLkr(asset.averagePurchasePrice)}
        </td>
        <td className="p-4 text-sm font-mono text-right text-slate-300 whitespace-nowrap">
          {asset.currentPrice === null ? (
            <span className="text-slate-500">Not set</span>
          ) : (
            <>
              <div>{formatLkr(asset.currentPrice)}</div>
              <div className="text-xs text-slate-500">{asset.priceUpdatedOn}</div>
            </>
          )}
        </td>
        <td className="p-4 text-sm font-mono font-bold text-right text-white whitespace-nowrap">
          {formatLkr(asset.marketValue)}
        </td>
        <td className={`p-4 text-sm font-mono text-right whitespace-nowrap ${gainClass(asset.unrealizedGain)}`}>
          <div>{formatGain(asset.unrealizedGain)}</div>
          {asset.sharesOwned > 0 && <div className="text-xs">{asset.unrealizedGainPercent}%</div>}
        </td>
        <td className={`p-4 text-sm font-mono text-right whitespace-nowrap ${gainClass(asset.realizedGain)}`}>
          {formatGain(asset.realizedGain)}
        </td>
        <td className="p-4 text-sm font-mono text-right text-slate-300 whitespace-nowrap">
          {formatLkr(asset.dividendsReceived)}
        </td>
        <td className="p-4">
          <div className="flex justify-end gap-2 whitespace-nowrap">
            {!isSold && (
              <>
                <button type="button" onClick={() => onOpen(asset, "PRICE")} className={actionClass}>
                  Update Price
                </button>
                <button type="button" onClick={() => onOpen(asset, "SELL")} className={actionClass}>
                  Sell
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => onDelete(asset)}
              className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
      {children}
    </>
  );
}