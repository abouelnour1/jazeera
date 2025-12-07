
import React from 'react';
import { Syringe, Moon } from 'lucide-react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Logo Graphic Simulation */}
      <div className="relative w-24 h-24 mb-2">
        {/* Red Crescent */}
        <div className="absolute inset-0 flex items-center justify-center">
            <Moon className="w-24 h-24 text-red-600 fill-current" strokeWidth={0} style={{ transform: 'rotate(-45deg)' }} />
        </div>
        {/* Map/Syringe Composite */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
           {/* Abstract Saudi Map simulation using a path or icon, using a shield for simplicity in this demo context */}
           <div className="text-green-600 font-bold opacity-20 absolute w-full h-full bg-green-100 rounded-full mix-blend-multiply filter blur-md"></div>
           <Syringe className="w-14 h-14 text-black transform -rotate-45 drop-shadow-md" />
        </div>
      </div>
      
      {/* Text */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-red-600 leading-none mb-1">صيدلية</h1>
        <h2 className="text-lg font-bold text-green-700 tracking-wide">مجمع الجزيرة الطبي</h2>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Al Jazeera Medical Complex Pharmacy</p>
      </div>
    </div>
  );
};
