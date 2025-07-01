import React, { useState, useRef } from 'react';
import { Upload, Download, Plus, X, Save, FileSpreadsheet } from 'lucide-react';
import { RevenueData, RevenueCategory } from '@/types/revenue';
import * as Papa from 'papaparse';


interface DataInputProps {
    categories: RevenueCategory[];
    onDataSubmit: (data: Omit<RevenueData, 'id' | 'created_at' | 'updated_at' | 'created_by'>[]) => Promise<{ success?: boolean; error?: unknown }>;
    loading: boolean;
}

// 카테고리별 제품 목록 정의
const CATEGORY_PRODUCTS: Record<string, string[]> = {
    '제품 매출': [
        'RIN-COAT',
        'RIN-SEAL PLUS',
        'RIN-HARD PLUS',
        'RIN-ONE COAT',
        'RIN-ONE COAT(RK-61)',
        'RIN-HARD ACE',
        'RIN-HARD PLUS(LI)',
        'RIN-CRETE',
        '고성능 침투성 방수제'
    ],
    '건설기계 매출': [
        '950GT',
        '850GT',
        'Falcon',
        'D1688',
        'Leopard-D1325',
        'DF20',
        'DF23',
        'DF23R',
        'DF26RE',
        'Flying Fish Grinder',
        'PRO850',
        'PRO950'
    ],
    '무역 매출': [
        '수출용 방수재',
        '수입 장비 부품',
        '해외 기술 라이선스'
    ],
    '온라인 매출': [
        '온라인 방수재 패키지',
        '디지털 기술 상담',
        '온라인 교육 과정'
    ],
    '기타 매출': [
        '기술 컨설팅',
        '시공 서비스',
        '품질 검사',
        'A/S 서비스',
        '교육 프로그램'
    ]
};

// 제품명 셀렉트 컴포넌트 (카테고리 드롭다운과 유사하게 단순화)
interface ProductSelectProps {
    value: string;
    category: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const ProductSelect: React.FC<ProductSelectProps> = ({
    value,
    category,
    onChange,
    placeholder = "제품명",
    className = ""
}) => {
    // 카테고리에 해당하는 제품 목록 가져오기
    const availableProducts = CATEGORY_PRODUCTS[category] || [];

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-500 ${className}`}
            disabled={availableProducts.length === 0}
        >
            <option value="">{availableProducts.length > 0 ? placeholder : '카테고리를 먼저 선택하세요'}</option>
            {availableProducts.map((product, index) => (
                <option key={index} value={product}>
                    {product}
                </option>
            ))}
        </select>
    );
};

const DataInput: React.FC<DataInputProps> = ({
    categories,
    onDataSubmit,
    loading
}) => {
    const [inputMethod, setInputMethod] = useState<'manual' | 'upload'>('manual');
    const [tableData, setTableData] = useState<Partial<RevenueData>[]>([
        {
            date: new Date().toISOString().split('T')[0],
            category: '',
            product_name: '',
            revenue: 0,
            quantity: 0,
            unit_price: 0,
            region: '',
            customer_type: '',
            notes: ''
        }
    ]);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 수동 입력 행 추가
    const addRow = () => {
        setTableData([
            ...tableData,
            {
                date: new Date().toISOString().split('T')[0],
                category: '',
                product_name: '',
                revenue: 0,
                quantity: 0,
                unit_price: 0,
                region: '',
                customer_type: '',
                notes: ''
            }
        ]);
    };

    // 행 삭제
    const removeRow = (index: number) => {
        if (tableData.length > 1) {
            setTableData(tableData.filter((_, i) => i !== index));
        }
    };

    // 테이블 데이터 업데이트
    const updateTableData = (index: number, field: keyof RevenueData, value: string | number) => {
        const updatedData = [...tableData];
        updatedData[index] = { ...updatedData[index], [field]: value };

        // 단가와 수량이 변경되면 매출 자동 계산
        if (field === 'unit_price' || field === 'quantity') {
            const quantity = field === 'quantity' ? Number(value) : (updatedData[index].quantity || 0);
            const unitPrice = field === 'unit_price' ? Number(value) : (updatedData[index].unit_price || 0);
            updatedData[index].revenue = quantity * unitPrice;
        }

        setTableData(updatedData);
    };

    // 수동 입력 데이터 제출
    const handleManualSubmit = async () => {
        const validData = tableData.filter(row =>
            row.date && row.category && row.revenue && row.revenue > 0
        );

        if (validData.length === 0) {
            setUploadError('유효한 데이터가 없습니다. 날짜, 카테고리, 매출은 필수입니다.');
            return;
        }

        try {
            const result = await onDataSubmit(validData as Omit<RevenueData, 'id' | 'created_at' | 'updated_at' | 'created_by'>[]);
            if (result.success) {
                setUploadSuccess(`${validData.length}개 항목이 저장되었습니다.`);
                setTableData([{
                    date: new Date().toISOString().split('T')[0],
                    category: '',
                    product_name: '',
                    revenue: 0,
                    quantity: 0,
                    unit_price: 0,
                    region: '',
                    customer_type: '',
                    notes: ''
                }]);
                setTimeout(() => setUploadSuccess(null), 3000);
            } else {
                setUploadError('데이터 저장 중 오류가 발생했습니다.');
            }
        } catch (_error) {
            console.error('Error saving data:', _error);
            setUploadError('데이터 저장 중 오류가 발생했습니다.');
        }
    };

    // CSV 파일 업로드 처리
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadError(null);
        setUploadSuccess(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const parsedData: Partial<RevenueData>[] = (results.data as Record<string, string>[]).map((row) => ({
                        date: row.date || row['날짜'] || '',
                        category: row.category || row['카테고리'] || '',
                        product_name: row.product_name || row['제품명'] || '',
                        revenue: parseFloat(row.revenue || row['매출'] || '0'),
                        quantity: parseInt(row.quantity || row['수량'] || '0'),
                        unit_price: parseFloat(row.unit_price || row['단가'] || '0'),
                        region: row.region || row['지역'] || '',
                        customer_type: row.customer_type || row['고객유형'] || '',
                        notes: row.notes || row['비고'] || ''
                    }));

                    const validData = parsedData.filter(row =>
                        row.date && row.category && row.revenue && row.revenue > 0
                    );

                    if (validData.length === 0) {
                        setUploadError('유효한 데이터가 없습니다. CSV 파일의 형식을 확인해주세요.');
                        return;
                    }

                    const result = await onDataSubmit(validData as Omit<RevenueData, 'id' | 'created_at' | 'updated_at' | 'created_by'>[]);
                    if (result.success) {
                        setUploadSuccess(`${validData.length}개 항목이 업로드되었습니다.`);
                    } else {
                        setUploadError('데이터 업로드 중 오류가 발생했습니다.');
                    }
                } catch (_error) {
                    console.error('Error processing file:', _error);
                    setUploadError('파일 처리 중 오류가 발생했습니다.');
                }
            },
            error: () => {
                setUploadError('파일을 읽을 수 없습니다. CSV 파일인지 확인해주세요.');
            }
        });

        // 파일 입력 초기화
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // CSV 템플릿 다운로드
    const downloadTemplate = () => {
        const template = [
            {
                '날짜': '2024-01-01',
                '카테고리': '제품 매출',
                '제품명': '린코트 20kg',
                '매출': '100000',
                '수량': '10',
                '단가': '10000',
                '지역': '서울',
                '고객유형': '일반',
                '비고': '예시 데이터'
            }
        ];

        const csv = Papa.unparse(template);
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = '매출데이터_템플릿.csv';
        link.click();
    };

    return (
        <div className="bg-white rounded-lg border p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">데이터 입력</h3>

                {/* 입력 방식 선택 */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setInputMethod('manual')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${inputMethod === 'manual'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        수동 입력
                    </button>
                    <button
                        onClick={() => setInputMethod('upload')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${inputMethod === 'upload'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        파일 업로드
                    </button>
                </div>

                {/* 에러/성공 메시지 */}
                {uploadError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {uploadError}
                    </div>
                )}
                {uploadSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                        {uploadSuccess}
                    </div>
                )}
            </div>

            {inputMethod === 'manual' ? (
                // 수동 입력 테이블
                <div className="space-y-4">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border border-gray-300 px-2 py-1 text-left text-sm font-medium min-w-[90px]">날짜</th>
                                    <th className="border border-gray-300 px-2 py-1 text-left text-sm font-medium min-w-[100px]">카테고리</th>
                                    <th className="border border-gray-300 px-2 py-1 text-left text-sm font-medium min-w-[120px]">제품명</th>
                                    <th className="border border-gray-300 px-2 py-1 text-left text-sm font-medium min-w-[70px]">수량</th>
                                    <th className="border border-gray-300 px-2 py-1 text-left text-sm font-medium min-w-[80px]">단가</th>
                                    <th className="border border-gray-300 px-2 py-1 text-left text-sm font-medium min-w-[80px]">매출</th>
                                    <th className="border border-gray-300 px-2 py-1 text-left text-sm font-medium min-w-[80px]">지역</th>
                                    <th className="border border-gray-300 px-2 py-1 text-left text-sm font-medium min-w-[90px]">고객유형</th>
                                    <th className="border border-gray-300 px-2 py-1 text-left text-sm font-medium min-w-[100px]">비고</th>
                                    <th className="border border-gray-300 px-2 py-1 text-center text-sm font-medium min-w-[60px]">작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((row, index) => (
                                    <tr key={index}>
                                        <td className="border border-gray-300 p-1">
                                            <input
                                                type="date"
                                                value={row.date || ''}
                                                onChange={(e) => updateTableData(index, 'date', e.target.value)}
                                                className="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            <select
                                                value={row.category || ''}
                                                onChange={(e) => updateTableData(index, 'category', e.target.value)}
                                                className="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-500"
                                            >
                                                <option value="">선택</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.name}>
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            <ProductSelect
                                                value={row.product_name || ''}
                                                category={row.category || ''}
                                                onChange={(value) => updateTableData(index, 'product_name', value)}
                                                placeholder="제품명"
                                                className="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            <input
                                                type="number"
                                                value={row.quantity || ''}
                                                onChange={(e) => updateTableData(index, 'quantity', parseInt(e.target.value) || 0)}
                                                className="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-500"
                                                min="0"
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            <input
                                                type="number"
                                                value={row.unit_price || ''}
                                                onChange={(e) => updateTableData(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                className="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-500"
                                                min="0"
                                                step="0.01"
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            <input
                                                type="number"
                                                value={row.revenue || ''}
                                                onChange={(e) => updateTableData(index, 'revenue', parseFloat(e.target.value) || 0)}
                                                className="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-500 bg-gray-50"
                                                min="0"
                                                step="0.01"
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            <input
                                                type="text"
                                                value={row.region || ''}
                                                onChange={(e) => updateTableData(index, 'region', e.target.value)}
                                                className="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-500"
                                                placeholder="지역"
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            <select
                                                value={row.customer_type || ''}
                                                onChange={(e) => updateTableData(index, 'customer_type', e.target.value)}
                                                className="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-500"
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
                                                value={row.notes || ''}
                                                onChange={(e) => updateTableData(index, 'notes', e.target.value)}
                                                className="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-500"
                                                placeholder="비고"
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-1 text-center">
                                            <button
                                                onClick={() => removeRow(index)}
                                                disabled={tableData.length === 1}
                                                className="p-1 text-red-600 hover:text-red-700 disabled:text-gray-400"
                                                title="행 삭제"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center">
                        <button
                            onClick={addRow}
                            className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700"
                        >
                            <Plus className="w-4 h-4" />
                            행 추가
                        </button>

                        <button
                            onClick={handleManualSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? '저장 중...' : '저장'}
                        </button>
                    </div>
                </div>
            ) : (
                // 파일 업로드
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                            <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <h4 className="text-lg font-medium mb-2">CSV 파일 업로드</h4>
                            <p className="text-gray-600 mb-4">
                                매출 데이터가 포함된 CSV 파일을 업로드하세요
                            </p>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="hidden"
                            />

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <Upload className="w-4 h-4" />
                                    {loading ? '업로드 중...' : '파일 선택'}
                                </button>

                                <button
                                    onClick={downloadTemplate}
                                    className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    <Download className="w-4 h-4" />
                                    템플릿 다운로드
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium mb-2">CSV 파일 형식 안내</h5>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>• 첫 번째 행에는 컬럼 헤더가 포함되어야 합니다</p>
                            <p>• 필수 컬럼: 날짜, 카테고리, 매출</p>
                            <p>• 선택 컬럼: 제품명, 수량, 단가, 지역, 고객유형, 비고</p>
                            <p>• 날짜 형식: YYYY-MM-DD (예: 2024-01-01)</p>
                            <p>• 숫자는 콤마 없이 입력해주세요</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataInput;