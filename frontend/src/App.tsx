import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import OnboardingForm from './pages/OnboardingForm';
import EngineerManagement from './pages/EngineerManagement';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/onboarding/new" element={<OnboardingForm />} />
        <Route path="/onboarding/:id" element={<OnboardingForm />} />
        <Route path="/engineers" element={<EngineerManagement />} />
      </Routes>
    </Layout>
  );
}

export default App;
