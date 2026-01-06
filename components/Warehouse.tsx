import React, { useEffect, useState } from 'react';
import { InventoryService } from '../services/mockBackend';
import { Medicine, UserRole } from '../types';
import { Search, Filter, AlertCircle, CheckCircle, Calendar, ArrowDown, ArrowUp, Lock, Plus, X, BarChart3, Clock } from 'lucide-react';

interface WarehouseProps {
  userRole?: UserRole;
}

const Warehouse: React.FC<WarehouseProps> = ({ userRole }) => {
  const [inventory, setInventory] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'General',
    stock: 0,
    expiry: '',
    criticalThreshold: 100
  });

  const isReadOnly = userRole === UserRole.COMMUNITY;

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    const data = await InventoryService.getAll();
    setInventory(data);
    setLoading(false);
  };

  const updateStock = async (id: string, current: number, change: number) => {
    if (isReadOnly) return;
    const newValue = Math.max(0, current + change);
    setInventory(prev => prev.map(m => m.id === id ? { ...m, stock: newValue } : m));
    await InventoryService.updateStock(id, newValue);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.expiry) return;

    await InventoryService.addMedicine({
      ...newItem,
      stock: Number(newItem.stock),
      criticalThreshold: Number(newItem.criticalThreshold)
    });
    
    setShowAddModal(false);
    setNewItem({ name: '', category: 'General', stock: 0, expiry: '', criticalThreshold: 100 });
    loadInventory();
  };

  const getStockStatus = (stock: number, threshold: number, forecast?: number) => {
    const isAtRiskOfForecast = forecast && stock < forecast;
    if (stock < threshold || isAtRiskOfForecast) return { label: 'CRITICAL', color: 'bg-red-100 text-red-700 border-red-200', barColor: 'bg-red-500' };
    if (stock < threshold * 2) return { label: 'MONITOR', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', barColor: 'bg-yellow-500' };
    return { label: 'SECURE', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', barColor: 'bg-emerald-500' };
  };

  const getExpiryInfo = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { 
        isExpired: true, 
        isSoon: false, 
        label: 'EXPIRED', 
        color: 'text-red-600', 
        subColor: 'text-red-400',
        bg: 'bg-red-50'
      };
    }
    if (diffDays <= 30) {
      return { 
        isExpired: false, 
        isSoon: true, 
        label: `Expiring Soon (${diffDays}d)`, 
        color: 'text-amber-600', 
        subColor: 'text-amber-500',
        bg: 'bg-amber-50'
      };
    }
    return { 
      isExpired: false, 
      isSoon: false, 
      label: 'Standard Shelf-Life', 
      color: 'text-slate-700', 
      subColor: 'text-slate-400',
      bg: ''
    };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Central Stock Registry</h2>
             {isReadOnly && (
                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-200 flex items-center">
                  <Lock size={12} className="mr-1" /> READ-ONLY
                </span>
             )}
           </div>
           <p className="text-slate-500 font-medium">Monitoring {inventory.length} high-priority pharmaceuticals.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <div className="relative flex-1 sm:flex-none">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
             <input type="text" placeholder="Search state registry..." className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium shadow-sm" />
           </div>
           {userRole !== UserRole.COMMUNITY && (
             <button onClick={() => setShowAddModal(true)} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center">
               <Plus size={18} className="mr-2" /> NEW ENTRY
             </button>
           )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-400 font-black tracking-widest">
                <th className="px-8 py-5">Nomenclature & Identity</th>
                <th className="px-8 py-5">Current vs Forecasted</th>
                <th className="px-8 py-5">Classification</th>
                <th className="px-8 py-5">Batch Integrity</th>
                {!isReadOnly && <th className="px-8 py-5 text-right">Logistics</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-16 text-center text-slate-400 font-bold italic">Synchronizing state ledger...</td></tr>
              ) : inventory.map((item) => {
                const status = getStockStatus(item.stock, item.criticalThreshold, item.forecastedDemand);
                const expiryInfo = getExpiryInfo(item.expiry);
                const maxStock = Math.max(item.criticalThreshold * 3, item.stock);
                const percentage = (item.stock / maxStock) * 100;

                return (
                  <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors group ${expiryInfo.bg}`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-sm mr-4 border border-slate-200">
                           {item.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 text-base">{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 tracking-tight uppercase">SHLC-REF: {item.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="w-full max-w-[240px]">
                        <div className="flex justify-between items-end mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-lg">{item.stock.toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-slate-400">UNITS</span>
                          </div>
                          <span className={`text-[10px] px-2.5 py-1 rounded-full border font-black ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full transition-all duration-700 ${status.barColor}`} style={{ width: `${percentage}%` }}></div>
                        </div>
                        {item.forecastedDemand && (
                          <div className="mt-2 flex items-center text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-fit">
                            <BarChart3 size={12} className="mr-1.5" />
                            AI Forecasted Needs: {item.forecastedDemand.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                        {item.category.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`text-sm font-bold flex items-center ${expiryInfo.color}`}>
                        {(expiryInfo.isSoon || expiryInfo.isExpired) && <AlertCircle size={14} className="mr-1.5" />}
                        {item.expiry}
                      </div>
                      <div className={`text-[10px] mt-1 uppercase font-black tracking-tight ${expiryInfo.subColor}`}>
                        {expiryInfo.label}
                      </div>
                    </td>
                    {!isReadOnly && (
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => updateStock(item.id, item.stock, -200)} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm">
                            <ArrowDown size={18} />
                          </button>
                          <button onClick={() => updateStock(item.id, item.stock, 200)} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50 transition-all shadow-sm">
                            <ArrowUp size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Warehouse;