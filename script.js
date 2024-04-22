var fs = require('fs');
const data = fs.readFileSync('./collection.json');
console.log(JSON.parse(data));

