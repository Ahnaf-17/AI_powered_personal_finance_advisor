/**
 * Market Controller
 * Provides simulated Australian market data for display and AI prompt enrichment.
 *
 * Author: Md Monsur Hossain (AI & Quality Lead)
 * COIT20273 – AI-Powered Personal Finance Advisor
 */

function rand(base, maxPct) {
  const pct = +(Math.random() * maxPct * 2 - maxPct).toFixed(2);
  return { price: +(base * (1 + pct / 100)).toFixed(4), changePct: pct, trend: pct >= 0 ? 'up' : 'down' };
}

function buildMarketSnapshot() {
  return {
    fetchedAt: new Date().toISOString(),
    cached: false,
    stocks: [
      { symbol: 'ASX 200',  ...rand(8110,  1.0) },
      { symbol: 'BHP',      ...rand(44.20, 1.5) },
      { symbol: 'CBA',      ...rand(165.50,1.2) },
      { symbol: 'CSL',      ...rand(298.80,1.3) },
      { symbol: 'NAB',      ...rand(42.10, 1.1) },
      { symbol: 'WBC',      ...rand(33.70, 1.0) },
      { symbol: 'ANZ',      ...rand(30.50, 1.0) },
      { symbol: 'RIO',      ...rand(119.40,1.4) },
    ],
    crypto: [
      { symbol: 'BTC', name: 'Bitcoin',  ...rand(147500, 3.5) },
      { symbol: 'ETH', name: 'Ethereum', ...rand(4950,   3.5) },
      { symbol: 'BNB', name: 'BNB',      ...rand(895,    3.0) },
      { symbol: 'XRP', name: 'XRP',      ...rand(3.25,   4.5) },
      { symbol: 'SOL', name: 'Solana',   ...rand(263,    4.0) },
    ],
    forex: [
      { symbol: 'AUD/USD', ...rand(0.6450, 0.4) },
      { symbol: 'AUD/EUR', ...rand(0.5930, 0.3) },
      { symbol: 'AUD/GBP', ...rand(0.5090, 0.3) },
      { symbol: 'AUD/JPY', ...rand(99.40,  0.5) },
      { symbol: 'AUD/NZD', ...rand(1.0870, 0.3) },
    ],
    commodities: [
      { symbol: 'Gold',      unit: ' AUD/oz',  ...rand(5180,  0.8) },
      { symbol: 'Silver',    unit: ' AUD/oz',  ...rand(51.80, 1.2) },
      { symbol: 'Iron Ore',  unit: ' AUD/t',   ...rand(155,   2.0) },
      { symbol: 'Oil (WTI)', unit: ' AUD/bbl', ...rand(112,   1.8) },
      { symbol: 'Copper',    unit: ' AUD/lb',  ...rand(6.85,  1.5) },
    ],
  };
}

function getMarketPulse() {
  return buildMarketSnapshot();
}

async function getMarketContextForAI() {
  try {
    const d = buildMarketSnapshot();
    const asx  = d.stocks[0];
    const btc  = d.crypto[0];
    const aud  = d.forex[0];
    const gold = d.commodities[0];
    const fmt  = (v) => `${v >= 0 ? '+' : ''}${v}%`;
    return (
      `Australian market snapshot (simulated, AUD): ` +
      `ASX 200 ${(+asx.price).toLocaleString('en-AU')} (${fmt(asx.changePct)}), ` +
      `BTC A$${(+btc.price).toLocaleString('en-AU')} (${fmt(btc.changePct)}), ` +
      `AUD/USD ${(+aud.price).toFixed(4)} (${fmt(aud.changePct)}), ` +
      `Gold A$${(+gold.price).toLocaleString('en-AU')}/oz (${fmt(gold.changePct)})`
    );
  } catch (err) {
    console.error('marketController: error building market context', err.message);
    return null;
  }
}

module.exports = { getMarketContextForAI, getMarketPulse };


