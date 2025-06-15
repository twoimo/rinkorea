
import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SortOption {
  value: string;
  label: string;
}

interface GridOption {
  value: number;
  label: string;
}

interface ShopControlsProps {
  sortBy: string;
  sortOptions: SortOption[];
  gridCols: number;
  pendingGridCols: number;
  gridOptions: GridOption[];
  showSortDropdown: boolean;
  gridLoading: boolean;
  isAdmin: boolean;
  onSortChange: (value: string) => void;
  onToggleSortDropdown: () => void;
  onGridColsChange: (value: number) => void;
  onGridApply: () => void;
}

const ShopControls = ({
  sortBy,
  sortOptions,
  gridCols,
  pendingGridCols,
  gridOptions,
  showSortDropdown,
  gridLoading,
  isAdmin,
  onSortChange,
  onToggleSortDropdown,
  onGridColsChange,
  onGridApply,
}: ShopControlsProps) => {
  return (
    <div className="mb-6 sm:mb-8">
      {/* 모바일용 정렬 드롭다운 */}
      <div className="block sm:hidden mb-4">
        <div className="relative">
          <button
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left flex items-center justify-between touch-manipulation"
            onClick={onToggleSortDropdown}
            aria-label="정렬 방식 선택"
          >
            <span className="font-medium">
              {sortOptions.find(opt => opt.value === sortBy)?.label}
            </span>
            <ChevronDown className={`w-5 h-5 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showSortDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              {sortOptions.map(opt => (
                <button
                  key={opt.value}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg touch-manipulation"
                  onClick={() => onSortChange(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 데스크톱용 정렬 버튼들 */}
      <div className="hidden sm:flex flex-wrap gap-2 mb-4">
        {sortOptions.map(opt => (
          <button
            key={opt.value}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation ${
              sortBy === opt.value 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
            onClick={() => onSortChange(opt.value)}
            aria-label={opt.label}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 관리자 그리드 설정 */}
      {isAdmin && (
        <div className="flex items-center gap-2 justify-end">
          <label className="text-sm font-medium text-gray-700">그리드:</label>
          <select
            className="border rounded px-2 py-1 text-sm touch-manipulation"
            value={pendingGridCols}
            onChange={e => onGridColsChange(Number(e.target.value))}
            disabled={gridLoading}
            aria-label="그리드 설정"
          >
            {gridOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold disabled:opacity-50 touch-manipulation"
            onClick={onGridApply}
            disabled={gridLoading || pendingGridCols === gridCols}
            aria-label="그리드 적용"
          >
            {gridLoading ? '적용 중...' : '적용'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ShopControls;
