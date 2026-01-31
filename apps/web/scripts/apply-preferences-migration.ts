import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log("📦 Reading migration file...");
    const migrationPath = path.join(
      process.cwd(),
      "supabase",
      "migrations",
      "20241110000001_create_user_preferences_table.sql"
    );
    
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");
    
    console.log("🚀 Applying migration...");
    const { error } = await supabase.rpc("exec_sql", { sql: migrationSQL });
    
    if (error) {
      console.error("❌ Error applying migration:", error);
      process.exit(1);
    }
    
    console.log("✅ Migration applied successfully!");
    console.log("📊 Verifying table creation...");
    
    const { data, error: verifyError } = await supabase
      .from("user_preferences")
      .select("count")
      .limit(1);
    
    if (verifyError) {
      console.error("❌ Error verifying table:", verifyError);
      process.exit(1);
    }
    
    console.log("✅ Table verified successfully!");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

applyMigration();
