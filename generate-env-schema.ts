import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function generateEnvSchema(envFilePath = ".env", outputPath = "src/env.ts") {
  try {
    // Read .env file
    const envContent = fs.readFileSync(envFilePath, "utf8");

    // Parse environment variables
    const envVars = [];
    const lines = envContent.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith("#")) continue;

      // Extract variable name (before the = sign)
      const equalIndex = trimmed.indexOf("=");
      if (equalIndex > 0) {
        const varName = trimmed.substring(0, equalIndex).trim();
        envVars.push(varName);
      }
    }

    // Generate the schema file content
    const schemaContent = `import "dotenv/config";
  import { z } from "zod";
  
  const envSchema = z.object({
  ${envVars.map((varName) => `  ${varName}: z.string(),`).join("\n")}
  });
  
  export const env = envSchema.parse(process.env);
  `;

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the schema file
    fs.writeFileSync(outputPath, schemaContent);
    execSync(`bunx prettier --write "${outputPath}"`, { stdio: "inherit" });
    console.log(`✅ Generated env schema at ${outputPath}`);
    console.log(`📝 Found ${envVars.length} environment variables:`);
    envVars.forEach((varName) => console.log(`   - ${varName}`));
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error generating env schema:", error.message);
    }
    process.exit(1);
  }
}

generateEnvSchema();
