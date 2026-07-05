import { build } from 'vite';
try {
  await build();
  console.log('BUILD OK');
} catch(e) {
  console.error(e.message);
  process.exit(1);
}
