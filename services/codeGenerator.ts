
export const generateExpressScript = () => {
  return `const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const BASE_URL = 'https://cinesubz.co';

app.use(cors());
app.use(express.json());

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

/**
 * Health Check Endpoint
 */
app.get('/health', async (req, res) => {
  try {
    const start = Date.now();
    await axios.get(BASE_URL, { headers, timeout: 5000 });
    res.json({
      status: 'online',
      latency: \`\${Date.now() - start}ms\`,
      endpoints: ['/search', '/details', '/download', '/health']
    });
  } catch (error) {
    res.status(503).json({ status: 'degraded', error: error.message });
  }
});

// URL Transformation Logic for Direct Downloads (Sonic Cloud Mapping)
const urlMappings = [
  { search: ['https://google.com/server11/1:/', 'https://google.com/server12/1:/', 'https://google.com/server13/1:/'], replace: 'https://cloud.sonic-cloud.online/server1/' },
  { search: ['https://google.com/server21/1:/', 'https://google.com/server22/1:/', 'https://google.com/server23/1:/'], replace: 'https://cloud.sonic-cloud.online/server2/' },
  { search: ['https://google.com/server3/1:/'], replace: 'https://cloud.sonic-cloud.online/server3/' },
  { search: ['https://google.com/server4/1:/'], replace: 'https://cloud.sonic-cloud.online/server4/' },
  { search: ['https://google.com/server5/1:/'], replace: 'https://cloud.sonic-cloud.online/server5/' }
];

function transformDownloadUrl(originalUrl) {
  if (!originalUrl) return '';
  let modifiedUrl = originalUrl;
  let urlChanged = false;

  for (const mapping of urlMappings) {
    if (urlChanged) break;
    for (const searchUrl of mapping.search) {
      if (originalUrl.startsWith(searchUrl)) {
        modifiedUrl = originalUrl.replace(searchUrl, mapping.replace);
        if (modifiedUrl.includes(".mp4?bot=cscloud2bot&code=")) {
          modifiedUrl = modifiedUrl.replace(".mp4?bot=cscloud2bot&code=", "?ext=mp4&bot=cscloud2bot&code=");
        } else if (modifiedUrl.includes(".mp4")) {
          modifiedUrl = modifiedUrl.replace(".mp4", "?ext=mp4");
        } else if (modifiedUrl.includes(".mkv?bot=cscloud2bot&code=")) {
          modifiedUrl = modifiedUrl.replace(".mkv?bot=cscloud2bot&code=", "?ext=mkv&bot=cscloud2bot&code=");
        } else if (modifiedUrl.includes(".mkv")) {
          modifiedUrl = modifiedUrl.replace(".mkv", "?ext=mkv");
        } else if (modifiedUrl.includes(".zip")) {
          modifiedUrl = modifiedUrl.replace(".zip", "?ext=zip");
        }
        urlChanged = true;
        break;
      }
    }
  }
  return modifiedUrl;
}

// 1. Search Endpoint
app.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Missing query' });
    const searchUrl = \`\${BASE_URL}/?s=\${encodeURIComponent(query)}\`;
    const response = await axios.get(searchUrl, { headers });
    const $ = cheerio.load(response.data);
    const results = [];
    $('.item-box, .display-item, article').each((i, el) => {
      const $el = $(el);
      const title = $el.find('.title a, h3 a, .entry-title a').first().text().trim();
      const url = $el.find('a').first().attr('href');
      const poster = $el.find('img').first().attr('src') || $el.find('img').attr('data-src');
      const rating = $el.find('.imdb-score, .rating').text().trim();
      if (title && url) {
        results.push({
          title,
          type: url.includes('/tvshows/') ? 'tvshow' : 'movie',
          poster_url: poster,
          rating: rating || 'N/A',
          movie_url: url
        });
      }
    });
    res.json({ count: results.length, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Details Endpoint
app.get('/details', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'Missing URL' });
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);
    const title = $('h1.entry-title').first().text().trim() || $('.sheader .data h1').text().trim();
    const poster = $('meta[property="og:image"]').attr('content') || $('.poster img').first().attr('src');
    const about = $('.wp-content p').first().text().trim() || $('.description p').first().text().trim() || $('meta[name="description"]').attr('content');
    const imdb_rating = $('.imdb-score').first().text().trim() || $('.rating').first().text().trim() || 'N/A';
    const year = $('.date').first().text().match(/\\d{4}/)?.[0] || 'N/A';
    const details = {};
    $('.custom_fields, .info-list li, .movie-info li').each((i, el) => {
       const text = $(el).text();
       if (text.includes(':')) {
         const parts = text.split(':');
         const key = parts[0].trim().toLowerCase();
         const val = parts[1].trim();
         details[key] = val;
       }
    });
    const downloadLinks = [];
    $('a').each((i, el) => {
      const $a = $(el);
      const href = $a.attr('href') || '';
      const text = $a.text().trim();
      if (href.includes('cinesubz.co/api-') || (href.includes('cinesubz.co') && text.match(/\\d+p/i))) {
        const quality = text.match(/\\d+p/i)?.[0] || 'HD';
        const sizeMatch = text.match(/(\\d+\\.?\\d*\\s*(?:GB|MB))/i);
        const size = sizeMatch ? sizeMatch[1] : (details['size'] || 'N/A');
        downloadLinks.push({ quality, size, countdown_url: href });
      }
    });
    res.json({
      success: true,
      data: {
        movie_info: { title, year, imdb_rating, about, genres: details['genre'] || [], size: details['size'] || 'N/A' },
        poster_url: poster,
        download_links: [...new Map(downloadLinks.map(l => [l.countdown_url, l])).values()]
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Final Download Resolver
app.get('/download', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'Missing URL' });
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);
    const download_options = [];
    $('a').each((i, el) => {
        const $el = $(el);
        const h = $el.attr('href') || '';
        const t = $el.text().trim().toLowerCase();
        const id = $el.attr('id');
        if (h.includes('google.com/server') || h.includes('sonic-cloud.online')) {
            download_options.push({ type: 'direct', label: 'Direct Download', download_url: transformDownloadUrl(h) });
        }
        if (h.includes('drive.google.com') || t.includes('google drive')) {
            download_options.push({ type: 'google', label: 'Google Drive', download_url: h });
        }
        if (h.includes('mega.nz') || t.includes('mega')) {
            download_options.push({ type: 'mega', label: 'Mega.nz', download_url: h });
        }
        if (h.includes('t.me/') || t.includes('telegram')) {
            download_options.push({ type: 'telegram', label: 'Telegram', download_url: h });
        }
        if (id === 'link' && h) {
             const type = h.includes('t.me') ? 'telegram' : (h.includes('drive.google') ? 'google' : 'direct');
             download_options.push({ type, label: 'Primary Link', download_url: type === 'direct' ? transformDownloadUrl(h) : h });
        }
    });
    const uniqueOptions = [...new Map(download_options.map(o => [o.download_url, o])).values()];
    res.json({ success: uniqueOptions.length > 0, count: uniqueOptions.length, download_options: uniqueOptions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export for Vercel and handle local listen
if (require.main === module) {
  app.listen(PORT, () => console.log(\`Server running locally on port \${PORT}\`));
}

module.exports = app;`;
};
