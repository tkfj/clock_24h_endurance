# ---------- 1) ベース ----------
FROM node:22-bookworm-slim AS base
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# ---------- 2) 依存解決（devDeps 含む） ----------
# Nextのビルドは TypeScript/Tailwind 等のdevDependenciesを使うため、ビルド段階では dev も入れる
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
# 可能なら npm ci を使う（lockfile 必須）
RUN npm ci

# ---------- 3) ビルド ----------
FROM deps AS builder
WORKDIR /app
COPY . .
# 例：環境変数をビルド時に渡す場合（必要に応じて）
# ARG NEXT_PUBLIC_API_BASE
# ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
RUN npm run build

# ---------- 4) ランナー（本番最小） ----------
# distroless でもOKだが、まずはデバッグしやすい node:slim を採用
FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app

# セキュリティ：非rootで実行
RUN useradd -m nextjs
USER nextjs

# Next の standalone 出力をコピー
# .next/standalone には最小限の node_modules と server.js が含まれる
COPY --chown=nextjs:nextjs --from=builder /app/.next/standalone ./ 
# 静的アセットを配置
COPY --chown=nextjs:nextjs --from=builder /app/.next/static ./ .next/static
COPY --chown=nextjs:nextjs --from=builder /app/public ./ public

EXPOSE 3000
# 任意のヘルスチェック（/health を実装していない場合はコメントアウト）
# HEALTHCHECK --interval=30s --timeout=3s CMD node -e "process.exit(0)"

# standalone のエントリ（server.js）は /app/server.js に配置される
CMD ["node", "server.js"]
