import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { generateOpenGraphImage } from 'astro-og-canvas';

const projectRoot = process.cwd();
const postsDir = path.join(projectRoot, 'src/data/blog-posts');
const outputDir = path.join(projectRoot, 'public/open-graph');

const staticPages = [
  {
    route: 'home',
    title: 'Joe Hsu',
    description: 'Posts on software engineering, product, and building at GetWhys.',
  },
  {
    route: 'about',
    title: 'About',
    description: 'About Joe Hsu, software engineer at GetWhys.',
  },
  {
    route: 'blog',
    title: 'Blog',
    description: 'Latest articles.',
  },
];

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const data = {};
  for (const rawLine of match[1].split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const splitIndex = line.indexOf(':');
    if (splitIndex === -1) continue;

    const key = line.slice(0, splitIndex).trim();
    const value = line.slice(splitIndex + 1).trim().replace(/^['\"]|['\"]$/g, '');
    data[key] = value;
  }

  return data;
}

async function getPostPages() {
  const files = await readdir(postsDir);
  const markdownFiles = files.filter((file) => file.endsWith('.md'));
  const pages = [];

  for (const file of markdownFiles) {
    const raw = await readFile(path.join(postsDir, file), 'utf-8');
    const frontmatter = parseFrontmatter(raw);
    if (!frontmatter.slug || !frontmatter.title) continue;

    pages.push({
      route: `blog/${frontmatter.slug}`,
      title: frontmatter.title,
      description: frontmatter.description ?? 'Read the full post on Joe Hsu\'s blog.',
    });
  }

  return pages;
}

function toBuffer(image) {
  if (Buffer.isBuffer(image)) return image;
  if (image instanceof Uint8Array) return Buffer.from(image);
  if (image instanceof ArrayBuffer) return Buffer.from(image);
  if (typeof image === 'string') return Buffer.from(image);
  return Buffer.from([]);
}

async function generateImage(page) {
  const body = await generateOpenGraphImage({
    title: page.title,
    description: page.description,
    logo: {
      path: './public/assets/profile.png',
      size: [104, 104],
    },
    bgGradient: [
      [242, 241, 238],
      [214, 202, 176],
    ],
    border: {
      color: [138, 106, 66],
      width: 14,
      side: 'block-end',
    },
    padding: 68,
    font: {
      title: {
        color: [35, 34, 32],
        size: 82,
        lineHeight: 1.02,
        weight: 'Bold',
      },
      description: {
        color: [102, 100, 94],
        size: 31,
        lineHeight: 1.25,
      },
    },
  });

  const filePath = path.join(outputDir, `${page.route}.png`);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, toBuffer(body));
}

const postPages = await getPostPages();
const pages = [...staticPages, ...postPages];

await Promise.all(pages.map((page) => generateImage(page)));
