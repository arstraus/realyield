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
import { Save, FolderOpen, BarChart2, LayoutDashboard, TrendingUp, FileText, Table, DollarSign, Edit3, Check, X, Database, LogOut } from 'lucide-react';
import ConfirmModal from './components/ConfirmModal';


function AppContent() {
  // Auth hook - must be first
  const { isAuthenticated, loading, user, signOut, environment } = useAuth();
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
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState('');
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

  // Scenario name editing handlers
  const startEditingName = () => {
    setEditingNameValue(scenarioName);
    setIsEditingName(true);
  };

  const saveNameEdit = () => {
    const trimmed = editingNameValue.trim();
    setScenarioName(trimmed || 'Untitled Analysis');
    setIsEditingName(false);
  };

  const cancelNameEdit = () => {
    setIsEditingName(false);
    setEditingNameValue('');
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveNameEdit();
    } else if (e.key === 'Escape') {
      cancelNameEdit();
    }
  };

  // Handle saving (simple file save)
  const handleSave = async () => {
    // Logic handled by Quick Save mostly, but if we need a direct save:
    handleQuickSave();
  };

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

  // Scenario Name Editor Component
  const ScenarioNameEditor = () => (
    <div className="flex items-center">
      {isEditingName ? (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={editingNameValue}
            onChange={(e) => setEditingNameValue(e.target.value)}
            onKeyDown={handleNameKeyDown}
            autoFocus
            className="px-2 py-1 text-lg font-semibold border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            placeholder="Enter scenario name..."
          />
          <button
            onClick={saveNameEdit}
            className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded"
            title="Save"
          >
            <Check size={18} />
          </button>
          <button
            onClick={cancelNameEdit}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded"
            title="Cancel"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <button
          onClick={startEditingName}
          className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors group"
          title="Click to rename"
        >
          <span className="text-lg font-semibold text-slate-800">{scenarioName}</span>
          <Edit3 size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      )}
    </div>
  );

  // Header Actions
  const headerActions = (
    <div className="flex space-x-2 items-center">
      <ScenarioNameEditor />
      <div className="w-px bg-slate-200 mx-2 h-6"></div>

      {/* Save Button - save to database */}
      <button
        onClick={handleQuickSave}
        className="flex items-center px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-sm"
        title={currentDbId ? "Save to database" : "Save to library"}
      >
        <Save size={18} className="mr-2" />
        Save
      </button>

      {/* Library - browse and manage saved scenarios */}
      <button
        onClick={() => setShowScenarioManager(true)}
        className="flex items-center px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
        title="Browse saved scenarios"
      >
        <Database size={18} className="mr-2" />
        Library
      </button>

      {/* User menu (web only) */}
      {environment === 'web' && user && (
        <>
          <div className="w-px bg-slate-200 mx-1 h-6"></div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600 hidden sm:inline">{user.email}</span>
            <button
              onClick={signOut}
              className="flex items-center px-2 py-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`
        flex items-center px-4 py-3 border-b-2 text-sm font-medium transition-colors whitespace-nowrap
        ${activeTab === id
          ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50'
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
      `}
    >
      <Icon size={18} className={`mr-2 ${activeTab === id ? 'text-emerald-600' : 'text-slate-400'}`} />
      {label}
    </button>
  );

  return (
    <Layout onNewAnalysis={handleNewAnalysis} actions={headerActions}>
      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200 mb-6 -mt-8 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto no-scrollbar">
            <TabButton id="inputs" label="Inputs" icon={FolderOpen} />
            <TabButton id="analysis" label="Analysis" icon={LayoutDashboard} />
            <TabButton id="compare" label="Compare" icon={BarChart2} />
            <TabButton id="proforma" label="Pro Forma" icon={Table} />
            <TabButton id="sensitivity" label="Sensitivity" icon={TrendingUp} />
            <TabButton id="loans" label="Loans" icon={DollarSign} />
            <TabButton id="memo" label="Memo" icon={FileText} />
          </div>
        </div>
      </div>

      <div className="mt-6">
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
      </div>



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
