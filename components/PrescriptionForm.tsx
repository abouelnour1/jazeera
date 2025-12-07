import React, { useState } from 'react';
import { PrescriptionRequest, MedicationItem } from '../types';
import { Send, FileText, Calendar, User, Phone, Plus, Trash2, Camera, Pill, AlignLeft, Hash, X, CheckCircle2, ChevronDown } from 'lucide-react';

interface PrescriptionFormProps {
  onSubmit: (data: PrescriptionRequest) => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<Partial<PrescriptionRequest>>({
    fullName: '',
    phoneNumber: '',
    refillDate: '',
    notes: '',
  });
  
  const [medications, setMedications] = useState<MedicationItem[]>([
    { id: '1', name: '', concentration: '', usage: '', image: null }
  ]);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Medication List Handlers
  const addMedication = () => {
    setMedications(prev => [
      ...prev,
      { id: Date.now().toString(), name: '', concentration: '', usage: '', image: null }
    ]);
  };

  const removeMedication = (id: string) => {
    if (medications.length === 1) return;
    setMedications(prev => prev.filter(med => med.id !== id));
  };

  const updateMedication = (id: string, field: keyof MedicationItem, value: any) => {
    setMedications(prev => prev.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateMedication(id, 'image', e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const newRequest: PrescriptionRequest = {
      id: Date.now().toString(),
      fullName: formData.fullName || '',
      phoneNumber: formData.phoneNumber || '',
      refillDate: formData.refillDate || '',
      notes: formData.notes || '',
      medications: medications,
      submissionDate: new Date().toISOString(),
      status: 'pending'
    };

    onSubmit(newRequest);
    
    setTimeout(() => {
        setLoading(false);
        setSubmitted(true);
    }, 800);
  };

  if (submitted) {
    return (
      <div className="bg-white p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] text-center border border-gray-100 max-w-xl mx-auto mt-12 animate-fade-in-up">
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 className="w-12 h-12 animate-pulse-slow" />
        </div>
        <h3 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">تم استلام طلبك بنجاح</h3>
        <p className="text-gray-500 mb-8 mt-2 text-lg leading-relaxed">سيقوم فريق الصيدلة بمراجعة طلبك وتجهيز الأدوية في الموعد المحدد.</p>
        <button 
          onClick={() => { 
            setSubmitted(false); 
            setFormData({ fullName: '', phoneNumber: '', refillDate: '', notes: '' });
            setMedications([{ id: Date.now().toString(), name: '', concentration: '', usage: '', image: null }]);
          }}
          className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors shadow-lg"
        >
          ارسال طلب جديد
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-6 relative overflow-hidden">
        {/* Background Blob */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-rose-100/50 rounded-full blur-3xl -z-10"></div>
        
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-rose-600 to-red-500 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold flex items-center gap-3 mb-2">
                        <FileText className="w-8 h-8" />
                        <span>نموذج صرف العلاج الشهري</span>
                    </h2>
                    <p className="text-rose-100 opacity-90">يرجى تعبئة البيانات بدقة لضمان تجهيز الدواء بشكل صحيح.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                
                {/* Personal Info */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="group">
                        <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-rose-600 transition-colors">الاسم الرباعي</label>
                        <div className="relative">
                            <User className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                            <input
                                type="text"
                                name="fullName"
                                required
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all placeholder:text-gray-400"
                                placeholder="الاسم بالكامل..."
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-rose-600 transition-colors">رقم الهاتف</label>
                        <div className="relative">
                            <Phone className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                            <input
                                type="tel"
                                name="phoneNumber"
                                required
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all placeholder:text-gray-400"
                                placeholder="05xxxxxxxx"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-gray-100 my-4"></div>

                {/* Medications List */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Pill className="w-6 h-6 text-rose-500" />
                            قائمة الأدوية
                        </label>
                        <span className="text-xs font-bold bg-rose-50 text-rose-600 px-3 py-1 rounded-full">
                            {medications.length} أدوية
                        </span>
                    </div>
                
                    <div className="space-y-5">
                        {medications.map((med, index) => (
                        <div key={med.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-rose-100 transition-all group relative">
                            <div className="absolute left-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                {medications.length > 1 && (
                                    <button 
                                        type="button"
                                        onClick={() => removeMedication(med.id)}
                                        className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                </span>
                                <span className="text-sm font-bold text-gray-500">تفاصيل الدواء</span>
                            </div>

                            <div className="grid gap-5">
                                {/* Row 1 */}
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={med.name}
                                            onChange={(e) => updateMedication(med.id, 'name', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border-0 border-b-2 border-gray-200 focus:border-rose-500 focus:bg-gray-50/50 rounded-t-lg outline-none transition-all placeholder:text-gray-400 text-gray-800 font-medium"
                                            placeholder="اسم الدواء..."
                                        />
                                        <Pill className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                    </div>
                                    
                                    <div className="relative h-[42px]">
                                        {med.image ? (
                                            <div className="flex items-center justify-between w-full h-full px-4 border border-green-200 bg-green-50/50 rounded-xl">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                                    <span className="text-green-700 text-xs truncate dir-ltr font-medium">
                                                        {typeof med.image === 'string' ? 'تم الرفع' : (med.image as File).name}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => updateMedication(med.id, 'image', null)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(med.id, e)}
                                                    className="hidden"
                                                    id={`file-${med.id}`}
                                                />
                                                <label 
                                                    htmlFor={`file-${med.id}`} 
                                                    className="cursor-pointer flex items-center justify-center gap-2 w-full h-full border border-dashed border-gray-300 hover:border-rose-400 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50/30 transition-all text-sm font-medium"
                                                >
                                                    <Camera className="w-4 h-4" />
                                                    <span>إرفاق صورة العلبة</span>
                                                </label>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Row 2 */}
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={med.concentration}
                                            onChange={(e) => updateMedication(med.id, 'concentration', e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-rose-400 outline-none text-sm transition-all"
                                            placeholder="التركيز (500mg)"
                                        />
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={med.usage}
                                            onChange={(e) => updateMedication(med.id, 'usage', e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-rose-400 outline-none text-sm transition-all"
                                            placeholder="الاستخدام (مرة يومياً)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                
                    <button
                        type="button"
                        onClick={addMedication}
                        className="mt-6 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center gap-2 font-bold group"
                    >
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                            <Plus className="w-4 h-4" />
                        </div>
                        إضافة دواء آخر
                    </button>
                </div>

                <div className="w-full h-px bg-gray-100 my-4"></div>

                {/* Date & Notes */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 group">
                        <label className="block text-sm font-bold text-gray-700 mb-2">ميعاد الصرف</label>
                        <div className="relative">
                            <Calendar className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-rose-500" />
                            <input
                                type="date"
                                name="refillDate"
                                required
                                value={formData.refillDate}
                                onChange={handleInputChange}
                                className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 group">
                        <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات إضافية</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={1}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all resize-none"
                            placeholder="أي تفاصيل أخرى..."
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-rose-600 to-red-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-rose-500/40 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            <span>إرسال الطلب</span>
                        </>
                    )}
                </button>

            </form>
        </div>
    </div>
  );
};

export default PrescriptionForm;