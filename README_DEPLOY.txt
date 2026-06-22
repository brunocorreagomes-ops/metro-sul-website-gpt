METRO SUL — DEPLOY NOTES

1. Upload the extracted files to the root of the GitHub repository.
2. Keep the file named CNAME with this exact content:
   www.metrosulofficial.com
3. In GitHub: Settings > Pages > Deploy from a branch > main > /root.
4. In Hostinger DNS:
   A       @       185.199.108.153
   A       @       185.199.109.153
   A       @       185.199.110.153
   A       @       185.199.111.153
   CNAME   www     YOUR-GITHUB-USERNAME.github.io
5. Wait for DNS propagation.
6. In GitHub Pages, enable Enforce HTTPS when available.
7. Replace Google Analytics and Meta Pixel placeholders in index.html when you have the real IDs.
