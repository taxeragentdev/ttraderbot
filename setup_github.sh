#!/bin/bash

# SSH key oluştur
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N "" -C "taxeragentdev"

# SSH config'i ayarla
cat >> ~/.ssh/config <<EOF
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  StrictHostKeyChecking no
EOF

# Public key'i yazdır
echo ""
echo "===== PUBLIC KEY (GitHub'a ekle) ====="
cat ~/.ssh/id_ed25519.pub
echo "===== END PUBLIC KEY ====="
