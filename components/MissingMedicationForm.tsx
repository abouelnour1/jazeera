import React, { useState } from 'react';
import { MissingMedicationRequest } from '../types';
import { Send, User, Phone, AlertCircle, SearchX, CheckCircle2 } from 'lucide-react';

interface MissingMedicationFormProps {
  onSubmit: (data: MissingMedicationRequest) => void;
}

const MissingMedicationForm: React.FC<MissingMedicationFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<Partial<MissingMedicationRequest>>({
    fullName: '',
    phoneNumber: '',
    medicineName: '',
    notes: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRequest: MissingMedicationRequest = {
        id: Date.now().toString(),
        fullName: formData.fullName || '',
        phoneNumber: formData.phoneNumber || '',
        medicineName: formData.medicineName || '',
        notes: formData.notes,
        submissionDate: new Date().toISOString(),
        status: 'pending'
    };

    onSubmit(newRequest);
    
    setTimeout(() => {
        setSubmitted(true);
    }, 500);
  };

  if (submitted) {
    return (
      <div className="bg-white p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] text-center border border-gray-100 max-w-xl mx-auto mt-12 animate-fade-in-up">
        <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 className="w-12 h-12 animate-pulse-slow" />
        </div>
        <h3 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">تم استلام الطلب</h3>
        <p className="text-gray-500 mb-8 mt-2 text-lg leading-relaxed">سنعمل على توفير الدواء بأسرع وقت ممكن وسنتواصل معك فور توفره.</p>
        <button 
          onClick={() => { 
            setSubmitted(false); 
            setFormData({ fullName: '', phoneNumber: '', medicineName: '', notes: '' }); 
          }}
          className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors shadow-lg"
        >
          تسجيل دواء آخر
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-6 relative overflow-hidden">
         {/* Background Blob */}
         <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-orange-100/50 rounded-full blur-3xl -z-10"></div>

         <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold flex items-center gap-3 mb-2">
                        <SearchX className="w-8 h-8" />
                        <span>نموذج طلب توفير دواء</span>
                    </h2>
                    <p className="text-orange-100 opacity-90">نحن نهتم بصحتك. سجل اسم الدواء وسنقوم بتوفيره لك.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                
                {/* Personal Info */}
                <div className="space-y-4">
                    <div className="group">
                        <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">اسم المريض</label>
                        <div className="relative">
                            <User className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type="text"
                                name="fullName"
                                required
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400"
                                placeholder="الاسم..."
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">رقم التواصل</label>
                        <div className="relative">
                            <Phone className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type="tel"
                                name="phoneNumber"
                                required
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400"
                                placeholder="05xxxxxxxx"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-gray-100 my-2"></div>

                {/* Medicine Info */}
                <div className="group">
                    <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">اسم الدواء المطلوب</label>
                    <div className="relative">
                        <AlertCircle className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            name="medicineName"
                            required
                            value={formData.medicineName}
                            onChange={handleInputChange}
                            className="w-full pr-12 pl-4 py-3 bg-orange-50 border border-orange-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium text-orange-900 placeholder:text-orange-300"
                            placeholder="اكتب اسم الدواء الذي ترغب بتوفيره..."
                        />
                    </div>
                </div>

                {/* Notes */}
                <div className="group">
                    <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات (اختياري)</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                        placeholder="التركيز، الشركة، الخ..."
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-orange-500/40 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 text-lg"
                >
                    <Send className="w-6 h-6" />
                    <span>إرسال الطلب</span>
                </button>

            </form>
        </div>
    </div>
  );
};

export default MissingMedicationForm;