const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

const port = 3000; // Specify the port

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
