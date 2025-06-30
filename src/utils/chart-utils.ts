// 차트 공통 컴포넌트들
export const useRechartsComponents = () => {
    return import('recharts').then(module => ({
        Line: module.Line,
        Bar: module.Bar,
        Pie: module.Pie,
        Area: module.Area,
        XAxis: module.XAxis,
        YAxis: module.YAxis,
        CartesianGrid: module.CartesianGrid,
        Tooltip: module.Tooltip,
        Legend: module.Legend,
        Cell: module.Cell
    }));
}; 