const fs = require('fs');
const path = require('path');
const { escapeHtml } = require('./messageUtils');

const filePath = path.join(__dirname, 'formValues.txt');

function router(req, res) {

    if (req.url === '/') {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err && err.code !== 'ENOENT') {
                res.writeHead(500);
                return res.end('Error reading file');
            }

            const username = err ? '' : data;

            res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8'
            });

            res.end(`
                <h2>Saved Username: ${escapeHtml(username)}</h2>
                <form action="/message" method="POST">
                    <label>Name:</label>
                    <input name="username" required>
                    <button type="add">Add</button>
                </form>
            `);
        });
    }

    else if (req.url === '/message') {
        const chunks = [];

        req.on('data', chunk => chunks.push(chunk));

        req.on('end', () => {
            const formData = Buffer.concat(chunks).toString('utf8');
            const username = new URLSearchParams(formData)
                .get('username')?.trim();

            if (!username) {
                res.writeHead(400);
                return res.end('Username is required');
            }

            fs.writeFile(filePath, username, 'utf8', err => {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error saving username');
                }

                res.writeHead(303, { Location: '/' });
                res.end();
            });
        });
    }

    else {
        res.writeHead(404);
        res.end('Page Not Found');
    }
}

module.exports = router;