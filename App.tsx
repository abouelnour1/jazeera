
import React, { useState, useEffect } from 'react';
import { Logo } from './components/Logo';
import PrescriptionForm from './components/PrescriptionForm';
import DietaryAdvisor from './components/DietaryAdvisor';
import MissingMedicationForm from './components/MissingMedicationForm';
import AdminDashboard from './components/AdminDashboard';
import { medicalData as initialMedicalData } from './medicalData';
import { Phone, Mail, Clock, Home, Pill, Utensils, AlertCircle, Shield, Menu, X, Banknote, ExternalLink, ChevronLeft, Stethoscope, HeartPulse } from 'lucide-react';
import { PrescriptionRequest, MissingMedicationRequest, MedicalDataMap, DietAdvice } from './types';
import { supabase } from './services/supabase';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'form' | 'advice' | 'missing' | 'admin' | 'price'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  // App Data State
  const [prescriptionRequests, setPrescriptionRequests] = useState<PrescriptionRequest[]>([]);
  const [missingRequests, setMissingRequests] = useState<MissingMedicationRequest[]>([]);
  const [medicalDataState, setMedicalDataState] = useState<MedicalDataMap>(initialMedicalData);

  // --- HYBRID DATA FETCHING LOGIC ---
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setConnectionStatus('checking');
    try {
        // Try a simple fetch to test connection
        const { error } = await supabase.from('medical_advice').select('key_id').limit(1);
        
        if (error) throw error;

        // If successful, we are ONLINE
        setConnectionStatus('online');
        await fetchSupabaseData();

        // Subscribe to changes
        const subscription = supabase
            .channel('public:all')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'prescription_requests' }, () => fetchSupabaseData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'missing_requests' }, () => fetchSupabaseData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'medical_advice' }, () => fetchSupabaseData())
            .subscribe();

        return () => { supabase.removeChannel(subscription); };

    } catch (err) {
        console.warn('Supabase connection failed (likely invalid key), switching to Offline Mode.', err);
        setConnectionStatus('offline');
        loadLocalData();
    }
  };

  // 1. Supabase Fetcher
  const fetchSupabaseData = async () => {
      // Prescriptions
      const { data: presData } = await supabase.from('prescription_requests').select('*').order('submission_date', { ascending: false });
      if (presData) {
         setPrescriptionRequests(presData.map((p: any) => ({
             id: p.id,
             fullName: p.full_name,
             phoneNumber: p.phone_number,
             refillDate: p.refill_date,
             notes: p.notes,
             medications: p.medications,
             submissionDate: p.submission_date,
             status: p.status
         })));
      }

      // Missing Requests
      const { data: missData } = await supabase.from('missing_requests').select('*').order('submission_date', { ascending: false });
      if (missData) {
          setMissingRequests(missData.map((m: any) => ({
              id: m.id,
              fullName: m.full_name,
              phoneNumber: m.phone_number,
              medicineName: m.medicine_name,
              notes: m.notes,
              submissionDate: m.submission_date,
              status: m.status
          })));
      }

      // Medical Advice
      const { data: adviceData } = await supabase.from('medical_advice').select('*');
      if (adviceData && adviceData.length > 0) {
          const newMap: MedicalDataMap = {};
          adviceData.forEach((item: any) => { newMap[item.key_id] = item.data; });
          setMedicalDataState(prev => ({ ...prev, ...newMap }));
      } else {
          // Upload initial data if empty
          for (const [key, value] of Object.entries(initialMedicalData)) {
            await supabase.from('medical_advice').insert({ key_id: key, data: value });
          }
      }
  };

  // 2. LocalStorage Fetcher (Fallback)
  const loadLocalData = () => {
    const savedPrescriptions = localStorage.getItem('prescriptionRequests');
    if (savedPrescriptions) setPrescriptionRequests(JSON.parse(savedPrescriptions));

    const savedMissing = localStorage.getItem('missingRequests');
    if (savedMissing) setMissingRequests(JSON.parse(savedMissing));

    const savedAdvice = localStorage.getItem('medicalData');
    if (savedAdvice) setMedicalDataState(JSON.parse(savedAdvice));
  };

  // Helper for LocalStorage Saving
  const saveLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };
  
  // Helper: Convert File to Base64 for offline storage
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // --- HANDLERS ---

  const handlePrescriptionSubmit = async (data: PrescriptionRequest) => {
    // Process images
    const processedMedications = await Promise.all(data.medications.map(async (med) => {
        if (med.image && med.image instanceof File) {
            if (connectionStatus === 'online') {
                // Upload to Supabase Storage
                const fileName = `${Date.now()}_${med.id}`;
                const { error: uploadError } = await supabase.storage.from('medication-images').upload(fileName, med.image);
                if (!uploadError) {
                    const { data: urlData } = supabase.storage.from('medication-images').getPublicUrl(fileName);
                    return { ...med, image: urlData.publicUrl };
                }
            } else {
                // Convert to Base64 for Local
                const base64 = await fileToBase64(med.image);
                return { ...med, image: base64 };
            }
        }
        return med;
    }));

    const finalData = { ...data, medications: processedMedications };

    if (connectionStatus === 'online') {
        await supabase.from('prescription_requests').insert({
            id: finalData.id,
            full_name: finalData.fullName,
            phone_number: finalData.phoneNumber,
            refill_date: finalData.refillDate,
            notes: finalData.notes,
            medications: finalData.medications,
            submission_date: finalData.submissionDate,
            status: 'pending'
        });
        fetchSupabaseData(); // Refresh
    } else {
        const updated = [finalData, ...prescriptionRequests];
        setPrescriptionRequests(updated);
        saveLocal('prescriptionRequests', updated);
    }
  };

  const handleMissingSubmit = async (data: MissingMedicationRequest) => {
    if (connectionStatus === 'online') {
        await supabase.from('missing_requests').insert({
            id: data.id,
            full_name: data.fullName,
            phone_number: data.phoneNumber,
            medicine_name: data.medicineName,
            notes: data.notes,
            submission_date: data.submissionDate,
            status: 'pending'
        });
        fetchSupabaseData();
    } else {
        const updated = [data, ...missingRequests];
        setMissingRequests(updated);
        saveLocal('missingRequests', updated);
    }
  };

  const handleUpdateStatus = async (type: 'prescription' | 'missing', id: string, status: 'completed' | 'cancelled') => {
    if (connectionStatus === 'online') {
        const table = type === 'prescription' ? 'prescription_requests' : 'missing_requests';
        await supabase.from(table).update({ status }).eq('id', id);
        fetchSupabaseData();
    } else {
        if (type === 'prescription') {
            const updated = prescriptionRequests.map(r => r.id === id ? { ...r, status } : r);
            setPrescriptionRequests(updated);
            saveLocal('prescriptionRequests', updated);
        } else {
            const updated = missingRequests.map(r => r.id === id ? { ...r, status } : r);
            setMissingRequests(updated);
            saveLocal('missingRequests', updated);
        }
    }
  };

  const handleDelete = async (type: 'prescription' | 'missing', id: string) => {
    if (confirm('هل أنت متأكد من الحذف؟')) {
        if (connectionStatus === 'online') {
            const table = type === 'prescription' ? 'prescription_requests' : 'missing_requests';
            await supabase.from(table).delete().eq('id', id);
            fetchSupabaseData();
        } else {
            if (type === 'prescription') {
                const updated = prescriptionRequests.filter(r => r.id !== id);
                setPrescriptionRequests(updated);
                saveLocal('prescriptionRequests', updated);
            } else {
                const updated = missingRequests.filter(r => r.id !== id);
                setMissingRequests(updated);
                saveLocal('missingRequests', updated);
            }
        }
    }
  };

  const handleUpdateMedicalData = async (key: string, newData: DietAdvice) => {
    if (connectionStatus === 'online') {
        await supabase.from('medical_advice').update({ data: newData }).eq('key_id', key);
        fetchSupabaseData();
    } else {
        const updated = { ...medicalDataState, [key]: newData };
        setMedicalDataState(updated);
        saveLocal('medicalData', updated);
    }
  };

  const handleAddMedicalData = async (key: string, newData: DietAdvice) => {
     if (connectionStatus === 'online') {
        await supabase.from('medical_advice').insert({ key_id: key, data: newData });
        fetchSupabaseData();
     } else {
        const updated = { ...medicalDataState, [key]: newData };
        setMedicalDataState(updated);
        saveLocal('medicalData', updated);
     }
  };

  const handleNavClick = (view: typeof currentView) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md bg-white/80 border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
                <div 
                    className="flex items-center gap-3 cursor-pointer group" 
                    onClick={() => handleNavClick('home')}
                >
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition-transform group-hover:scale-105">
                        GM
                    </div>
                    <div>
                        <h1 className="text-lg md:text-xl font-bold text-slate-800 leading-tight">صيدلية مجمع الجزيرة</h1>
                        <p className="text-[10px] text-slate-500 hidden sm:block font-medium tracking-wide">Al Jazeera Medical Complex Pharmacy</p>
                    </div>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-2xl border border-white/50 backdrop-blur-sm">
                    {[
                        { id: 'home', icon: Home, label: 'الرئيسية' },
                        { id: 'form', icon: Pill, label: 'صرف العلاج' },
                        { id: 'missing', icon: AlertCircle, label: 'توفير دواء' },
                        { id: 'price', icon: Banknote, label: 'الأسعار' },
                        { id: 'advice', icon: Utensils, label: 'نصائح طبية' },
                    ].map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => handleNavClick(item.id as any)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                                currentView === item.id 
                                ? 'bg-white text-brand-600 shadow-sm ring-1 ring-black/5' 
                                : 'text-slate-500 hover:text-brand-600 hover:bg-white/50'
                            }`}
                        >
                            <item.icon className={`w-4 h-4 ${currentView === item.id ? 'fill-current opacity-20' : ''}`} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Mobile Menu Button */}
                <button 
                    className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Nav Dropdown */}
            {isMobileMenuOpen && (
                <nav className="md:hidden pt-4 pb-2 mt-2 flex flex-col gap-2 animate-fade-in-up bg-white rounded-2xl p-4 shadow-xl border border-slate-100 absolute left-4 right-4 top-16">
                    {[
                        { id: 'home', icon: Home, label: 'الرئيسية', color: 'text-brand-600', bg: 'bg-brand-50' },
                        { id: 'form', icon: Pill, label: 'طلب صرف العلاج', color: 'text-rose-600', bg: 'bg-rose-50' },
                        { id: 'missing', icon: AlertCircle, label: 'طلب توفير دواء', color: 'text-orange-600', bg: 'bg-orange-50' },
                        { id: 'price', icon: Banknote, label: 'أسعار الأدوية', color: 'text-purple-600', bg: 'bg-purple-50' },
                        { id: 'advice', icon: Utensils, label: 'الدليل الغذائي', color: 'text-blue-600', bg: 'bg-blue-50' },
                    ].map((item) => (
                         <button 
                            key={item.id}
                            onClick={() => handleNavClick(item.id as any)}
                            className={`px-4 py-3 rounded-xl flex items-center gap-3 font-bold transition-all ${
                                currentView === item.id 
                                ? `${item.bg} ${item.color} ring-1 ring-inset` 
                                : 'bg-transparent text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>
            )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-20">
        
        {/* View: Home */}
        {currentView === 'home' && (
            <section className="animate-fade-in-up container mx-auto px-4 py-8 md:py-16">
                
                {/* Hero Section */}
                <div className="flex flex-col items-center text-center mb-16 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-200/30 rounded-full blur-3xl -z-10"></div>
                    <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-blue-200/20 rounded-full blur-3xl -z-10"></div>

                    <div className="mb-8 relative hover:scale-105 transition-transform duration-500 cursor-default">
                        <Logo className="" />
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
                        رعايتك الصحية، <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-teal-500">أسهل وأقرب</span> إليك
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                        منصة طبية ذكية متكاملة لخدمتكم على مدار الساعة. اطلب أدويتك، استشر دليلك الغذائي، واعرف الأسعار بضغطة زر.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <button 
                            onClick={() => handleNavClick('form')}
                            className="bg-brand-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-700 hover:shadow-brand-500/50 transition-all flex items-center gap-2"
                        >
                            <Pill className="w-5 h-5" />
                            ابدأ طلب دواء
                        </button>
                        <button 
                            onClick={() => handleNavClick('advice')}
                            className="bg-white text-slate-700 border border-slate-200 px-8 py-3 rounded-full font-bold shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2"
                        >
                            <Stethoscope className="w-5 h-5 text-brand-600" />
                            نصائح طبية
                        </button>
                    </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {/* Card 1 */}
                    <div 
                        onClick={() => handleNavClick('form')}
                        className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/30 mb-4 group-hover:-translate-y-1 transition-transform">
                                <Pill className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">صرف العلاج</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">طلب إعادة صرف الأدوية المزمنة وتجهيزها للاستلام.</p>
                            <div className="mt-4 flex items-center text-rose-600 text-sm font-bold gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                                طلب الآن <ChevronLeft className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div 
                        onClick={() => handleNavClick('missing')}
                        className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30 mb-4 group-hover:-translate-y-1 transition-transform">
                                <AlertCircle className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">توفير دواء</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">طلب توفير دواء غير موجود حالياً، وسنقوم بتأمينه لك.</p>
                            <div className="mt-4 flex items-center text-orange-600 text-sm font-bold gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                                إبلاغ الآن <ChevronLeft className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                     {/* Card 3 */}
                     <div 
                        onClick={() => handleNavClick('price')}
                        className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30 mb-4 group-hover:-translate-y-1 transition-transform">
                                <Banknote className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">أسعار الأدوية</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">خدمة ذكية للاستعلام عن أسعار الأدوية في السوق.</p>
                            <div className="mt-4 flex items-center text-purple-600 text-sm font-bold gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                                بحث الآن <ChevronLeft className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    {/* Card 4 */}
                    <div 
                        onClick={() => handleNavClick('advice')}
                        className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-4 group-hover:-translate-y-1 transition-transform">
                                <HeartPulse className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">الدليل الغذائي</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">نصائح غذائية مخصصة للأمراض المزمنة مدعومة بالذكاء.</p>
                            <div className="mt-4 flex items-center text-blue-600 text-sm font-bold gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                                تصفح الدليل <ChevronLeft className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )}

        {/* View: Form */}
        {currentView === 'form' && (
            <section className="container mx-auto px-4 py-6 animate-fade-in-up">
                <PrescriptionForm onSubmit={handlePrescriptionSubmit} />
            </section>
        )}

        {/* View: Missing Meds */}
        {currentView === 'missing' && (
            <section className="container mx-auto px-4 py-6 animate-fade-in-up">
                <MissingMedicationForm onSubmit={handleMissingSubmit} />
            </section>
        )}

        {/* View: Price Check */}
        {currentView === 'price' && (
            <section className="w-full h-[calc(100vh-80px)] animate-fade-in-up flex flex-col bg-white">
                 <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex items-center justify-between shadow-md z-10">
                    <div className="flex items-center gap-2">
                        <Banknote className="w-5 h-5" />
                        <h2 className="font-bold text-lg">استعلام عن أسعار الأدوية</h2>
                    </div>
                    <a 
                        href="https://med-ai-taupe.vercel.app/" 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-full transition-colors border border-white/20"
                    >
                        <span>فتح في نافذة جديدة</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                 </div>
                 <iframe 
                    src="https://med-ai-taupe.vercel.app/" 
                    title="Medicine Price Check"
                    className="flex-1 w-full border-0 bg-slate-50"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 />
            </section>
        )}

        {/* View: Advice */}
        {currentView === 'advice' && (
            <section className="container mx-auto px-4 py-4 md:py-8 h-auto md:h-[calc(100vh-100px)] animate-fade-in-up">
                <DietaryAdvisor data={medicalDataState} />
            </section>
        )}

        {/* View: Admin */}
        {currentView === 'admin' && (
            <section className="animate-fade-in-up">
                <AdminDashboard 
                    prescriptionRequests={prescriptionRequests}
                    missingRequests={missingRequests}
                    medicalData={medicalDataState}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={handleDelete}
                    onUpdateMedicalData={handleUpdateMedicalData}
                    onAddMedicalData={handleAddMedicalData}
                    isAuthenticated={isAdminLoggedIn}
                    onLogin={() => setIsAdminLoggedIn(true)}
                    onLogout={() => setIsAdminLoggedIn(false)}
                    connectionStatus={connectionStatus}
                />
            </section>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8 border-t border-slate-800 relative overflow-hidden mt-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-brand-900/50">
                    GM
                </div>
                <h3 className="text-white text-xl font-bold tracking-tight">صيدلية مجمع الجزيرة</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-6">
                نلتزم بتقديم رعاية صيدلانية متقدمة، مع توفير كافة الأدوية والاستشارات الطبية والغذائية لضمان صحتكم وسلامتكم على مدار الساعة.
              </p>
            </div>
            
            <div>
              <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-b border-slate-800 pb-2 inline-block">ساعات العمل</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-brand-500">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-white font-bold">مفتوح 24 ساعة</span>
                    <span className="text-xs text-slate-500">نحن دائماً في خدمتك</span>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-b border-slate-800 pb-2 inline-block">تواصل معنا</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400">
                    <a href="tel:2317222" className="hover:text-brand-400 transition-colors">2317222</a>
                    <a href="tel:2789090" className="hover:text-brand-400 transition-colors">2789090</a>
                    <a href="tel:2250109" className="hover:text-brand-400 transition-colors">2250109</a>
                    <a href="tel:2250108" className="hover:text-brand-400 transition-colors">2250108</a>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-500" />
                  <a href="mailto:jazzeramedicalcomplex@gmail.com" className="hover:text-brand-400 transition-colors text-xs">
                    jazzeramedicalcomplex@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800/50 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
            <p>&copy; {new Date().getFullYear()} صيدلية مجمع الجزيرة الطبي. جميع الحقوق محفوظة.</p>
            <button 
                onClick={() => setCurrentView('admin')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-300 transition-colors px-4 py-2 rounded-lg hover:bg-slate-800/50"
            >
                <Shield className="w-3 h-3" />
                <span>بوابة الموظفين</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
