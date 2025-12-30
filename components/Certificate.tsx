"use client";

import { useEffect, useState } from "react";

interface CertificateProps {
  studentName: string;
  courseName: string;
  date: string;
}

export default function Certificate({ studentName, courseName, date }: CertificateProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
      <div 
        className={`bg-white text-black p-2 max-w-4xl w-full shadow-2xl transform transition-all duration-700 ${isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
      >
        {/* CERTIFICATE BORDER */}
        <div className="border-[10px] border-double border-gray-800 p-10 h-full flex flex-col items-center justify-center text-center relative bg-[#fffdf0]">
          
          {/* CORNER DECORATIONS */}
          <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-yellow-600"></div>
          <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-yellow-600"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-yellow-600"></div>
          <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-yellow-600"></div>

          {/* CONTENT */}
          <div className="mb-8">
            <h1 className="text-5xl font-serif font-bold text-gray-900 tracking-wider mb-2 uppercase">Certificate</h1>
            <h2 className="text-2xl font-serif text-yellow-700 uppercase tracking-widest">of Achievement</h2>
          </div>

          <p className="text-lg text-gray-600 italic mb-4">This certifies that</p>

          <h3 className="text-4xl font-bold font-serif text-blue-900 border-b-2 border-gray-300 pb-2 mb-6 px-12 min-w-[300px]">
            {studentName}
          </h3>

          <p className="text-lg text-gray-600 italic mb-4">has successfully completed the curriculum for</p>

          <h4 className="text-3xl font-bold text-gray-800 mb-8">{courseName}</h4>

          <div className="flex justify-between w-full max-w-2xl mt-12 px-12">
            <div className="text-center">
              <p className="text-lg font-bold border-t border-black pt-2 px-8">{date}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
            </div>
            
            {/* GOLD SEAL */}
            <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center shadow-inner border-4 border-yellow-600">
               <span className="text-white font-bold text-xs text-center leading-tight">OFFICIAL<br/>SEAL</span>
            </div>

            <div className="text-center">
              <p className="font-serif font-italic text-2xl border-t border-black pt-2 px-8">Bubble AI</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Instructor Signature</p>
            </div>
          </div>

          {/* CLOSE / PRINT ACTIONS (Hidden when printing) */}
          <div className="absolute top-4 right-4 print:hidden flex gap-2">
            <button 
              onClick={handlePrint}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold shadow"
            >
              🖨️ Print / Save PDF
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>

        </div>
      </div>
      
      {/* CSS to hide other elements when printing */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed, .fixed * {
            visibility: visible;
          }
          .fixed {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            padding: 0;
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}