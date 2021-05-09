const express = require('express')
const PORT = process.env.port || 3000


const app = express()


app.use('/api', require('./routes/api-files'))


app.listen(PORT, () => {
    console.log('Server runniong on port ' + PORT);
});

