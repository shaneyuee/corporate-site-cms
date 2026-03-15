CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  date VARCHAR(20) NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO users (username, password_hash)
VALUES ('admin', 'e21209ceae533bb785701385e32094d68972974a89787c4e65d6da882f8d8585')
ON CONFLICT (username) DO NOTHING;

INSERT INTO news (title, date, summary, content)
SELECT * FROM (
  VALUES
    ('华辰工业新产线交付华南客户', '2026-01-15', '自动化清洗与输送一体化产线成功投运，产能提升30%。', '本次项目覆盖清洗、烘干、输送、检测等关键环节，帮助客户实现高效稳定生产。'),
    ('公司通过智能制造能力再认证', '2025-12-08', '在研发、生产、交付与服务环节持续强化数字化能力。', '华辰工业持续投入研发与流程优化，推动产品质量与交付效率双提升。'),
    ('华辰工业亮相华东工业展', '2025-11-20', '展示清洗设备与环保配套方案，获多家制造企业关注。', '展会期间，华辰工业与多家客户达成合作意向，共同推进智能制造升级。')
) AS seed(title, date, summary, content)
WHERE NOT EXISTS (SELECT 1 FROM news);
