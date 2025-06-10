import React, { useState, useRef, useEffect } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SupabaseClient } from '@supabase/supabase-js';

const MB = 1024 * 1024;

const AdminDangerZone = () => {
    // 모든 Hook은 컴포넌트 최상단에서 선언
    const { isAdmin, loading: roleLoading } = useUserRole();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [confirmQnA, setConfirmQnA] = useState('');
    const [confirmNews, setConfirmNews] = useState('');
    const [confirmUsers, setConfirmUsers] = useState('');
    const [confirmNotice, setConfirmNotice] = useState('');
    const [confirmProduct, setConfirmProduct] = useState('');
    const [confirmOrder, setConfirmOrder] = useState('');
    const [confirmUser, setConfirmUser] = useState('');
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

    // 권한 체크 및 리다이렉트
    useEffect(() => {
        if (!roleLoading && !isAdmin) navigate('/');
    }, [isAdmin, roleLoading, navigate]);

    // 모달 열기
    const openModal = (message: string, action: () => void) => {
        setModal({ open: true, action, message });
    };
    // 모달 닫기
    const closeModal = () => setModal({ open: false, action: null, message: '' });

    // 고객상담(문의/답변) 초기화
    const handleResetQnA = async () => {
        if (confirmQnA !== 'qna') return setResult('"qna"를 입력해야 삭제됩니다.');
        setLoading(true);
        setResult('');
        try {
            // replies 전체 삭제
            const { data: replies } = await supabase.from('replies').select('id');
            const replyIds = replies?.map(r => r.id) || [];
            if (replyIds.length > 0) await supabase.from('replies').delete().in('id', replyIds);
            // inquiries 전체 삭제
            const { data: inquiries } = await supabase.from('inquiries').select('id');
            const inquiryIds = inquiries?.map(i => i.id) || [];
            if (inquiryIds.length > 0) await supabase.from('inquiries').delete().in('id', inquiryIds);
            setResult('고객상담 게시판이 초기화되었습니다.');
        } catch (e) {
            setResult('오류: ' + (e.message || e));
        }
        setLoading(false);
    };

    // 모든 문의글 비밀글 처리
    const handleMakeAllPrivate = async () => {
        if (confirmQnA !== 'private') return setResult('"private"를 입력해야 비밀글 처리가 됩니다.');
        setLoading(true);
        setResult('');
        try {
            const { error } = await supabase
                .from('inquiries')
                .update({ is_private: true })
                .eq('is_private', false);

            if (error) {
                setResult('오류: ' + error.message);
            } else {
                setResult('모든 문의글이 비밀글 처리되었습니다.');
            }
        } catch (e) {
            setResult('오류: ' + (e.message || e));
        }
        setLoading(false);
    };

    // 공지사항 초기화
    const handleResetNews = async () => {
        if (confirmNews !== 'news') return setResult('"news"를 입력해야 삭제됩니다.');
        setLoading(true);
        setResult('');
        try {
            const { data: news } = await supabase.from('news').select('id');
            const newsIds = news?.map(n => n.id) || [];
            if (newsIds.length > 0) await supabase.from('news').delete().in('id', newsIds);
            setResult('공지사항 게시판이 초기화되었습니다.');
        } catch (e) {
            setResult('오류: ' + (e.message || e));
        }
        setLoading(false);
    };

    // 관리자 제외 사용자 계정 삭제
    const handleDeleteUsers = async () => {
        if (confirmUsers !== 'users') return setResult('"users"를 입력해야 삭제됩니다.');
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
            const now = new Date();
            const pad = (n: number) => n.toString().padStart(2, '0');
            const fileName = `rinkorea-backup-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.json`;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
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
                const { data: newsRows } = await supabase.from('news').select('id');
                const newsIds = newsRows?.map(n => n.id) || [];
                if (newsIds.length > 0) await supabase.from('news').delete().in('id', newsIds);
                for (const n of data.news) await supabase.from('news').insert(n);
            }
            if (Array.isArray(data.inquiries)) {
                const { data: inquiryRows } = await supabase.from('inquiries').select('id');
                const inquiryIds = inquiryRows?.map(i => i.id) || [];
                if (inquiryIds.length > 0) await supabase.from('inquiries').delete().in('id', inquiryIds);
                for (const i of data.inquiries) await supabase.from('inquiries').insert(i);
            }
            if (Array.isArray(data.replies)) {
                const { data: replyRows } = await supabase.from('replies').select('id');
                const replyIds = replyRows?.map(r => r.id) || [];
                if (replyIds.length > 0) await supabase.from('replies').delete().in('id', replyIds);
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
    const backupSizeText = backupSize !== null
        ? backupSize > MB
            ? `${(backupSize / MB).toFixed(2)} MB`
            : `${(backupSize / 1024).toFixed(2)} KB`
        : '';

    if (roleLoading || !isAdmin) return null;
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-20 max-w-2xl">
                <h1 className="text-2xl font-bold mb-8 text-red-700">관리자 위험구역 (Danger Zone)</h1>
                <div className="space-y-8">
                    {/* 고객상담 비밀글 처리 */}
                    <div className="bg-white p-6 rounded shadow border border-yellow-200">
                        <h2 className="text-lg font-bold text-yellow-700 mb-2">고객상담 게시판 비밀글 처리</h2>
                        <p className="mb-2 text-sm text-gray-700">모든 공개 문의글을 비밀글로 변경합니다.</p>
                        <input type="text" className="border px-2 py-1 rounded mr-2" placeholder='"private" 입력' value={confirmQnA} onChange={e => setConfirmQnA(e.target.value)} />
                        <button onClick={() => openModal('정말로 모든 문의글을 비밀글 처리하시겠습니까?', handleMakeAllPrivate)} disabled={loading} className="bg-yellow-600 text-white px-4 py-2 rounded disabled:opacity-50">비밀글 처리</button>
                    </div>
                    {/* 고객상담 초기화 */}
                    <div className="bg-white p-6 rounded shadow border border-red-200">
                        <h2 className="text-lg font-bold text-red-700 mb-2">고객상담 게시판 초기화</h2>
                        <p className="mb-2 text-sm text-gray-700">모든 문의글과 답변이 영구 삭제됩니다. 복구 불가!</p>
                        <input type="text" className="border px-2 py-1 rounded mr-2" placeholder='"qna" 입력' value={confirmQnA} onChange={e => setConfirmQnA(e.target.value)} />
                        <button onClick={() => openModal('정말로 고객상담 게시판을 초기화하시겠습니까?', handleResetQnA)} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50">초기화</button>
                    </div>
                    {/* 공지사항 초기화 */}
                    <div className="bg-white p-6 rounded shadow border border-red-200">
                        <h2 className="text-lg font-bold text-red-700 mb-2">공지사항 초기화</h2>
                        <p className="mb-2 text-sm text-gray-700">모든 공지사항이 영구 삭제됩니다. 복구 불가!</p>
                        <input type="text" className="border px-2 py-1 rounded mr-2" placeholder='"notice" 입력' value={confirmNotice} onChange={e => setConfirmNotice(e.target.value)} />
                        <button onClick={() => openModal('정말로 공지사항을 초기화하시겠습니까?', handleResetNews)} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50">초기화</button>
                    </div>
                    {/* 사용자 계정 삭제 */}
                    <div className="bg-white p-6 rounded shadow border border-red-200">
                        <h2 className="text-lg font-bold text-red-700 mb-2">관리자 제외 사용자 계정 전체 삭제</h2>
                        <p className="mb-2 text-sm text-gray-700">관리자 계정을 제외한 모든 사용자 계정이 영구 삭제됩니다. 복구 불가!</p>
                        <input type="text" className="border px-2 py-1 rounded mr-2" placeholder='"users" 입력' value={confirmUsers} onChange={e => setConfirmUsers(e.target.value)} />
                        <button onClick={() => openModal('정말로 모든 사용자 계정을 삭제하시겠습니까?', handleDeleteUsers)} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50">전체 삭제</button>
                    </div>
                    {/* 데이터 백업/복원 */}
                    <div className="bg-white p-6 rounded shadow border border-blue-200">
                        <h2 className="text-lg font-bold text-blue-700 mb-2">데이터 백업(내보내기) / 가져오기(복원)</h2>
                        <p className="mb-2 text-sm text-gray-700">고객상담, 답변, 공지사항 데이터를 JSON 파일로 내보내거나 복원할 수 있습니다.</p>
                        <div className="flex flex-col gap-2 mb-2">
                            <button onClick={handleExport} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">내보내기</button>
                            {backupSize !== null && (
                                <span className="text-xs text-gray-600">백업 파일 크기: {backupSizeText}</span>
                            )}
                            {backupWarning && (
                                <span className="text-xs text-red-600 font-bold">{backupWarning}</span>
                            )}
                            <label className="block mt-4 text-sm font-medium text-gray-700">백업 파일 가져오기(복원)</label>
                            <div className="flex flex-col gap-2">
                                <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition-colors text-center disabled:opacity-50">
                                    파일 선택
                                    <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImport} disabled={importing} className="hidden" />
                                </label>
                                {importing && <span className="text-xs text-blue-600">복원 중입니다...</span>}
                            </div>
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