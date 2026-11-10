import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function devApiPlugin() {
  return {
    name: "dev-api-plugin",
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === "/api/create-checkout" && req.method === "POST") {
          let bodyStr = "";
          req.on("data", (chunk: any) => { bodyStr += chunk; });
          req.on("end", async () => {
            try {
              const body = JSON.parse(bodyStr || "{}");
              const apiKey = process.env.VITE_BACHS_API_KEY || "sk_sandbox_9f8fb85e_zfe4AAk2KQqAPiqlB8gA6d4vNua8k5ATdaBRsdBfkEw";
              const baseUrl = apiKey.startsWith("sk_live_")
                ? "https://api.bachs.io/v1"
                : "https://sandbox-api.bachs.io/v1";

              const formattedAmount = Number(body.amount).toFixed(2);
              const payload = {
                pricing: {
                  amount: formattedAmount,
                  currency: body.currency || "NGN",
                },
                customer: {
                  email: body.email,
                  name: body.name || "Student",
                  ...(body.phone ? { phone: body.phone } : {}),
                },
                reference: body.reference || `GFX-${Date.now()}`,
                metadata: body.metadata || {},
              };

              const apiRes = await fetch(`${baseUrl}/checkout-sessions`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${apiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              });

              const data = await apiRes.json();
              res.statusCode = apiRes.status;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(data));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ message: err.message }));
            }
          });
        } else {
          next();
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile(), devApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
