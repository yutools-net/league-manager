/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // プロジェクトルートの index.html
    "./src/**/*.{js,ts,jsx,tsx}", // srcフォルダ内の全てのjs, ts, jsx, tsxファイル
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}