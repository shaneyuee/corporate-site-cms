const { Pool } = require('pg');
const { Client } = require('minio');
const sharp = require('sharp');
const { randomUUID } = require('crypto');

const TARGET_WIDTH = 1280;
const TARGET_HEIGHT = 720;
const bucket = process.env.MINIO_BUCKET || 'website-products';
const minioHost = process.env.MINIO_ENDPOINT || '81.71.32.222';
const minioPort = Number(process.env.MINIO_PORT || 9000);
const minioUseSSL = process.env.MINIO_USE_SSL === 'true';
const minioAccessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const minioSecretKey = process.env.MINIO_SECRET_KEY || 'minioadmin';
const minioPublicBase = (process.env.MINIO_PUBLIC_URL || `http://${minioHost}:${minioPort}`).replace(/\/$/, '');
const databaseUrl = process.env.DATABASE_URL || 'postgresql://website:website@81.71.32.222:5432/website?sslmode=disable';

const minioClient = new Client({
  endPoint: minioHost,
  port: minioPort,
  useSSL: minioUseSSL,
  accessKey: minioAccessKey,
  secretKey: minioSecretKey,
});

function buildPublicUrl(objectKey) {
  return `${minioPublicBase}/${bucket}/${objectKey}`;
}

async function reprocessImage(url) {
  const source = (url || '').trim();
  if (!source) return source;

  const response = await fetch(source);
  if (!response.ok) throw new Error(`Fetch failed ${response.status}`);
  const inputBuffer = Buffer.from(await response.arrayBuffer());

  const outputBuffer = await sharp(inputBuffer)
    .rotate()
    .resize(TARGET_WIDTH, TARGET_HEIGHT, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const objectKey = `products/migrated-16x9-${Date.now()}-${randomUUID()}.png`;
  await minioClient.putObject(bucket, objectKey, outputBuffer, outputBuffer.length, {
    'Content-Type': 'image/png',
  });

  return buildPublicUrl(objectKey);
}

async function main() {
  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  let productsTouched = 0;
  let imagesReprocessed = 0;
  let failures = 0;

  try {
    const hasBucket = await minioClient.bucketExists(bucket).catch(() => false);
    if (!hasBucket) await minioClient.makeBucket(bucket);

    const { rows } = await client.query('SELECT id, image, case_studies FROM products ORDER BY id');
    console.log(`Found ${rows.length} products`);

    for (const row of rows) {
      let changed = false;
      let nextImage = row.image || '';
      let nextCaseStudies = Array.isArray(row.case_studies) ? row.case_studies : [];

      if (nextImage) {
        try {
          nextImage = await reprocessImage(nextImage);
          imagesReprocessed += 1;
          changed = true;
        } catch (err) {
          failures += 1;
          console.warn(`Product ${row.id} main image failed: ${err.message}`);
        }
      }

      nextCaseStudies = await Promise.all(
        nextCaseStudies.map(async (item, index) => {
          if (!item || !item.image) return item;
          try {
            const nextUrl = await reprocessImage(item.image);
            imagesReprocessed += 1;
            changed = true;
            return { ...item, image: nextUrl };
          } catch (err) {
            failures += 1;
            console.warn(`Product ${row.id} case[${index}] image failed: ${err.message}`);
            return item;
          }
        }),
      );

      if (changed) {
        await client.query(
          `UPDATE products
             SET image = $2,
                 case_studies = $3::jsonb,
                 updated_at = NOW()
           WHERE id = $1`,
          [row.id, nextImage, JSON.stringify(nextCaseStudies)],
        );
        productsTouched += 1;
      }
    }

    console.log('--- Reprocess Summary ---');
    console.log(`Products updated: ${productsTouched}`);
    console.log(`Images reprocessed: ${imagesReprocessed}`);
    console.log(`Failures: ${failures}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
