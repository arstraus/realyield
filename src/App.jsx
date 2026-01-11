import React, { useState, useMemo } from 'react';
import Layout from './components/Layout';
import InputSection from './components/InputSection';
import Dashboard from './components/Dashboard';
import ComparisonView from './components/ComparisonView';
import ProFormaTable from './components/ProFormaTable';
import LoanComparisonTool from './components/LoanComparisonTool';
import SensitivityAnalysis from './components/SensitivityAnalysis';
import InvestmentMemo from './components/InvestmentMemo';
import ScenarioManager from './components/ScenarioManager';
import AuthPage from './components/AuthPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DEFAULT_PROPERTY, DEFAULT_FINANCING, DEFAULT_OPERATIONS, DEFAULT_TAX_MARKET, DEFAULT_CLOSING_COSTS } from './utils/constants';
import { generateForecast } from './utils/financials';
import { mergeScenarioData } from './utils/scenarioHelpers';
import * as dataService from './services/dataService';
import { useToast } from './components/Toast';
import ConfirmModal from './components/ConfirmModal';


function AppContent() {
  // Auth hook - must be first
  const { isAuthenticated, loading, user, signOut } = useAuth();
  const toast = useToast();

  // All state hooks - must be called unconditionally (React rules of hooks)
  const [property, setProperty] = useState(DEFAULT_PROPERTY);
  const [financing, setFinancing] = useState(DEFAULT_FINANCING);
  const [operations, setOperations] = useState(DEFAULT_OPERATIONS);
  const [taxMarket, setTaxMarket] = useState(DEFAULT_TAX_MARKET);
  const [closingCosts, setClosingCosts] = useState(DEFAULT_CLOSING_COSTS);
  const [activeTab, setActiveTab] = useState('inputs');
  const [currentDbId, setCurrentDbId] = useState(null);
  const [scenarioName, setScenarioName] = useState('Untitled Analysis');
  const [comparisonScenarios, setComparisonScenarios] = useState([]);
  const [showScenarioManager, setShowScenarioManager] = useState(false);
  const [showNewAnalysisModal, setShowNewAnalysisModal] = useState(false);

  // useMemo must be called unconditionally (before any returns)
  const results = useMemo(() => {
    return generateForecast(property, financing, operations, taxMarket, closingCosts);
  }, [property, financing, operations, taxMarket, closingCosts]);

  // NOW we can have conditional returns (after all hooks)
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const handleQuickSave = async () => {
    try {
      // If loaded from database, update in database
      if (currentDbId) {
        await dataService.updateScenario(currentDbId, {
          name: scenarioName,
          property: { address: property.address, city: property.city, state: property.state },
          data: { property, financing, operations, taxMarket, closingCosts }
        });
        toast.success('Scenario saved to library');
        return;
      }

      // Otherwise, open the scenario manager to save to database
      setShowScenarioManager(true);
    } catch (err) {
      console.error("Failed to save:", err);
      toast.error('Failed to save changes');
    }
  };

  const loadScenarioFromCompare = (data, name) => {
    if (data) {
      if (data.property) setProperty(data.property);
      if (data.financing) setFinancing(data.financing);
      if (data.operations) setOperations(data.operations);
      if (data.taxMarket) setTaxMarket(data.taxMarket);
      if (data.closingCosts) setClosingCosts(data.closingCosts);

      setScenarioName(data.scenarioName || name || 'Untitled Analysis');
      setActiveTab('analysis');
    }
  };

  const handleNewAnalysis = () => {
    setShowNewAnalysisModal(true);
  };

  const confirmNewAnalysis = () => {
    setProperty(DEFAULT_PROPERTY);
    setFinancing(DEFAULT_FINANCING);
    setOperations(DEFAULT_OPERATIONS);
    setTaxMarket(DEFAULT_TAX_MARKET);
    setClosingCosts(DEFAULT_CLOSING_COSTS);
    setActiveTab('inputs');
    setShowNewAnalysisModal(false);

    setScenarioName('Untitled Analysis');
    setCurrentDbId(null);
  };

  // Load scenario from database
  const handleLoadFromDatabase = (scenario) => {
    const merged = mergeScenarioData(scenario.data);

    setProperty(merged.property);
    setFinancing(merged.financing);
    setOperations(merged.operations);
    setTaxMarket(merged.taxMarket);
    setClosingCosts(merged.closingCosts);

    setScenarioName(scenario.name || 'Untitled Analysis');
    setCurrentDbId(scenario.id);
    setActiveTab('analysis');
    toast.success(`Loaded "${scenario.name}"`);
  };

  // Handle save callback from ScenarioManager
  const handleSaveToDatabase = (savedScenario) => {
    setCurrentDbId(savedScenario.id);
    setScenarioName(savedScenario.name);
    toast.success(`Saved "${savedScenario.name}" to library`);
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={user}
      onSignOut={signOut}
      onNewAnalysis={handleNewAnalysis}
      onSave={handleQuickSave}
      onOpenLibrary={() => setShowScenarioManager(true)}
      scenarioName={scenarioName}
      currentDbId={currentDbId}
    >
      {/* Content based on active tab */}
      {activeTab === 'inputs' && (
        <div className="max-w-3xl mx-auto">
          <InputSection
            property={property} setProperty={setProperty}
            financing={financing} setFinancing={setFinancing}
            operations={operations} setOperations={setOperations}
            taxMarket={taxMarket} setTaxMarket={setTaxMarket}
            closingCosts={closingCosts} setClosingCosts={setClosingCosts}
          />
        </div>
      )}

      {activeTab === 'analysis' && (
        <Dashboard
          metrics={results.metrics}
          forecast={results.forecast}
          amortizationSchedule={results.amortizationSchedule}
          loanAmount={property.purchasePrice * (1 - financing.downPaymentPercent / 100)}
        />
      )}

      {activeTab === 'compare' && (
        <ComparisonView
          comparisonScenarios={comparisonScenarios}
          setComparisonScenarios={setComparisonScenarios}
          currentScenario={{ property, financing, operations, taxMarket, closingCosts }}
          onLoad={loadScenarioFromCompare}
        />
      )}

      {activeTab === 'proforma' && (
        <ProFormaTable forecast={results.forecast} />
      )}

      {activeTab === 'sensitivity' && (
        <SensitivityAnalysis
          property={property}
          financing={financing}
          operations={operations}
          taxMarket={taxMarket}
          closingCosts={closingCosts}
        />
      )}

      {activeTab === 'loans' && (
        <LoanComparisonTool
          purchasePrice={property.purchasePrice}
          downPaymentPercent={financing.downPaymentPercent}
        />
      )}

      {activeTab === 'memo' && (
        <InvestmentMemo
          property={property}
          financing={financing}
          operations={operations}
          taxMarket={taxMarket}
          closingCosts={closingCosts}
          metrics={results.metrics}
          forecast={results.forecast}
          scenarioName={scenarioName}
        />
      )}

      <ConfirmModal
        isOpen={showNewAnalysisModal}
        onClose={() => setShowNewAnalysisModal(false)}
        onConfirm={confirmNewAnalysis}
        title="Start New Analysis?"
        message="Are you sure you want to start a new analysis? Any unsaved changes to the current scenario will be lost."
        confirmText="Start New"
      />

      <ScenarioManager
        isOpen={showScenarioManager}
        onClose={() => setShowScenarioManager(false)}
        currentScenario={{ property, financing, operations, taxMarket, closingCosts }}
        scenarioName={scenarioName}
        onLoadScenario={handleLoadFromDatabase}
        onSaveScenario={handleSaveToDatabase}
      />
    </Layout>
  );
}

// Main App wrapper with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
