import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { DeviceDebugPage } from './pages/DeviceDebugPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/debug" element={<DeviceDebugPage />} />
      </Routes>
    </Router>
  );
}

export default App;
