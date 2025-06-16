import React, { useState, useEffect } from 'react';
import { Edit, Trash2, X, Save, Calendar, Package, DollarSign } from 'lucide-react';
import { RevenueData, RevenueCategory } from '@/types/revenue';

interface DataTableProps {
    data: RevenueData[];
    categories: RevenueCategory[];
    loading: boolean;
    onEdit: (id: string, data: Partial<RevenueData>) => Promise<{ success?: boolean; error?: unknown }>;
    onDelete: (id: string) => Promise<{ success?: boolean; error?: unknown }>;
    onBulkDelete: (ids: string[]) => Promise<{ success?: boolean; error?: unknown }>;
    onRefresh: () => void;
}

const DataTable: React.FC<DataTableProps> = ({
    data,
    categories,
    loading,
    onEdit,
    onDelete,
    onBulkDelete,
    onRefresh
}) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingData, setEditingData] = useState<Partial<RevenueData>>({});
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [resetConfirmText, setResetConfirmText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [filterCategory, setFilterCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // 필터링된 데이터
    const filteredData = data.filter(item => {
        const matchesCategory = !filterCategory || item.category === filterCategory;
        const matchesSearch = !searchTerm ||
            item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.notes?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // 페이지네이션
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ko-KR');
    };

    const handleEdit = (item: RevenueData) => {
        setEditingId(item.id);
        setEditingData({ ...item });
    };

    const handleSave = async () => {
        if (!editingId) return;

        // 단가와 수량이 변경되면 매출 자동 계산
        if (editingData.unit_price && editingData.quantity) {
            editingData.revenue = editingData.unit_price * editingData.quantity;
        }

        const result = await onEdit(editingId, editingData);
        if (result.success) {
            setEditingId(null);
            setEditingData({});
            onRefresh();
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditingData({});
    };

    const handleDelete = async (id: string) => {
        const result = await onDelete(id);
        if (result.success) {
            setDeleteConfirmId(null);
            onRefresh();
        }
    };

    const updateEditingData = (field: keyof RevenueData, value: string | number) => {
        setEditingData(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg border p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-4 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">매출 데이터 관리</h3>

                {/* 필터 및 검색 */}
                <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-600" />
                        <select
                            value={filterCategory}
                            onChange={(e) => {
                                setFilterCategory(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="border rounded px-3 py-2 text-sm"
                        >
                            <option value="">전체 카테고리</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="제품명, 지역, 비고 검색..."
                            className="border rounded px-3 py-2 text-sm w-64"
                        />
                    </div>

                    <div className="text-sm text-gray-600 flex items-center">
                        총 {filteredData.length}개 항목
                    </div>

                    <button
                        onClick={() => setShowResetDialog(true)}
                        disabled={data.length === 0}
                        className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        모든 데이터 초기화
                    </button>
                </div>
            </div>

            {/* 데이터 테이블 */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">날짜</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">카테고리</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">제품명</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">수량</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">단가</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">매출</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">지역</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">고객유형</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">비고</th>
                            <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                {editingId === item.id ? (
                                    // 편집 모드
                                    <>
                                        <td className="border border-gray-300 p-1">
                                            <input
                                                type="date"
                                                value={editingData.date || ''}
                                                onChange={(e) => updateEditingData('date', e.target.value)}
                                                className="w-full px-2 py-1 text-sm border rounded"
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            <select
                                                value={editingData.category || ''}
                                                onChange={(e) => updateEditingData('category', e.target.value)}
                                                className="w-full px-2 py-1 text-sm border rounded"
                                            >
                                                <option value="">선택</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            <input
                                                type="text"
                                                value={editingData.product_name || ''}
                                                onChange={(e) => updateEditingData('product_name', e.target.value)}
                                                className="w-full px-2 py-1 text-sm border rounded"
                                                placeholder="제품명"
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            <input
                                                type="number"
                                                value={editingData.quantity || ''}
                                                onChange={(e) => updateEditingData('quantity', parseInt(e.target.value) || 0)}
                                                className="w-full px-2 py-1 text-sm border rounded"
                                                min="0"
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            <input
                                                type="number"
                                                value={editingData.unit_price || ''}
                                                onChange={(e) => updateEditingData('unit_price', parseFloat(e.target.value) || 0)}
                                                className="w-full px-2 py-1 text-sm border rounded"
                                                min="0"
                                                step="0.01"
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            <input
                                                type="number"
                                                value={editingData.revenue || ''}
                                                onChange={(e) => updateEditingData('revenue', parseFloat(e.target.value) || 0)}
                                                className="w-full px-2 py-1 text-sm border rounded bg-gray-50"
                                                min="0"
                                                step="0.01"
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            <input
                                                type="text"
                                                value={editingData.region || ''}
                                                onChange={(e) => updateEditingData('region', e.target.value)}
                                                className="w-full px-2 py-1 text-sm border rounded"
                                                placeholder="지역"
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            <select
                                                value={editingData.customer_type || ''}
                                                onChange={(e) => updateEditingData('customer_type', e.target.value)}
                                                className="w-full px-2 py-1 text-sm border rounded"
                                            >
                                                <option value="">선택</option>
                                                <option value="일반">일반</option>
                                                <option value="기업">기업</option>
                                                <option value="대리점">대리점</option>
                                                <option value="직판">직판</option>
                                            </select>
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            <input
                                                type="text"
                                                value={editingData.notes || ''}
                                                onChange={(e) => updateEditingData('notes', e.target.value)}
                                                className="w-full px-2 py-1 text-sm border rounded"
                                                placeholder="비고"
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-1 text-center">
                                            <div className="flex justify-center gap-1">
                                                <button
                                                    onClick={handleSave}
                                                    className="p-1 text-green-600 hover:text-green-700"
                                                    title="저장"
                                                >
                                                    <Save className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    className="p-1 text-gray-600 hover:text-gray-700"
                                                    title="취소"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    // 일반 모드
                                    <>
                                        <td className="border border-gray-300 px-3 py-2 text-sm">
                                            {formatDate(item.date)}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-2 text-sm">
                                            <span
                                                className="inline-block w-3 h-3 rounded-full mr-2"
                                                style={{ backgroundColor: categories.find(c => c.name === item.category)?.color }}
                                            />
                                            {item.category}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-2 text-sm">
                                            {item.product_name || '-'}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-2 text-sm text-right">
                                            {item.quantity?.toLocaleString() || '-'}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-2 text-sm text-right">
                                            {item.unit_price ? formatCurrency(item.unit_price) : '-'}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-2 text-sm text-right font-medium">
                                            {formatCurrency(item.revenue)}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-2 text-sm">
                                            {item.region || '-'}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-2 text-sm">
                                            {item.customer_type || '-'}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-2 text-sm">
                                            {item.notes || '-'}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-2 text-center">
                                            <div className="flex justify-center gap-1">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-1 text-blue-600 hover:text-blue-700"
                                                    title="편집"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmId(item.id)}
                                                    className="p-1 text-red-600 hover:text-red-700"
                                                    title="삭제"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-600">
                        {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)}개 / 총 {filteredData.length}개
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                            이전
                        </button>

                        <div className="flex items-center gap-1">
                            {/* 첫 페이지 */}
                            {currentPage > 3 && (
                                <>
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        className="px-3 py-2 border rounded text-sm hover:bg-gray-50 transition-colors"
                                    >
                                        1
                                    </button>
                                    {currentPage > 4 && <span className="px-2 text-gray-500">...</span>}
                                </>
                            )}

                            {/* 현재 페이지 주변 */}
                            {[...Array(totalPages)].map((_, i) => {
                                const pageNum = i + 1;
                                if (pageNum < currentPage - 2 || pageNum > currentPage + 2) return null;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-2 border rounded text-sm transition-colors ${currentPage === pageNum
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            {/* 마지막 페이지 */}
                            {currentPage < totalPages - 2 && (
                                <>
                                    {currentPage < totalPages - 3 && <span className="px-2 text-gray-500">...</span>}
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        className="px-3 py-2 border rounded text-sm hover:bg-gray-50 transition-colors"
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                            다음
                        </button>
                    </div>
                </div>
            )}

            {/* 삭제 확인 모달 */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">데이터 삭제</h3>
                        <p className="text-gray-600 mb-6">
                            이 매출 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                취소
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirmId)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 데이터 초기화 확인 모달 */}
            {showResetDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">모든 데이터 초기화</h3>
                                <p className="text-sm text-gray-600">위험한 작업입니다</p>
                            </div>
                        </div>

                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">
                                        <strong>주의:</strong> 이 작업은 모든 매출 데이터를 완전히 삭제합니다.
                                    </p>
                                    <ul className="mt-2 text-xs text-red-600 list-disc list-inside">
                                        <li>총 {data.length}개의 매출 기록이 삭제됩니다</li>
                                        <li>삭제된 데이터는 복구할 수 없습니다</li>
                                        <li>모든 차트와 통계가 초기화됩니다</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                확인을 위해 "데이터 삭제"를 입력하세요:
                            </label>
                            <input
                                type="text"
                                placeholder="데이터 삭제"
                                className="w-full border rounded-lg px-3 py-2"
                                onChange={(e) => {
                                    setResetConfirmText(e.target.value);
                                }}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowResetDialog(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                취소
                            </button>
                            <button
                                onClick={async () => {
                                    // Use bulk delete function to prevent network resource exhaustion
                                    try {
                                        const allIds = data.map(item => item.id);
                                        const result = await onBulkDelete(allIds);
                                        if (result.success) {
                                            setShowResetDialog(false);
                                            setResetConfirmText('');
                                            onRefresh();
                                        }
                                    } catch (error) {
                                        console.error('데이터 초기화 실패:', error);
                                    }
                                }}
                                disabled={resetConfirmText !== '데이터 삭제'}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                모든 데이터 삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 데이터가 없을 때 */}
            {filteredData.length === 0 && !loading && data.length > 0 && (
                <div className="text-center py-12">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        검색 결과가 없습니다
                    </h3>
                    <p className="text-gray-600">
                        다른 검색어나 필터를 시도해보세요
                    </p>
                </div>
            )}
        </div>
    );
};

export default DataTable;