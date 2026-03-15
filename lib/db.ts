import { promises as fs } from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import { LocalizedList, LocalizedText } from "@/lib/i18n";

const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD_HASH = "e21209ceae533bb785701385e32094d68972974a89787c4e65d6da882f8d8585";

type SiteSeed = {
  seed?: {
    products?: Array<{
      name: string;
      category: string;
      categoryI18n?: LocalizedText;
      summary: string;
      image: string;
      features: string[];
      nameI18n?: LocalizedText;
      summaryI18n?: LocalizedText;
      featuresI18n?: LocalizedList;
      videos?: string[];
      caseStudies?: Array<{
        title: LocalizedText;
        summary: LocalizedText;
        image: string;
      }>;
    }>;
    news?: Array<{
      title: string;
      titleI18n?: LocalizedText;
      date: string;
      summary: string;
      summaryI18n?: LocalizedText;
      content: string;
      contentI18n?: LocalizedText;
    }>;
    admins?: Array<{ username: string; passwordHash: string }>;
  };
  products?: Array<{
    name: string;
    category: string;
    categoryI18n?: LocalizedText;
    summary: string;
    image: string;
    features: string[];
    nameI18n?: LocalizedText;
    summaryI18n?: LocalizedText;
    featuresI18n?: LocalizedList;
    videos?: string[];
    caseStudies?: Array<{
      title: LocalizedText;
      summary: LocalizedText;
      image: string;
    }>;
  }>;
  news?: Array<{
    title: string;
    titleI18n?: LocalizedText;
    date: string;
    summary: string;
    summaryI18n?: LocalizedText;
    content: string;
    contentI18n?: LocalizedText;
  }>;
  admins?: Array<{ username: string; passwordHash: string }>;
};

export type ProductRecord = {
  id: number;
  name: string;
  category: string;
  categoryI18n: LocalizedText;
  summary: string;
  image: string;
  features: string[];
  nameI18n: LocalizedText;
  summaryI18n: LocalizedText;
  featuresI18n: LocalizedList;
  videos: string[];
  caseStudies: Array<{
    title: LocalizedText;
    summary: LocalizedText;
    image: string;
  }>;
};

export type ProductCaseStudy = {
  title: LocalizedText;
  summary: LocalizedText;
  image: string;
};

export type UserRecord = {
  id: number;
  username: string;
  passwordHash: string;
};

export type NewsRecord = {
  id: number;
  title: string;
  titleI18n: LocalizedText;
  date: string;
  summary: string;
  summaryI18n: LocalizedText;
  content: string;
  contentI18n: LocalizedText;
};

export type InquiryRecord = {
  id: number;
  name: string;
  phone: string;
  requirement: string;
  locale: string;
  isRead: boolean;
  createdAt: string;
};

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://website:website@127.0.0.1:5432/website?sslmode=disable";

declare global {
  var __websitePgPool: Pool | undefined;
  var __websitePgInitPromise: Promise<void> | undefined;
}

function getPool(): Pool {
  if (!globalThis.__websitePgPool) {
    globalThis.__websitePgPool = new Pool({
      connectionString,
    });
  }
  return globalThis.__websitePgPool;
}

async function readSeedData(): Promise<SiteSeed> {
  const filePath = path.join(process.cwd(), "data", "site.json");
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content) as SiteSeed;
}

async function seedProductsIfEmpty(pool: Pool): Promise<void> {
  const countResult = await pool.query<{ count: string }>("SELECT COUNT(*) AS count FROM products");
  const count = Number(countResult.rows[0]?.count ?? 0);
  if (count > 0) {
    return;
  }

  const seed = await readSeedData();
  const products = seed.seed?.products ?? seed.products ?? [];
  for (const item of products) {
    const categoryI18n = { zh: item.category, ...(item.categoryI18n ?? {}) };
    const nameI18n = { zh: item.name, ...(item.nameI18n ?? {}) };
    const summaryI18n = { zh: item.summary, ...(item.summaryI18n ?? {}) };
    const featuresI18n = { zh: item.features ?? [], ...(item.featuresI18n ?? {}) };

    await pool.query(
      `
      INSERT INTO products (name, category, summary, image, features, category_i18n, name_i18n, summary_i18n, features_i18n, videos, case_studies)
      VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8::jsonb, $9::jsonb, $10::jsonb, $11::jsonb)
      `,
      [
        item.name,
        item.category,
        item.summary,
        item.image,
        JSON.stringify(item.features ?? []),
        JSON.stringify(categoryI18n),
        JSON.stringify(nameI18n),
        JSON.stringify(summaryI18n),
        JSON.stringify(featuresI18n),
        JSON.stringify(item.videos ?? []),
        JSON.stringify(item.caseStudies ?? []),
      ],
    );
  }
}

async function seedAdminsIfEmpty(pool: Pool): Promise<void> {
  const seed = await readSeedData();
  const seededAdmins = seed.seed?.admins ?? seed.admins;
  const admins = seededAdmins && seededAdmins.length > 0
    ? seededAdmins
    : [{ username: DEFAULT_ADMIN_USERNAME, passwordHash: DEFAULT_ADMIN_PASSWORD_HASH }];

  for (const admin of admins) {
    await pool.query(
      `
      INSERT INTO users (username, password_hash)
      VALUES ($1, $2)
      ON CONFLICT (username) DO NOTHING
      `,
      [admin.username, admin.passwordHash],
    );
  }
}

async function seedNewsIfEmpty(pool: Pool): Promise<void> {
  const countResult = await pool.query<{ count: string }>("SELECT COUNT(*) AS count FROM news");
  const count = Number(countResult.rows[0]?.count ?? 0);
  if (count > 0) {
    return;
  }

  const seed = await readSeedData();
  const news = seed.seed?.news ?? seed.news ?? [];
  for (const item of news) {
    const titleI18n = { zh: item.title, ...(item.titleI18n ?? {}) };
    const summaryI18n = { zh: item.summary, ...(item.summaryI18n ?? {}) };
    const contentI18n = { zh: item.content, ...(item.contentI18n ?? {}) };

    await pool.query(
      `
      INSERT INTO news (title, title_i18n, date, summary, summary_i18n, content, content_i18n)
      VALUES ($1, $2::jsonb, $3, $4, $5::jsonb, $6, $7::jsonb)
      `,
      [item.title, JSON.stringify(titleI18n), item.date, item.summary, JSON.stringify(summaryI18n), item.content, JSON.stringify(contentI18n)],
    );
  }
}

export async function ensureDatabaseReady(): Promise<void> {
  if (!globalThis.__websitePgInitPromise) {
    globalThis.__websitePgInitPromise = (async () => {
      const pool = getPool();

      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(255) NOT NULL,
          category_i18n JSONB NOT NULL DEFAULT '{}'::jsonb,
          summary TEXT NOT NULL,
          image TEXT NOT NULL DEFAULT '',
          features JSONB NOT NULL DEFAULT '[]'::jsonb,
          name_i18n JSONB NOT NULL DEFAULT '{}'::jsonb,
          summary_i18n JSONB NOT NULL DEFAULT '{}'::jsonb,
          features_i18n JSONB NOT NULL DEFAULT '{}'::jsonb,
          videos JSONB NOT NULL DEFAULT '[]'::jsonb,
          case_studies JSONB NOT NULL DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS name_i18n JSONB NOT NULL DEFAULT '{}'::jsonb`);
      await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS category_i18n JSONB NOT NULL DEFAULT '{}'::jsonb`);
      await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS summary_i18n JSONB NOT NULL DEFAULT '{}'::jsonb`);
      await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS features_i18n JSONB NOT NULL DEFAULT '{}'::jsonb`);
      await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS videos JSONB NOT NULL DEFAULT '[]'::jsonb`);
      await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS case_studies JSONB NOT NULL DEFAULT '[]'::jsonb`);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS news (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          title_i18n JSONB NOT NULL DEFAULT '{}'::jsonb,
          date VARCHAR(20) NOT NULL,
          summary TEXT NOT NULL,
          summary_i18n JSONB NOT NULL DEFAULT '{}'::jsonb,
          content TEXT NOT NULL,
          content_i18n JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await pool.query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS title_i18n JSONB NOT NULL DEFAULT '{}'::jsonb`);
      await pool.query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS summary_i18n JSONB NOT NULL DEFAULT '{}'::jsonb`);
      await pool.query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS content_i18n JSONB NOT NULL DEFAULT '{}'::jsonb`);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS inquiries (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(100) NOT NULL,
          requirement TEXT NOT NULL,
          locale VARCHAR(10) NOT NULL DEFAULT 'zh',
          is_read BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await pool.query(`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS locale VARCHAR(10) NOT NULL DEFAULT 'zh'`);
      await pool.query(`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE`);

      await seedAdminsIfEmpty(pool);
      await seedProductsIfEmpty(pool);
      await seedNewsIfEmpty(pool);
    })();
  }

  await globalThis.__websitePgInitPromise;
}

function mapProductRow(row: {
  id: number;
  name: string;
  category: string;
  category_i18n: unknown;
  summary: string;
  image: string;
  features: unknown;
  name_i18n: unknown;
  summary_i18n: unknown;
  features_i18n: unknown;
  videos: unknown;
  case_studies: unknown;
}): ProductRecord {
  const categoryI18n = (typeof row.category_i18n === "object" && row.category_i18n)
    ? (row.category_i18n as LocalizedText)
    : {};
  const nameI18n = (typeof row.name_i18n === "object" && row.name_i18n) ? (row.name_i18n as LocalizedText) : {};
  const summaryI18n = (typeof row.summary_i18n === "object" && row.summary_i18n) ? (row.summary_i18n as LocalizedText) : {};
  const featuresI18n = (typeof row.features_i18n === "object" && row.features_i18n) ? (row.features_i18n as LocalizedList) : {};
  const videos = Array.isArray(row.videos) ? (row.videos as string[]) : [];
  const caseStudies = Array.isArray(row.case_studies)
    ? (row.case_studies as Array<{ title: LocalizedText; summary: LocalizedText; image: string }>)
    : [];

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    categoryI18n: { zh: row.category, ...categoryI18n },
    summary: row.summary,
    image: row.image,
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    nameI18n: { zh: row.name, ...nameI18n },
    summaryI18n: { zh: row.summary, ...summaryI18n },
    featuresI18n: { zh: Array.isArray(row.features) ? (row.features as string[]) : [], ...featuresI18n },
    videos,
    caseStudies,
  };
}

export async function listProducts(): Promise<ProductRecord[]> {
  await ensureDatabaseReady();
  const pool = getPool();
  const result = await pool.query<{
    id: number;
    name: string;
    category: string;
    category_i18n: unknown;
    summary: string;
    image: string;
    features: unknown;
    name_i18n: unknown;
    summary_i18n: unknown;
    features_i18n: unknown;
    videos: unknown;
    case_studies: unknown;
  }>(
    `
    SELECT id, name, category, category_i18n, summary, image, features, name_i18n, summary_i18n, features_i18n, videos, case_studies
    FROM products
    ORDER BY id DESC
    `,
  );

  return result.rows.map(mapProductRow);
}

export async function createProduct(input: {
  name: string;
  category: string;
  categoryI18n?: LocalizedText;
  summary: string;
  image: string;
  features: string[];
  nameI18n?: LocalizedText;
  summaryI18n?: LocalizedText;
  featuresI18n?: LocalizedList;
  videos?: string[];
  caseStudies?: Array<{ title: LocalizedText; summary: LocalizedText; image: string }>;
}): Promise<ProductRecord> {
  await ensureDatabaseReady();
  const pool = getPool();
  const result = await pool.query<{
    id: number;
    name: string;
    category: string;
    category_i18n: unknown;
    summary: string;
    image: string;
    features: unknown;
    name_i18n: unknown;
    summary_i18n: unknown;
    features_i18n: unknown;
    videos: unknown;
    case_studies: unknown;
  }>(
    `
    INSERT INTO products (name, category, category_i18n, summary, image, features, name_i18n, summary_i18n, features_i18n, videos, case_studies)
    VALUES ($1, $2, $3::jsonb, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, $9::jsonb, $10::jsonb, $11::jsonb)
    RETURNING id, name, category, category_i18n, summary, image, features, name_i18n, summary_i18n, features_i18n, videos, case_studies
    `,
    [
      input.name,
      input.category,
      JSON.stringify({ zh: input.category, ...(input.categoryI18n ?? {}) }),
      input.summary,
      input.image,
      JSON.stringify(input.features ?? []),
      JSON.stringify({ zh: input.name, ...(input.nameI18n ?? {}) }),
      JSON.stringify({ zh: input.summary, ...(input.summaryI18n ?? {}) }),
      JSON.stringify({ zh: input.features ?? [], ...(input.featuresI18n ?? {}) }),
      JSON.stringify(input.videos ?? []),
      JSON.stringify(input.caseStudies ?? []),
    ],
  );

  return mapProductRow(result.rows[0]);
}

export async function updateProduct(
  id: number,
  input: {
    name: string;
    category: string;
    categoryI18n?: LocalizedText;
    summary: string;
    image: string;
    features: string[];
    nameI18n?: LocalizedText;
    summaryI18n?: LocalizedText;
    featuresI18n?: LocalizedList;
    videos?: string[];
    caseStudies?: Array<{ title: LocalizedText; summary: LocalizedText; image: string }>;
  },
): Promise<ProductRecord | null> {
  await ensureDatabaseReady();
  const pool = getPool();
  const result = await pool.query<{
    id: number;
    name: string;
    category: string;
    category_i18n: unknown;
    summary: string;
    image: string;
    features: unknown;
    name_i18n: unknown;
    summary_i18n: unknown;
    features_i18n: unknown;
    videos: unknown;
    case_studies: unknown;
  }>(
    `
    UPDATE products
    SET name = $2,
        category = $3,
        category_i18n = $4::jsonb,
        summary = $5,
        image = $6,
        features = $7::jsonb,
        name_i18n = $8::jsonb,
        summary_i18n = $9::jsonb,
        features_i18n = $10::jsonb,
        videos = $11::jsonb,
        case_studies = $12::jsonb,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, name, category, category_i18n, summary, image, features, name_i18n, summary_i18n, features_i18n, videos, case_studies
    `,
    [
      id,
      input.name,
      input.category,
      JSON.stringify({ zh: input.category, ...(input.categoryI18n ?? {}) }),
      input.summary,
      input.image,
      JSON.stringify(input.features ?? []),
      JSON.stringify({ zh: input.name, ...(input.nameI18n ?? {}) }),
      JSON.stringify({ zh: input.summary, ...(input.summaryI18n ?? {}) }),
      JSON.stringify({ zh: input.features ?? [], ...(input.featuresI18n ?? {}) }),
      JSON.stringify(input.videos ?? []),
      JSON.stringify(input.caseStudies ?? []),
    ],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapProductRow(result.rows[0]);
}

export async function updateProductCaseStudies(id: number, caseStudies: ProductCaseStudy[]): Promise<ProductRecord | null> {
  await ensureDatabaseReady();
  const pool = getPool();
  const result = await pool.query<{
    id: number;
    name: string;
    category: string;
    category_i18n: unknown;
    summary: string;
    image: string;
    features: unknown;
    name_i18n: unknown;
    summary_i18n: unknown;
    features_i18n: unknown;
    videos: unknown;
    case_studies: unknown;
  }>(
    `
    UPDATE products
    SET case_studies = $2::jsonb,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, name, category, category_i18n, summary, image, features, name_i18n, summary_i18n, features_i18n, videos, case_studies
    `,
    [id, JSON.stringify(caseStudies ?? [])],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapProductRow(result.rows[0]);
}

export async function deleteProduct(id: number): Promise<ProductRecord | null> {
  await ensureDatabaseReady();
  const pool = getPool();
  const result = await pool.query<{
    id: number;
    name: string;
    category: string;
    category_i18n: unknown;
    summary: string;
    image: string;
    features: unknown;
    name_i18n: unknown;
    summary_i18n: unknown;
    features_i18n: unknown;
    videos: unknown;
    case_studies: unknown;
  }>(
    `
    DELETE FROM products
    WHERE id = $1
    RETURNING id, name, category, category_i18n, summary, image, features, name_i18n, summary_i18n, features_i18n, videos, case_studies
    `,
    [id],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapProductRow(result.rows[0]);
}

export async function countProducts(): Promise<number> {
  await ensureDatabaseReady();
  const pool = getPool();
  const result = await pool.query<{ count: string }>("SELECT COUNT(*) AS count FROM products");
  return Number(result.rows[0]?.count ?? 0);
}

export async function findUserByUsername(username: string): Promise<UserRecord | null> {
  await ensureDatabaseReady();
  const pool = getPool();
  const result = await pool.query<{
    id: number;
    username: string;
    password_hash: string;
  }>(
    `
    SELECT id, username, password_hash
    FROM users
    WHERE username = $1
    LIMIT 1
    `,
    [username],
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
  };
}

function mapNewsRow(row: {
  id: number;
  title: string;
  title_i18n: unknown;
  date: string;
  summary: string;
  summary_i18n: unknown;
  content: string;
  content_i18n: unknown;
}): NewsRecord {
  const titleI18n = (typeof row.title_i18n === "object" && row.title_i18n) ? (row.title_i18n as LocalizedText) : {};
  const summaryI18n = (typeof row.summary_i18n === "object" && row.summary_i18n) ? (row.summary_i18n as LocalizedText) : {};
  const contentI18n = (typeof row.content_i18n === "object" && row.content_i18n) ? (row.content_i18n as LocalizedText) : {};

  return {
    id: row.id,
    title: row.title,
    titleI18n: { zh: row.title, ...titleI18n },
    date: row.date,
    summary: row.summary,
    summaryI18n: { zh: row.summary, ...summaryI18n },
    content: row.content,
    contentI18n: { zh: row.content, ...contentI18n },
  };
}

export async function listNews(): Promise<NewsRecord[]> {
  await ensureDatabaseReady();
  const pool = getPool();
  const result = await pool.query<{
    id: number;
    title: string;
    title_i18n: unknown;
    date: string;
    summary: string;
    summary_i18n: unknown;
    content: string;
    content_i18n: unknown;
  }>(
    `
    SELECT id, title, title_i18n, date, summary, summary_i18n, content, content_i18n
    FROM news
    ORDER BY id DESC
    `,
  );

  return result.rows.map(mapNewsRow);
}

export async function createNews(input: {
  title: string;
  titleI18n?: LocalizedText;
  date: string;
  summary: string;
  summaryI18n?: LocalizedText;
  content: string;
  contentI18n?: LocalizedText;
}): Promise<NewsRecord> {
  await ensureDatabaseReady();
  const pool = getPool();
  const result = await pool.query<{
    id: number;
    title: string;
    title_i18n: unknown;
    date: string;
    summary: string;
    summary_i18n: unknown;
    content: string;
    content_i18n: unknown;
  }>(
    `
    INSERT INTO news (title, title_i18n, date, summary, summary_i18n, content, content_i18n)
    VALUES ($1, $2::jsonb, $3, $4, $5::jsonb, $6, $7::jsonb)
    RETURNING id, title, title_i18n, date, summary, summary_i18n, content, content_i18n
    `,
    [
      input.title,
      JSON.stringify({ zh: input.title, ...(input.titleI18n ?? {}) }),
      input.date,
      input.summary,
      JSON.stringify({ zh: input.summary, ...(input.summaryI18n ?? {}) }),
      input.content,
      JSON.stringify({ zh: input.content, ...(input.contentI18n ?? {}) }),
    ],
  );

  return mapNewsRow(result.rows[0]);
}

export async function updateNews(
  id: number,
  input: {
    title: string;
    titleI18n?: LocalizedText;
    date: string;
    summary: string;
    summaryI18n?: LocalizedText;
    content: string;
    contentI18n?: LocalizedText;
  },
): Promise<NewsRecord | null> {
  await ensureDatabaseReady();
  const pool = getPool();
  const result = await pool.query<{
    id: number;
    title: string;
    title_i18n: unknown;
    date: string;
    summary: string;
    summary_i18n: unknown;
    content: string;
    content_i18n: unknown;
  }>(
    `
    UPDATE news
    SET title = $2,
        title_i18n = COALESCE(title_i18n, '{}'::jsonb) || jsonb_build_object('zh', $2) || COALESCE($6::jsonb, '{}'::jsonb),
        date = $3,
        summary = $4,
        summary_i18n = COALESCE(summary_i18n, '{}'::jsonb) || jsonb_build_object('zh', $4) || COALESCE($7::jsonb, '{}'::jsonb),
        content = $5,
        content_i18n = COALESCE(content_i18n, '{}'::jsonb) || jsonb_build_object('zh', $5) || COALESCE($8::jsonb, '{}'::jsonb),
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, title, title_i18n, date, summary, summary_i18n, content, content_i18n
    `,
    [
      id,
      input.title,
      input.date,
      input.summary,
      input.content,
      input.titleI18n ? JSON.stringify(input.titleI18n) : null,
      input.summaryI18n ? JSON.stringify(input.summaryI18n) : null,
      input.contentI18n ? JSON.stringify(input.contentI18n) : null,
    ],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapNewsRow(result.rows[0]);
}

export async function deleteNews(id: number): Promise<NewsRecord | null> {
  await ensureDatabaseReady();
  const pool = getPool();
  const result = await pool.query<{
    id: number;
    title: string;
    title_i18n: unknown;
    date: string;
    summary: string;
    summary_i18n: unknown;
    content: string;
    content_i18n: unknown;
  }>(
    `
    DELETE FROM news
    WHERE id = $1
    RETURNING id, title, title_i18n, date, summary, summary_i18n, content, content_i18n
    `,
    [id],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapNewsRow(result.rows[0]);
}

export async function countNews(): Promise<number> {
  await ensureDatabaseReady();
  const pool = getPool();
  const result = await pool.query<{ count: string }>("SELECT COUNT(*) AS count FROM news");
  return Number(result.rows[0]?.count ?? 0);
}

function mapInquiryRow(row: {
  id: number;
  name: string;
  phone: string;
  requirement: string;
  locale: string;
  is_read: boolean;
  created_at: string;
}): InquiryRecord {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    requirement: row.requirement,
    locale: row.locale,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

export async function listInquiries(): Promise<InquiryRecord[]> {
  await ensureDatabaseReady();
  const pool = getPool();
  const result = await pool.query<{
    id: number;
    name: string;
    phone: string;
    requirement: string;
    locale: string;
    is_read: boolean;
    created_at: string;
  }>(
    `
    SELECT id, name, phone, requirement, locale, is_read, created_at
    FROM inquiries
    ORDER BY is_read ASC, created_at DESC
    `,
  );

  return result.rows.map(mapInquiryRow);
}

export async function createInquiry(input: {
  name: string;
  phone: string;
  requirement: string;
  locale?: string;
}): Promise<InquiryRecord> {
  await ensureDatabaseReady();
  const pool = getPool();
  const result = await pool.query<{
    id: number;
    name: string;
    phone: string;
    requirement: string;
    locale: string;
    is_read: boolean;
    created_at: string;
  }>(
    `
    INSERT INTO inquiries (name, phone, requirement, locale)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, phone, requirement, locale, is_read, created_at
    `,
    [input.name, input.phone, input.requirement, input.locale ?? "zh"],
  );

  return mapInquiryRow(result.rows[0]);
}

export async function markInquiryAsRead(id: number): Promise<InquiryRecord | null> {
  await ensureDatabaseReady();
  const pool = getPool();
  const result = await pool.query<{
    id: number;
    name: string;
    phone: string;
    requirement: string;
    locale: string;
    is_read: boolean;
    created_at: string;
  }>(
    `
    UPDATE inquiries
    SET is_read = TRUE
    WHERE id = $1
    RETURNING id, name, phone, requirement, locale, is_read, created_at
    `,
    [id],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapInquiryRow(result.rows[0]);
}

export async function countUnreadInquiries(): Promise<number> {
  await ensureDatabaseReady();
  const pool = getPool();
  const result = await pool.query<{ count: string }>("SELECT COUNT(*) AS count FROM inquiries WHERE is_read = FALSE");
  return Number(result.rows[0]?.count ?? 0);
}
