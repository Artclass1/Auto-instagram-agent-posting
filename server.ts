import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Needed to parse JSON bodies
  app.use(express.json());

  // API Route: OAuth flow initialization
  app.get('/api/auth/url', (req, res) => {
    const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/auth/callback`;
    
    const params = new URLSearchParams({
      client_id: process.env.INSTAGRAM_CLIENT_ID || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'user_profile,user_media',
    });

    const authUrl = `https://api.instagram.com/oauth/authorize?${params.toString()}`;
    res.json({ url: authUrl });
  });

  // API Route: OAuth callback
  app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
    const { code, error, error_reason, error_description } = req.query;

    if (error) {
      console.error('Instagram OAuth Error:', error, error_reason, error_description);
      return res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: '${error}' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication failed: ${error_description}. This window should close automatically.</p>
          </body>
        </html>
      `);
    }

    if (code) {
      // Typically, you would exchange this code for an access token here.
      // E.g., via POST to https://api.instagram.com/oauth/access_token
      // For this example, we notify the frontend that authentication was successful.
      
      return res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', code: '${code}' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    }

    res.status(400).send('Invalid request');
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // For Express v4, use '*'
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
