import { NextRequest, NextResponse } from 'next/server';

interface BookResult {
  id: string;
  title: string;
  author: string | null;
  publisher: string | null;
  totalPages: number | null;
  coverUrl: string | null;
  isbn: string | null;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q) {
    return NextResponse.json({ data: [] });
  }

  // ISBN 検索 → OpenBD で直接引き
  if (/^[0-9]{10,13}$/.test(q)) {
    const result = await fetchOpenBD(q);
    if (result) {
      return NextResponse.json({ data: [result] });
    }
  }

  // 楽天ブックスAPI（プライマリ）
  const rakutenResults = await fetchRakutenBooks(q);
  if (rakutenResults.length > 0) {
    return NextResponse.json({ data: rakutenResults });
  }

  // フォールバック: NDL + OpenBD（楽天APIキー未設定 or 0件時）
  const ndlResults = await fetchNDL(q);
  if (ndlResults.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const isbns = ndlResults.map((r) => r.isbn).filter((isbn): isbn is string => isbn !== null);
  const openbdMap = isbns.length > 0 ? await fetchOpenBDBulk(isbns) : new Map<string, BookResult>();

  const merged = ndlResults.map((ndl) => {
    const obd = ndl.isbn ? openbdMap.get(ndl.isbn) : undefined;
    const coverUrl =
      obd?.coverUrl ||
      (ndl.isbn ? `https://ndlsearch.ndl.go.jp/thumbnail/${ndl.isbn}.jpg` : null);
    return {
      ...ndl,
      coverUrl,
      totalPages: obd?.totalPages || ndl.totalPages,
      publisher: obd?.publisher || ndl.publisher,
    };
  });

  return NextResponse.json({ data: merged });
}

// --- 楽天ブックス書籍検索API ---

interface RakutenBookItem {
  title: string;
  author: string;
  publisherName: string;
  isbn: string;
  largeImageUrl: string;
  mediumImageUrl: string;
  smallImageUrl: string;
  itemCaption: string;
  salesDate: string;
  subTitle: string;
}

async function fetchRakutenBooks(query: string): Promise<BookResult[]> {
  const appId = process.env.RAKUTEN_APP_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  if (!appId || !accessKey) return [];

  const url = new URL('https://openapi.rakuten.co.jp/services/api/BooksBook/Search/20170404');
  url.searchParams.set('applicationId', appId);
  url.searchParams.set('accessKey', accessKey);
  url.searchParams.set('title', query);
  url.searchParams.set('hits', '30');
  url.searchParams.set('sort', 'standard');
  url.searchParams.set('format', 'json');

  try {
    const siteUrl = process.env.RAKUTEN_SITE_URL || 'http://localhost';
    const res = await fetch(url.toString(), {
      headers: {
        Referer: siteUrl,
        Origin: siteUrl,
      },
    });
    if (!res.ok) return [];

    const data = (await res.json()) as {
      Items?: Array<{ Item: RakutenBookItem }>;
    };

    if (!data.Items || data.Items.length === 0) return [];

    return data.Items.map(({ Item: item }) => {
      // 楽天の画像URLは ?_ex=NNxNN で最大化
      const coverUrl = item.largeImageUrl || item.mediumImageUrl || item.smallImageUrl || null;

      let title = item.title;
      if (item.subTitle) {
        title = `${item.title} ${item.subTitle}`;
      }

      return {
        id: `rakuten-${item.isbn}`,
        title,
        author: item.author || null,
        publisher: item.publisherName || null,
        totalPages: null,
        coverUrl,
        isbn: item.isbn || null,
      };
    });
  } catch {
    return [];
  }
}

// --- NDL (フォールバック) ---

async function fetchNDL(query: string): Promise<BookResult[]> {
  const url = new URL('https://ndlsearch.ndl.go.jp/api/opensearch');
  url.searchParams.set('title', query);
  url.searchParams.set('cnt', '100');

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return [];

    const xml = await res.text();
    return parseNDLXml(xml);
  } catch {
    return [];
  }
}

interface NdlParsedItem extends BookResult {
  volumeNum: number | null;
}

function parseNDLXml(xml: string): BookResult[] {
  const items: NdlParsedItem[] = [];
  const seen = new Set<string>();
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1] ?? '';

    const categories = extractAllTags(block, 'category');
    if (!categories.includes('図書')) continue;

    const title = extractTag(block, 'dc:title');
    if (!title) continue;

    const author = extractTag(block, 'dc:creator');
    const publisher = extractTag(block, 'dc:publisher');
    const isbn = extractIsbn(block);
    const volume = extractTag(block, 'dcndl:volume');
    const seriesTitle = extractTag(block, 'dcndl:seriesTitle');

    if (isbn) {
      if (seen.has(isbn)) continue;
      seen.add(isbn);
    }

    let displayTitle = title;
    if (volume) {
      displayTitle = `${title} (${volume})`;
    }

    const volumeNum = volume ? parseInt(volume, 10) : null;

    items.push({
      id: isbn ? `ndl-${isbn}` : `ndl-${items.length}-${Date.now()}`,
      title: displayTitle,
      author: seriesTitle ? (author ? `${author} / ${seriesTitle}` : seriesTitle) : author,
      publisher,
      totalPages: null,
      coverUrl: null,
      isbn,
      volumeNum: isNaN(volumeNum ?? NaN) ? null : volumeNum,
    });
  }

  items.sort((a, b) => {
    if (a.volumeNum === null && b.volumeNum === null) return 0;
    if (a.volumeNum === null) return -1;
    if (b.volumeNum === null) return -1;
    return a.volumeNum - b.volumeNum;
  });

  return items;
}

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`);
  const match = regex.exec(xml);
  return match?.[1]?.trim() ?? null;
}

function extractAllTags(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, 'g');
  const results: string[] = [];
  let m;
  while ((m = regex.exec(xml)) !== null) {
    if (m[1]) results.push(m[1].trim());
  }
  return results;
}

function extractIsbn(xml: string): string | null {
  const isbnRegex = /<dc:identifier[^>]*type="dcndl:ISBN"[^>]*>([^<]+)<\/dc:identifier>/;
  const match = isbnRegex.exec(xml);
  if (!match?.[1]) return null;
  return match[1].trim().replace(/-/g, '');
}

// --- OpenBD ---

async function fetchOpenBD(isbn: string): Promise<BookResult | null> {
  try {
    const res = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbn}`);
    if (!res.ok) return null;
    const data = (await res.json()) as Array<OpenBDItem | null>;
    return parseOpenBDItem(data[0]);
  } catch {
    return null;
  }
}

async function fetchOpenBDBulk(isbns: string[]): Promise<Map<string, BookResult>> {
  const map = new Map<string, BookResult>();
  if (isbns.length === 0) return map;

  try {
    const res = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbns.join(',')}`);
    if (!res.ok) return map;
    const data = (await res.json()) as Array<OpenBDItem | null>;
    for (const item of data) {
      const parsed = parseOpenBDItem(item);
      if (parsed?.isbn) {
        map.set(parsed.isbn, parsed);
      }
    }
  } catch {
    // ignore
  }
  return map;
}

interface OpenBDItem {
  summary?: {
    title: string;
    author: string;
    publisher: string;
    isbn: string;
    cover: string;
  };
  onix?: {
    DescriptiveDetail?: {
      Extent?: Array<{ ExtentValue: string }>;
    };
  };
}

function parseOpenBDItem(item: OpenBDItem | null | undefined): BookResult | null {
  if (!item?.summary) return null;
  const pages = item.onix?.DescriptiveDetail?.Extent?.[0]?.ExtentValue;

  return {
    id: `openbd-${item.summary.isbn}`,
    title: item.summary.title,
    author: item.summary.author || null,
    publisher: item.summary.publisher || null,
    totalPages: pages ? parseInt(pages, 10) : null,
    coverUrl: item.summary.cover || null,
    isbn: item.summary.isbn,
  };
}
