const { hashPassword, comparePassword } = require('./utils/bcrypt');
const { generateToken, verifyToken } = require('./utils/jwt');

console.log('Testing bcryptjs...');
hashPassword('test123').then(hash => {
  console.log('Hash created:', hash.substring(0, 20) + '...');
  return comparePassword('test123', hash).then(match => {
    console.log('Password match test:', match ? 'PASS' : 'FAIL');
  });
}).catch(err => console.error('bcrypt error:', err));

console.log('\nTesting jwt...');
try {
  const token = generateToken(123);
  console.log('Token generated:', token.substring(0, 30) + '...');
  
  const decoded = verifyToken(token);
  console.log('Token verified, userId:', decoded.userId);
  console.log('JWT test: PASS');
} catch (err) {
  console.error('JWT error:', err.message);
}
