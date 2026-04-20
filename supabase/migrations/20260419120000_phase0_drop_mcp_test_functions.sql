-- Phase 0 hardening: remove leftover MCP test functions
-- These were likely created during earlier MCP experiments and have mutable search_path.

DROP FUNCTION IF EXISTS public.__mcp_exec_test2();
DROP FUNCTION IF EXISTS public.__mcp_test_plpgsql();
