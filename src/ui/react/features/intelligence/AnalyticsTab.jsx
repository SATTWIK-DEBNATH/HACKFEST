import React, { useState } from 'react';
import { SectionHeader, Metric, StatusBadge, DataRow, EmptyState } from '../../components/index.js';
import { analyticalStack } from '../../../../intelligence/analyticalStack.js';

export function AnalyticsTab({ onFlyTo }) {
  const [brief] = useState(() => analyticalStack.generateIntelligenceBrief());
  const [scorecard] = useState(() => analyticalStack.getPublicAccuracyScorecard());
  const [forecasts] = useState(() => analyticalStack.getAllForecasts());
  const [convergences] = useState(() => analyticalStack.detectSpatialConvergence());

  // RAG Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Chat State
  const [chatLog, setChatLog] = useState([
    { sender: 'bot', text: 'RAD Intelligence Operator initialized. Ingesting multi-sensor telemetry across 770+ upstream feeds.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const results = analyticalStack.queryRAGMemory(searchQuery, 4);
    setSearchResults(results);
  };

  const handleSendChat = (e) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    const reply = analyticalStack.askChatAnalyst(userMsg);
    setChatLog((prev) => [
      ...prev,
      { sender: 'user', text: userMsg },
      { sender: 'bot', text: reply }
    ]);
    setChatInput('');
  };

  return (
    <div className="rad-tab-content-flow" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Situational Intelligence Brief */}
      <div className="intel-card">
        <SectionHeader
          title="Situational Intelligence Brief"
          subtitle={`Tier: ${brief.summarizerTier.toUpperCase()}`}
          icon="📝"
        />
        <div className="intel-brief-box" style={{ marginTop: '6px' }}>
          <strong>{brief.headline}</strong>
          <br /><br />
          {brief.body}
        </div>
        <div className="intel-sources-list">
          <span style={{ fontWeight: 600, color: 'var(--signal-cyan-active)' }}>
            PROVENANCE & CITATIONS:
          </span>
          {brief.citations.map((c) => (
            <div key={c.ref} className="intel-source-item">
              <span><strong>[{c.ref}]</strong> {c.title} ({c.source})</span>
              <StatusBadge status="healthy" label={`${Math.round(c.trustScore * 100)}% Trust`} />
            </div>
          ))}
        </div>
      </div>

      {/* Deduction & Forecasting Engine */}
      <div className="intel-card">
        <SectionHeader
          title="Deduction & Forecasting Engine"
          subtitle={`Public Scorecard: ${scorecard.accuracyRate}`}
          icon="🔮"
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '6px' }}>
          <Metric label="Accuracy Rate" value={scorecard.accuracyRate} trend="Verified" trendDirection="up" />
          <Metric label="Brier Score" value={scorecard.brierScore} subtitle="Lower is better" />
          <Metric label="Forecasts" value={scorecard.totalForecasts} subtitle={`${scorecard.resolvedForecasts} Resolved`} />
        </div>

        <div style={{ fontSize: '9.5px', fontWeight: 600, color: 'var(--signal-cyan-active)', marginTop: '8px' }}>
          ACTIVE HYPOTHESES & PROJECTIONS:
        </div>
        {forecasts.map((f) => (
          <div key={f.id} className="intel-forecast-item">
            <div className="intel-forecast-header">
              <span className="intel-forecast-hypothesis">{f.hypothesis}</span>
              <StatusBadge status="brass" label={`${Math.round(f.confidence * 100)}% CONF`} />
            </div>
            <div className="intel-forecast-steps">
              <div className="intel-forecast-step-card">
                <span className="intel-forecast-step-time">12 Hours</span>
                <span className="intel-forecast-step-desc">{f.steps.t12h}</span>
              </div>
              <div className="intel-forecast-step-card">
                <span className="intel-forecast-step-time">24 Hours</span>
                <span className="intel-forecast-step-desc">{f.steps.t24h}</span>
              </div>
              <div className="intel-forecast-step-card">
                <span className="intel-forecast-step-time">48 Hours</span>
                <span className="intel-forecast-step-desc">{f.steps.t48h}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Geospatial Convergence Radar */}
      <div className="intel-card">
        <SectionHeader
          title="Geospatial Convergence Radar"
          subtitle="1°×1° Bin Intersections"
          icon="📍"
        />
        {convergences.map((c) => (
          <div key={c.id} className="intel-conv-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <StatusBadge
                status={c.severity === 'CRITICAL' ? 'critical' : 'warning'}
                label={c.severity}
              />
              <button
                type="button"
                className="intel-fly-btn"
                onClick={() => onFlyTo?.(c.lon, c.lat, 1500000)}
                title={`Fly globe to (${c.lat.toFixed(1)}°, ${c.lon.toFixed(1)}°)`}
              >
                🌐 FLY TO ({c.lat.toFixed(1)}°, {c.lon.toFixed(1)}°)
              </button>
            </div>
            <div style={{ fontWeight: 600, color: 'var(--accent-brass)', fontSize: '10.5px' }}>
              {c.location}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-primary)' }}>{c.description}</div>
            <div style={{ fontSize: '8.5px', color: 'var(--text-secondary)' }}>
              Domains: {c.domains.join(' + ')}
            </div>
          </div>
        ))}
      </div>

      {/* Client-Side RAG Memory */}
      <div className="intel-card">
        <SectionHeader
          title="Client-Side RAG Memory Retrieval"
          subtitle="Cosine Vector Similarity"
          icon="💾"
        />
        <form onSubmit={handleSearch} className="intel-rag-input-row">
          <input
            type="text"
            className="intel-input"
            placeholder="Query semantic memory (e.g. Taiwan, Red Sea, Cable, Solar flare)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search semantic memory"
          />
          <button type="submit" className="rad-panel-btn-icon" style={{ padding: '6px 12px', fontWeight: 600 }}>
            SEARCH
          </button>
        </form>

        {searchQuery.trim() && searchResults.length === 0 ? (
          <EmptyState
            title="No matching intel in vector store"
            description="Try searching for 'Taiwan', 'Hormuz', 'Cable', or 'Gold'."
            actionLabel="Clear Search"
            onAction={() => {
              setSearchQuery('');
              setSearchResults([]);
            }}
          />
        ) : (
          searchResults.length > 0 && (
            <div className="intel-rag-results">
              {searchResults.map((r) => (
                <DataRow
                  key={r.id}
                  label={r.title}
                  description={r.content}
                  badge={<StatusBadge status="healthy" label={`${Math.round(r.similarity * 100)}% MATCH`} />}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* AI Analyst Assistant */}
      <div className="intel-card">
        <SectionHeader
          title="AI Intel Analyst Assistant"
          subtitle="Heuristic Co-Pilot"
          icon="🤖"
        />
        <div className="intel-chat-log" role="log" aria-live="polite">
          {chatLog.map((msg, i) => (
            <div key={i} className={`intel-chat-msg ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <form onSubmit={handleSendChat} className="intel-rag-input-row">
          <input
            type="text"
            className="intel-input"
            placeholder="Ask AI Analyst (e.g., Red Sea risks, yield curve, cut cables)..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            aria-label="Message AI Analyst"
          />
          <button type="submit" className="rad-panel-btn-icon" style={{ padding: '6px 12px', fontWeight: 600 }}>
            SEND
          </button>
        </form>
      </div>
    </div>
  );
}
