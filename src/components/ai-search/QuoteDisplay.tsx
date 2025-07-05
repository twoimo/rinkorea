import React from 'react';

interface Product {
    name: string;
    price: number;
    quantity: number;
}

interface QuoteData {
    products: Product[];
    total: number;
    validity: string;
    notes: string;
}

interface QuoteDisplayProps {
    data: QuoteData;
}

const QuoteDisplay: React.FC<QuoteDisplayProps> = ({ data }) => {
    if (!data || !data.products) {
        return <p>견적 정보를 표시할 수 없습니다.</p>;
    }

    // Calculate the subtotal for each product and the overall total
    const productsWithSubtotal = data.products.map(product => ({
        ...product,
        subtotal: product.price * product.quantity,
    }));

    const calculatedTotal = productsWithSubtotal.reduce((sum, product) => sum + product.subtotal, 0);

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm my-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                스마트 견적서
            </h3>

            {/* Products Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-3">제품명</th>
                            <th scope="col" className="px-4 py-3 text-right">수량</th>
                            <th scope="col" className="px-4 py-3 text-right">단가</th>
                            <th scope="col" className="px-4 py-3 text-right">합계</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productsWithSubtotal.map((product, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                                    {product.name}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {product.quantity.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    ₩{product.price.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-right font-medium">
                                    ₩{product.subtotal.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals Section */}
            <div className="mt-6 flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600">합계</span>
                        <span className="font-semibold text-gray-800">
                            ₩{calculatedTotal.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-blue-600 border-t pt-2">
                        <span>총 견적 금액</span>
                        <span>
                            ₩{data.total.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Notes Section */}
            <div className="mt-6 border-t pt-4">
                <p className="text-xs text-gray-500">
                    <strong>유효기간:</strong> {data.validity}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    <strong>참고:</strong> {data.notes}
                </p>
            </div>
        </div>
    );
};

export default QuoteDisplay; 