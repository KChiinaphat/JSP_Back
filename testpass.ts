import bcrypt from 'bcryptjs';

async function run() {
  const password = 'test12345';
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);
}

run();
