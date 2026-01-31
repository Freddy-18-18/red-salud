#!/bin/bash

echo "🔧 Desinstalando Tailwind CSS 4 (beta)..."
npm uninstall tailwindcss @tailwindcss/postcss tw-animate-css

echo "📦 Instalando Tailwind CSS 3 (estable)..."
npm install -D tailwindcss@^3.4.0 postcss@^8.4.0 autoprefixer@^10.4.0 tailwindcss-animate@^1.0.7

echo "✅ Tailwind CSS actualizado a versión estable"
echo "🔄 Reinicia el servidor de desarrollo: npm run dev"
