
import React from 'react';

interface CertificateTypeCardProps {
  name: string;
  type: string;
  icon: React.ReactNode;
  description: string;
}

const CertificateTypeCard: React.FC<CertificateTypeCardProps> = ({
  name,
  type,
  icon,
  description
}) => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center mb-4 sm:mb-6">
        <div className="bg-gray-50 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{name}</h3>
          <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">{type}</span>
        </div>
      </div>
      <p className="text-sm sm:text-base text-gray-600">{description}</p>
    </div>
  );
};

export default CertificateTypeCard;
