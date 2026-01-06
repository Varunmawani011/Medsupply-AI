import React, { useEffect, useState } from 'react';
import { AreaChart, Area as ReArea, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { AlertTriangle, TrendingUp, ShieldCheck, MapPin, BrainCircuit, RefreshCw, Activity, Target, Zap, Waves, Globe, Filter, CloudRain, CalendarDays, History } from 'lucide-react';
import { AIService } from '../services/mockBackend';
import { AIAnalysisResult, AreaType, IncidentType, HierarchicalForecast } from '../types';

const Dashboard: React.FC = () => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [incidentType, setIncidentType] = useState<IncidentType>(IncidentType.GENERAL);
  const [granularity, setGranularity] = useState<AreaType>(AreaType.DISTRICT);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await AIService.runHierarchicalAnalysis(incidentType);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    runAnalysis();
  }, [incidentType]);

  const filteredForecasts = analysis?.hierarchicalForecasts.filter(f => f.areaType === granularity) || [];

  const ScenarioIcon = ({ type }: { type: IncidentType }) => {
    switch (type) {
      case IncidentType.DISASTER: return <Waves className="text-blue-500" />;
      case IncidentType.PANDEMIC: return <Zap className="text-purple-500" />;
      case IncidentType.EMERGENCY: return <AlertTriangle className="text-orange-500" />;
      default: return <Globe className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header with Strategic Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                 <Target size={22} />
               </div>
               <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">State Health Command</h2>
            </div>
            <p className="text-slate-500 font-medium">Multi-Tier Hierarchical Medicine Forecasting Engine</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200 flex gap-2">
              {(Object.values(IncidentType) as IncidentType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setIncidentType(type)}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-2 ${
                    incidentType === type ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <ScenarioIcon type={type} />
                  {type}
                </button>
              ))}
            </div>
            <button 
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
            >
              {isAnalyzing ? <RefreshCw className="animate-spin" /> : <BrainCircuit />}
              Sync Intelligence
            </button>
          </div>
        </div>
      </div>

      {/* External Intelligence Signals Bar */}
      {analysis?.externalSignals && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-4">
             <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600"><CloudRain size={20} /></div>
             <div>
               <p className="text-[10px] font-black text-blue-400 uppercase tracking-wider">Environmental Signal</p>
               <p className="text-sm font-bold text-blue-900">{analysis.externalSignals.weather}</p>
             </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-4">
             <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-600"><CalendarDays size={20} /></div>
             <div>
               <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Localized Events</p>
               <p className="text-sm font-bold text-emerald-900">{analysis.externalSignals.events.join(", ")}</p>
             </div>
          </div>
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-center gap-4">
             <div className="p-2 bg-white rounded-lg shadow-sm text-amber-600"><History size={20} /></div>
             <div>
               <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Historical Context</p>
               <p className="text-sm font-bold text-amber-900">{analysis.externalSignals.historicalContext}</p>
             </div>
          </div>
        </div>
      )}

      {/* Main Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Key Metrics & Scenario Analysis */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Activity size={80} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Statewide Forecast (7D)</p>
              <h3 className="text-4xl font-black text-slate-900 mb-2">
                {analysis?.statewideShortTermForecast.toLocaleString() || '---'} <span className="text-sm font-medium text-slate-400">units</span>
              </h3>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <ShieldCheck size={14} className="text-emerald-500" />
                Confidence: {((analysis?.confidenceScore || 0) * 100).toFixed(0)}%
              </div>
           </div>

           <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <ScenarioIcon type={incidentType} />
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Scenario Context</span>
              </div>
              <p className="text-lg font-bold leading-snug mb-4">{analysis?.scenarioImpact || 'Loading strategic data...'}</p>
              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Primary Risk Medicine</p>
                <p className="text-xl font-black text-emerald-400">{analysis?.targetedMedicine || 'Monitoring...'}</p>
              </div>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Strategic Directive</h4>
              <p className="text-sm text-slate-600 leading-relaxed italic border-l-4 border-slate-900 pl-4">
                "{analysis?.recommendation || 'Analyzing current signals for actionable directives...'}"
              </p>
           </div>
        </div>

        {/* Right: Hierarchical Charting */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h3 className="font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                <BarChart className="text-blue-500" />
                Granular Demand Distribution
              </h3>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {(Object.values(AreaType) as AreaType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setGranularity(type)}
                    className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${
                      granularity === type ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
           </div>

           <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredForecasts}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="areaName" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                  />
                  <Bar dataKey="predictedDemand" radius={[6, 6, 0, 0]} barSize={40}>
                    {filteredForecasts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.growthRate > 0.1 ? '#ef4444' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
           
           <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Baseline Demand</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">High Velocity Shift (&gt;10%)</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Updated: {new Date().toLocaleTimeString()}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;