import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	base: "./",
	plugins: [react()],
	server: {
		proxy: {
			"/api-deepl": {
				target: "https://api.deepl.com",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api-deepl/, ""),
			},
		},
	},
});
