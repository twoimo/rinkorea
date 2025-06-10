import React, { useState } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AdminDangerZone = () => {
    const { isAdmin } = useUserRole();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [confirm, setConfirm] = useState('');

    if (!isAdmin) {
        navigate('/');
        return null;
    }

    // 고객상담(문의/답변) 초기화
    const handleResetQnA = async () => {
        if (confirm !== 'qna') return setResult('"qna"를 입력해야 삭제됩니다.');
        setLoading(true);
        setResult('');
        try {
            await supabase.from('replies').delete().neq('id', '');
            await supabase.from('inquiries').delete().neq('id', '');
            setResult('고객상담 게시판이 초기화되었습니다.');
        } catch (e) {
            setResult('오류: ' + e.message);
        }
        setLoading(false);
    };

    // 공지사항 초기화
    const handleResetNews = async () => {
        if (confirm !== 'news') return setResult('"news"를 입력해야 삭제됩니다.');
        setLoading(true);
        setResult('');
        try {
            await supabase.from('news').delete().neq('id', '');
            setResult('공지사항 게시판이 초기화되었습니다.');
        } catch (e) {
            setResult('오류: ' + e.message);
        }
        setLoading(false);
    };

    // 관리자 제외 사용자 계정 삭제
    const handleDeleteUsers = async () => {
        if (confirm !== 'users') return setResult('"users"를 입력해야 삭제됩니다.');
        setLoading(true);
        setResult('');
        try {
            // 관리자 계정 이메일(예: 2019@rinkorea.com)만 남기고 모두 삭제
            const adminEmail = '2019@rinkorea.com'; // 실제 관리자 이메일로 변경 필요
            // auth.users에서 전체 유저 조회
            const { data } = await supabase.auth.admin.listUsers();
            const users = data?.users || [];
            const toDelete = users.filter(u => u.email !== adminEmail);
            for (const u of toDelete) {
                await supabase.auth.admin.deleteUser(u.id);
            }
            setResult('관리자 계정을 제외한 모든 사용자 계정이 삭제되었습니다.');
        } catch (e) {
            setResult('오류: ' + e.message);
        }
        setLoading(false);
    };

    // 데이터 백업(내보내기)
    const handleExport = async () => {
        setLoading(true);
        setResult('');
        try {
            // 예시: inquiries, replies, news 테이블을 모두 export
            const [inq, rep, news] = await Promise.all([
                supabase.from('inquiries').select('*'),
                supabase.from('replies').select('*'),
                supabase.from('news').select('*'),
            ]);
            const blob = new Blob([
                JSON.stringify({ inquiries: inq.data, replies: rep.data, news: news.data }, null, 2)
            ], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'rinkorea-backup.json';
            a.click();
            setResult('데이터가 내보내기 되었습니다.');
        } catch (e) {
            setResult('오류: ' + e.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-20 max-w-2xl">
                <h1 className="text-2xl font-bold mb-8 text-red-700">관리자 위험구역 (Danger Zone)</h1>
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded shadow border border-red-200">
                        <h2 className="text-lg font-bold text-red-700 mb-2">고객상담 게시판 초기화</h2>
                        <p className="mb-2 text-sm text-gray-700">모든 문의글과 답변이 영구 삭제됩니다. 복구 불가!</p>
                        <input type="text" className="border px-2 py-1 rounded mr-2" placeholder='"qna" 입력' value={confirm} onChange={e => setConfirm(e.target.value)} />
                        <button onClick={handleResetQnA} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50">초기화</button>
                    </div>
                    <div className="bg-white p-6 rounded shadow border border-red-200">
                        <h2 className="text-lg font-bold text-red-700 mb-2">공지사항 게시판 초기화</h2>
                        <p className="mb-2 text-sm text-gray-700">모든 공지사항이 영구 삭제됩니다. 복구 불가!</p>
                        <input type="text" className="border px-2 py-1 rounded mr-2" placeholder='"news" 입력' value={confirm} onChange={e => setConfirm(e.target.value)} />
                        <button onClick={handleResetNews} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50">초기화</button>
                    </div>
                    <div className="bg-white p-6 rounded shadow border border-red-200">
                        <h2 className="text-lg font-bold text-red-700 mb-2">관리자 제외 사용자 계정 전체 삭제</h2>
                        <p className="mb-2 text-sm text-gray-700">관리자 계정을 제외한 모든 사용자 계정이 영구 삭제됩니다. 복구 불가!</p>
                        <input type="text" className="border px-2 py-1 rounded mr-2" placeholder='"users" 입력' value={confirm} onChange={e => setConfirm(e.target.value)} />
                        <button onClick={handleDeleteUsers} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50">전체 삭제</button>
                    </div>
                    <div className="bg-white p-6 rounded shadow border border-blue-200">
                        <h2 className="text-lg font-bold text-blue-700 mb-2">데이터 백업(내보내기)</h2>
                        <p className="mb-2 text-sm text-gray-700">고객상담, 답변, 공지사항 데이터를 JSON 파일로 내보냅니다.</p>
                        <button onClick={handleExport} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">내보내기</button>
                    </div>
                    {result && <div className="mt-4 p-4 bg-gray-100 rounded text-center text-sm text-gray-700">{result}</div>}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AdminDangerZone; 