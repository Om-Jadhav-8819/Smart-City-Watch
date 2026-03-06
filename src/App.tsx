import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import useSimulation from './hooks/useSimulation';
import useCityData from './hooks/useCityData';
import { COLORS } from './data/cityConstants';

// Auth Components
import LandingPage from './components/auth/LandingPage';
import SignInForm from './components/auth/SignInForm';
import SignUpForm from './components/auth/SignUpForm';

// Layout Components
import AdminLayout from './components/layout/AdminLayout';
import PublicLayout from './components/layout/PublicLayout';

// Admin Views
import Dashboard from './components/admin/Dashboard';
import Predictions from './components/admin/Predictions';
import WhatIf from './components/admin/WhatIf';
import ZoneManager from './components/admin/ZoneManager';
import AdminBot from './components/admin/AdminBot';

// Public Views
import PublicPortal from './components/public/PublicPortal';
import CitizenBot from './components/public/CitizenBot';

export default function App() {
  const { currentUser, isAuthenticated, authLoading, signOut, apiKey, setApiKey } = useAuth();
  const { 
    zones, simHour, history, resetSimulation, updateZone,
    customAssets, customUtilizations, customHistory,
    addCustomAsset, updateCustomAsset, deleteCustomAsset
  } = useSimulation();
  
  const { 
    cityHealthScore, criticalAssets, warningAssets, populationAtRisk, avgUtilByZone,
    customAssetAlerts
  } = useCityData(zones, customAssets, customUtilizations);

  const [authView, setAuthView] = useState({ role: '', type: 'landing' });
  const [adminView, setAdminView] = useState('dashboard');
  const [publicView, setPublicView] = useState('portal');

  // Handle Auth Routing
  if (authLoading) {
    return (
      <div style={{ height: "100vh", width: "100vw", backgroundColor: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.dimText }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "12px", color: COLORS.blue }}>CityVitals</div>
          <div style={{ fontSize: "12px", letterSpacing: "2px" }}>INITIALIZING SYSTEMS...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView.type === 'landing') {
      return <LandingPage onSelectRole={(role, type) => setAuthView({ role, type })} />;
    }
    if (authView.type === 'signin') {
      return (
        <SignInForm 
          role={authView.role} 
          onBack={() => setAuthView({ role: '', type: 'landing' })} 
          onSwitchToSignUp={() => setAuthView({ ...authView, type: 'signup' })} 
        />
      );
    }
    if (authView.type === 'signup') {
      return (
        <SignUpForm 
          role={authView.role} 
          onBack={() => setAuthView({ role: '', type: 'landing' })} 
          onSwitchToSignIn={() => setAuthView({ ...authView, type: 'signin' })} 
        />
      );
    }
  }

  // Authenticated Views
  if (currentUser.role === 'admin') {
    return (
      <AdminLayout 
        activeView={adminView} 
        setView={setAdminView} 
        user={currentUser} 
        onSignOut={signOut}
        simHour={simHour}
        healthScore={cityHealthScore}
        criticalCount={criticalAssets.length + customAssetAlerts.length}
        customAssets={customAssets}
        customUtilizations={customUtilizations}
      >
        {adminView === 'dashboard' && (
          <Dashboard 
            zones={zones} 
            health={cityHealthScore} 
            criticalAssets={criticalAssets} 
            warningAssets={warningAssets} 
            populationAtRisk={populationAtRisk}
            user={currentUser}
            customAssets={customAssets}
            customUtilizations={customUtilizations}
          />
        )}
        {adminView === 'predictions' && (
          <Predictions 
            zones={zones} 
            history={history} 
            customAssets={customAssets}
            customUtilizations={customUtilizations}
            customHistory={customHistory}
          />
        )}
        {adminView === 'whatif' && <WhatIf zones={zones} />}
        {adminView === 'zones' && (
          <ZoneManager 
            zones={zones} 
            history={history}
            updateZone={updateZone} 
            user={currentUser}
            customAssets={customAssets}
            customUtilizations={customUtilizations}
            customHistory={customHistory}
            addCustomAsset={addCustomAsset}
            updateCustomAsset={updateCustomAsset}
            deleteCustomAsset={deleteCustomAsset}
          />
        )}
        {adminView === 'adminbot' && (
          <AdminBot 
            zones={zones} 
            simHour={simHour} 
            history={history} 
            user={currentUser} 
            apiKey={apiKey}
            setApiKey={setApiKey}
          />
        )}
      </AdminLayout>
    );
  }

  // Public Role
  return (
    <PublicLayout 
      activeView={publicView} 
      setView={setPublicView} 
      user={currentUser} 
      onSignOut={signOut}
      criticalCount={criticalAssets.length}
    >
      {publicView === 'portal' && <PublicPortal zones={zones} user={currentUser} avgUtilByZone={avgUtilByZone} />}
      {publicView === 'citizenbot' && (
        <CitizenBot 
          zones={zones} 
          simHour={simHour} 
          user={currentUser} 
          apiKey={apiKey}
          setApiKey={setApiKey}
        />
      )}
    </PublicLayout>
  );
}
