# Cora 주사위 굴리기

D4, D6, D8, D10, D12, D20, D100 주사위를 한 번에 굴리고 결과와 합계를 확인하는 한국어 랜덤 서비스입니다.

- 운영 주소: https://dice.cora1022.com
- 기술: 순수 HTML, CSS, JavaScript
- 난수: `crypto.getRandomValues()`
- 배포: Netlify `dist` 자동 배포

## 로컬 검증

```powershell
npm ci
npm test
npm run build
python -m http.server 4173 --directory dist
```

