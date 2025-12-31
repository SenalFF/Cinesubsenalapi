
export const generateExpressScript = () => {
  return `/**
 * Senal Tech - Ultimate Media Scraper Engine v2.0
 * movie tv series cartoons ultimate
 * 
 * High-performance Express.js server for CineSubz media extraction.
 * Optimized for Movies, TV Series, and Cartoons.
 */
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const BASE_URL = 'https://cinesubz.co';

app.use(cors());
app.use(express.json());

// Pro-tier headers to avoid bot detection
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Referer': BASE_URL
};

/**
 * Sonic Cloud Transformation Matrix
 * Maps legacy storage nodes to direct streaming/download URLs.
 */
const urlMappings = [
  { search: ['https://google.com/server11/1:/', 'https://google.com/server12/1:/', 'https://google.com/server13/1:/'], replace: 'https://cloud.sonic-cloud.online/server1/' },
  { search: ['https://google.com/server21/1:/', 'https://google.com/server22/1:/', 'https://google.com/server23/1:/'], replace: 'https://cloud.sonic-cloud.online/server2/' },
  { search: ['https://google.com/server3/1:/'], replace: 'https://cloud.sonic-cloud.online/server3/' },
  { search: ['https://google.com/server4/1:/'], replace: 'https://cloud.sonic-cloud.online/server4/' },
  { search: ['https://google.com/server5/1:/'], replace: 'https://cloud.sonic-cloud.online/server5/' }
];

function transformUrl(raw) {
  if (!raw || raw.startsWith('#')) return '';
  let finalUrl = raw;
  
  // Apply Server Mappings
  for (const mapping of urlMappings) {
    for (const pattern of mapping.search) {
      if (finalUrl.startsWith(pattern)) {
        finalUrl = finalUrl.replace(pattern, mapping.replace);
        break;
      }
    }
  }

  // Inject proper query parameters for cloud streaming
  if (finalUrl.includes('sonic-cloud.online')) {
    finalUrl = finalUrl.replace(/\.mp4(\?|$)/, '?ext=mp4').replace(/\.mkv(\?|$)/, '?ext=mkv');
    finalUrl = finalUrl.replace(/\.zip(\?|$)/, '?ext=zip');
    // Ensure single query mark
    finalUrl = finalUrl.replace('??', '?').replace('?ext=', '&ext=').replace('?bot=', '&bot=');
    if (!finalUrl.includes('?') && finalUrl.includes('&')) finalUrl = finalUrl.replace('&', '?');
  }
  
  return finalUrl;
}

/**
 * [GET] /health
 * Diagnostics for server status and target site reachability.
 */
app.get('/health', async (req, res) => {
  try {
    const start = Date.now();
    await axios.get(BASE_URL, { headers, timeout: 5000 });
    res.json({
      success: true,
      engine: "Senal Tech v2.0",
      status: "Online",
      latency: \`\${Date.now() - start}ms\`,
      target: "cinesubz.co"
    });
  } catch (err) {
    res.status(503).json({ success: false, error: "Target unreachable", message: err.message });
  }
});

/**
 * [GET] /search?q={query}
 * Fetches movie, series, and cartoon search results.
 */
app.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Missing query parameter 'q'" });
    
    const { data } = await axios.get(\`\${BASE_URL}/?s=\${encodeURIComponent(q)}\`, { headers });
    const $ = cheerio.load(data);
    const results = [];

    $('.item-box, .result-item, .display-item, article').each((_, el) => {
      const $el = $(el);
      const title = $el.find('h1, h2, h3, .title').first().text().trim();
      const url = $el.find('a').first().attr('href');
      const poster = $el.find('img').first().attr('src') || $el.find('img').attr('data-src');
      const rating = $el.find('.imdb-score, .rating').text().trim() || 'N/A';

      if (title && url) {
        results.push({
          title,
          type: url.includes('/tvshows/') ? 'tvshow' : (url.includes('/cartoons/') ? 'cartoon' : 'movie'),
          poster_url: poster,
          rating,
          movie_url: url
        });
      }
    });

    res.json({ success: true, count: results.length, results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * [GET] /details?url={page_url}
 * Extracts metadata and all available quality entries.
 */
app.get('/details', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "Missing 'url' parameter" });

    const { data } = await axios.get(url, { headers });
    const $ = cheerio.load(data);

    const title = $('.entry-title, .sheader h1').first().text().trim();
    const poster = $('meta[property="og:image"]').attr('content') || $('.poster img').first().attr('src');
    const description = $('.wp-content p, .description p').first().text().trim();
    const imdb = $('.imdb-score, .rating').first().text().trim() || 'N/A';
    
    const meta = {};
    $('.custom_fields, .info-list li').each((_, el) => {
      const t = $(el).text();
      if (t.includes(':')) {
        const [k, v] = t.split(':');
        meta[k.trim().toLowerCase()] = v.trim();
      }
    });

    const download_links = [];
    $('a').each((_, el) => {
      const $a = $(el);
      const h = $a.attr('href') || '';
      const t = $a.text().trim();
      
      // Filter for download/api entry buttons
      if (h.includes('/api-') || h.includes('/links/') || t.match(/\\d+p/i)) {
        const quality = t.match(/\\d+p/i)?.[0] || '720p';
        const size = t.match(/(\\d+\\.?\\d*\\s*(?:GB|MB))/i)?.[1] || meta['size'] || 'N/A';
        download_links.push({ quality, size, countdown_url: h });
      }
    });

    res.json({
      success: true,
      data: {
        movie_info: { title, year: title.match(/\\d{4}/)?.[0] || 'N/A', rating: imdb, description },
        poster_url: poster,
        download_links: [...new Map(download_links.map(d => [d.countdown_url, d])).values()]
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * [GET] /download?url={api_url}
 * Resolves countdown/redirect pages into final direct cloud links.
 */
app.get('/download', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "Missing 'url' parameter" });

    const { data } = await axios.get(url, { headers });
    const $ = cheerio.load(data);
    const resolved = [];

    const add = (h, label, type) => {
      if (!h || h.startsWith('#')) return;
      resolved.push({ type, label, download_url: type === 'direct' ? transformUrl(h) : h });
    };

    // Parse Static Buttons
    $('a').each((_, el) => {
      const h = $(el).attr('href') || '';
      const t = $(el).text().toLowerCase();
      const id = $(el).attr('id');

      if (h.includes('sonic-cloud.online') || h.includes('google.com/server')) add(h, "Sonic Cloud", "direct");
      else if (h.includes('mega.nz')) add(h, "Mega.nz", "mega");
      else if (h.includes('drive.google.com')) add(h, "Google Drive", "google");
      else if (h.includes('t.me/')) add(h, "Telegram Fast", "telegram");
      else if (id === 'link' || id === 'generate') {
        const dType = h.includes('t.me') ? 'telegram' : (h.includes('drive.google') ? 'google' : 'direct');
        add(h, "Direct Stream", dType);
      }
    });

    // Parse Script Blocks (for hidden links)
    $('script').each((_, el) => {
      const content = $(el).html();
      if (content && content.includes('href')) {
        const found = content.match(/https?:\\\/\\\/[^\s'"]+/g);
        if (found) found.forEach(u => {
          const clean = u.replace(/\\\\/g, '').replace(/\\/g, '');
          if (clean.includes('sonic-cloud.online')) add(clean, "Extracted Direct", "direct");
        });
      }
    });

    const unique = [...new Map(resolved.map(l => [l.download_url, l])).values()];
    res.json({ success: unique.length > 0, count: unique.length, download_options: unique });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => console.log(\`Senal Tech Engine v2.0 running on \${PORT}\`));
}

module.exports = app;`;
};
