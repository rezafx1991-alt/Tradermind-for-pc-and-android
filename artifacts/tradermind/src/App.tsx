import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { VideoTemplate } from './components/video/VideoTemplate';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as CapacitorApp } from '@capacitor/app';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster, toast } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';

// Hash-based location hook برای Electron (file:// protocol)
// FIX: query params را از path جدا می‌کنیم تا Wouter route matching درست کار کند
// مثال: hash="#/journal/trades/new?editId=xxx" → path="/journal/trades/new"
// query params از طریق window.location.hash مستقیماً در دسترس است
function useElectronHashLocation(): [string, (to: string) => void] {
  const getPathOnly = () => {
    const hash = window.location.hash.replace(/^#/, '') || '/';
    return hash.split('?')[0]; // فقط path - بدون query string
  };
  const [path, setPath] = useState<string>(getPathOnly);
  useEffect(() => {
    const handler = () => setPath(getPathOnly());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  const navigate = useCallback((to: string) => { window.location.hash = to; }, []);
  return [path, navigate];
}
import { ThemeProvider } from './components/ThemeProvider';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LockScreen } from './components/LockScreen';
import { seedInitialData } from './services/seedService';
import { useSecurityStore } from './security/useSecurityStore';
import { NavigationGuardProvider } from './navigation/NavigationGuard';
import { reminderService } from './services/reminderService';
import { normalizeExistingTrades } from './services/tradeNormalizationService';

// ── Lazy-loaded pages (code splitting برای بارگذاری سریع‌تر)
const Dashboard        = lazy(() => import('./pages/Dashboard'));
const StrategiesList   = lazy(() => import('./pages/StrategiesList'));
const StrategyBuilder  = lazy(() => import('./pages/StrategyBuilder'));
const AnalysisList     = lazy(() => import('./pages/AnalysisList'));
const NewAnalysis      = lazy(() => import('./pages/NewAnalysis'));
const SessionRunner    = lazy(() => import('./pages/SessionRunner'));
const TradeJournal     = lazy(() => import('./pages/TradeJournal'));
const NewTrade         = lazy(() => import('./pages/NewTrade'));
const TradeDetail      = lazy(() => import('./pages/TradeDetail'));
const DailyJournalList = lazy(() => import('./pages/DailyJournalList'));
const DailyEntry       = lazy(() => import('./pages/DailyEntry'));
const Reports          = lazy(() => import('./pages/Reports'));
const SymbolsList      = lazy(() => import('./pages/SymbolsList'));
const SymbolKnowledge  = lazy(() => import('./pages/SymbolKnowledge'));
const BackupRestore    = lazy(() => import('./pages/BackupRestore'));
const Settings         = lazy(() => import('./pages/Settings'));
const NotFound         = lazy(() => import('./pages/not-found'));
const PostTradeReview  = lazy(() => import('./pages/PostTradeReview'));
const LiveTrade        = lazy(() => import('./pages/LiveTrade'));
const EdgeAnalytics    = lazy(() => import('./pages/EdgeAnalytics'));
const TraderProfile    = lazy(() => import('./pages/TraderProfile'));
const KnowledgeBase    = lazy(() => import('./pages/KnowledgeBase'));
const TradeReplay            = lazy(() => import('./pages/TradeReplay'));
const MarketContextList      = lazy(() => import('./pages/MarketContextList'));
const MarketContextSession   = lazy(() => import('./pages/MarketContextSession'));
const DataImport             = lazy(() => import('./pages/DataImport'));
const DataQuality            = lazy(() => import('./pages/DataQuality'));
const SearchPage             = lazy(() => import('./pages/Search'));
const DevDiagnostics         = import.meta.env.DEV ? lazy(() => import('./pages/DevDiagnostics')) : null;
const RiskManagement         = lazy(() => import('./pages/RiskManagement'));
const RiskPlanner            = lazy(() => import('./pages/RiskPlanner'));
const RiskProfile            = lazy(() => import('./pages/RiskProfile'));
const PerformanceDashboard   = lazy(() => import('./pages/PerformanceDashboard'));
const ScreenshotIntelligence = lazy(() => import('./pages/ScreenshotIntelligence'));
const AdvancedAnalytics      = lazy(() => import('./pages/AdvancedAnalytics'));
const TradeInsights          = lazy(() => import('./pages/TradeInsights'));
const TradingPsychology      = lazy(() => import('./pages/TradingPsychology'));
const Accounts               = lazy(() => import('./pages/Accounts'));
const TradingBoxes           = lazy(() => import('./pages/TradingBoxes'));
const Reminders              = lazy(() => import('./pages/Reminders'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

// ── Loading fallback برای Suspense (skeleton layout)
function PageLoader() {
  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 animate-in fade-in duration-200">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-primary/10 rounded-md animate-pulse" />
        <div className="h-4 w-72 bg-primary/10 rounded-md animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-primary/10 animate-pulse" />
        ))}
      </div>
      <div className="h-56 rounded-xl bg-primary/10 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-40 rounded-xl bg-primary/10 animate-pulse" />
        <div className="h-40 rounded-xl bg-primary/10 animate-pulse" />
      </div>
    </div>
  );
}

// ── مدیریت Auto-Lock ─────────────────────────────────────
/**
 * یک کامپوننت بدون رندر که:
 * ۱. در شروع برنامه اگر امنیت فعال باشد، قفل را تنظیم می‌کند
 * ۲. بر اساس autoLockMinutes تایمر قفل را مدیریت می‌کند
 * ۳. به رویدادهای Visibility Change گوش می‌دهد
 */
function AutoLockManager() {
  const { isEnabled, autoLockMinutes, isLocked, lock, touchActivity } = useSecurityStore();

  // قفل اولیه: هنگام باز شدن برنامه
  useEffect(() => {
    if (isEnabled) {
      lock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // مدیریت تایمر auto-lock و visibility
  useEffect(() => {
    if (!isEnabled || isLocked) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const resetTimer = () => {
      touchActivity();
      if (timer) clearTimeout(timer);
      if (autoLockMinutes > 0) {
        timer = setTimeout(() => lock(), autoLockMinutes * 60_000);
      }
    };

    const isEditingText = () => {
      const active = document.activeElement;
      return active instanceof HTMLInputElement
        || active instanceof HTMLTextAreaElement
        || active instanceof HTMLElement && active.isContentEditable;
    };

    // On Android the keyboard's voice-typing UI can briefly change WebView
    // visibility while the text field remains focused. Do not lock over an
    // active editor in that transient browser event.
    const handleVisibilityChange = () => {
      if (document.hidden && autoLockMinutes === 0 && !isEditingText()) {
        lock();
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const;
    events.forEach(e => document.addEventListener(e, resetTimer, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Capacitor's app-state event represents an actual native background
    // transition and is therefore safer than using WebView visibility alone.
    let disposed = false;
    let removeAppStateListener: (() => void) | null = null;
    CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (!isActive && autoLockMinutes === 0) lock();
    }).then(handle => {
      if (disposed) handle.remove();
      else removeAppStateListener = () => { void handle.remove(); };
    });

    // شروع تایمر
    if (autoLockMinutes > 0) {
      timer = setTimeout(() => lock(), autoLockMinutes * 60_000);
    }

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach(e => document.removeEventListener(e, resetTimer));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      disposed = true;
      removeAppStateListener?.();
    };
  }, [isEnabled, autoLockMinutes, isLocked, lock, touchActivity]);

  return null;
}

// ── Router ────────────────────────────────────────────────
function Router() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/strategies" component={StrategiesList} />
          <Route path="/strategies/:id" component={StrategyBuilder} />

          <Route path="/analysis" component={AnalysisList} />
          <Route path="/analysis/new" component={NewAnalysis} />
          <Route path="/analysis/:id" component={SessionRunner} />

          <Route path="/journal/trades" component={TradeJournal} />
          <Route path="/journal/trades/new" component={NewTrade} />
          <Route path="/journal/trades/:id/review" component={PostTradeReview} />
          <Route path="/journal/trades/:id/live" component={LiveTrade} />
          <Route path="/journal/trades/:id" component={TradeDetail} />

          <Route path="/journal/daily" component={DailyJournalList} />
          <Route path="/journal/daily/:date" component={DailyEntry} />
          <Route path="/journal/insights" component={TradeInsights} />

          <Route path="/reports" component={Reports} />
          <Route path="/analytics/edge" component={EdgeAnalytics} />
          <Route path="/analytics/advanced" component={AdvancedAnalytics} />
          <Route path="/profile" component={TraderProfile} />
          <Route path="/knowledge" component={KnowledgeBase} />
          <Route path="/replay" component={TradeReplay} />

          <Route path="/market-context" component={MarketContextList} />
          <Route path="/market-context/:id" component={MarketContextSession} />

          <Route path="/symbols" component={SymbolsList} />
          <Route path="/symbols/:symbol" component={SymbolKnowledge} />
          <Route path="/import" component={DataImport} />
          <Route path="/data-quality" component={DataQuality} />
          <Route path="/search" component={SearchPage} />
          <Route path="/performance" component={PerformanceDashboard} />

          <Route path="/risk/management" component={RiskManagement} />
          <Route path="/risk/planner" component={RiskPlanner} />
          <Route path="/risk/profile" component={RiskProfile} />

          <Route path="/analytics/psychology" component={TradingPsychology} />
          <Route path="/screenshots" component={ScreenshotIntelligence} />

          <Route path="/accounts" component={Accounts} />
          <Route path="/trading-boxes" component={TradingBoxes} />
          <Route path="/reminders" component={Reminders} />

          <Route path="/backup" component={BackupRestore} />
          <Route path="/settings" component={Settings} />

          {DevDiagnostics && (
            <Route path="/dev" component={DevDiagnostics} />
          )}

          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

// ── محتوای اصلی با بررسی قفل ─────────────────────────────
function AppContent() {
  const { isEnabled, isLocked } = useSecurityStore();

  useEffect(() => {
    void seedInitialData().then(async () => {
      const normalized = await normalizeExistingTrades();
      if (normalized.updated > 0) {
        toast.success(
          `${normalized.updated} معامله اصلاح شد؛ ${normalized.closed} معامله بسته و ${normalized.sessionsDetected} سشن تشخیص داده شد.`,
        );
      }
    }).catch((error) => {
      // Seed داده کمکی توسعه است و نباید شکست آن رابط اصلی برنامه را
      // از کار بیندازد.
      console.error('[TraderMind startup]', error);
    });
    void reminderService.initialize().catch(error => {
      console.error('[TraderMind reminders]', error);
    });
  }, []);

  return (
    <>
      <AutoLockManager />
      {/* اگر قفل فعال و بسته باشد، صفحه قفل نمایش داده می‌شود */}
      {isEnabled && isLocked && <LockScreen />}
      <Router />
    </>
  );
}

// ── App اصلی ────────────────────────────────────────────
function App() {
  if (window.location.pathname.includes('/video') || window.location.hash === '#/video') {
    return <VideoTemplate />;
  }
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <WouterRouter
              hook={window.location.protocol === 'file:' ? useElectronHashLocation : undefined}
              base={window.location.protocol === 'file:' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '')}
            >
              <NavigationGuardProvider>
                <AppContent />
              </NavigationGuardProvider>
            </WouterRouter>
            <Toaster />
            <SonnerToaster
              theme="system"
              position="top-center"
              richColors
              closeButton
            />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
