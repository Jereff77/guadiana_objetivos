-- ============================================================================
-- Migración: Trazabilidad de invocaciones de herramientas en el chat de IA
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_tool_invocations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  user_message_id UUID REFERENCES ai_chat_messages(id) ON DELETE SET NULL,
  tool_name       TEXT NOT NULL,
  tool_input      JSONB,
  tool_result     JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tool_invocations_session
  ON ai_tool_invocations (session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tool_invocations_user_msg
  ON ai_tool_invocations (user_message_id);

ALTER TABLE ai_tool_invocations ENABLE ROW LEVEL SECURITY;

-- El usuario ve solo las invocaciones de sus sesiones
CREATE POLICY "tool_invocations_own" ON ai_tool_invocations
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM ai_chat_sessions WHERE user_id = auth.uid()
    )
  );

-- Service role: acceso completo (para insertar desde sendChatMessage)
CREATE POLICY "tool_invocations_service" ON ai_tool_invocations
  FOR ALL USING (auth.role() = 'service_role');
