import React, { useState, useRef, useEffect } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const MB = 1024 * 1024;

const AdminDangerZone = () => {
    const { isAdmin } = useUserRole();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [confirm, setConfirm] = useState('');
    const [modal, setModal] = useState<{ open: boolean; action: null | (() => void); message: string }>({ open: false, action: null, message: '' });
    const [backupSize, setBackupSize] = useState<number | null>(null);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 페이지 진입 시 자동으로 백업 파일 크기 계산
    useEffect(() => {
        const fetchBackupSize = async () => {
            try {
                const [inq, rep, news] = await Promise.all([
                    supabase.from('inquiries').select('*'),
                    supabase.from('replies').select('*'),
                    supabase.from('news').select('*'),
                ]);
                const json = JSON.stringify({ inquiries: inq.data, replies: rep.data, news: news.data }, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                setBackupSize(blob.size);
            } catch (e) {/* ignore */ }
        };
        fetchBackupSize();
    }, []);

    if (!isAdmin) {
        navigate('/');
        return null;
    }

    // 모달 열기
    const openModal = (message: string, action: () => void) => {
        setModal({ open: true, action, message });
    };
    // 모달 닫기
    const closeModal = () => setModal({ open: false, action: null, message: '' });

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
            setResult('오류: ' + (e.message || e));
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
            setResult('오류: ' + (e.message || e));
        }
        setLoading(false);
    };

    // 관리자 제외 사용자 계정 삭제
    const handleDeleteUsers = async () => {
        if (confirm !== 'users') return setResult('"users"를 입력해야 삭제됩니다.');
        setLoading(true);
        setResult('');
        try {
            const adminEmail = '2019@rinkorea.com'; // 실제 관리자 이메일로 변경 필요
            const { data } = await supabase.auth.admin.listUsers();
            const users = data?.users || [];
            const toDelete = users.filter(u => u.email !== adminEmail);
            for (const u of toDelete) {
                await supabase.auth.admin.deleteUser(u.id);
            }
            setResult('관리자 계정을 제외한 모든 사용자 계정이 삭제되었습니다.');
        } catch (e) {
            setResult('오류: ' + (e.message || e));
        }
        setLoading(false);
    };

    // 데이터 백업(내보내기)
    const handleExport = async () => {
        setLoading(true);
        setResult('');
        try {
            const [inq, rep, news] = await Promise.all([
                supabase.from('inquiries').select('*'),
                supabase.from('replies').select('*'),
                supabase.from('news').select('*'),
            ]);
            const json = JSON.stringify({ inquiries: inq.data, replies: rep.data, news: news.data }, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            setBackupSize(blob.size);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'rinkorea-backup.json';
            a.click();
            setResult('데이터가 내보내기 되었습니다.');
        } catch (e) {
            setResult('오류: ' + (e.message || e));
        }
        setLoading(false);
    };

    // 데이터 백업 가져오기(복원)
    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImporting(true);
        setResult('');
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            // 순서: news -> inquiries -> replies (관계상)
            if (Array.isArray(data.news)) {
                await supabase.from('news').delete().neq('id', '');
                for (const n of data.news) await supabase.from('news').insert(n);
            }
            if (Array.isArray(data.inquiries)) {
                await supabase.from('inquiries').delete().neq('id', '');
                for (const i of data.inquiries) await supabase.from('inquiries').insert(i);
            }
            if (Array.isArray(data.replies)) {
                await supabase.from('replies').delete().neq('id', '');
                for (const r of data.replies) await supabase.from('replies').insert(r);
            }
            setResult('데이터가 성공적으로 복원되었습니다.');
        } catch (e) {
            setResult('오류: ' + (e.message || e));
        }
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Danger 안내 메시지
    const backupWarning = backupSize && backupSize > 400 * MB
        ? '⚠️ 데이터 용량이 400MB를 초과했습니다. Supabase 무료 플랜(500MB) 임박! 백업을 강력히 권장합니다.'
        : '';

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-20 max-w-2xl">
                <h1 className="text-2xl font-bold mb-8 text-red-700">관리자 위험구역 (Danger Zone)</h1>
                <div className="space-y-8">
                    {/* 고객상담 초기화 */}
                    <div className="bg-white p-6 rounded shadow border border-red-200">
                        <h2 className="text-lg font-bold text-red-700 mb-2">고객상담 게시판 초기화</h2>
                        <p className="mb-2 text-sm text-gray-700">모든 문의글과 답변이 영구 삭제됩니다. 복구 불가!</p>
                        <input type="text" className="border px-2 py-1 rounded mr-2" placeholder='"qna" 입력' value={confirm} onChange={e => setConfirm(e.target.value)} />
                        <button onClick={() => openModal('정말로 고객상담 게시판을 초기화하시겠습니까?', handleResetQnA)} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50">초기화</button>
                    </div>
                    {/* 공지사항 초기화 */}
                    <div className="bg-white p-6 rounded shadow border border-red-200">
                        <h2 className="text-lg font-bold text-red-700 mb-2">공지사항 게시판 초기화</h2>
                        <p className="mb-2 text-sm text-gray-700">모든 공지사항이 영구 삭제됩니다. 복구 불가!</p>
                        <input type="text" className="border px-2 py-1 rounded mr-2" placeholder='"news" 입력' value={confirm} onChange={e => setConfirm(e.target.value)} />
                        <button onClick={() => openModal('정말로 공지사항 게시판을 초기화하시겠습니까?', handleResetNews)} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50">초기화</button>
                    </div>
                    {/* 사용자 계정 삭제 */}
                    <div className="bg-white p-6 rounded shadow border border-red-200">
                        <h2 className="text-lg font-bold text-red-700 mb-2">관리자 제외 사용자 계정 전체 삭제</h2>
                        <p className="mb-2 text-sm text-gray-700">관리자 계정을 제외한 모든 사용자 계정이 영구 삭제됩니다. 복구 불가!</p>
                        <input type="text" className="border px-2 py-1 rounded mr-2" placeholder='"users" 입력' value={confirm} onChange={e => setConfirm(e.target.value)} />
                        <button onClick={() => openModal('정말로 모든 사용자 계정을 삭제하시겠습니까?', handleDeleteUsers)} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50">전체 삭제</button>
                    </div>
                    {/* 데이터 백업/복원 */}
                    <div className="bg-white p-6 rounded shadow border border-blue-200">
                        <h2 className="text-lg font-bold text-blue-700 mb-2">데이터 백업(내보내기) / 가져오기(복원)</h2>
                        <p className="mb-2 text-sm text-gray-700">고객상담, 답변, 공지사항 데이터를 JSON 파일로 내보내거나 복원할 수 있습니다.</p>
                        <div className="flex flex-col gap-2 mb-2">
                            <button onClick={handleExport} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">내보내기</button>
                            {backupSize !== null && (
                                <span className="text-xs text-gray-600">백업 파일 크기: {(backupSize / MB).toFixed(2)} MB</span>
                            )}
                            {backupWarning && (
                                <span className="text-xs text-red-600 font-bold">{backupWarning}</span>
                            )}
                            <label className="block mt-4 text-sm font-medium text-gray-700">백업 파일 가져오기(복원)</label>
                            <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImport} disabled={importing} className="block" />
                            {importing && <span className="text-xs text-blue-600">복원 중입니다...</span>}
                        </div>
                    </div>
                    {/* 결과 안내 */}
                    {result && <div className="mt-4 p-4 bg-gray-100 rounded text-center text-sm text-gray-700">{result}</div>}
                </div>
                {/* 경고/확인 모달 */}
                {modal.open && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-8 max-w-xs w-full text-center">
                            <div className="text-lg font-bold text-red-700 mb-4">경고</div>
                            <div className="mb-6 text-gray-800">{modal.message}</div>
                            <div className="flex gap-4 justify-center">
                                <button onClick={() => { modal.action && modal.action(); closeModal(); }} className="bg-red-600 text-white px-4 py-2 rounded">확인</button>
                                <button onClick={closeModal} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">취소</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default AdminDangerZone; 