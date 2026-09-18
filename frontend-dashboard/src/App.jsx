import LiveRiskFeed from './components/LiveRiskFeed';
import ModelMetrics from './components/ModelMetrics';
import TypologyBreakdown from './components/TypologyBreakdown';

export default function App() {
  return (
    <div style={{ maxWidth: 980, margin: '40px auto', fontFamily: 'sans-serif', padding: 20 }}>
      <h1>PayShield AI Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
        <LiveRiskFeed />
        <ModelMetrics />
      </div>
      <TypologyBreakdown />
    </div>
  );
}
