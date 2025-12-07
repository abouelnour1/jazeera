import React, { useState } from 'react';
import { MedicalDataMap } from '../types';
import { CheckCircle2, XCircle, Utensils, AlertTriangle, ChevronLeft, Stethoscope, Printer, ArrowRight, BookOpen } from 'lucide-react';
import { Logo } from './Logo';

interface DietaryAdvisorProps {
  data: MedicalDataMap;
}

const DietaryAdvisor: React.FC<DietaryAdvisorProps> = ({ data }) => {
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);

  const advice = selectedCondition ? data[selectedCondition] : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-white/50 h-full flex flex-col max-w-7xl mx-auto overflow-hidden print:overflow-visible print:bg-white print:shadow-none print:border-none print:h-auto">
      {/* Header - No Print */}
      <div className="bg-gradient-to-r from-brand-600 to-teal-500 p-5 md:p-6 text-white no-print flex items-center justify-between">
        <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 opacity-80" />
            <span>الدليل الغذائي الطبي</span>
            </h2>
            <p className="text-brand-100 text-xs md:text-sm mt-1 font-medium opacity-90">نصائح غذائية معتمدة لتحسين صحتك</p>
        </div>
        <div className="bg-white/10 p-2 rounded-lg">
            <Utensils className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row h-full min-h-[600px] md:overflow-hidden print:overflow-visible print:h-auto print:block">
        
        {/* Sidebar / Menu */}
        <div className={`w-full md:w-80 bg-slate-50 border-l border-slate-100 p-4 overflow-y-auto no-print ${selectedCondition ? 'hidden md:block' : 'block'}`}>
          <h3 className="text-slate-400 text-xs font-bold uppercase mb-4 px-2 tracking-wider">
            اختر الحالة الصحية
          </h3>
          <div className="space-y-2">
            {Object.keys(data).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedCondition(key)}
                className={`w-full text-right px-4 py-4 md:py-3.5 rounded-xl flex items-center justify-between transition-all group ${
                  selectedCondition === key 
                    ? 'bg-white text-brand-600 shadow-md ring-1 ring-brand-100' 
                    : 'text-slate-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                <span className="font-bold text-sm">{data[key].condition}</span>
                <ChevronLeft className={`w-4 h-4 transition-transform opacity-50 group-hover:opacity-100 ${selectedCondition === key ? '-translate-x-1 text-brand-500' : 'text-slate-400'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className={`w-full md:flex-1 p-4 md:p-8 md:overflow-y-auto bg-white/50 print:bg-white print:p-0 print:overflow-visible ${!selectedCondition ? 'hidden md:block' : 'block print:block'}`}>
            {!advice ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 mt-10 md:mt-0 no-print">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <Stethoscope className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-600 mb-2">لم يتم اختيار حالة</h3>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto">اختر مرضاً من القائمة الجانبية لعرض النصائح الغذائية الخاصة به</p>
                </div>
            ) : (
                <div className="animate-fade-in-up space-y-6 max-w-4xl mx-auto pb-32 print:pb-0 print:space-y-2 print-content-wrapper">
                    
                    {/* --- PRINT HEADER (Visible only in print) --- */}
                    <div className="print-only hidden w-full mb-4 border-b-2 border-gray-800 pb-2">
                        <div className="flex items-center justify-between flex-row">
                            {/* Text Info (Right in RTL) */}
                            <div className="text-right flex-1">
                                <h1 className="text-2xl font-black text-gray-900 leading-none mb-1">صيدلية مجمع الجزيرة الطبي</h1>
                                <p className="text-sm font-bold text-gray-600 mb-2">Al Jazeera Medical Complex Pharmacy</p>
                                
                                <div className="text-xs font-medium text-gray-500 space-y-0.5">
                                    <p>الرياض - النسيم الغربي - شارع حسان بن ثابت</p>
                                    <p>هاتف: 2317222 - 2789090 | خدمة 24 ساعة</p>
                                </div>
                            </div>

                            {/* Logo (Left in RTL) */}
                            <div className="shrink-0 scale-75 origin-top-left -ml-4">
                                <Logo showText={false} />
                            </div>
                        </div>
                    </div>
                    {/* --- END PRINT HEADER --- */}

                    {/* Toolbar (Back & Print) - No Print */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-5 no-print">
                         <button 
                            onClick={() => setSelectedCondition(null)}
                            className="md:hidden flex items-center gap-2 text-slate-600 hover:text-brand-600 font-bold bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-xl text-sm"
                         >
                            <ArrowRight className="w-4 h-4" />
                            <span>رجوع</span>
                         </button>
                         
                         <div className="hidden md:block">
                            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-wider">Medical Advice</span>
                         </div>

                         <button 
                            onClick={handlePrint}
                            className="flex items-center gap-2 text-slate-600 bg-white border border-slate-200 hover:border-brand-300 hover:text-brand-600 px-4 py-2 rounded-xl font-bold transition-all shadow-sm text-sm"
                         >
                            <Printer className="w-4 h-4" />
                            <span>طباعة التقرير</span>
                         </button>
                    </div>

                    {/* Content Header */}
                    <div className="mb-8 print:mb-2 text-center print:text-right">
                        <div className="flex items-center justify-between print:border-b print:border-gray-200 print:pb-2">
                            <h3 className="text-3xl print:text-xl font-extrabold text-slate-800 mb-2 print:mb-0 print:text-black decoration-brand-500 underline decoration-4 underline-offset-8 print:no-underline">
                                {advice.condition}
                            </h3>
                            <p className="print-only text-[10px] text-gray-400">تاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
                        </div>
                        <div className="h-1.5 w-20 bg-gradient-to-r from-brand-500 to-teal-400 rounded-full no-print mx-auto md:mx-0"></div>
                    </div>

                    <div className="space-y-8 print:space-y-2">
                        {/* Print Layout: Grid for Allowed/Forbidden */}
                        <div className="grid md:grid-cols-2 print:grid-cols-2 gap-6 print:gap-4">
                            
                            {/* Allowed */}
                            <div className="bg-white p-6 md:p-8 rounded-3xl border border-green-100 shadow-[0_4px_20px_rgba(34,197,94,0.05)] relative overflow-hidden print:shadow-none print:border print:border-gray-300 print:rounded-lg print:p-3 print:bg-transparent">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -mr-8 -mt-8 -z-10 no-print"></div>
                                
                                <h4 className="font-bold text-green-700 flex items-center gap-3 mb-6 text-xl print:text-sm print:text-black print:mb-2 print:border-b print:border-gray-200 print:pb-1">
                                    <div className="p-2 bg-green-100 rounded-lg no-print">
                                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                                    </div>
                                    <span className="print-only text-green-600 font-bold ml-1">✓</span>
                                    <div>
                                        <span className="block">المسموح به</span>
                                        <span className="text-xs font-normal opacity-70 text-green-600 print:hidden">الأطعمة الموصى بها</span>
                                    </div>
                                </h4>
                                <ul className="space-y-3 print:space-y-1">
                                    {advice.allowedFoods.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm print:text-xs font-medium text-slate-700 print:text-black">
                                            <div className="w-2 h-2 bg-green-500 rounded-full shrink-0 mt-1.5 print:bg-black print:w-1 print:h-1 print:mt-1.5"></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Forbidden */}
                            <div className="bg-white p-6 md:p-8 rounded-3xl border border-red-100 shadow-[0_4px_20px_rgba(239,68,68,0.05)] relative overflow-hidden print:shadow-none print:border print:border-gray-300 print:rounded-lg print:p-3 print:bg-transparent">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-8 -mt-8 -z-10 no-print"></div>

                                <h4 className="font-bold text-red-700 flex items-center gap-3 mb-6 text-xl print:text-sm print:text-black print:mb-2 print:border-b print:border-gray-200 print:pb-1">
                                    <div className="p-2 bg-red-100 rounded-lg no-print">
                                        <XCircle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <span className="print-only text-red-600 font-bold ml-1">X</span>
                                    <div>
                                        <span className="block">الممنوع</span>
                                        <span className="text-xs font-normal opacity-70 text-red-600 print:hidden">الأطعمة التي يجب تجنبها</span>
                                    </div>
                                </h4>
                                <ul className="space-y-3 print:space-y-1">
                                    {advice.forbiddenFoods.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm print:text-xs font-medium text-slate-700 print:text-black">
                                            <div className="w-2 h-2 bg-red-500 rounded-full shrink-0 mt-1.5 print:bg-black print:w-1 print:h-1 print:mt-1.5"></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-blue-50/50 p-6 md:p-8 rounded-3xl border border-blue-100 print:bg-transparent print:border print:border-gray-300 print:rounded-lg print:p-3 print:mt-2">
                            <h4 className="font-bold text-blue-800 mb-6 flex items-center gap-3 text-lg print:text-sm print:text-black print:mb-2 print:border-b print:border-gray-200 print:pb-1">
                                <div className="p-2 bg-blue-100 rounded-lg no-print">
                                    <Utensils className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="print-only font-bold ml-1">•</span>
                                <span>نصائح عامة</span>
                            </h4>
                            <ul className="grid print:grid-cols-2 gap-3 print:gap-x-4 print:gap-y-1">
                                 {advice.tips.map((tip, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm print:text-xs text-slate-700 bg-white p-4 rounded-xl shadow-sm border border-blue-100/50 print:bg-transparent print:shadow-none print:border-0 print:p-0 print:text-black">
                                        <span className="font-bold text-blue-500 text-lg leading-none mt-0.5 print:text-black print:text-xs">•</span>
                                        {tip}
                                    </li>
                                 ))}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-xs flex items-start gap-3 mt-8 border border-amber-100 leading-relaxed print:bg-transparent print:border-t print:border-b-0 print:border-l-0 print:border-r-0 print:border-gray-300 print:text-black print:text-[10px] print:mt-4 print:pt-2 print:rounded-none">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 print:hidden" />
                        <p className="font-medium text-center w-full">تنبيه: {advice.disclaimer}</p>
                    </div>
                    
                    <div className="hidden print:block mt-2 text-center">
                        <p className="text-[10px] text-gray-500">مع تمنياتنا لكم بالشفاء العاجل - صيدلية مجمع الجزيرة الطبي</p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DietaryAdvisor;