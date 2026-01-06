import React, { useState, useEffect } from 'react';
import { MapPin, Thermometer, Activity, Send, CheckCircle } from 'lucide-react';
import { CommunityService } from '../services/mockBackend';
import { Area, AreaType } from '../types';

const Community: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const allAreas = CommunityService.getAreas();
    const cities = allAreas.filter(a => a.type === AreaType.CITY);
    setAreas(cities);
    if (cities.length > 0) setSelectedCityId(cities[0].id);
  }, []);

  const symptomOptions = [
    'Fever', 'Dry Cough', 'Fatigue', 'Breathing Issues', 
    'Severe Diarrhea', 'Vomiting', 'Muscle Aches', 'Skin Lesions'
  ];

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev => prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (symptoms.length === 0 || !selectedCityId) return;
    
    await CommunityService.submitReport({
      cityId: selectedCityId,
      symptoms,
      severity: 7 
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSymptoms([]);
    }, 4000);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Citizen Health Check</h2>
        <p className="text-slate-500 mt-2 font-medium">Anonymized signals directly inform the State AI Command center.</p>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border-2 border-emerald-100 rounded-3xl p-12 text-center shadow-xl shadow-emerald-100/50">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
            <CheckCircle size={40} />
          </div>
          <h3 className="text-2xl font-black text-emerald-900 mb-2 uppercase">Data Transmitted</h3>
          <p className="text-emerald-700 font-medium">Your localized signal has been added to the regional risk model.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 p-8 text-white relative">
            <div className="flex items-center gap-2 opacity-60 mb-2">
              <Activity size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Localized Surveillance</span>
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight">Current Symptoms</h3>
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 rounded-full -mr-16 -mt-16 opacity-20"></div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            {/* Hierarchical Location Selector */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={16} className="text-blue-500" />
                Select Your City
              </label>
              <div className="grid grid-cols-1 gap-4">
                <select 
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
                >
                  {areas.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Symptoms Logic */}
            <div className="space-y-4">
               <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Thermometer size={16} className="text-red-500" />
                Select Observed Symptoms
              </label>
              <div className="grid grid-cols-2 gap-3">
                {symptomOptions.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={`
                      p-4 rounded-2xl text-xs font-black uppercase transition-all text-left border-2
                      ${symptoms.includes(symptom) 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-[0.98]' 
                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}
                    `}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={symptoms.length === 0}
              className="group w-full bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
            >
              Dispatch Report
              <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Community;