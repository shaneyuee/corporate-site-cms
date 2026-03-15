#!/usr/bin/env bash
set -euo pipefail

REMOTE_HOST="${1:-${DEPLOY_REMOTE_HOST:-}}"
REMOTE_DIR="${2:-${DEPLOY_REMOTE_DIR:-/root/website}}"

if [[ -z "$REMOTE_HOST" ]]; then
  echo "[ERROR] 请提供远端主机，例如: bash scripts/backfill-news-i18n.sh root@81.71.32.222"
  echo "[TIP] 也可以设置环境变量 DEPLOY_REMOTE_HOST"
  exit 1
fi

echo "[INFO] 在远端执行 news i18n 回填: $REMOTE_HOST ($REMOTE_DIR)"

ssh "$REMOTE_HOST" "cd '$REMOTE_DIR' && \
  CONTAINER=\
\$(docker ps --format '{{.Names}}' | grep -E '^website_postgres(_1)?$' | head -n 1); \
  if [[ -z \"\$CONTAINER\" ]]; then echo '[ERROR] 未找到 postgres 容器'; exit 1; fi; \
  docker exec -i \"\$CONTAINER\" psql -U website -d website <<'SQL'
ALTER TABLE news ADD COLUMN IF NOT EXISTS title_i18n JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE news ADD COLUMN IF NOT EXISTS summary_i18n JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE news ADD COLUMN IF NOT EXISTS content_i18n JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE news
SET
  title_i18n = COALESCE(title_i18n, '{}'::jsonb)
    || jsonb_build_object('zh', title)
    || CASE title
      WHEN '华辰工业新产线交付华南客户' THEN jsonb_build_object('en','Huachen Delivers New Production Line to South China Client','ja','華辰工業、華南顧客向け新ラインを納入','ko','화천공업, 화남 고객사에 신규 생산라인 납품')
      WHEN '公司通过智能制造能力再认证' THEN jsonb_build_object('en','Company Passes Smart Manufacturing Capability Re-Certification','ja','スマート製造能力の再認証を取得','ko','스마트 제조 역량 재인증 통과')
      WHEN '华辰工业亮相华东工业展' THEN jsonb_build_object('en','Huachen Appears at East China Industrial Expo','ja','華辰工業、華東工業展示会に出展','ko','화천공업, 화동 산업 전시회 참가')
      ELSE '{}'::jsonb
    END,
  summary_i18n = COALESCE(summary_i18n, '{}'::jsonb)
    || jsonb_build_object('zh', summary)
    || CASE title
      WHEN '华辰工业新产线交付华南客户' THEN jsonb_build_object('en','The integrated automation line for cleaning and conveying is now in operation, increasing capacity by 30%.','ja','自動洗浄・搬送一体ラインが稼働し、生産能力が30%向上しました。','ko','자동 세정·이송 통합 라인이 가동되어 생산능력이 30% 향상되었습니다.')
      WHEN '公司通过智能制造能力再认证' THEN jsonb_build_object('en','We continue to strengthen digital capabilities across R&D, production, delivery, and service.','ja','研究開発・生産・納入・サービスの各段階でデジタル能力を継続的に強化しています。','ko','R&D, 생산, 납품, 서비스 전 과정에서 디지털 역량을 지속적으로 강화하고 있습니다.')
      WHEN '华辰工业亮相华东工业展' THEN jsonb_build_object('en','The company showcased cleaning equipment and environmental solutions, attracting strong interest from manufacturers.','ja','洗浄設備と環境対応ソリューションを展示し、多くの製造企業から注目を集めました。','ko','세정 장비와 환경 솔루션을 선보여 다수 제조기업의 관심을 받았습니다.')
      ELSE '{}'::jsonb
    END,
  content_i18n = COALESCE(content_i18n, '{}'::jsonb)
    || jsonb_build_object('zh', content)
    || CASE title
      WHEN '华辰工业新产线交付华南客户' THEN jsonb_build_object('en','This project covered key stages including cleaning, drying, conveying, and inspection, helping the customer achieve efficient and stable production.','ja','本プロジェクトは洗浄・乾燥・搬送・検査などの主要工程をカバーし、顧客の高効率かつ安定した生産を実現しました。','ko','이번 프로젝트는 세정, 건조, 이송, 검사 등 핵심 공정을 포함하여 고객사의 고효율·안정 생산을 지원했습니다.')
      WHEN '公司通过智能制造能力再认证' THEN jsonb_build_object('en','Huachen keeps investing in R&D and process optimization to improve both product quality and delivery efficiency.','ja','華辰工業は研究開発とプロセス最適化への投資を継続し、品質と納入効率の双方を向上させています。','ko','화천공업은 연구개발과 공정 최적화에 지속 투자하여 제품 품질과 납품 효율을 함께 개선하고 있습니다.')
      WHEN '华辰工业亮相华东工业展' THEN jsonb_build_object('en','During the expo, Huachen reached cooperation intentions with multiple clients to jointly advance smart manufacturing upgrades.','ja','展示会期間中、華辰工業は複数の顧客と協業意向を確認し、スマート製造の高度化を共同で推進しました。','ko','전시회 기간 동안 화천공업은 여러 고객사와 협력 의향을 확인하고 스마트 제조 고도화를 함께 추진했습니다.')
      ELSE '{}'::jsonb
    END;
SQL"

echo "[DONE] news i18n 回填完成。"