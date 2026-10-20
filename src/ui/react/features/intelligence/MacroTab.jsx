import React, { useState } from 'react';
import { SectionHeader, Metric, StatusBadge, DataRow, EmptyState } from '../../components/index.js';
import { macroFinanceRadar } from '../../../../intelligence/macroFinanceRadar.js';

export function MacroTab() {
  const [quotes] = useState(() => macroFinanceRadar.getAssetQuotes());
  const [sge] = useState(() => macroFinanceRadar.getShanghaiGoldDivergence());
  const [fxList] = useState(() => macroFinanceRadar.getFxStressRadar());
  const [yieldCurve] = useState(() => macroFinanceRadar.getYieldCurveAnalysis());
  const [sentiment] = useState(() => macroFinanceRadar.getSentimentOverview());
  const [poly] = useState(() => macroFinanceRadar.getPolymarketPredictions());

  // Filter for FX radar
  const [fxSearch, setFxSearch] = useState('');

  const filteredFx = fxList.filter(
    (fx) =>
      fx.pair.toLowerCase().includes(fxSearch.toLowerCase()) ||
      fx.currency.toLowerCase().includes(fxSearch.toLowerCase()) ||
      fx.stressLevel.toLowerCase().includes(fxSearch.toLowerCase())
  );

  return (
    <div className="rad-tab-content-flow" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Global Macro Tickers */}
      <div className="intel-card">
        <SectionHeader
          title="Global Macro Tickers"
          subtitle="Cross-Asset Surveillance"
          icon="📈"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '6px' }}>
          {quotes.map((q) => (
            <Metric
              key={q.symbol}
              label={q.name}
              value={q.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              trend={`${q.changePercent >= 0 ? '+' : ''}${q.changePercent.toFixed(2)}%`}
              trendDirection={q.changePercent >= 0 ? 'up' : 'down'}
              subtitle={q.symbol}
            />
          ))}
        </div>
      </div>

      {/* SGE Physical vs COMEX Paper Divergence */}
      <div className="intel-sge-card">
        <SectionHeader
          title="Shanghai Gold Exchange (SGE) Physical Arbitrage"
          subtitle="East-West Divergence"
          icon="🪙"
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', marginTop: '4px' }}>
          <span>SGE Physical vs COMEX Paper Gold:</span>
          <span className="intel-sge-spread">
            +${sge.gold.spreadPerOzUsd.toFixed(2)}/oz (+{sge.gold.spreadPercent.toFixed(2)}%)
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', marginTop: '2px' }}>
          <span>SGE Physical vs COMEX Paper Silver:</span>
          <span className="intel-sge-spread">
            +${sge.silver.spreadPerOzUsd.toFixed(2)}/oz (+{sge.silver.spreadPercent.toFixed(2)}%)
          </span>
        </div>
        <div style={{ fontSize: '8.5px', color: 'var(--text-secondary)', lineHeight: 1.3, marginTop: '4px' }}>
          Arbitrage Incentive: <strong style={{ color: 'var(--accent-brass)' }}>{sge.implication.arbitrageIncentive.toUpperCase()}</strong>.
          Physical bullion delivery drain on Western COMEX/LBMA vaults continues as Asian central banks settle off-market.
        </div>
      </div>

      {/* US Treasury Yield Curve & Recession Inversion */}
      <div className="intel-card">
        <SectionHeader
          title="US Treasury Yield Curve & Recession Meter"
          subtitle={`Recession Prob: ${yieldCurve.recessionProbability}`}
          icon="📉"
        />
        <div className="intel-curve-bar-chart">
          {Object.entries(yieldCurve.curve).map(([tenor, rate]) => {
            const heightPct = Math.max(15, (rate / 5.5) * 100);
            return (
              <div key={tenor} className="intel-curve-col">
                <span style={{ fontSize: '8px', color: 'var(--signal-cyan-active)', marginBottom: '2px' }}>
                  {rate.toFixed(2)}%
                </span>
                <div className="intel-curve-pillar" style={{ height: `${heightPct}%` }} />
                <span className="intel-curve-lbl">{tenor}</span>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '9.5px', marginTop: '6px' }}>
          <Metric
            label="10Y - 2Y Spread"
            value={`${yieldCurve.spread10Y2Y >= 0 ? '+' : ''}${yieldCurve.spread10Y2Y.toFixed(2)}%`}
            trend={yieldCurve.inversion10Y2Y ? 'Inverted' : 'De-inverting'}
            trendDirection={yieldCurve.inversion10Y2Y ? 'down' : 'up'}
          />
          <Metric
            label="10Y - 3M Spread"
            value={`${yieldCurve.spread10Y3M >= 0 ? '+' : ''}${yieldCurve.spread10Y3M.toFixed(2)}%`}
            trend={yieldCurve.inversion10Y3M ? 'Inverted' : 'Normal'}
            trendDirection={yieldCurve.inversion10Y3M ? 'down' : 'up'}
          />
        </div>
        <div style={{ fontSize: '8.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Regime: <strong>{yieldCurve.regime}</strong> &bull; Highest historical recession probability occurs as the 10Y-2Y curve un-inverts while front-end 3M remains pinned.
        </div>
      </div>

      {/* 45-Currency FX Stress Radar */}
      <div className="intel-card">
        <SectionHeader
          title="45-Currency FX Stress Radar"
          subtitle={`${fxList.length} Monitored Pairs`}
          icon="💱"
          actions={
            <input
              type="text"
              className="intel-input"
              style={{ width: '130px', padding: '2px 6px', fontSize: '9px' }}
              placeholder="Filter pair / currency..."
              value={fxSearch}
              onChange={(e) => setFxSearch(e.target.value)}
              aria-label="Filter currencies"
            />
          }
        />

        {filteredFx.length === 0 ? (
          <EmptyState
            title="No matching currency pairs"
            description="Clear filter to view all 45 currencies."
            actionLabel="Reset Filter"
            onAction={() => setFxSearch('')}
          />
        ) : (
          <div className="intel-fx-grid">
            {filteredFx.slice(0, 10).map((fx) => (
              <DataRow
                key={fx.pair}
                label={fx.pair}
                description={`Rate: ${fx.exchangeRateToUsd.toFixed(2)}`}
                badge={
                  <StatusBadge
                    status={fx.isSuddenDevaluation ? 'critical' : fx.stressLevel === 'HIGH' ? 'warning' : 'neutral'}
                    label={`${fx.change72hPercent >= 0 ? '+' : ''}${fx.change72hPercent.toFixed(1)}%`}
                  />
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Sentiment & Polymarket Predictions */}
      <div className="intel-card">
        <SectionHeader
          title="Sentiment & Polymarket Odds"
          subtitle={`Fear & Greed: ${sentiment.fearAndGreedIndex.value} (${sentiment.fearAndGreedIndex.category})`}
          icon="🎲"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {poly.map((p, idx) => (
            <DataRow
              key={idx}
              label={p.question}
              description={`Volume: $${(p.volumeUsd / 1e6).toFixed(1)}M`}
              badge={
                <StatusBadge
                  status={p.probability >= 0.7 ? 'healthy' : p.probability >= 0.3 ? 'brass' : 'neutral'}
                  label={`${Math.round(p.probability * 100)}% YES`}
                />
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
