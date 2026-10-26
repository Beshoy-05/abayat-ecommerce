'use client';

import React from 'react';
import { X, Ruler, CheckCircle2 } from 'lucide-react';
import { useThemeStore } from '@/store/useThemeStore';
import { motion, AnimatePresence } from 'framer-motion';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  const { language } = useThemeStore();

  const sizeChart = [
    { size: 'XS', heightCm: '150 - 155 cm', heightFt: "4'11\" - 5'1\"", bustIn: '34" - 36"', lengthIn: '52"' },
    { size: 'S', heightCm: '155 - 160 cm', heightFt: "5'1\" - 5'3\"", bustIn: '36" - 38"', lengthIn: '54"' },
    { size: 'M', heightCm: '160 - 165 cm', heightFt: "5'3\" - 5'5\"", bustIn: '38" - 40"', lengthIn: '56"' },
    { size: 'L', heightCm: '165 - 170 cm', heightFt: "5'5\" - 5'7\"", bustIn: '40" - 42"', lengthIn: '58"' },
    { size: 'XL', heightCm: '170 - 175 cm', heightFt: "5'7\" - 5'9\"", bustIn: '42" - 44"', lengthIn: '60"' },
    { size: '2XL', heightCm: '175+ cm', heightFt: "5'9\"+", bustIn: '44" - 46"', lengthIn: '60"' },
    { size: 'Free Size', heightCm: 'يناسب الجميع', heightFt: 'Universal', bustIn: 'مريح وواسع', lengthIn: '56" - 58"' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden z-10 p-6 sm:p-8"
          >
            {/* Header */}
            <div className="flex justify-between items-start pb-5 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center text-[var(--accent-gold)]">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-light text-[var(--text-primary)]">
                    {language === 'ar' ? 'دليل مقاسات العبايات الملكية' : 'Haute Couture Abaya Sizing Chart'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {language === 'ar'
                      ? 'يعتمد المقاس الخليجي القياسي على طول الجسم الإجمالي'
                      : 'Standard GCC Abaya length corresponds to client height'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full hover:bg-[var(--bg-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">
                    <th className="py-3 px-3">{language === 'ar' ? 'المقاس' : 'Size'}</th>
                    <th className="py-3 px-3">{language === 'ar' ? 'طول السيدة (سم)' : 'Recommended Height (cm)'}</th>
                    <th className="py-3 px-3">{language === 'ar' ? 'طول السيدة (قدم)' : 'Height (ft/in)'}</th>
                    <th className="py-3 px-3">{language === 'ar' ? 'عرض الصدر' : 'Bust Width'}</th>
                    <th className="py-3 px-3">{language === 'ar' ? 'طول العباية' : 'Abaya Length'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                  {sizeChart.map((row) => (
                    <tr key={row.size} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                      <td className="py-3 px-3 font-serif font-bold text-sm text-[var(--accent-gold)]">
                        {row.size}
                      </td>
                      <td className="py-3 px-3">{row.heightCm}</td>
                      <td className="py-3 px-3">{row.heightFt}</td>
                      <td className="py-3 px-3">{row.bustIn}</td>
                      <td className="py-3 px-3 font-semibold">{row.lengthIn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Measurement Tips */}
            <div className="mt-8 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs space-y-2">
              <p className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--accent-gold)]" />
                <span>
                  {language === 'ar' ? 'كيفية اختيار مقاسكِ المثالي:' : 'Bespoke Measurement Advice:'}
                </span>
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {language === 'ar'
                  ? 'إذا كنتِ ترتدين الكعب العالي بانتظام مع العباية، يُنصح باختيار مقاس أطول بدرجة واحدة (مثال: إذا كان طولك 160 سم وتفضلين الكعب، اختاري مقاس 56 بدلاً من 54).'
                  : 'If you plan to wear high heels with your haute couture abaya, we recommend selecting one size up in length (e.g., if you are 160 cm and wear heels, select size 56 instead of 54).'}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
