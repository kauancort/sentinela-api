import 'dotenv/config';

import { app } from './App';

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`API disponivel em http://localhost:${port}`);
  console.log(`Documentacao Swagger em http://localhost:${port}/api-docs`);
});
