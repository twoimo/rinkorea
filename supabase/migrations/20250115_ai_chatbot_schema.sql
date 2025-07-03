-- AI 챗봇 시스템을 위한 데이터베이스 스키마

-- 채팅 세션 테이블
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    session_type VARCHAR(20) DEFAULT 'user' CHECK (session_type IN ('user', 'admin')),
    context JSONB DEFAULT '{}',
    channel_talk_id VARCHAR(255),
    total_messages INTEGER DEFAULT 0,
    ai_provider VARCHAR(20) DEFAULT 'mistral' CHECK (ai_provider IN ('mistral', 'claude')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 채팅 메시지 테이블
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    message_id VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'assistant', 'system')),
    ai_provider VARCHAR(20) CHECK (ai_provider IN ('mistral', 'claude')),
    tokens_used INTEGER DEFAULT 0,
    response_time_ms INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI 분석 결과 테이블
CREATE TABLE IF NOT EXISTS ai_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL CHECK (analysis_type IN ('revenue', 'customer', 'sales', 'trend')),
    request_data JSONB NOT NULL,
    result_data JSONB NOT NULL,
    ai_provider VARCHAR(20) NOT NULL CHECK (ai_provider IN ('mistral', 'claude')),
    confidence_score DECIMAL(3,2),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 챗봇 설정 테이블
CREATE TABLE IF NOT EXISTS chatbot_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    config_name VARCHAR(100) NOT NULL,
    enabled_providers TEXT[] DEFAULT ARRAY['mistral'],
    max_message_length INTEGER DEFAULT 2000,
    response_timeout INTEGER DEFAULT 30000,
    features JSONB DEFAULT '{"revenueAnalysis": false, "salesPrediction": false, "customerAnalytics": false}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 챗봇 사용 통계 테이블
CREATE TABLE IF NOT EXISTS chatbot_usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    total_sessions INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    admin_sessions INTEGER DEFAULT 0,
    ai_requests_mistral INTEGER DEFAULT 0,
    ai_requests_claude INTEGER DEFAULT 0,
    avg_response_time_ms DECIMAL(10,2),
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_started_at ON chat_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_type ON chat_sessions(session_type);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender);
CREATE INDEX IF NOT EXISTS idx_chat_messages_ai_provider ON chat_messages(ai_provider);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_user_id ON ai_analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_type ON ai_analysis_results(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_generated_at ON ai_analysis_results(generated_at);

CREATE INDEX IF NOT EXISTS idx_chatbot_configs_user_id ON chatbot_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_configs_active ON chatbot_configs(is_active);

CREATE INDEX IF NOT EXISTS idx_usage_stats_date ON chatbot_usage_stats(date);

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 적용
CREATE TRIGGER update_chat_sessions_updated_at 
    BEFORE UPDATE ON chat_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbot_configs_updated_at 
    BEFORE UPDATE ON chatbot_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 보안 정책 (RLS - Row Level Security)
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_configs ENABLE ROW LEVEL SECURITY;

-- 채팅 세션 정책
CREATE POLICY "Users can view their own chat sessions" ON chat_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions" ON chat_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" ON chat_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- 채팅 메시지 정책  
CREATE POLICY "Users can view messages from their sessions" ON chat_messages
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM chat_sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in their sessions" ON chat_messages
    FOR INSERT WITH CHECK (
        session_id IN (
            SELECT id FROM chat_sessions WHERE user_id = auth.uid()
        )
    );

-- AI 분석 결과 정책
CREATE POLICY "Users can view their own analysis results" ON ai_analysis_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analysis results" ON ai_analysis_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 챗봇 설정 정책
CREATE POLICY "Users can view their own chatbot configs" ON chatbot_configs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own chatbot configs" ON chatbot_configs
    FOR ALL USING (auth.uid() = user_id);

-- 관리자 전용 정책 (통계 테이블)
CREATE POLICY "Only admins can view usage stats" ON chatbot_usage_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 초기 데이터 삽입 (기본 챗봇 설정)
INSERT INTO chatbot_configs (
    user_id, 
    config_name, 
    enabled_providers, 
    features
) 
SELECT 
    auth.uid(), 
    'Default Config', 
    ARRAY['mistral'], 
    '{"revenueAnalysis": false, "salesPrediction": false, "customerAnalytics": false}'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM chatbot_configs WHERE user_id = auth.uid()
);

-- 함수: 일일 사용 통계 업데이트
CREATE OR REPLACE FUNCTION update_daily_usage_stats()
RETURNS void AS $$
BEGIN
    INSERT INTO chatbot_usage_stats (
        date,
        total_sessions,
        total_messages,
        admin_sessions,
        ai_requests_mistral,
        ai_requests_claude,
        avg_response_time_ms,
        error_count
    )
    SELECT 
        CURRENT_DATE,
        COUNT(DISTINCT cs.id),
        COUNT(cm.id),
        COUNT(DISTINCT CASE WHEN cs.session_type = 'admin' THEN cs.id END),
        COUNT(CASE WHEN cm.ai_provider = 'mistral' THEN cm.id END),
        COUNT(CASE WHEN cm.ai_provider = 'claude' THEN cm.id END),
        AVG(cm.response_time_ms),
        COUNT(CASE WHEN cm.metadata->>'error' IS NOT NULL THEN cm.id END)
    FROM chat_sessions cs
    LEFT JOIN chat_messages cm ON cs.id = cm.session_id
    WHERE DATE(cs.created_at) = CURRENT_DATE
    ON CONFLICT (date) DO UPDATE SET
        total_sessions = EXCLUDED.total_sessions,
        total_messages = EXCLUDED.total_messages,
        admin_sessions = EXCLUDED.admin_sessions,
        ai_requests_mistral = EXCLUDED.ai_requests_mistral,
        ai_requests_claude = EXCLUDED.ai_requests_claude,
        avg_response_time_ms = EXCLUDED.avg_response_time_ms,
        error_count = EXCLUDED.error_count;
END;
$$ LANGUAGE plpgsql;

-- 댓글 및 설명
COMMENT ON TABLE chat_sessions IS 'AI 챗봇 대화 세션 정보';
COMMENT ON TABLE chat_messages IS 'AI 챗봇 대화 메시지';
COMMENT ON TABLE ai_analysis_results IS 'AI 분석 결과 저장';
COMMENT ON TABLE chatbot_configs IS '챗봇 설정 정보';
COMMENT ON TABLE chatbot_usage_stats IS '챗봇 사용 통계';

COMMENT ON COLUMN chat_sessions.session_type IS '세션 유형: user 또는 admin';
COMMENT ON COLUMN chat_sessions.context IS '세션 컨텍스트 데이터 (JSON)';
COMMENT ON COLUMN chat_sessions.channel_talk_id IS '채널톡 세션 ID';

COMMENT ON COLUMN chat_messages.sender IS '메시지 발신자: user, assistant, system';
COMMENT ON COLUMN chat_messages.tokens_used IS 'AI API 호출 시 사용된 토큰 수';
COMMENT ON COLUMN chat_messages.response_time_ms IS 'AI 응답 생성 시간 (밀리초)';

COMMENT ON COLUMN ai_analysis_results.analysis_type IS '분석 유형: revenue, customer, sales, trend';
COMMENT ON COLUMN ai_analysis_results.confidence_score IS 'AI 분석 신뢰도 (0.00-1.00)'; 