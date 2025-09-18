export default function handler(req, res) {
  console.log('DEBUG: index.js called, method:', req.method);
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Debug Test</title>
</head>
<body>
    <h1>🎉 SUCCESS! Your index.js is working!</h1>
    <p>Method: ${req.method}</p>
    <p>URL: ${req.url}</p>
    <p>If you see this, your routing is fixed!</p>
    <button onclick="testAPI()">Test API</button>
    <div id="result"></div>
    
    <script>
    async function testAPI() {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: 'test connection',
                    userId: 'test'
                })
            });
            const data = await response.json();
            document.getElementById('result').innerHTML = 'API Test: ' + data.response;
        } catch (error) {
            document.getElementById('result').innerHTML = 'API Error: ' + error.message;
        }
    }
    </script>
</body>
</html>`;

  res.status(200).send(html);
}
