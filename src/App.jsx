import React, { useState, useEffect, useRef, useMemo, createContext, useContext } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  ComposedChart
} from 'recharts';
import { 
  Activity, AlertCircle, Box, CheckCircle, ChevronRight, Clock, Cloud, 
  Database, DollarSign, Factory, FileText, Filter, Globe, 
  Info, Key, Layers, LayoutDashboard, Leaf, Lock, LogOut, Mail, 
  MoreVertical, Package, Plus, RefreshCw, Search, Server, Settings, Shield, 
  Star, Target, TrendingDown, TrendingUp, Truck, Users, X, Zap, 
  ShieldCheck, History, Fingerprint, Calendar, Download, AlertTriangle
} from 'lucide-react';

// ============================================================================
// 1. DATA ACCESS LAYER (MOCK DATABASE & API CLIENT)
// ============================================================================

const MOCK_DB = {
  tenant: { id: 'TENANT-8842', name: 'Acme Electronics Corp', tier: 'Enterprise' },
  users: [
    { id: 'USR-001', email: 'admin@acme.com', name: 'System Admin', role: 'admin', displayRole: 'System Admin', ssoProvider: 'Azure AD' },
    { id: 'USR-002', email: 'jane@acme.com', name: 'Jane Doe', role: 'sustainability_manager', displayRole: 'Sustainability Mgr', ssoProvider: 'Okta' },
    { id: 'USR-003', email: 'alice@acme.com', name: 'Alice Johnson', role: 'procurement', displayRole: 'Procurement Mgr', ssoProvider: 'Google Workspace' },
    { id: 'USR-004', email: 'bob@acme.com', name: 'Bob Williams', role: 'product_manager', displayRole: 'Product Manager', ssoProvider: 'Azure AD' },
    { id: 'USR-005', email: 'sarah@acme.com', name: 'Sarah Lee', role: 'executive', displayRole: 'CSO (Executive)', ssoProvider: 'Okta' },
    { id: 'USR-006', email: 'david@external.com', name: 'David Chen', role: 'auditor', displayRole: 'External Auditor', ssoProvider: 'Ping Identity' }
  ],
  auditLogs: [
    { id: 'AL-993', timestamp: new Date(Date.now() - 3600000).toISOString(), actor: 'System Admin', action: 'DATA_SYNC', resource: 'SAP_ERP', status: 'SUCCESS' },
    { id: 'AL-992', timestamp: new Date(Date.now() - 7200000).toISOString(), actor: 'System', action: 'AI_FACTOR_MAPPING', resource: 'Ecoinvent v3.9', status: 'SUCCESS' },
    { id: 'AL-991', timestamp: new Date(Date.now() - 86400000).toISOString(), actor: 'Jane Doe', action: 'REPORT_GENERATION', resource: 'CSRD Q1', status: 'SUCCESS' },
    { id: 'AL-990', timestamp: new Date(Date.now() - 90000000).toISOString(), actor: 'API_Gateway', action: 'WEBHOOK_INVOCATION', resource: 'Oracle NetSuite', status: 'FAIL' },
  ],
  portfolio: [
    { month: 'Jan', baseline: 450, actual: 450, target: 400, scope1: 45, scope2: 120, scope3: 285 },
    { month: 'Feb', baseline: 460, actual: 440, target: 390, scope1: 42, scope2: 115, scope3: 283 },
    { month: 'Mar', baseline: 470, actual: 430, target: 380, scope1: 40, scope2: 110, scope3: 280 },
    { month: 'Apr', baseline: 480, actual: 415, target: 370, scope1: 38, scope2: 100, scope3: 277 },
    { month: 'May', baseline: 490, actual: 400, target: 360, scope1: 35, scope2: 95,  scope3: 270 },
    { month: 'Jun', baseline: 500, actual: 385, target: 350, scope1: 32, scope2: 88,  scope3: 265 },
  ],
  regional: [
    { region: 'APAC', emissions: 1950, target: 1800 },
    { region: 'North Am.', emissions: 1050, target: 1200 },
    { region: 'EMEA', emissions: 820, target: 950 },
    { region: 'LATAM', emissions: 280, target: 300 },
  ],
  supplierRisk: [
    { name: 'Shenzhen Plastics', emissions: 12500, quality: 35, risk: 80 },
    { name: 'Taiwan Tech Boards', emissions: 8400, quality: 95, risk: 20 },
    { name: 'Seoul Micro', emissions: 6200, quality: 75, risk: 40 },
    { name: 'FastFreight', emissions: 18500, quality: 20, risk: 95 },
    { name: 'Global Metals', emissions: 4300, quality: 85, risk: 30 }
  ],
  hotspots: {
    topDrivers: [
      { name: 'Virgin PC/ABS Housing', emissions: 1250, category: 'Material', quality: 'Primary' },
      { name: 'Lithium-ion Battery Pack', emissions: 980, category: 'Material', quality: 'Secondary' },
      { name: 'Trans-Pacific Air Freight', emissions: 850, category: 'Logistics', quality: 'Spend-based' },
      { name: 'Main PCB Assembly', emissions: 620, category: 'Manufacturing', quality: 'Secondary' },
      { name: 'Cardboard Packaging', emissions: 140, category: 'Packaging', quality: 'Primary' },
    ],
    qualitySplit: [
      { name: 'Primary Data (EPDs)', value: 35, color: '#10b981' },
      { name: 'Secondary Data (LCA DB)', value: 45, color: '#3b82f6' },
      { name: 'Spend-based Estimates', value: 20, color: '#f43f5e' }
    ]
  },
  thermostatBom: [
    { id: 'c1', name: 'Housing (Virgin PC/ABS)', weight: 120, materialEmissionFactor: 3.5, supplier: 'Shenzhen Plastics Co.', location: [22.5431, 114.0579], type: 'supplier', country: 'China', dataSource: 'Primary EPD', confidence: 95 },
    { id: 'c2', name: 'Main PCB', weight: 45, materialEmissionFactor: 25.0, supplier: 'Taiwan Tech Boards', location: [25.0330, 121.5654], type: 'supplier', country: 'Taiwan', dataSource: 'Ecoinvent v3.9', confidence: 78 },
    { id: 'c3', name: 'Sensor Array', weight: 15, materialEmissionFactor: 18.0, supplier: 'Seoul Micro', location: [37.5665, 126.9780], type: 'supplier', country: 'South Korea', dataSource: 'Spend-based proxy', confidence: 42 },
    { id: 'c4', name: 'Packaging (Cardboard)', weight: 200, materialEmissionFactor: 0.9, supplier: 'Local Pack Co.', location: [30.2672, -97.7431], type: 'supplier', country: 'USA', dataSource: 'Primary EPD', confidence: 98 },
    { id: 'c5', name: 'Glass Display Panel', weight: 80, materialEmissionFactor: 1.5, supplier: 'Munich Glassworks', location: [48.1351, 11.5820], type: 'supplier', country: 'Germany', dataSource: 'Ecoinvent v3.9', confidence: 82 }
  ],
  initiatives: [
    { id: 'INT-101', title: 'Transition to Recycled PC/ABS', category: 'Material Subs', status: 'Approved', owner: 'J. Smith', target: '-120 tCO₂e', cost: '+$0.15/unit', urgency: 'High', date: 'Oct 15' },
    { id: 'INT-102', title: 'Localize EMEA Aluminum Sourcing', category: 'Logistics', status: 'In Progress', owner: 'A. Johnson', target: '-420 tCO₂e', cost: '-$0.05/unit', urgency: 'Critical', date: 'Nov 01' },
    { id: 'INT-103', title: 'Renewable PPA for Austin Plant', category: 'Energy', status: 'Verified', owner: 'B. Williams', target: '-890 tCO₂e', cost: '+$12k/yr', urgency: 'Medium', date: 'Dec 01' },
    { id: 'INT-104', title: 'Audit FastFreight Logistics', category: 'Primary Data', status: 'Identified', owner: 'A. Johnson', target: 'Data Quality', cost: '$0', urgency: 'Low', date: 'TBD' },
  ],
  reports: [
    { id: 'REP-25-081', name: 'FY24 GHG Protocol Summary', type: 'Annual Disclosure', framework: 'GHG Protocol', date: 'Jan 15, 2025', status: 'Completed', user: 'Jane Doe' },
    { id: 'REP-25-082', name: 'Q1 Product Footprint (Thermostat)', type: 'LCA Extract', framework: 'ISO 14067', date: 'Apr 02, 2025', status: 'Completed', user: 'System Admin' },
    { id: 'REP-25-083', name: 'Supplier Disclosure Pack - EMEA', type: 'Supply Chain', framework: 'Custom', date: 'May 10, 2025', status: 'Failed', user: 'Jane Doe' },
    { id: 'REP-25-084', name: 'EU CSRD Pre-Assessment', type: 'Compliance', framework: 'CSRD', date: 'Jun 01, 2025', status: 'Completed', user: 'System' },
  ],
  suppliers: [
    { id: 'SUP-001', name: 'Shenzhen Plastics Co.', type: 'Plastics & Polymers', location: 'China', confidence: 'Low', status: 'Pending', emissions: 12500, score: 'C' },
    { id: 'SUP-002', name: 'Taiwan Tech Boards', type: 'Electronics', location: 'Taiwan', confidence: 'High', status: 'Verified', emissions: 8400, score: 'A' },
    { id: 'SUP-003', name: 'Seoul Micro', type: 'Semiconductors', location: 'South Korea', confidence: 'Medium', status: 'In Review', emissions: 6200, score: 'B' },
    { id: 'SUP-004', name: 'Texas EcoPlastics', type: 'Recycled Materials', location: 'USA', confidence: 'High', status: 'Verified', emissions: 1100, score: 'A+' },
    { id: 'SUP-005', name: 'Local Pack Co.', type: 'Packaging', location: 'USA', confidence: 'High', status: 'Verified', emissions: 850, score: 'A' },
    { id: 'SUP-006', name: 'Global Metals Inc.', type: 'Raw Materials', location: 'Germany', confidence: 'High', status: 'Verified', emissions: 4300, score: 'A-' },
    { id: 'SUP-007', name: 'FastFreight Logistics', type: 'Transport', location: 'Global', confidence: 'Low', status: 'Action Required', emissions: 18500, score: 'D' },
  ]
};

// ============================================================================
// 2. BACKEND SERVICE SIMULATION (API, AUTH, AUDIT, AI)
// ============================================================================

const ServerServices = {
  Auth: {
    ssoLogin: async (email) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const user = MOCK_DB.users.find(u => u.email === email) || MOCK_DB.users[0];
      ServerServices.Audit.log(user.name, 'SSO_LOGIN_SUCCESS', user.ssoProvider);
      return user;
    },
    verifyMFA: async (user) => {
      ServerServices.Audit.log(user.name, 'MFA_VERIFICATION_SUCCESS', 'Authenticator App');
    },
    failMFA: async (user) => {
      ServerServices.Audit.log(user ? user.name : 'Unknown User', 'MFA_VERIFICATION_FAILED', 'Authenticator App', 'FAIL');
    }
  },
  
  Audit: {
    log: (actor, action, resource, status = 'SUCCESS') => {
      const newLog = {
        id: `AL-${Math.floor(Math.random() * 10000)}`,
        timestamp: new Date().toISOString(),
        actor, action, resource, status
      };
      MOCK_DB.auditLogs.unshift(newLog);
    },
    getLogs: async (user) => {
      if (user.role !== 'admin' && user.role !== 'auditor') throw new Error("403 Forbidden");
      await new Promise(resolve => setTimeout(resolve, 400));
      return MOCK_DB.auditLogs;
    }
  },

  Data: {
    getCollection: async (collectionName, user) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Strict Backend RBAC Filtering
      if (collectionName === 'integrations' && user.role !== 'admin') throw new Error("403 Forbidden");
      if (['portfolio', 'regional', 'supplierRisk', 'hotspots', 'thermostatBom'].includes(collectionName) && ['admin', 'auditor'].includes(user.role)) {
        // Mock returning empty or throwing based on strict access
        // For dashboard safety, we will let auditor see basic metrics if needed, but restrict admins from business data.
      }

      if (!['initiatives', 'reports', 'auditLogs', 'regional', 'supplierRisk', 'users'].includes(collectionName)) {
        ServerServices.Audit.log(user.name, 'READ_COLLECTION', collectionName);
      }
      return MOCK_DB[collectionName];
    },
    createInitiative: async (payload, user) => {
      // Removed admin and auditor from initiative creation
      if (!['sustainability_manager', 'procurement', 'product_manager', 'executive'].includes(user.role)) throw new Error("403 Forbidden");
      await new Promise(resolve => setTimeout(resolve, 600));
      const newInit = {
        id: `INT-${Math.floor(Math.random() * 900) + 100}`,
        ...payload,
        status: 'Identified',
        date: 'TBD'
      };
      MOCK_DB.initiatives.unshift(newInit);
      ServerServices.Audit.log(user.name, 'CREATE_INITIATIVE', newInit.id);
      return newInit;
    },
    runReportJob: async (payload, user) => {
      // Removed admin and procurement from reports
      if (!['sustainability_manager', 'executive', 'auditor'].includes(user.role)) throw new Error("403 Forbidden");
      await new Promise(resolve => setTimeout(resolve, 800)); 
      const newReport = {
        id: `REP-25-${Math.floor(Math.random() * 900) + 100}`,
        name: payload.name,
        type: 'Compliance Export',
        framework: payload.framework,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        status: 'Running',
        user: user.name
      };
      MOCK_DB.reports.unshift(newReport);
      ServerServices.Audit.log(user.name, 'EXECUTE_REPORT_JOB', newReport.id);
      setTimeout(() => {
        const targetReport = MOCK_DB.reports.find(r => r.id === newReport.id);
        if(targetReport) targetReport.status = 'Completed';
      }, 5000);
      return newReport;
    },
    triggerIntegrationSync: async (systemName, user) => {
      if (user.role !== 'admin') throw new Error("403 Forbidden");
      await new Promise(resolve => setTimeout(resolve, 1500));
      ServerServices.Audit.log(user.name, 'MANUAL_INTEGRATION_SYNC', systemName);
      return { status: 'SUCCESS', message: `Successfully synchronized datasets from ${systemName}` };
    },
    processIngestionFile: async (fileDetails, user) => {
      // Admin should not process business ingestion files
      if (!['sustainability_manager', 'auditor'].includes(user.role)) throw new Error("403 Forbidden");
      ServerServices.Audit.log(user.name, 'UPLOAD_ERP_EXTRACT', fileDetails.name);
      const prompt = `Map these raw ERP inputs to LCA databases: "Hsg_Blk_PCABS_v2", "Alum_Sheet_3mm", "Pkg_Card_Brn", "Unk_Plstc", "Screw_SS". Return pure JSON array.`;
      await ServerServices.AI.generateInsight(prompt, user);
      
      ServerServices.Audit.log(user.name, 'AI_SEMANTIC_MAPPING_COMPLETE', '5 rows mapped');
      return [
        { raw: "Hsg_Blk_PCABS_v2", mapped: "Polycarbonate/ABS blend, virgin", confidence: 92, status: "Auto-Mapped", factor: 3.5 },
        { raw: "Alum_Sheet_3mm", mapped: "Aluminum alloy, primary, at plant", confidence: 95, status: "Auto-Mapped", factor: 11.2 },
        { raw: "Pkg_Card_Brn", mapped: "Corrugated board box, recycled", confidence: 88, status: "Auto-Mapped", factor: 0.8 },
        { raw: "Unk_Plstc", mapped: "Injection molding, generic plastic", confidence: 45, status: "Needs Review", factor: 2.1 },
        { raw: "Screw_SS", mapped: "Steel, stainless 316, drawn wire", confidence: 98, status: "Auto-Mapped", factor: 4.8 }
      ];
    }
  },

  AI: {
    generateInsight: async (prompt, user) => {
      const apiKey = ""; 
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: "You are an AI Sustainability Assistant." }] },
        generationConfig: { temperature: 0.1 }
      };

      try {
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error("API Error");
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
      } catch (error) {
        return "Backend AI service disconnected. Operating in offline deterministic mode.";
      }
    }
  }
};

const EmissionsService = {
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))); 
  },

  calculateProductFootprint: (bom, assembly, scenario = 'baseline') => {
    let totalMaterial = 0, totalLogistics = 0;
    let activeBOM = JSON.parse(JSON.stringify(bom));
    let activeAssembly = { ...assembly };

    if (scenario === 'local-recycled') {
      activeBOM[0] = { ...activeBOM[0], name: 'Housing (Recycled Ocean PC)', materialEmissionFactor: 1.2, supplier: 'Texas EcoPlastics', location: [29.7604, -95.3698], country: 'USA', dataSource: 'Primary EPD', confidence: 99 };
      activeAssembly.energyFactor = 0.05; 
    }

    const nodes = [], links = [];
    activeBOM.forEach(item => {
      const weightKg = item.weight / 1000;
      const matEmissions = weightKg * item.materialEmissionFactor;
      totalMaterial += matEmissions;
      const distance = EmissionsService.calculateDistance(item.location[0], item.location[1], activeAssembly.location[0], activeAssembly.location[1]);
      const logEmissions = weightKg * distance * 0.0001; 
      totalLogistics += logEmissions;
      nodes.push({ ...item, emissions: matEmissions + logEmissions });
      links.push({ from: item.location, to: activeAssembly.location, distance: Math.round(distance), emissions: logEmissions, item: item.name });
    });

    const manufacturing = activeAssembly.energyFactor * activeAssembly.energyPerUnit;
    const avgConfidence = activeBOM.reduce((acc, curr) => acc + curr.confidence, 0) / activeBOM.length;

    return {
      breakdown: [
        { name: 'Materials', value: Number(totalMaterial.toFixed(2)) },
        { name: 'Manufacturing', value: Number(manufacturing.toFixed(2)) },
        { name: 'Logistics', value: Number(totalLogistics.toFixed(2)) }
      ],
      total: Number((totalMaterial + totalLogistics + manufacturing).toFixed(2)),
      nodes: [...nodes, { ...activeAssembly, emissions: manufacturing, isHub: true }],
      links, 
      scenarioName: scenario,
      dataQualityScore: Math.round(avgConfidence)
    };
  }
};


// ============================================================================
// 3. STATE MANAGEMENT (CONTEXT & HOOKS)
// ============================================================================

const AppContext = createContext(null);

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [activeRoute, setActiveRoute] = useState('dashboard');
  
  const useServerQuery = (collectionName) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tick, setTick] = useState(0);

    const refetch = () => setTick(t => t + 1);

    useEffect(() => {
      if (!user) return;
      let isMounted = true;
      setLoading(true);
      ServerServices.Data.getCollection(collectionName, user)
        .then(res => { if(isMounted) { setData(res); setLoading(false); setError(null); } })
        .catch(err => { if(isMounted) { setError(err); setLoading(false); } });
      return () => { isMounted = false; };
    }, [collectionName, user, tick]);

    return { data, loading, error, refetch };
  };

  const login = (userData) => setUser(userData);
  const logout = () => {
    ServerServices.Audit.log(user.name, 'USER_LOGOUT', 'System');
    setUser(null);
  };

  return (
    <AppContext.Provider value={{ user, login, logout, activeRoute, setActiveRoute, useServerQuery }}>
      {children}
    </AppContext.Provider>
  );
}

const useApp = () => useContext(AppContext);


// ============================================================================
// 4. SHARED UI COMPONENTS (DESIGN SYSTEM)
// ============================================================================

const Card = ({ children, className = '', title, action }) => (
  <div className={`bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm flex flex-col ${className}`}>
    {(title || action) && (
      <div className="flex justify-between items-center mb-6">
        {title && <h3 className="text-lg font-bold text-zinc-900 tracking-tight">{title}</h3>}
        {action}
      </div>
    )}
    {children}
  </div>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const PageHeader = ({ title, description, action }) => (
  <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm mb-8">
    <div>
      <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">{title}</h2>
      {description && <div className="text-sm text-zinc-500 mt-2 leading-relaxed max-w-2xl">{description}</div>}
    </div>
    {action && <div className="flex gap-3 shrink-0">{action}</div>}
  </div>
);

const LoadingSpinner = () => (
  <div className="w-full h-64 flex flex-col items-center justify-center text-zinc-400">
    <RefreshCw className="animate-spin mb-4" size={24} />
    <span className="text-sm font-medium">Fetching enterprise data records...</span>
  </div>
);

const NavItem = ({ icon, label, isActive, onClick, disabled }) => {
  if (disabled) return null; 
  
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${
        isActive ? 'bg-zinc-800/80 text-white shadow-sm ring-1 ring-zinc-700' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
      }`}
    >
      {icon}<span>{label}</span>
    </button>
  );
};

function ComplexTooltip({ text }) {
  return (
    <span className="relative inline-flex items-center group cursor-help ml-1.5 align-text-bottom z-50">
      <span className="w-3.5 h-3.5 rounded-full bg-zinc-200/80 border border-zinc-300 flex items-center justify-center text-zinc-500 hover:bg-zinc-800 hover:text-white transition-all shadow-sm">
        <Info size={10} strokeWidth={3} />
      </span>
      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-80 p-3 bg-zinc-950 text-zinc-400 text-xs rounded-xl shadow-2xl border border-zinc-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none font-medium leading-relaxed text-left block">
        <span className="font-mono text-[9px] text-emerald-400 mb-1.5 border-b border-zinc-800 pb-1.5 flex items-center gap-1.5 uppercase tracking-widest block">
          <Activity size={10} className="inline-block" /> System Tooltip
        </span>
        <span className="block">{text}</span>
        <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-zinc-950 block"></span>
      </span>
    </span>
  );
}

function AccessDenied() {
  return (
    <div className="py-20 text-center bg-rose-50 border border-rose-200 rounded-xl max-w-2xl mx-auto mt-10">
      <AlertCircle size={40} className="mx-auto text-rose-500 mb-4" />
      <h3 className="text-xl font-bold text-rose-900 mb-2">Access Denied</h3>
      <p className="text-sm text-rose-700">Your current role permissions do not allow you to view this module.</p>
    </div>
  );
}


// ============================================================================
// 5. FEATURE MODULES (WITH RBAC ADAPTATIONS)
// ============================================================================

function DashboardFeature() {
  const { user, useServerQuery } = useApp();
  const { data: portfolioData, loading: portLoading } = useServerQuery('portfolio');
  const { data: regionalData, loading: regLoading } = useServerQuery('regional');
  const { data: logs, loading: logsLoading } = useServerQuery('auditLogs');
  const { data: supplierRisk, loading: riskLoading } = useServerQuery('supplierRisk');
  const { data: reports, loading: repLoading } = useServerQuery('reports');
  const { data: bomData, loading: bomLoading } = useServerQuery('thermostatBom');
  
  const [insightText, setInsightText] = useState("Awaiting inference payload from AI backend cluster...");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if(!portLoading && portfolioData && user.role === 'sustainability_manager') handleGenerateInsight();
  }, [portLoading, user.role]);

  const handleGenerateInsight = async () => {
    setIsGenerating(true);
    const prompt = `Target: 350 tCO2e. Actual: 385 tCO2e. Top Hotspot: Virgin PC/ABS Housing. Write a 3-sentence insight.`;
    const result = await ServerServices.AI.generateInsight(prompt, user);
    setInsightText(result);
    setIsGenerating(false);
  };

  if (portLoading || regLoading || logsLoading || riskLoading || repLoading || bomLoading) return <LoadingSpinner />;

  // --------------------------------------------------------
  // DASHBOARD VARIANT: PROCUREMENT MANAGER
  // --------------------------------------------------------
  if (user.role === 'procurement') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <PageHeader title="Supply Chain Intelligence" description="Monitor supplier risk, data quality, and compliance readiness." />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="!p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={20}/></div></div>
            <div><h4 className="text-sm font-semibold text-zinc-500 mb-1">Active Suppliers</h4><span className="text-3xl font-extrabold">284</span></div>
          </Card>
          <Card className="!p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><AlertTriangle size={20}/></div></div>
            <div><h4 className="text-sm font-semibold text-zinc-500 mb-1">High Risk Entities</h4><span className="text-3xl font-extrabold text-rose-600">12</span></div>
          </Card>
          <Card className="!p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle size={20}/></div></div>
            <div><h4 className="text-sm font-semibold text-zinc-500 mb-1">Avg. ESG Score</h4><span className="text-3xl font-extrabold text-emerald-600">B+</span></div>
          </Card>
          <Card className="!p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><ShieldCheck size={20}/></div></div>
            <div><h4 className="text-sm font-semibold text-zinc-500 mb-1">Primary Data</h4><span className="text-3xl font-extrabold text-amber-600">35%</span></div>
          </Card>
        </div>
        <Card title="Supplier Risk Matrix">
          <div className="h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis type="number" dataKey="risk" name="Data Risk (%)" tick={{fill: '#a1a1aa'}} label={{ value: 'Data Inaccuracy Risk', position: 'bottom', fill: '#a1a1aa', fontSize: 12 }} />
                <YAxis type="number" dataKey="emissions" name="Emissions (tCO2e)" tick={{fill: '#a1a1aa'}} />
                <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{ borderRadius: '12px' }} />
                <Scatter name="Suppliers" data={supplierRisk} fill="#18181b">
                  {supplierRisk.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.risk > 50 ? '#f43f5e' : entry.risk > 30 ? '#f59e0b' : '#10b981'} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    );
  }

  // --------------------------------------------------------
  // DASHBOARD VARIANT: EXECUTIVE (CSO)
  // --------------------------------------------------------
  if (user.role === 'executive') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <PageHeader title="Executive Overview" description="Corporate Net Zero trajectory and financial impact of ESG initiatives." />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="!p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-zinc-100 text-zinc-600 rounded-lg"><Globe size={20}/></div></div>
            <div><h4 className="text-sm font-semibold text-zinc-500 mb-1">Net Zero Delta</h4><span className="text-3xl font-extrabold text-rose-600">+1.2% <span className="text-sm font-medium">Off Target</span></span></div>
          </Card>
          <Card className="!p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign size={20}/></div></div>
            <div><h4 className="text-sm font-semibold text-zinc-500 mb-1">Initiative ROI</h4><span className="text-3xl font-extrabold text-emerald-600">$1.2M <span className="text-sm font-medium">Saved</span></span></div>
          </Card>
          <Card className="!p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Shield size={20}/></div></div>
            <div><h4 className="text-sm font-semibold text-zinc-500 mb-1">Compliance Score</h4><span className="text-3xl font-extrabold text-blue-600">98%</span></div>
          </Card>
          <Card className="!p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Target size={20}/></div></div>
            <div><h4 className="text-sm font-semibold text-zinc-500 mb-1">Active Projects</h4><span className="text-3xl font-extrabold">14</span></div>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Portfolio Emissions Trajectory">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={portfolioData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#a1a1aa'}} />
                  <Tooltip contentStyle={{ borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="baseline" stroke="#d4d4d8" fill="transparent" strokeDasharray="4 4" strokeWidth={2} />
                  <Line type="monotone" dataKey="actual" stroke="#18181b" strokeWidth={3} />
                  <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={3} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card title="Regional Target Attainment">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} />
                  <YAxis dataKey="region" type="category" axisLine={false} tickLine={false} tick={{fill: '#52525b', fontSize: 12, fontWeight: 500}} width={80} />
                  <Tooltip cursor={{fill: '#f4f4f5'}} contentStyle={{ borderRadius: '12px' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Bar dataKey="target" name="Target" fill="#d4d4d8" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="emissions" name="Actual" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12}>
                    {regionalData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.emissions > entry.target ? '#f43f5e' : '#10b981'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // DASHBOARD VARIANT: PRODUCT MANAGER
  // --------------------------------------------------------
  if (user.role === 'product_manager') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <PageHeader title="Product Lifecycle Analytics" description="Manage BOM emissions, scenario modeling, and materials impact." />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="!p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Package size={20}/></div></div>
            <div><h4 className="text-sm font-semibold text-zinc-500 mb-1">SKUs Modeled</h4><span className="text-3xl font-extrabold">142</span></div>
          </Card>
          <Card className="!p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckSquare size={20}/></div></div>
            <div><h4 className="text-sm font-semibold text-zinc-500 mb-1">Verified LCA</h4><span className="text-3xl font-extrabold text-emerald-600">89%</span></div>
          </Card>
          <Card className="!p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Layers size={20}/></div></div>
            <div><h4 className="text-sm font-semibold text-zinc-500 mb-1">Scenarios Run</h4><span className="text-3xl font-extrabold text-purple-600">1.4k</span></div>
          </Card>
          <Card className="!p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><AlertTriangle size={20}/></div></div>
            <div><h4 className="text-sm font-semibold text-zinc-500 mb-1">High Impact Mats</h4><span className="text-3xl font-extrabold text-amber-600">12</span></div>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Material Hotspots Breakdown">
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={MOCK_DB.hotspots.topDrivers} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="emissions" stroke="none">
                     {MOCK_DB.hotspots.topDrivers.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.category === 'Material' ? '#18181b' : entry.category === 'Logistics' ? '#f59e0b' : '#3b82f6'} />)}
                   </Pie>
                   <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                 </PieChart>
               </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // DASHBOARD VARIANT: AUDITOR
  // --------------------------------------------------------
  if (user.role === 'auditor') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <PageHeader title="Compliance & Audit Overview" description="System integrity, report generation history, and immutable event logs." />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="!p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-zinc-100 text-zinc-600 rounded-lg"><History size={20}/></div></div>
            <div><h4 className="text-sm font-semibold text-zinc-500 mb-1">Audit Events (30d)</h4><span className="text-3xl font-extrabold">12.4k</span></div>
          </Card>
          <Card className="!p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Database size={20}/></div></div>
            <div><h4 className="text-sm font-semibold text-zinc-500 mb-1">Verifiable Nodes</h4><span className="text-3xl font-extrabold text-emerald-600">4,291</span></div>
          </Card>
          <Card className="!p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={20}/></div></div>
            <div><h4 className="text-sm font-semibold text-zinc-500 mb-1">Reports Generated</h4><span className="text-3xl font-extrabold text-blue-600">{reports?.length || 0}</span></div>
          </Card>
          <Card className="!p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><Shield size={20}/></div></div>
            <div><h4 className="text-sm font-semibold text-zinc-500 mb-1">Failed Jobs</h4><span className="text-3xl font-extrabold text-rose-600">1</span></div>
          </Card>
        </div>
        <Card title="Recent System Activity (Immutable)">
          <div className="divide-y divide-zinc-100 overflow-y-auto max-h-[300px] custom-scrollbar">
            {logs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
                    <Fingerprint size={14}/>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs font-medium text-zinc-500">{log.resource} • by {log.actor}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={log.status === 'SUCCESS' ? 'success' : 'danger'}>{log.status}</Badge>
                  <div className="text-[10px] font-mono text-zinc-400 mt-1">{new Date(log.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // --------------------------------------------------------
  // DASHBOARD VARIANT: SYSTEM ADMIN
  // --------------------------------------------------------
  if (user.role === 'admin') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <PageHeader title="System Operations" description="Platform health, integration status, and tenant configuration." />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="!p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Activity size={20}/></div></div>
            <div><h4 className="text-sm font-semibold text-zinc-500 mb-1">System Status</h4><span className="text-3xl font-extrabold text-emerald-600">Healthy</span></div>
          </Card>
          <Card className="!p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Layers size={20}/></div></div>
            <div><h4 className="text-sm font-semibold text-zinc-500 mb-1">Active Integrations</h4><span className="text-3xl font-extrabold">2</span></div>
          </Card>
          <Card className="!p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Database size={20}/></div></div>
            <div><h4 className="text-sm font-semibold text-zinc-500 mb-1">Data Ingested (30d)</h4><span className="text-3xl font-extrabold">1.4 TB</span></div>
          </Card>
          <Card className="!p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-zinc-100 text-zinc-600 rounded-lg"><Users size={20}/></div></div>
            <div><h4 className="text-sm font-semibold text-zinc-500 mb-1">Active Personas</h4><span className="text-3xl font-extrabold">6</span></div>
          </Card>
        </div>
        <Card title="Integration Health">
          <div className="space-y-4">
             <div className="flex justify-between items-center p-4 border border-zinc-200 rounded-xl bg-zinc-50">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-100 text-blue-700 font-black rounded-lg flex items-center justify-center">SAP</div>
                 <div><h4 className="font-bold">SAP S/4HANA</h4><p className="text-xs text-zinc-500">Connected • Syncing real-time</p></div>
               </div>
               <Badge variant="success">Online</Badge>
             </div>
             <div className="flex justify-between items-center p-4 border border-zinc-200 rounded-xl bg-zinc-50">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-zinc-900 text-white font-black rounded-lg flex items-center justify-center">eI</div>
                 <div><h4 className="font-bold">Ecoinvent v3.9</h4><p className="text-xs text-zinc-500">Connected • API Key Valid</p></div>
               </div>
               <Badge variant="success">Online</Badge>
             </div>
             <div className="flex justify-between items-center p-4 border border-rose-200 rounded-xl bg-rose-50">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-rose-100 text-rose-700 font-black rounded-lg flex items-center justify-center">OR</div>
                 <div><h4 className="font-bold text-rose-900">Oracle NetSuite</h4><p className="text-xs text-rose-700">Webhook Invocation Failed</p></div>
               </div>
               <Badge variant="danger">Error</Badge>
             </div>
          </div>
        </Card>
      </div>
    );
  }

  // --------------------------------------------------------
  // DASHBOARD VARIANT: SUSTAINABILITY MANAGER (DEFAULT/FALLBACK)
  // --------------------------------------------------------
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="!p-6"><h4 className="text-sm text-zinc-500 mb-2">Total Scope 3</h4><span className="text-4xl font-extrabold">4,250 <span className="text-sm text-zinc-400">tCO₂e</span></span></Card>
        <Card className="!p-6"><h4 className="text-sm text-zinc-500 mb-2">Products Modeled</h4><span className="text-4xl font-extrabold">142 <span className="text-sm text-zinc-400">SKUs</span></span></Card>
        <Card className="!p-6"><h4 className="text-sm text-zinc-500 mb-2">Avg. Footprint</h4><span className="text-4xl font-extrabold">29.9 <span className="text-sm text-zinc-400">kgCO₂e</span></span></Card>
        <Card className="!p-6"><h4 className="text-sm text-zinc-500 mb-2">Primary Data Coverage</h4><span className="text-4xl font-extrabold">35 <span className="text-sm text-zinc-400">%</span></span></Card>
      </div>

      <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border border-emerald-100 rounded-2xl p-6 shadow-sm flex gap-5 items-start">
        <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 shadow-sm">
          <Server className="text-emerald-600" size={24} strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-zinc-900 mb-1 flex items-center gap-2">
            Enterprise AI Diagnostics
            <Badge variant="success" className="!text-[10px]">Secure Backend Request</Badge>
          </h3>
          <p className="text-sm text-zinc-700 leading-relaxed max-w-4xl min-h-[60px] font-medium">
            {isGenerating ? (
              <span className="flex items-center gap-2 text-emerald-600">
                <RefreshCw size={16} className="animate-spin" /> Querying secure Gemini inference cluster...
              </span>
            ) : insightText}
          </p>
        </div>
      </div>

      <Card>
        <h3 className="text-lg font-bold mb-6">Emissions Trajectory</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#a1a1aa'}} />
              <Tooltip contentStyle={{ borderRadius: '12px' }} />
              <Area type="monotone" dataKey="actual" stroke="#18181b" fill="#18181b" fillOpacity={0.05} strokeWidth={3} />
              <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function ProductsFeature() {
  const { useServerQuery } = useApp();
  const { data: bomData, loading } = useServerQuery('thermostatBom');
  const [scenario, setScenario] = useState('baseline');

  const ASSEMBLY_PLANT = { name: 'Austin Facility', location: [30.2672, -97.7431], energyFactor: 0.4, energyPerUnit: 5 };

  if (loading) return <LoadingSpinner />;
  const result = EmissionsService.calculateProductFootprint(bomData, ASSEMBLY_PLANT, scenario);

  const lifecycleData = [
    { name: 'Raw Materials', value: 65, fill: '#18181b' },
    { name: 'Manufacturing', value: 20, fill: '#52525b' },
    { name: 'Logistics', value: 10, fill: '#f59e0b' },
    { name: 'End of Life', value: 5, fill: '#a1a1aa' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Top Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div>
          <Badge variant="success" className="mb-2"><CheckCircle size={12}/> Verified BOM Model</Badge>
          <h2 className="text-2xl font-bold text-zinc-900">Smart Thermostat v2</h2>
        </div>
        <div className="flex gap-2 p-1 bg-zinc-100 rounded-lg">
          <button onClick={() => setScenario('baseline')} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${scenario === 'baseline' ? 'bg-white shadow text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>Baseline</button>
          <button onClick={() => setScenario('local-recycled')} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${scenario !== 'baseline' ? 'bg-white shadow text-emerald-700' : 'text-zinc-500 hover:text-zinc-700'}`}>Local + Recycled</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* KPI Column */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="text-center items-center justify-center !py-10">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Total Cradle-to-Gate</h3>
            <span className="text-6xl font-black text-zinc-900">{result.total} <span className="text-xl text-zinc-400 font-bold">kg</span></span>
            
            {scenario !== 'baseline' ? (
              <div className="mt-4 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-sm font-bold px-4 py-1.5 rounded-full ring-1 ring-emerald-200">
                <TrendingDown size={16} /> 12% reduction applied
              </div>
            ) : <div className="mt-4 h-8"></div>}

            <div className="mt-8 pt-6 border-t border-zinc-100 w-full flex flex-col items-center">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Model Confidence Score</span>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className={result.dataQualityScore > 80 ? "text-emerald-500" : "text-amber-500"}/>
                <span className={`text-lg font-bold ${result.dataQualityScore > 80 ? "text-emerald-700" : "text-amber-700"}`}>{result.dataQualityScore}%</span>
              </div>
            </div>
          </Card>

          <Card title="Lifecycle Breakdown" className="!pb-4">
             <div className="h-[200px] mb-4">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={lifecycleData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                     {lifecycleData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                   </Pie>
                   <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="space-y-3">
               {lifecycleData.map(item => (
                 <div key={item.name} className="flex justify-between items-center text-sm font-semibold">
                   <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.fill}}></div>{item.name}</span>
                   <span>{item.value}%</span>
                 </div>
               ))}
             </div>
          </Card>
        </div>

        {/* Data & Table Column */}
        <div className="xl:col-span-2 space-y-6 flex flex-col">
          <Card className="!p-0 overflow-hidden flex-1">
            <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
              <h3 className="font-bold text-zinc-900">Bill of Materials & Data Provenance</h3>
              <Badge variant="info">{result.nodes.filter(n => n.type === 'supplier').length} Components</Badge>
            </div>
            <div className="overflow-y-auto max-h-[500px] custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-zinc-100 text-xs uppercase tracking-wider text-zinc-500 font-bold sticky top-0 shadow-sm z-10">
                    <th className="px-6 py-4">Component</th>
                    <th className="px-6 py-4">Est. Emissions</th>
                    <th className="px-6 py-4">Data Source (Provenance)</th>
                    <th className="px-6 py-4 text-center">Quality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 text-sm">
                  {result.nodes.filter(n => n.type === 'supplier').map(item => (
                    <tr key={item.id} className="hover:bg-zinc-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-zinc-900">{item.name}</div>
                        <div className="text-xs text-zinc-500 flex items-center gap-1 mt-1"><Factory size={12}/> {item.supplier} • <Globe size={12} className="ml-1"/> {item.country}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-zinc-900">{item.emissions.toFixed(1)} <span className="text-zinc-400 font-medium text-xs">kg</span></td>
                      <td className="px-6 py-4">
                        <Badge variant={item.confidence > 85 ? 'success' : item.confidence > 50 ? 'info' : 'danger'}>
                          {item.dataSource}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-mono text-xs font-bold ${item.confidence > 85 ? 'text-emerald-600' : item.confidence > 50 ? 'text-blue-600' : 'text-rose-600'}`}>{item.confidence}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}

function HotspotsFeature() {
  const { useServerQuery } = useApp();
  const { data: hotspotsData, loading: hotLoading } = useServerQuery('hotspots');
  const { data: supplierRisk, loading: riskLoading } = useServerQuery('supplierRisk');

  if (hotLoading || riskLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Hotspots & Data Quality Analysis" 
        description={<span>Identify primary emission drivers and monitor the integrity and provenance of your footprint data across the portfolio.</span>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <Card className="!p-6">
          <h3 className="text-lg font-bold text-zinc-900 tracking-tight mb-2">Top Emission Drivers</h3>
          <p className="text-sm text-zinc-500 mb-6">Highest contributing components across product lines (tCO₂e).</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hotspotsData.topDrivers} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#52525b', fontSize: 12, fontWeight: 500}} width={150} />
                <Tooltip cursor={{fill: '#f4f4f5'}} contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 500 }} />
                <Bar dataKey="emissions" radius={[0, 4, 4, 0]}>
                  {hotspotsData.topDrivers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.category === 'Material' ? '#18181b' : entry.category === 'Logistics' ? '#f59e0b' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="!p-6">
          <h3 className="text-lg font-bold text-zinc-900 tracking-tight mb-2">Supplier Risk Matrix</h3>
          <p className="text-sm text-zinc-500 mb-6">Emissions Volume vs. Data Quality Risk.</p>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis type="number" dataKey="risk" name="Data Risk (%)" tick={{fill: '#a1a1aa', fontSize: 12}} label={{ value: 'Data Inaccuracy Risk', position: 'bottom', offset: 0, fill: '#a1a1aa', fontSize: 12 }} />
                <YAxis type="number" dataKey="emissions" name="Emissions (tCO2e)" tick={{fill: '#a1a1aa', fontSize: 12}} />
                <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{ borderRadius: '12px', padding: '12px' }} />
                <Scatter name="Suppliers" data={supplierRisk} fill="#18181b">
                  {supplierRisk.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.risk > 50 ? '#f43f5e' : entry.risk > 30 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="lg:col-span-2 bg-rose-50 border border-rose-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-3 text-rose-700">
              <AlertTriangle size={18} strokeWidth={2.5}/>
              <h4 className="text-sm font-bold uppercase tracking-widest">High Risk Anomaly Detected</h4>
            </div>
            <p className="text-sm text-rose-900 leading-relaxed font-medium max-w-3xl">
              We detected a high reliance (45%) on "Spend-based estimates" within the <strong className="font-bold">Trans-Pacific Air Freight</strong> category. This represents a significant data quality risk and may artificially inflate reported Scope 3 Category 4 emissions.
            </p>
          </div>
          <button className="whitespace-nowrap text-sm font-bold text-white bg-rose-600 px-6 py-3 rounded-xl hover:bg-rose-700 transition-colors shadow-sm">
            Launch Corrective Action
          </button>
        </div>

      </div>
    </div>
  );
}

function InitiativesFeature() {
  const { user, useServerQuery } = useApp();
  const { data: initiatives, loading, refetch } = useServerQuery('initiatives');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) return <LoadingSpinner />;

  const columns = ['Identified', 'Approved', 'In Progress', 'Verified'];
  const columnColors = { 'Identified': 'bg-zinc-400', 'Approved': 'bg-blue-500', 'In Progress': 'bg-amber-500', 'Verified': 'bg-emerald-500' };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const payload = {
      title: formData.get('title'),
      category: formData.get('category'),
      owner: user.name, 
      target: formData.get('target'),
      cost: formData.get('cost'),
      urgency: formData.get('urgency')
    };

    await ServerServices.Data.createInitiative(payload, user);
    setIsSubmitting(false);
    setIsCreateModalOpen(false);
    refetch(); 
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader 
        title="Reduction Initiatives Pipeline" 
        description={<span>Govern carbon mitigation workflows from identification to verified reduction. <ComplexTooltip text="Initiative records are transacted against the backend graph, establishing strict FK relations between owners, due dates, and product/supplier schemas."/></span>}
        action={<button onClick={() => setIsCreateModalOpen(true)} className="px-4 py-2 bg-zinc-900 text-white text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-zinc-800 transition-colors"><Plus size={16}/> Create Initiative</button>}
      />

      <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-280px)] custom-scrollbar">
        {columns.map(col => (
          <div key={col} className="bg-zinc-100/50 rounded-2xl p-4 border border-zinc-200/60 min-w-[300px] flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-zinc-600 uppercase tracking-widest mb-4 flex items-center gap-2 px-2 shrink-0">
              <div className={`w-2 h-2 rounded-full ${columnColors[col]}`}></div> {col}
              <span className="ml-auto bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-md text-[10px]">
                {initiatives.filter(i => i.status === col).length}
              </span>
            </h3>
            
            <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              {initiatives.filter(i => i.status === col).map(item => (
                <div key={item.id} className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="default" className="!bg-zinc-50 !text-[10px]">{item.id}</Badge>
                    {item.urgency === 'Critical' && <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1 bg-rose-50 px-1.5 py-0.5 rounded"><AlertCircle size={10}/> Critical</span>}
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900 mb-4 leading-snug group-hover:text-emerald-700 transition-colors">{item.title}</h4>
                  
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-zinc-100">
                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
                      <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"><TrendingDown size={12}/>{item.target}</span>
                      <span className="flex items-center gap-1.5 bg-zinc-50 px-2 py-1 rounded-md"><DollarSign size={12}/>{item.cost}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mt-1">
                      <span className="flex items-center gap-1.5"><Users size={12}/> {item.owner}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={12}/> {item.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-8">
            <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
              <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">New Mitigation Initiative</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 rounded-xl transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreate} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Initiative Title</label>
                <input name="title" required type="text" placeholder="e.g., Switch to Ocean Plastic" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Category</label>
                  <select name="category" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none">
                    <option>Material Subs</option><option>Logistics</option><option>Energy</option><option>Primary Data</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Urgency</label>
                  <select name="urgency" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none">
                    <option>Normal</option><option>Medium</option><option>High</option><option>Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Target Reduction</label>
                  <input name="target" required type="text" placeholder="-100 tCO2e" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Est. Cost Impact</label>
                  <input name="cost" required type="text" placeholder="-$0.10/unit" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none" />
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-zinc-600 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-100 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <RefreshCw size={16} className="animate-spin"/> : 'Save Initiative'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportsFeature() {
  const { user, useServerQuery } = useApp();
  const { data: reports, loading, error, refetch } = useServerQuery('reports');
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRunReport = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const payload = { name: formData.get('name'), framework: formData.get('framework') };

    await ServerServices.Data.runReportJob(payload, user);
    setIsSubmitting(false);
    setIsRunModalOpen(false);
    refetch(); 
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <AccessDenied />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <PageHeader 
        title="Compliance & Disclosures" 
        description={<span>Generate audit-ready exports for regulatory bodies. <ComplexTooltip text="Generates immutable cryptographic hashes (SHA-256) of materialized views to guarantee point-in-time auditability of dynamically generated compliance artifacts." /></span>}
        action={<button onClick={() => setIsRunModalOpen(true)} className="px-5 py-2.5 text-sm font-bold text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-2"><Plus size={16} /> Run New Report</button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="!p-6 flex flex-row items-center gap-4">
          <div className="p-4 bg-emerald-50 rounded-full text-emerald-600"><FileText size={24}/></div>
          <div><h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Total Reports Generated</h4><span className="text-3xl font-black text-zinc-900">124</span></div>
        </Card>
        <Card className="!p-6 flex flex-row items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-full text-blue-600"><ShieldCheck size={24}/></div>
          <div><h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Compliance Score</h4><span className="text-3xl font-black text-zinc-900">98%</span></div>
        </Card>
        <Card className="!p-6 flex flex-row items-center gap-4">
          <div className="p-4 bg-amber-50 rounded-full text-amber-600"><Clock size={24}/></div>
          <div><h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Pending Audits</h4><span className="text-3xl font-black text-zinc-900">2</span></div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Templates Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Available Templates</h3>
          
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4 hover:border-emerald-500 cursor-pointer transition-colors group" onClick={() => setIsRunModalOpen(true)}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors"><Globe size={18}/></div>
              <h4 className="font-bold text-zinc-900 text-sm">GHG Protocol Core</h4>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">Standard Scope 1, 2, 3 rollout for corporate ESG disclosure.</p>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4 hover:border-blue-500 cursor-pointer transition-colors group" onClick={() => setIsRunModalOpen(true)}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors"><CheckCircle size={18}/></div>
              <h4 className="font-bold text-zinc-900 text-sm">EU CSRD Pack</h4>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">Formats data to meet ESRS E1 climate change disclosure requirements.</p>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4 hover:border-purple-500 cursor-pointer transition-colors group" onClick={() => setIsRunModalOpen(true)}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors"><Box size={18}/></div>
              <h4 className="font-bold text-zinc-900 text-sm">Product LCA Extract</h4>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">ISO 14067 compliant lifecycle footprint for a specific product SKU.</p>
          </div>
        </div>

        {/* Report History Table */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
            <h3 className="font-bold text-zinc-900 flex items-center gap-2">
              <FileText size={18} className="text-zinc-400"/> Report Run History
            </h3>
            <div className="flex items-center gap-4">
              <button onClick={refetch} className="text-zinc-400 hover:text-zinc-900 transition-colors p-1" title="Refresh Jobs">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-zinc-100 text-xs uppercase tracking-wider text-zinc-500 font-bold sticky top-0">
                  <th className="px-6 py-4">Report Details</th>
                  <th className="px-6 py-4">Framework</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Artifact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 text-sm">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900">{report.name}</div>
                      <div className="text-xs text-zinc-400 font-medium flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{report.id}</span> • {report.date} • by {report.user}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center bg-zinc-100 text-zinc-700 px-2 py-1 rounded text-xs font-bold border border-zinc-200">
                        {report.framework}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {report.status === 'Completed' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle size={14} /> Completed
                        </span>
                      )}
                      {report.status === 'Running' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          <RefreshCw size={14} className="animate-spin" /> Compiling...
                        </span>
                      )}
                      {report.status === 'Failed' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
                          <AlertCircle size={14} /> Error
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {report.status === 'Completed' ? (
                        <div className="flex justify-end gap-2">
                           <button className="text-zinc-400 hover:text-zinc-900 p-2 rounded-lg transition-colors border border-transparent hover:border-zinc-200" title="Evidence Pack (Zip)">
                             <Database size={16} />
                           </button>
                           <button className="text-xs font-bold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 px-3 py-1.5 rounded-lg transition-colors shadow-sm flex items-center gap-2">
                             <Download size={14} className="text-emerald-600" /> PDF
                           </button>
                        </div>
                      ) : (
                        <button className="text-zinc-300 cursor-not-allowed p-2 rounded-lg flex items-center justify-end w-full">
                          <MoreVertical size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {isRunModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-8">
            <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
              <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">Run Compliance Report</h2>
              <button onClick={() => setIsRunModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 rounded-xl transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleRunReport} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Report Name</label>
                <input name="name" required type="text" defaultValue="FY25 Mid-Year Disclosure" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Framework</label>
                  <select name="framework" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none">
                    <option>CSRD</option><option>GHG Protocol</option><option>SEC Climate</option><option>ISO 14067</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Target Period</label>
                  <select name="period" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none">
                    <option>H1 2025</option><option>Q1 2025</option><option>FY 2024</option>
                  </select>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mt-4 flex items-start gap-3">
                <Lock size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">As-Of Data Snapshot</label>
                  <p className="text-xs text-amber-700 leading-relaxed mb-3">This report will lock the underlying emission factors and supplier data as they exist today to guarantee future auditability.</p>
                  <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-3 py-1.5 shadow-sm text-sm font-semibold w-fit">
                    <Calendar size={14} className="text-amber-500"/> Current Live Data
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsRunModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-zinc-600 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-100 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <RefreshCw size={16} className="animate-spin"/> : 'Execute Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function SuppliersFeature() {
  const { useServerQuery } = useApp();
  const { data: suppliers, loading } = useServerQuery('suppliers');

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Supplier Collaboration Portal" 
        description="Monitor Tier-1 and Tier-2 suppliers. Request and verify primary Environmental Product Declarations (EPDs) to improve portfolio data quality."
        action={<button className="px-5 py-2.5 text-sm font-bold text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-2"><Plus size={16} /> Invite Supplier</button>}
      />

      <div className="flex gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input type="text" placeholder="Search suppliers by name or ID..." className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl hover:bg-zinc-100 transition-colors">
          <Filter size={16} /> Filter
        </button>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar max-h-[500px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500 font-bold sticky top-0 z-10">
                <th className="px-6 py-4">Supplier Details</th>
                <th className="px-6 py-4">Total Emissions (tCO₂e)</th>
                <th className="px-6 py-4">Data Verification</th>
                <th className="px-6 py-4 text-center">ESG Score</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {suppliers.map(s => (
                <tr key={s.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-zinc-900">{s.name}</div>
                    <div className="text-xs text-zinc-500 flex items-center gap-1 mt-1"><Globe size={12}/> {s.location} • <span className="font-mono text-[10px] bg-zinc-100 px-1 rounded">{s.id}</span></div>
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-900">{s.emissions.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {s.status === 'Verified' ? <Badge variant="success"><ShieldCheck size={12} className="mr-1 inline"/> Primary Data</Badge> 
                     : s.status === 'Pending' ? <Badge variant="warning"><Clock size={12} className="mr-1 inline"/> Data Requested</Badge>
                     : s.status === 'In Review' ? <Badge variant="info"><Activity size={12} className="mr-1 inline"/> Under Review</Badge>
                     : <Badge variant="danger"><AlertCircle size={12} className="mr-1 inline"/> Using Averages</Badge>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-sm
                      ${s.score.includes('A') ? 'bg-emerald-100 text-emerald-800' : s.score.includes('B') ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'}`}>
                      {s.score}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <button className="text-zinc-400 hover:text-zinc-900 p-2 rounded-lg hover:bg-zinc-100 ml-auto flex"><MoreVertical size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function DataHubFeature() {
  const { user } = useApp();
  const [ingestState, setIngestState] = useState('idle'); 
  const [mappedItems, setMappedItems] = useState([]);
  const [progress, setProgress] = useState(0);

  const simulateIngestion = async () => {
    setIngestState('processing');
    setProgress(15);
    await new Promise(r => setTimeout(r, 800));
    setProgress(40);
    
    const results = await ServerServices.Data.processIngestionFile({ name: 'BOM_Extract_Q3.csv' }, user);
    
    setProgress(85);
    await new Promise(r => setTimeout(r, 600));
    setProgress(100);
    setMappedItems(results);
    setIngestState('complete');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <PageHeader 
        title="AI Data Ingestion Engine" 
        description={<span>NLP Fuzzy Matching pipeline for unstructured data. <ComplexTooltip text="Ingests unstructured tabular data, utilizing an LLM router to bypass strict regex limitations, executing semantic entity extraction and mapping against the global LCA taxonomy." /></span>}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="!p-6 flex flex-row items-center justify-between">
          <div><h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">Auto-Map Success</h4><span className="text-4xl font-extrabold text-emerald-600">94.2%</span></div>
          <div className="p-3 bg-emerald-50 rounded-full text-emerald-600"><CheckCircle size={24}/></div>
        </Card>
        <Card className="!p-6 flex flex-row items-center justify-between">
          <div><h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">Rows Processed</h4><span className="text-4xl font-extrabold text-zinc-900">1.2M</span></div>
          <div className="p-3 bg-zinc-100 rounded-full text-zinc-600"><Layers size={24}/></div>
        </Card>
        <Card className="!p-6 !bg-amber-50 !border-amber-200 flex flex-row items-center justify-between">
          <div><h4 className="text-sm font-bold text-amber-700 uppercase tracking-widest mb-1">Review Queue</h4><span className="text-4xl font-extrabold text-amber-900">128</span></div>
          <div className="p-3 bg-amber-100 rounded-full text-amber-700"><AlertCircle size={24}/></div>
        </Card>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="p-8 flex-1 flex flex-col min-h-[400px] justify-center">
          {ingestState === 'idle' && (
            <div className="border-2 border-dashed border-zinc-300 rounded-2xl p-12 flex flex-col items-center justify-center bg-zinc-50/50 hover:bg-zinc-50 transition-colors cursor-pointer group" onClick={simulateIngestion}>
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-zinc-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cloud className="text-emerald-500" size={32} />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Drag & Drop raw BOM extract</h3>
              <p className="text-sm text-zinc-500 mb-6">Supports .csv, .xlsx, or JSON dumps from SAP, Oracle, or Teamcenter.</p>
              <button className="px-6 py-2.5 bg-zinc-900 text-white font-bold rounded-xl text-sm shadow-sm hover:bg-zinc-800 transition-all flex items-center gap-2">
                <FileText size={16} /> Simulate ERP Upload
              </button>
            </div>
          )}

          {ingestState === 'processing' && (
            <div className="flex flex-col items-center justify-center animate-in fade-in">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center"><Star className="text-emerald-500" size={28} /></div>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight">AI Semantic Mapping in Progress</h3>
              <p className="text-sm text-zinc-500 font-medium max-w-sm text-center mb-8">Vectorizing raw strings, inferring physical attributes, and cross-referencing global LCA databases...</p>
              <div className="w-full max-w-md bg-zinc-100 rounded-full h-2 mb-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="text-xs font-bold text-zinc-400 tracking-widest uppercase">{progress}% Complete</span>
            </div>
          )}

          {ingestState === 'complete' && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2"><GitMerge className="text-emerald-500" size={20} /> Mapping Results Matrix</h3>
                <button onClick={() => setIngestState('idle')} className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-2"><RefreshCw size={14} /> Process New Batch</button>
              </div>
              
              <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500 font-bold">
                      <th className="px-6 py-4">Raw ERP String</th>
                      <th className="px-6 py-4">AI Mapped Scientific Category</th>
                      <th className="px-6 py-4 text-center">Confidence Score</th>
                      <th className="px-6 py-4">Est. Factor (kgCO₂e)</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-sm">
                    {mappedItems.map((item, idx) => (
                      <tr key={idx} className={item.status === 'Needs Review' ? 'bg-amber-50/30' : 'hover:bg-zinc-50'}>
                        <td className="px-6 py-4"><span className="font-mono text-xs text-zinc-700 bg-zinc-100 px-2 py-1 rounded">{item.raw}</span></td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-zinc-900">{item.mapped}</div>
                          {item.status === 'Needs Review' && <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1">Vague taxonomy detected</div>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={item.confidence >= 90 ? 'success' : item.confidence >= 75 ? 'info' : 'warning'}>{item.confidence}%</Badge>
                        </td>
                        <td className="px-6 py-4 font-semibold text-zinc-700">{item.factor}</td>
                        <td className="px-6 py-4 text-right">
                          {item.status === 'Needs Review' ? (
                            <button className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-4 py-1.5 rounded-lg shadow-sm">Manual Remap</button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 mr-2"><CheckCircle size={14} className="text-emerald-500" /> Approved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function IntegrationsFeature() {
  const { user, useServerQuery } = useApp();
  const { error } = useServerQuery('integrations');
  const [syncing, setSyncing] = useState(false);

  const handleSync = async (systemName) => {
    setSyncing(systemName);
    await ServerServices.Data.triggerIntegrationSync(systemName, user);
    setSyncing(false);
  };

  if (error) return <AccessDenied />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Enterprise API Connectors" 
        description={<span>Manage bi-directional data streams between internal ERPs and LCA databases. <ComplexTooltip text="Utilizing multiplexed gRPC tunnels over TLS 1.3 to guarantee sub-millisecond payload delivery between internal ERP shards and the ZeroByDesign vector space." /></span>}
        action={<button className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"><Plus size={16} /> Add Custom API</button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Active Connections */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Active Syncs
          </h3>
          
          <div className="bg-white rounded-2xl border border-emerald-500/30 shadow-sm overflow-hidden ring-1 ring-emerald-500/10">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-blue-700 text-xl">SAP</div>
                  <div>
                    <h4 className="font-bold text-zinc-900 text-lg">SAP S/4HANA</h4>
                    <Badge variant="success" className="mt-1"><CheckCircle size={12}/> Real-time Streaming</Badge>
                  </div>
                </div>
                <button 
                  onClick={() => handleSync('SAP S/4HANA')}
                  disabled={syncing}
                  className="p-2 text-zinc-400 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 rounded-lg transition-colors" title="Force Sync">
                  <RefreshCw size={18} className={syncing === 'SAP S/4HANA' ? 'animate-spin text-emerald-600' : ''} />
                </button>
              </div>
              <p className="text-sm text-zinc-500 mb-6">Ingesting global Procurement records, BOM variants, and Tier 1 vendor master data.</p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                <div><p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Payload Volume</p><p className="font-bold text-zinc-900">1.4 TB / mo</p></div>
                <div><p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Last Heartbeat</p><p className="font-bold text-zinc-900 flex items-center gap-1.5"><Activity size={14} className="text-emerald-500" /> 12s ago</p></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-emerald-500/30 shadow-sm overflow-hidden ring-1 ring-emerald-500/10">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center font-black text-white text-xl">eI</div>
                  <div>
                    <h4 className="font-bold text-zinc-900 text-lg">Ecoinvent v3.9</h4>
                    <Badge variant="success" className="mt-1"><CheckCircle size={12}/> REST API Connected</Badge>
                  </div>
                </div>
                <button 
                  onClick={() => handleSync('Ecoinvent v3.9')}
                  disabled={syncing}
                  className="p-2 text-zinc-400 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 rounded-lg transition-colors" title="Force Sync">
                  <RefreshCw size={18} className={syncing === 'Ecoinvent v3.9' ? 'animate-spin text-emerald-600' : ''} />
                </button>
              </div>
              <p className="text-sm text-zinc-500 mb-6">Primary scientific database for global cradle-to-gate emission factors across 18,000+ processes.</p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                <div><p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">API Key Status</p><p className="font-bold text-emerald-600">Valid (Auto-rotates)</p></div>
                <div><p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Nodes Mapped</p><p className="font-bold text-zinc-900">4,291</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* Available Connections */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-zinc-300"></div> Available Connectors
          </h3>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
            <div className="p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center font-black text-rose-700 text-xl">OR</div>
                <div><h4 className="font-bold text-zinc-900">Oracle NetSuite</h4><p className="text-xs text-zinc-500 font-medium">ERP Integration</p></div>
              </div>
              <button className="px-4 py-2 text-sm font-bold text-zinc-700 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors">Connect via OAuth</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
            <div className="p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center font-black text-teal-700 text-xl">TC</div>
                <div><h4 className="font-bold text-zinc-900">Siemens Teamcenter</h4><p className="text-xs text-zinc-500 font-medium">PLM Integration</p></div>
              </div>
              <button className="px-4 py-2 text-sm font-bold text-zinc-700 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors">Configure SOAP</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
            <div className="p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center font-black text-purple-700 text-xl">SP</div>
                <div><h4 className="font-bold text-zinc-900">Sphera LCA</h4><p className="text-xs text-zinc-500 font-medium">Scientific Database</p></div>
              </div>
              <button className="px-4 py-2 text-sm font-bold text-zinc-700 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors">Add License Key</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function SettingsFeature() {
  const { user, useServerQuery } = useApp();
  // Ensure non-admins default to workspace settings, auditors default to audit
  const [activeSubTab, setActiveSubTab] = useState(user.role === 'auditor' ? 'audit' : 'general');
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  
  const { data: usersList, loading: usersLoading } = useServerQuery('users');

  useEffect(() => {
    if (activeSubTab === 'audit') {
      setIsLoadingLogs(true);
      ServerServices.Audit.getLogs(user)
        .then(data => { setLogs(data); setIsLoadingLogs(false); })
        .catch(err => { console.error("Access Denied"); setIsLoadingLogs(false); });
    }
  }, [activeSubTab, user]);

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex">
        
        {/* Settings Sidebar with RBAC */}
        <div className="w-64 bg-zinc-50 border-r border-zinc-200 p-6 flex flex-col gap-2 shrink-0">
          
          {user.role !== 'auditor' && (
            <>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 px-2">Administration</h3>
              <button onClick={() => setActiveSubTab('general')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeSubTab === 'general' ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200' : 'text-zinc-600 hover:bg-zinc-200/50'}`}><Settings size={16}/> Workspace</button>
            </>
          )}

          {user.role === 'admin' && (
            <button onClick={() => setActiveSubTab('users')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeSubTab === 'users' ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200' : 'text-zinc-600 hover:bg-zinc-200/50'}`}><Users size={16}/> Access Control</button>
          )}
          
          {['admin', 'auditor'].includes(user.role) && (
            <>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-6 mb-2 px-2">Governance</h3>
              <button onClick={() => setActiveSubTab('audit')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeSubTab === 'audit' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-200/50'}`}><History size={16}/> Audit Logs</button>
              {user.role === 'admin' && (
                <button onClick={() => setActiveSubTab('api')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeSubTab === 'api' ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200' : 'text-zinc-600 hover:bg-zinc-200/50'}`}><Key size={16}/> API & Secrets</button>
              )}
            </>
          )}
        </div>

        <div className="flex-1 p-8 bg-white min-h-[500px] overflow-hidden">
          
          {activeSubTab === 'general' && user.role !== 'auditor' && (
            <div className="animate-in fade-in">
               <h2 className="text-xl font-bold text-zinc-900 mb-6">Workspace Settings</h2>
               <div className="grid grid-cols-2 gap-6 mb-6">
                 <div>
                   <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Organization Name</label>
                   <input type="text" defaultValue={MOCK_DB.tenant.name} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900/20" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Industry</label>
                   <select className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900/20">
                     <option>Consumer Electronics</option>
                     <option>Automotive</option>
                   </select>
                 </div>
               </div>
               <button className="px-6 py-2 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-colors">Save Changes</button>
            </div>
          )}

          {activeSubTab === 'audit' && (
            <div className="animate-in fade-in flex flex-col h-full">
              <div className="flex justify-between items-start mb-6 shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2"><ShieldCheck size={20} className="text-emerald-600"/> Immutable Audit Trail</h2>
                  <p className="text-sm text-zinc-500 mt-1">Cryptographically verifiable log of all system actions.</p>
                </div>
                <Badge variant="success">Tenant: {MOCK_DB.tenant.id}</Badge>
              </div>

              {isLoadingLogs ? (
                <div className="py-20 flex justify-center"><RefreshCw className="animate-spin text-zinc-400" /></div>
              ) : !['admin', 'auditor'].includes(user.role) ? (
                <AccessDenied />
              ) : (
                <div className="border border-zinc-200 rounded-xl overflow-hidden overflow-y-auto max-h-[500px] custom-scrollbar flex-1">
                  <table className="w-full text-left relative">
                    <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 font-bold border-b border-zinc-200 sticky top-0 z-10 shadow-sm">
                      <tr><th className="px-4 py-3">Timestamp</th><th className="px-4 py-3">Actor</th><th className="px-4 py-3">Action Event</th><th className="px-4 py-3">Resource</th><th className="px-4 py-3 text-right">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-sm font-medium text-zinc-700">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-zinc-50">
                          <td className="px-4 py-3 text-xs font-mono text-zinc-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                          <td className="px-4 py-3 flex items-center gap-2 whitespace-nowrap"><div className="w-6 h-6 rounded bg-zinc-200 flex items-center justify-center text-[10px] text-zinc-600"><Fingerprint size={12}/></div> {log.actor}</td>
                          <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                          <td className="px-4 py-3">{log.resource}</td>
                          <td className="px-4 py-3 text-right">
                            {log.status === 'SUCCESS' ? <Badge variant="success">Pass</Badge> : <Badge variant="danger">Fail</Badge>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'users' && user.role === 'admin' && (
            <div className="animate-in fade-in flex flex-col h-full">
              <div className="flex justify-between items-start mb-6 shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2"><Users size={20} className="text-emerald-600"/> Access Control & Roles</h2>
                  <p className="text-sm text-zinc-500 mt-1">Manage platform users, RBAC permissions, and SSO provisioning.</p>
                </div>
                <button className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-2"><Plus size={16} /> Invite User</button>
              </div>

              {usersLoading ? (
                <div className="py-20 flex justify-center"><RefreshCw className="animate-spin text-zinc-400" /></div>
              ) : (
                <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm overflow-y-auto max-h-[500px] custom-scrollbar flex-1">
                  <table className="w-full text-left bg-white relative">
                    <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 font-bold border-b border-zinc-200 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-6 py-4">User Details</th>
                        <th className="px-6 py-4">Assigned Role</th>
                        <th className="px-6 py-4">Authentication</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-sm">
                      {usersList?.map((u) => (
                        <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center font-bold text-sm ring-1 ring-zinc-200">
                                {u.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-zinc-900">{u.name}</p>
                                <p className="text-xs text-zinc-500">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={u.role === 'admin' ? 'info' : 'default'} className="font-semibold">{u.displayRole}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600">
                              <Shield size={14} className="text-emerald-500"/> {u.ssoProvider}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="success">Active</Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-zinc-400 hover:text-zinc-900 p-2 rounded-lg hover:bg-zinc-100 transition-colors"><MoreVertical size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {activeSubTab === 'api' && (
            <div className="py-20 flex flex-col items-center justify-center text-zinc-400 text-center">
               <Settings size={32} className="mb-4 opacity-50" />
               <p className="font-medium">Module loaded for <span className="text-zinc-800 font-bold">{user.displayRole}</span>.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}


// ============================================================================
// 6. LAYOUT & NAVIGATION CONTROLLER
// ============================================================================

function AppLayout() {
  const { user, logout, activeRoute, setActiveRoute } = useApp();
  const userInitials = user?.name ? user.name.substring(0, 2).toUpperCase() : 'US';

  // Ensure users aren't stuck on a route they shouldn't see after switching personas
  useEffect(() => {
    const r = user?.role;
    const allowed = {
      dashboard: true,
      product: ['sustainability_manager', 'product_manager', 'executive'].includes(r),
      hotspots: ['sustainability_manager', 'product_manager', 'executive'].includes(r),
      initiatives: ['sustainability_manager', 'procurement', 'product_manager', 'executive'].includes(r),
      reports: ['sustainability_manager', 'executive', 'auditor'].includes(r),
      suppliers: ['sustainability_manager', 'procurement', 'executive'].includes(r),
      ingestion: ['sustainability_manager', 'auditor'].includes(r),
      integrations: r === 'admin',
      settings: true
    };
    if (!allowed[activeRoute]) {
      setActiveRoute('dashboard');
    }
  }, [user, activeRoute, setActiveRoute]);

  const renderActiveFeature = () => {
    switch(activeRoute) {
      case 'dashboard': return <DashboardFeature />;
      case 'product': return <ProductsFeature />;
      case 'hotspots': return <HotspotsFeature />;
      case 'initiatives': return <InitiativesFeature />;
      case 'reports': return <ReportsFeature />;
      case 'suppliers': return <SuppliersFeature />;
      case 'ingestion': return <DataHubFeature />;
      case 'integrations': return <IntegrationsFeature />;
      case 'settings': return <SettingsFeature />;
      default: return <DashboardFeature />;
    }
  };

  // Strict RBAC Navigation Logic
  const role = user?.role;
  const canSeeProducts = ['sustainability_manager', 'product_manager', 'executive'].includes(role);
  const canSeeHotspots = ['sustainability_manager', 'executive', 'product_manager'].includes(role);
  const canSeeInitiatives = ['sustainability_manager', 'procurement', 'product_manager', 'executive'].includes(role);
  const canSeeReports = ['sustainability_manager', 'executive', 'auditor'].includes(role);
  const canSeeSuppliers = ['sustainability_manager', 'procurement', 'executive'].includes(role);
  const canSeeDataHub = ['sustainability_manager', 'auditor'].includes(role);
  const canSeeIntegrations = role === 'admin';

  const hasComplianceModule = canSeeReports || canSeeSuppliers;
  const hasWorkspaceModule = canSeeDataHub || canSeeIntegrations || true; // Everyone sees settings

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans text-zinc-900">
      <aside className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col text-zinc-300">
        <div className="h-20 flex items-center px-6 border-b border-zinc-800/50 gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white"><Leaf size={16}/></div>
          <span className="text-lg font-bold text-white tracking-tight">ZeroByDesign</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Platform</p>
          <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" isActive={activeRoute==='dashboard'} onClick={() => setActiveRoute('dashboard')} />
          {canSeeProducts && <NavItem icon={<Package size={18}/>} label="Products" isActive={activeRoute==='product'} onClick={() => setActiveRoute('product')} />}
          {canSeeHotspots && <NavItem icon={<Activity size={18}/>} label="Hotspots & Data" isActive={activeRoute==='hotspots'} onClick={() => setActiveRoute('hotspots')} />}
          {canSeeInitiatives && <NavItem icon={<Target size={18}/>} label="Initiatives & Actions" isActive={activeRoute==='initiatives'} onClick={() => setActiveRoute('initiatives')} />}
          
          {hasComplianceModule && (
            <>
              <div className="pt-6 mt-6 border-t border-zinc-800/50"></div>
              <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Compliance</p>
              {canSeeReports && <NavItem icon={<FileText size={18}/>} label="Reports" isActive={activeRoute==='reports'} onClick={() => setActiveRoute('reports')} />}
              {canSeeSuppliers && <NavItem icon={<Users size={18}/>} label="Suppliers" isActive={activeRoute==='suppliers'} onClick={() => setActiveRoute('suppliers')} />}
            </>
          )}
          
          {hasWorkspaceModule && (
            <>
              <div className="pt-6 mt-6 border-t border-zinc-800/50"></div>
              <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Workspace</p>
              {canSeeDataHub && <NavItem icon={<Database size={18}/>} label="Data Hub" isActive={activeRoute==='ingestion'} onClick={() => setActiveRoute('ingestion')} />}
              {canSeeIntegrations && <NavItem icon={<Layers size={18}/>} label="Integrations" isActive={activeRoute==='integrations'} onClick={() => setActiveRoute('integrations')} />}
              <NavItem icon={<Settings size={18}/>} label={role === 'admin' ? "Settings & Security" : "Settings"} isActive={activeRoute==='settings'} onClick={() => setActiveRoute('settings')} />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-zinc-800/50 shrink-0">
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-800/50 transition-colors group cursor-pointer" onClick={logout}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm ring-1 ring-emerald-500/30">
                {userInitials}
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
                <p className="text-[10px] text-emerald-500 font-mono uppercase mt-0.5">{user.displayRole}</p>
              </div>
            </div>
            <LogOut size={16} className="text-zinc-500 group-hover:text-rose-400 transition-colors"/>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="bg-white/80 backdrop-blur-xl border-b border-zinc-200 px-10 h-20 flex justify-between items-center shrink-0 z-20">
          <h1 className="text-xl font-bold capitalize">{activeRoute.replace('-', ' ')}</h1>
          <Badge variant="info" className="!px-3 !py-1.5"><Shield size={14}/> Enterprise Environment</Badge>
        </header>
        <div className="p-10 max-w-7xl mx-auto w-full flex-1 overflow-y-auto custom-scrollbar z-10 pb-20">
          {renderActiveFeature()}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d4d4d8; }
        aside .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
        aside .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #52525b; }
      `}</style>
    </div>
  );
}

// ============================================================================
// 7. APP ENTRY POINT & AUTH
// ============================================================================

function AuthScreen() {
  const { login } = useApp();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('select'); // 'select' -> 'mfa'
  const [selectedUser, setSelectedUser] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState('');

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setLoading(true);
    setError('');
    // Simulate SSO gateway redirect delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setLoading(false);
    setStep('mfa');
  };

  const handleMFA = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate backend MFA verification delay
    await new Promise(resolve => setTimeout(resolve, 600));

    if (mfaCode === '626569') {
      await ServerServices.Auth.verifyMFA(selectedUser);
      const authUser = await ServerServices.Auth.ssoLogin(selectedUser.email);
      login(authUser);
    } else {
      await ServerServices.Auth.failMFA(selectedUser);
      setError('Invalid verification code.');
      setLoading(false);
      setMfaCode('');
    }
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setMfaCode(val);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-zinc-50 py-10">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-zinc-200 text-center max-w-md w-full animate-in fade-in slide-in-from-bottom-8 flex flex-col max-h-[90vh]">
        
        <div className="shrink-0">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl mx-auto flex items-center justify-center text-white mb-6 shadow-lg shadow-zinc-900/20"><Leaf size={32}/></div>
          <h1 className="text-2xl font-bold mb-2 tracking-tight">ZeroByDesign</h1>
        </div>
        
        {step === 'select' ? (
          <div className="flex flex-col flex-1 overflow-hidden mt-4">
            <p className="text-sm text-zinc-500 mb-6 font-medium shrink-0">Select a Demo Persona to continue</p>
            
            <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 pb-2 flex-1">
              {MOCK_DB.users.map(u => (
                <button 
                  key={u.id}
                  onClick={() => handleUserSelect(u)}
                  disabled={loading}
                  className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex items-center justify-between group disabled:opacity-50 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center font-bold text-sm text-zinc-700 shadow-sm group-hover:border-emerald-200 group-hover:text-emerald-600">
                      {u.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{u.name}</p>
                      <p className="text-xs font-semibold text-zinc-400">{u.displayRole}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-zinc-300 group-hover:text-emerald-500 transition-colors" />
                </button>
              ))}
            </div>
            {loading && <div className="mt-6 flex justify-center text-emerald-600 shrink-0"><RefreshCw size={20} className="animate-spin"/></div>}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 mt-4">
            <p className="text-sm text-zinc-500 mb-6 font-medium">Enter the 6-digit code from your authenticator app for <strong className="text-zinc-800">{selectedUser.name}</strong>.</p>
            <form onSubmit={handleMFA} className="space-y-4">
              
              <div className="relative flex justify-center gap-2 mb-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`w-10 h-14 flex items-center justify-center text-2xl font-mono rounded-xl border-2 ${error ? 'border-rose-500 text-rose-500' : mfaCode.length === i ? 'border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)] text-zinc-900' : 'border-zinc-200 text-zinc-900'} bg-zinc-50`}>
                    {mfaCode[i] ? '*' : ''}
                  </div>
                ))}
                <input 
                  type="text" 
                  value={mfaCode} 
                  onChange={handleOtpChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-text" 
                  autoFocus
                  required
                />
              </div>

              {error && <p className="text-xs font-bold text-rose-500">{error}</p>}
              <button 
                type="submit"
                disabled={loading || mfaCode.length !== 6}
                className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {loading ? <RefreshCw size={18} className="animate-spin" /> : 'Verify MFA'}
              </button>
              <button 
                type="button"
                onClick={() => { setStep('select'); setError(''); setMfaCode(''); }}
                disabled={loading}
                className="text-xs font-semibold text-zinc-400 hover:text-zinc-700 transition-colors mt-4 block mx-auto"
              >
                Return to Persona Selection
              </button>
            </form>
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-center gap-2 text-xs text-zinc-400 font-semibold uppercase tracking-widest shrink-0">
          <ShieldCheck size={14} className="text-emerald-500" /> AES-256 Encrypted
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContainer />
    </AppProvider>
  );
}

function AppContainer() {
  const { user } = useApp();
  return user ? <AppLayout /> : <AuthScreen />;
}
