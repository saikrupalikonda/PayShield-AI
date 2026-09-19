import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ChatbotDrawer } from './components/chat/ChatbotDrawer';
import { Dashboard } from './pages/Dashboard';
import { DetectPage } from './pages/DetectPage';
import { ReportPage } from './pages/ReportPage';
import { HistoryPage } from './pages/HistoryPage';
import { AwarenessPage } from './pages/AwarenessPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminEvalPage } from './pages/AdminEvalPage';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { useAuth } from './context/AuthContext';
import { RiskAnalysisResult, MessageAnalysisResponse } from './types';
import { MessageReportPage } from './pages/MessageReportPage';

export const App: React.FC = () => {
  const { user, token, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeReport, setActiveReport] = useState<RiskAnalysisResult | null>(null);
  const [activeMessageReport, setActiveMessageReport] = useState<MessageAnalysisResponse | null>(null);
  const [initialDetectTab, setInitialDetectTab] = useState<string>('qr');
  const [initialArticleId, setInitialArticleId] = useState<string | undefined>(undefined);
  const [chatForceOpen, setChatForceOpen] = useState<boolean>(false);

  const handleNavigate = (tab: string, contextData?: any) => {
    if (tab === 'detect' && contextData?.tab) {
      setInitialDetectTab(contextData.tab);
    }
    if (tab === 'awareness' && contextData?.articleId) {
      setInitialArticleId(contextData.articleId);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalysisComplete = (result: RiskAnalysisResult) => {
    setActiveReport(result);
    setCurrentTab('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMessageAnalysisComplete = (result: MessageAnalysisResponse) => {
    setActiveMessageReport(result);
    setCurrentTab('message-report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-navy-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Initializing PayShield Protection Layer...
          </span>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Login Page
  if (!token) {
    return <Login onSuccess={() => setCurrentTab('dashboard')} />;
  }

  // Logged in but not onboarded -> Show Onboarding
  if (user && !user.is_onboarded) {
    return <Onboarding onComplete={() => setCurrentTab('dashboard')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Sticky Navbar */}
      <Navbar currentTab={currentTab} onNavigate={handleNavigate} />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <Dashboard 
            onNavigate={handleNavigate}
            onSelectScenario={handleAnalysisComplete}
          />
        )}

        {currentTab === 'detect' && (
          <DetectPage
            initialTab={initialDetectTab}
            onAnalysisComplete={handleAnalysisComplete}
            onMessageAnalysisComplete={handleMessageAnalysisComplete}
          />
        )}

        {currentTab === 'report' && activeReport && (
          <ReportPage
            report={activeReport}
            onBack={() => setCurrentTab('detect')}
            onPaymentOutcomeRecorded={() => {
              // Outcome logged
            }}
          />
        )}

        {currentTab === 'message-report' && activeMessageReport && (
          <MessageReportPage
            report={activeMessageReport}
            onBack={() => setCurrentTab('detect')}
            onOpenChatWithContext={(rep) => {
              setChatForceOpen(true);
            }}
          />
        )}

        {currentTab === 'history' && (
          <HistoryPage
            onViewReport={handleAnalysisComplete}
            onViewMessageReport={handleMessageAnalysisComplete}
          />
        )}

        {currentTab === 'awareness' && (
          <AwarenessPage initialArticleId={initialArticleId} />
        )}

        {currentTab === 'profile' && (
          <ProfilePage />
        )}

        {currentTab === 'admin' && (
          <AdminEvalPage />
        )}

        {currentTab === 'login' && (
          <Login onSuccess={() => setCurrentTab('dashboard')} />
        )}
      </main>

      {/* Floating Context-Aware Chatbot ("Ask PayShield") */}
      <ChatbotDrawer
        currentRiskReport={activeReport}
        currentMessageReport={activeMessageReport}
        forceOpen={chatForceOpen}
      />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

    </div>
  );
};
