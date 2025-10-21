import dotenv from 'dotenv';
dotenv.config();

import app from './app'; // import default export

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
