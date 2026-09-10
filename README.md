# Han Spoon · 한스푼

한국 여행자를 위한 식단 기반 메뉴 안내와 식당 발견 프론트엔드.

```bash
pnpm install
pnpm dev
```

개발 서버에서 `/home?demo=1&lang=ko`로 API 없는 시연을 시작하거나 `/dev/results-preview?lang=en`으로 결과 화면을 확인한다. 실제 API 모드의 개발 프록시는 localhost:8080을 사용한다.

```bash
pnpm build
node scripts/check-demo.mjs
git diff --check
```

제품·디자인·API 계약·시연 범위는 [docs/README.md](docs/README.md), 개발 규칙은 [AGENTS.md](AGENTS.md)를 참고한다. 식당·지도·환율·후기는 현재 데모 데이터다.
