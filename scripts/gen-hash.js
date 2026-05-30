const bcrypt = require('bcryptjs');
const password = 'Admin@VSC2025';
const hash = bcrypt.hashSync(password, 12);
console.log('Password:', password);
console.log('Hash:', hash);
