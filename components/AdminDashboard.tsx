
import React, { useState } from 'react';
import { PrescriptionRequest, MissingMedicationRequest, MedicalDataMap, DietAdvice } from '../types';
import { ShieldCheck, Lock, LogOut, Pill, AlertCircle, CheckCircle, Trash2, Clock, Image as ImageIcon, FileEdit, Save, X, Plus, Wifi, WifiOff } from 'lucide-react';

interface AdminDashboardProps {
  prescriptionRequests: PrescriptionRequest[];
  missingRequests: MissingMedicationRequest[];
  medicalData: MedicalDataMap;
  onUpdateStatus: (type: 'prescription' | 'missing', id: string, status: 'completed' | 'cancelled') => void;
  onDelete: (type: 'prescription' | 'missing', id: string) => void;
  onUpdateMedicalData: (key: string, newData: DietAdvice) => void;
  onAddMedicalData: (key: string, newData: DietAdvice) => void;
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
  connectionStatus?: 'online' | 'offline' | 'checking';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  prescriptionRequests, 
  missingRequests, 
  medicalData,
  onUpdateStatus,
  onDelete,
  onUpdateMedicalData,
  onAddMedicalData,
  isAuthenticated,
  onLogin,
  onLogout,
  connectionStatus = 'offline'
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'missing' | 'advice'>('prescriptions');

  // Advice Editing State
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<DietAdvice | null>(null);

  // Advice Creation State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newName, setNewName] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { 
      onLogin();
      setError('');
    } else {
      setError('كلمة المرور غير صحيحة');
    }
  };

  const startEditingAdvice = (key: string) => {
    setEditingKey(key);
    setEditForm({ ...medicalData[key] });
    setIsAddingNew(false);
  };

  const handleCreateNewAdvice = () => {
    if (!newKey || !newName) return;
    
    // Simple validation for key (lowercase, no spaces preferred)
    const formattedKey = newKey.toLowerCase().replace(/\s+/g, '_');

    if (medicalData[formattedKey]) {
        alert('هذا المعرف (Key) موجود بالفعل، يرجى اختيار معرف آخر.');
        return;
    }

    const newAdvice: DietAdvice = {
        condition: newName,
        allowedFoods: [],
        forbiddenFoods: [],
        tips: [],
        disclaimer: 'هذه المعلومات إرشادية فقط ولا تغني عن استشارة الطبيب المختص.'
    };

    onAddMedicalData(formattedKey, newAdvice);
    
    // Switch to edit mode for the new item
    setEditingKey(formattedKey);
    setEditForm(newAdvice);
    
    // Reset add form
    setIsAddingNew(false);
    setNewKey('');
    setNewName('');
  };

  const saveAdvice = () => {
    if (editingKey && editForm) {
        onUpdateMedicalData(editingKey, editForm);
        setEditingKey(null);
        setEditForm(null);
    }
  };

  const handleEditChange = (field: keyof DietAdvice, value: any) => {
    if (editForm) {
        // If it's an array (allowedFoods, forbiddenFoods, tips), we handle it as text area splitting by newline
        if (field === 'allowedFoods' || field === 'forbiddenFoods' || field === 'tips') {
            // value comes in as string from textarea, split it
            const arrayValue = value.split('\n').filter((line: string) => line.trim() !== '');
            setEditForm({ ...editForm, [field]: arrayValue });
        } else {
            setEditForm({ ...editForm, [field]: value });
        }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-4 rounded-full">
              <Lock className="w-8 h-8 text-gray-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">تسجيل دخول المشرف</h2>
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="أدخل كلمة المرور"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              دخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Admin Header */}
      <div className="bg-gray-900 text-white p-4 shadow-md">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-green-400" />
            <div>
                <h2 className="text-xl font-bold">لوحة تحكم الإدارة</h2>
                <div className="flex items-center gap-1.5 text-xs font-medium mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${connectionStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></span>
                    <span className="opacity-80">
                        {connectionStatus === 'online' ? 'متصل بقاعدة البيانات (Online)' : 'وضع التخزين المحلي (Offline)'}
                    </span>
                </div>
            </div>
          </div>
          <button 
            onClick={() => {
                setPassword('');
                onLogout();
            }}
            className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            تسجيل خروج
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'prescriptions'
                ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Pill className="w-5 h-5" />
            طلبات صرف العلاج
            <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full ml-2">
              {prescriptionRequests.filter(r => r.status === 'pending').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('missing')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'missing'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <AlertCircle className="w-5 h-5" />
            طلبات توفير الأدوية
            <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full ml-2">
              {missingRequests.filter(r => r.status === 'pending').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('advice')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'advice'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <FileEdit className="w-5 h-5" />
            تعديل النصائح الطبية
          </button>
        </div>

        {/* Content */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
          
          {/* Prescriptions Tab */}
          {activeTab === 'prescriptions' && (
            <>
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 grid grid-cols-12 gap-4 text-sm font-bold text-gray-500">
                <div className="col-span-3">المريض</div>
                <div className="col-span-4">التفاصيل / الأدوية</div>
                <div className="col-span-2">التاريخ</div>
                <div className="col-span-3 text-center">الإجراءات</div>
              </div>
              <div className="divide-y divide-gray-100">
                {prescriptionRequests.length === 0 ? (
                    <EmptyState message="لا توجد طلبات صرف علاج حالياً" />
                ) : (
                    prescriptionRequests.map((req) => (
                    <div key={req.id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-start ${req.status === 'completed' ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
                        <div className="col-span-3">
                        <p className="font-bold text-gray-800">{req.fullName}</p>
                        <a href={`tel:${req.phoneNumber}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">
                            <PhoneIcon className="w-3 h-3" /> {req.phoneNumber}
                        </a>
                        </div>
                        <div className="col-span-4">
                        <div className="space-y-1 mb-2">
                            {req.medications.map((med, idx) => (
                            <div key={idx} className="text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                                <span className="font-medium text-gray-700">{med.name || 'بدون اسم'}</span>
                                <span className="text-gray-400 text-xs">({med.concentration})</span>
                                {med.image && <ImageIcon className="w-3 h-3 text-blue-500" />}
                            </div>
                            ))}
                        </div>
                        {req.notes && (
                            <p className="text-xs text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-100">
                            ملاحظات: {req.notes}
                            </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">ميعاد الصرف: {req.refillDate}</p>
                        </div>
                        <div className="col-span-2 text-sm text-gray-500 flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(req.submissionDate).toLocaleDateString('ar-SA')}
                            </div>
                            <div className="text-xs opacity-70">
                                {new Date(req.submissionDate).toLocaleTimeString('ar-SA', {hour: '2-digit', minute:'2-digit'})}
                            </div>
                            
                            <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${req.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {req.status === 'completed' ? 'تم التنفيذ' : 'قيد الانتظار'}
                            </div>
                        </div>
                        <div className="col-span-3 flex justify-center gap-2">
                        {req.status !== 'completed' && (
                            <button 
                                onClick={() => onUpdateStatus('prescription', req.id, 'completed')}
                                className="bg-green-100 text-green-700 hover:bg-green-200 p-2 rounded-lg transition-colors"
                                title="تحديد كمكتمل"
                            >
                                <CheckCircle className="w-5 h-5" />
                            </button>
                        )}
                        <button 
                            onClick={() => onDelete('prescription', req.id)}
                            className="bg-red-50 text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors"
                            title="حذف الطلب"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        </div>
                    </div>
                    ))
                )}
              </div>
            </>
          )}

          {/* Missing Meds Tab */}
          {activeTab === 'missing' && (
             <>
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 grid grid-cols-12 gap-4 text-sm font-bold text-gray-500">
                    <div className="col-span-3">المريض</div>
                    <div className="col-span-4">الدواء المطلوب</div>
                    <div className="col-span-2">التاريخ</div>
                    <div className="col-span-3 text-center">الإجراءات</div>
                </div>
                <div className="divide-y divide-gray-100">
                    {missingRequests.length === 0 ? (
                        <EmptyState message="لا توجد بلاغات أدوية حالياً" />
                    ) : (
                        missingRequests.map((req) => (
                        <div key={req.id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-start ${req.status === 'completed' ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
                            <div className="col-span-3">
                                <p className="font-bold text-gray-800">{req.fullName}</p>
                                <a href={`tel:${req.phoneNumber}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">
                                    <PhoneIcon className="w-3 h-3" /> {req.phoneNumber}
                                </a>
                            </div>
                            <div className="col-span-4">
                                <p className="font-bold text-orange-600 text-lg">{req.medicineName}</p>
                                {req.notes && (
                                    <p className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded">
                                        {req.notes}
                                    </p>
                                )}
                            </div>
                            <div className="col-span-2 text-sm text-gray-500 flex flex-col gap-1">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(req.submissionDate).toLocaleDateString('ar-SA')}
                                </div>
                                <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${req.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {req.status === 'completed' ? 'تم التوفير' : 'قيد الانتظار'}
                                </div>
                            </div>
                            <div className="col-span-3 flex justify-center gap-2">
                            {req.status !== 'completed' && (
                                <button 
                                    onClick={() => onUpdateStatus('missing', req.id, 'completed')}
                                    className="bg-green-100 text-green-700 hover:bg-green-200 p-2 rounded-lg transition-colors"
                                    title="تحديد كمتوفر"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                </button>
                            )}
                            <button 
                                onClick={() => onDelete('missing', req.id)}
                                className="bg-red-50 text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors"
                                title="حذف البلاغ"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            </div>
                        </div>
                        ))
                    )}
                </div>
             </>
          )}

          {/* Advice Editor Tab */}
          {activeTab === 'advice' && (
            <div className="flex flex-col md:flex-row min-h-[500px]">
                {/* Sidebar List */}
                <div className="w-full md:w-1/4 border-l border-gray-200 bg-gray-50 p-4">
                    <button
                        onClick={() => {
                            setEditingKey(null);
                            setEditForm(null);
                            setIsAddingNew(true);
                        }}
                        className="w-full mb-4 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 py-3 rounded-lg border border-dashed border-blue-300 font-bold transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة حالة جديدة
                    </button>

                    <h3 className="font-bold text-gray-600 mb-3 px-2 text-xs uppercase">الحالات الموجودة</h3>
                    <div className="space-y-2">
                        {Object.keys(medicalData).map((key) => (
                            <button
                                key={key}
                                onClick={() => startEditingAdvice(key)}
                                className={`w-full text-right px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                    editingKey === key 
                                    ? 'bg-blue-600 text-white shadow-md' 
                                    : 'bg-white hover:bg-blue-50 text-gray-700 border border-gray-200'
                                }`}
                            >
                                {medicalData[key].condition}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Editor Area */}
                <div className="w-full md:w-3/4 p-6 bg-white">
                    {/* Mode: Adding New */}
                    {isAddingNew && (
                        <div className="animate-fade-in max-w-lg mx-auto mt-10">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Plus className="w-6 h-6 text-blue-600" />
                                إنشاء نصيحة طبية جديدة
                            </h3>
                            <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">المعرف (English Key)</label>
                                    <p className="text-xs text-gray-500 mb-2">يجب أن يكون بالإنجليزية وبدون مسافات (مثلاً: gastritis)</p>
                                    <input
                                        type="text"
                                        value={newKey}
                                        onChange={(e) => setNewKey(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-left dir-ltr"
                                        placeholder="e.g. gastritis"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">اسم الحالة (بالعربي)</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="مثلاً: التهاب المعدة"
                                    />
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={handleCreateNewAdvice}
                                        disabled={!newKey || !newName}
                                        className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        إنشاء ومتابعة
                                    </button>
                                    <button
                                        onClick={() => setIsAddingNew(false)}
                                        className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mode: Editing */}
                    {!isAddingNew && editingKey && editForm && (
                        <div className="animate-fade-in">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-800">تعديل: {editForm.condition}</h3>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setEditingKey(null)}
                                        className="text-gray-500 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm"
                                    >
                                        إلغاء
                                    </button>
                                    <button 
                                        onClick={saveAdvice}
                                        className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-green-200"
                                    >
                                        <Save className="w-4 h-4" />
                                        حفظ التعديلات
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Condition Name */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">اسم الحالة المرضية</label>
                                    <input 
                                        type="text" 
                                        value={editForm.condition}
                                        onChange={(e) => handleEditChange('condition', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Allowed Foods */}
                                    <div>
                                        <label className="block text-sm font-bold text-green-700 mb-2">المسموح (كل صنف في سطر)</label>
                                        <textarea 
                                            value={editForm.allowedFoods.join('\n')}
                                            onChange={(e) => handleEditChange('allowedFoods', e.target.value)}
                                            rows={8}
                                            className="w-full border border-green-200 bg-green-50/30 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                                        />
                                    </div>

                                    {/* Forbidden Foods */}
                                    <div>
                                        <label className="block text-sm font-bold text-red-700 mb-2">الممنوع (كل صنف في سطر)</label>
                                        <textarea 
                                            value={editForm.forbiddenFoods.join('\n')}
                                            onChange={(e) => handleEditChange('forbiddenFoods', e.target.value)}
                                            rows={8}
                                            className="w-full border border-red-200 bg-red-50/30 rounded-lg p-3 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Tips */}
                                <div>
                                    <label className="block text-sm font-bold text-blue-700 mb-2">نصائح عامة (كل نصيحة في سطر)</label>
                                    <textarea 
                                        value={editForm.tips.join('\n')}
                                        onChange={(e) => handleEditChange('tips', e.target.value)}
                                        rows={5}
                                        className="w-full border border-blue-200 bg-blue-50/30 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    />
                                </div>
                                
                                {/* Disclaimer */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 mb-2">إخلاء المسؤولية</label>
                                    <input 
                                        type="text" 
                                        value={editForm.disclaimer}
                                        onChange={(e) => handleEditChange('disclaimer', e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg p-2 text-sm text-gray-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mode: Empty State */}
                    {!isAddingNew && !editingKey && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 min-h-[300px]">
                            <FileEdit className="w-12 h-12 mb-3 opacity-20" />
                            <p>اختر حالة من القائمة للتعديل، أو أضف حالة جديدة</p>
                        </div>
                    )}
                </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
    <div className="py-12 flex flex-col items-center justify-center text-center text-gray-400">
        <div className="bg-gray-100 p-4 rounded-full mb-3">
            <LogOut className="w-8 h-8 opacity-20" />
        </div>
        <p>{message}</p>
    </div>
);

// Helper Icon
const PhoneIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);

export default AdminDashboard;
