# Node + 開発ツール入りの公式DevContainerベース
FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

# ワークディレクトリ
WORKDIR /workspaces/${LOCAL_WORKSPACE_FOLDER_BASENAME:-app}

# 追加パッケージが必要ならここで（例: git, curl, fonts 等）
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     git ca-certificates && rm -rf /var/lib/apt/lists/*
