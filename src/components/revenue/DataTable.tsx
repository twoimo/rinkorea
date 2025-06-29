import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Edit, Trash2, X, Save, Calendar, Package, DollarSign, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { RevenueData, RevenueCategory } from '@/types/revenue';
import { createPortal } from 'react-dom';

interface DataTableProps {
    data: RevenueData[];
    categories: RevenueCategory[];
    loading: boolean;
    onEdit: (id: string, data: Partial<RevenueData>) => Promise<{ success?: boolean; error?: unknown }>;
    onDelete: (id: string) => Promise<{ success?: boolean; error?: unknown }>;
    onBulkDelete: (ids: string[]) => Promise<{ success?: boolean; error?: unknown }>;
    onRefresh: () => void;
}

// 테이블 행 컴포넌트 - React.memo로 최적화
const TableRow = React.memo(({
    item,
    categories,
    isEditing,
    editingData,
    onEdit,
    onSave,
    onCancel,
    onDelete,
    onUpdateEditingData
}: {
    item: RevenueData;
    categories: RevenueCategory[];
    isEditing: boolean;
    editingData: Partial<RevenueData>;
    onEdit: (item: RevenueData) => void;
    onSave: () => void;
    onCancel: () => void;
    onDelete: (id: string) => void;
    onUpdateEditingData: (field: keyof RevenueData, value: string | number) => void;
}) => {
    const formatCurrency = useCallback((value: number) => {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }, []);

    const formatDate = useCallback((dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ko-KR');
    }, []);

    const categoryColor = useMemo(() =>
        categories.find(c => c.name === item.category)?.color,
        [categories, item.category]
    );

    if (isEditing) {
        return (
            <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-1">
                    <input
                        type="date"
                        value={editingData.date || ''}
                        onChange={(e) => onUpdateEditingData('date', e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                    />
                </td>
                <td className="border border-gray-300 p-1">
                    <select
                        value={editingData.category || ''}
                        onChange={(e) => onUpdateEditingData('category', e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
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
                        onChange={(e) => onUpdateEditingData('product_name', e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="제품명"
                    />
                </td>
                <td className="border border-gray-300 p-1">
                    <input
                        type="number"
                        value={editingData.quantity || ''}
                        onChange={(e) => onUpdateEditingData('quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                        min="0"
                    />
                </td>
                <td className="border border-gray-300 p-1">
                    <input
                        type="number"
                        value={editingData.unit_price || ''}
                        onChange={(e) => onUpdateEditingData('unit_price', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                    />
                </td>
                <td className="border border-gray-300 p-1">
                    <input
                        type="number"
                        value={editingData.revenue || ''}
                        onChange={(e) => onUpdateEditingData('revenue', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-sm border rounded bg-gray-50 focus:ring-1 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                    />
                </td>
                <td className="border border-gray-300 p-1">
                    <input
                        type="text"
                        value={editingData.region || ''}
                        onChange={(e) => onUpdateEditingData('region', e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="지역"
                    />
                </td>
                <td className="border border-gray-300 p-1">
                    <select
                        value={editingData.customer_type || ''}
                        onChange={(e) => onUpdateEditingData('customer_type', e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
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
                        onChange={(e) => onUpdateEditingData('notes', e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="비고"
                    />
                </td>
                <td className="border border-gray-300 p-1 text-center">
                    <div className="flex justify-center gap-1">
                        <button
                            onClick={onSave}
                            className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                            title="저장"
                        >
                            <Save className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onCancel}
                            className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
                            title="취소"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="border border-gray-300 px-3 py-2 text-sm">
                {formatDate(item.date)}
            </td>
            <td className="border border-gray-300 px-3 py-2 text-sm">
                <div className="flex items-center">
                    <span
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: categoryColor }}
                    />
                    {item.category}
                </div>
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
            <td className="border border-gray-300 px-3 py-2 text-sm text-right font-medium text-green-600">
                {formatCurrency(item.revenue)}
            </td>
            <td className="border border-gray-300 px-3 py-2 text-sm">
                {item.region || '-'}
            </td>
            <td className="border border-gray-300 px-3 py-2 text-sm">
                {item.customer_type || '-'}
            </td>
            <td className="border border-gray-300 px-3 py-2 text-sm max-w-xs truncate" title={item.notes}>
                {item.notes || '-'}
            </td>
            <td className="border border-gray-300 px-3 py-2 text-center">
                <div className="flex justify-center gap-1">
                    <button
                        onClick={() => onEdit(item)}
                        className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        title="편집"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(item.id)}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="삭제"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
});

// 페이지네이션 컴포넌트 - React.memo로 최적화
const Pagination = React.memo(({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
}) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    const getVisiblePages = useMemo(() => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    }, [currentPage, totalPages]);

    if (totalPages <= 1) return null;

    return (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
                {startIndex + 1}-{endIndex}개 / 총 {totalItems}개
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    title="이전 페이지"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                    {getVisiblePages.map((page, index) => {
                        if (page === '...') {
                            return <span key={index} className="px-2 text-gray-500">...</span>;
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => onPageChange(page as number)}
                                className={`px-3 py-2 border rounded text-sm transition-colors ${currentPage === page
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'hover:bg-gray-50'
                                    }`}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    title="다음 페이지"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
});

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
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [filterCategory, setFilterCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<keyof RevenueData>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // 필터링 및 정렬된 데이터 - useMemo로 최적화
    const processedData = useMemo(() => {
        const filtered = data.filter(item => {
            const matchesCategory = !filterCategory || item.category === filterCategory;
            const matchesSearch = !searchTerm ||
                item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        // 정렬 적용
        filtered.sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (aValue === bValue) return 0;

            const comparison = aValue < bValue ? -1 : 1;
            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [data, filterCategory, searchTerm, sortField, sortDirection]);

    // 페이지네이션된 데이터
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return processedData.slice(startIndex, startIndex + itemsPerPage);
    }, [processedData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(processedData.length / itemsPerPage);

    // 편집 핸들러들 - useCallback으로 최적화
    const handleEdit = useCallback((item: RevenueData) => {
        setEditingId(item.id);
        setEditingData({ ...item });
    }, []);

    const handleSave = useCallback(async () => {
        if (!editingId) return;

        // 단가와 수량이 변경되면 매출 자동 계산
        const finalData = { ...editingData };
        if (finalData.unit_price && finalData.quantity) {
            finalData.revenue = finalData.unit_price * finalData.quantity;
        }

        const result = await onEdit(editingId, finalData);
        if (result.success) {
            setEditingId(null);
            setEditingData({});
            onRefresh();
        }
    }, [editingId, editingData, onEdit, onRefresh]);

    const handleCancel = useCallback(() => {
        setEditingId(null);
        setEditingData({});
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        const result = await onDelete(id);
        if (result.success) {
            setDeleteConfirmId(null);
            onRefresh();
        }
    }, [onDelete, onRefresh]);

    const updateEditingData = useCallback((field: keyof RevenueData, value: string | number) => {
        setEditingData(prev => ({ ...prev, [field]: value }));
    }, []);

    // 정렬 핸들러
    const handleSort = useCallback((field: keyof RevenueData) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    }, [sortField]);

    // 페이지 변경 시 현재 페이지 유효성 검사
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);

    // 검색이나 필터 변경 시 첫 페이지로 이동
    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    }, []);

    const handleCategoryChange = useCallback((value: string) => {
        setFilterCategory(value);
        setCurrentPage(1);
    }, []);

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
        <div className="bg-white rounded-lg border p-4 sm:p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">매출 데이터 관리</h3>

                {/* 필터 및 검색 - 모바일 최적화 */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-600" />
                        <select
                            value={filterCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">전체 카테고리</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 flex-1">
                        <Search className="w-4 h-4 text-gray-600" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="제품명, 지역, 비고 검색..."
                            className="flex-1 border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">페이지당:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border rounded px-2 py-1 text-sm"
                        >
                            <option value={10}>10개</option>
                            <option value={25}>25개</option>
                            <option value={50}>50개</option>
                            <option value={100}>100개</option>
                        </select>
                    </div>

                    <div className="text-sm text-gray-600 flex items-center whitespace-nowrap">
                        총 {processedData.length}개 항목
                    </div>

                    <button
                        onClick={() => setShowResetDialog(true)}
                        disabled={data.length === 0}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
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
                            <th
                                className="border border-gray-300 px-3 py-2 text-left text-sm font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('date')}
                            >
                                날짜 {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                                className="border border-gray-300 px-3 py-2 text-left text-sm font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('category')}
                            >
                                카테고리 {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                                className="border border-gray-300 px-3 py-2 text-left text-sm font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('product_name')}
                            >
                                제품명 {sortField === 'product_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                                className="border border-gray-300 px-3 py-2 text-left text-sm font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('quantity')}
                            >
                                수량 {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                                className="border border-gray-300 px-3 py-2 text-left text-sm font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('unit_price')}
                            >
                                단가 {sortField === 'unit_price' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                                className="border border-gray-300 px-3 py-2 text-left text-sm font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('revenue')}
                            >
                                매출 {sortField === 'revenue' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                                className="border border-gray-300 px-3 py-2 text-left text-sm font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('region')}
                            >
                                지역 {sortField === 'region' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                                className="border border-gray-300 px-3 py-2 text-left text-sm font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('customer_type')}
                            >
                                고객유형 {sortField === 'customer_type' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">비고</th>
                            <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item) => (
                            <TableRow
                                key={item.id}
                                item={item}
                                categories={categories}
                                isEditing={editingId === item.id}
                                editingData={editingData}
                                onEdit={handleEdit}
                                onSave={handleSave}
                                onCancel={handleCancel}
                                onDelete={setDeleteConfirmId}
                                onUpdateEditingData={updateEditingData}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 페이지네이션 */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={processedData.length}
                itemsPerPage={itemsPerPage}
            />

            {/* 삭제 확인 모달 - Portal 방식으로 최적화 */}
            {deleteConfirmId && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        margin: 0
                    }}
                    onClick={() => setDeleteConfirmId(null)}
                >
                    <div
                        className="bg-white rounded-lg p-6 w-full max-w-md"
                        style={{
                            position: 'relative',
                            margin: 'auto',
                            transform: 'none'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold mb-4">데이터 삭제</h3>
                        <p className="text-gray-600 mb-6">
                            이 매출 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirmId)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* 데이터 초기화 확인 모달 - Portal 방식으로 최적화 */}
            {showResetDialog && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        margin: 0
                    }}
                    onClick={() => setShowResetDialog(false)}
                >
                    <div
                        className="bg-white rounded-lg p-6 w-full max-w-md"
                        style={{
                            position: 'relative',
                            margin: 'auto',
                            transform: 'none'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
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
                                className="w-full border rounded-lg px-3 py-2 focus:ring-1 focus:ring-red-500"
                                onChange={(e) => setResetConfirmText(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowResetDialog(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={async () => {
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
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                모든 데이터 삭제
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* 데이터가 없을 때 */}
            {processedData.length === 0 && !loading && data.length > 0 && (
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

            {data.length === 0 && !loading && (
                <div className="text-center py-12">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        매출 데이터가 없습니다
                    </h3>
                    <p className="text-gray-600">
                        데이터 입력 탭에서 매출 정보를 추가해보세요
                    </p>
                </div>
            )}
        </div>
    );
};

export default React.memo(DataTable);