import React, { useState } from 'react';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Language } from '@/contexts/LanguageContext';
import { Certificate } from '@/types/certificate';

interface CertificateCardProps {
  certificate: Certificate;
  isHidden: boolean;
  isAdmin: boolean;
  onImageClick: (certificate: Certificate) => void;
  onEdit: (certificate: Certificate) => void;
  onDelete: (certificate: Certificate) => void;
  onToggleHide: (certificate: Certificate) => void;
  isLoading?: boolean;
  size?: 'normal' | 'small';
  language: Language;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  isHidden,
  isAdmin,
  onImageClick,
  onEdit,
  onDelete,
  onToggleHide,
  isLoading = false,
  size = 'normal',
  language
}) => {
  const [_isExpanded, _setIsExpanded] = useState(false);
  const _isMobile = useIsMobile();

  const isSmall = size === 'small';
  const cardPadding = isSmall ? 'p-3 sm:p-4' : 'p-4 sm:p-6';
  const buttonSize = isSmall ? 'p-2' : 'p-3 sm:p-2';
  const iconSize = isSmall ? 'w-3 h-3 sm:w-4 sm:h-4' : 'w-4 h-4 sm:w-5 sm:h-5';
  const titleSize = isSmall ? 'text-sm sm:text-base' : 'text-base sm:text-lg';

  // 다국어 지원된 이름과 설명 가져오기
  const getLocalizedCertificateName = (cert: Certificate): string => {
    switch (language) {
      case 'en':
        return cert.name_en || cert.name;
      case 'zh':
        return cert.name_zh || cert.name;
      default:
        return cert.name_ko || cert.name;
    }
  };

  const getLocalizedCertificateDescription = (cert: Certificate): string => {
    switch (language) {
      case 'en':
        return cert.description_en || cert.description;
      case 'zh':
        return cert.description_zh || cert.description;
      default:
        return cert.description_ko || cert.description;
    }
  };

  const localizedName = getLocalizedCertificateName(certificate);
  const localizedDescription = getLocalizedCertificateDescription(certificate);

  return (
    <div className={`bg-white ${cardPadding} rounded-lg shadow-lg hover:shadow-xl transition-shadow ${isHidden && isAdmin ? 'opacity-50' : ''}`}>
      <div className="relative">
        <div
          className="cursor-pointer"
          onClick={() => onImageClick(certificate)}
        >
          <img
            src={certificate.image_url}
            alt={localizedName}
            className="w-full aspect-[1/1.4142] object-contain rounded-lg mb-3 sm:mb-4 border hover:border-blue-300 transition-colors"
            loading="lazy"
          />
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="absolute top-2 right-2 flex gap-1 sm:gap-2">
            <button
              onClick={() => onToggleHide(certificate)}
              className={`${buttonSize} rounded-full transition-colors touch-manipulation shadow ${isHidden
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              disabled={isLoading}
              title={isHidden ? '표시하기' : '숨기기'}
            >
              {isHidden ? <Eye className={iconSize} /> : <EyeOff className={iconSize} />}
            </button>
            <button
              onClick={() => onEdit(certificate)}
              className={`${buttonSize} bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors touch-manipulation shadow`}
              disabled={isLoading}
              title="편집"
            >
              <Edit className={iconSize} />
            </button>
            <button
              onClick={() => onDelete(certificate)}
              className={`${buttonSize} bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition-colors touch-manipulation shadow`}
              disabled={isLoading}
              title="삭제"
            >
              <Trash2 className={iconSize} />
            </button>
          </div>
        )}
      </div>

      <h3 className={`${titleSize} font-bold text-gray-900 mb-2 line-clamp-2 text-center`}>{localizedName}</h3>
      {!isSmall && (
        <p className="text-sm sm:text-base text-gray-600 line-clamp-2 text-center">{localizedDescription}</p>
      )}
    </div>
  );
};

export default CertificateCard;
