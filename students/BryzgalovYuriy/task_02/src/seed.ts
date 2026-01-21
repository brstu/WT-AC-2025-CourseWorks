import { connectDb, disconnectDb } from './config/db';
import { ServiceModel } from './modules/_models/service.model';
import { MasterModel } from './modules/_models/master.model';

async function seed() {
  await connectDb();

  await Promise.all([ServiceModel.deleteMany({}), MasterModel.deleteMany({})]);

  const services = await ServiceModel.insertMany([
    { name: 'Стрижка женская', price: 35, durationMin: 60, description: 'Мытьё + стрижка + укладка', isActive: true },
    { name: 'Стрижка мужская', price: 20, durationMin: 45, description: 'Классика/фейд', isActive: true },
    { name: 'Окрашивание', price: 80, durationMin: 120, description: 'Тон/осветление/уход', isActive: true },
    { name: 'Маникюр', price: 25, durationMin: 60, description: 'Комби + покрытие', isActive: true },
    { name: 'Брови', price: 15, durationMin: 30, description: 'Коррекция + окрашивание', isActive: true }
  ]);

  const byName = new Map(services.map((s) => [s.name, s._id]));

  await MasterModel.insertMany([
    {
      name: 'Алина',
      bio: 'Стрижки и укладки. Люблю ровные формы.',
      services: [byName.get('Стрижка женская')!, byName.get('Стрижка мужская')!],
      isActive: true
    },
    {
      name: 'Мария',
      bio: 'Окрашивание и уход. Подберу тон под настроение.',
      services: [byName.get('Окрашивание')!, byName.get('Стрижка женская')!],
      isActive: true
    },
    {
      name: 'София',
      bio: 'Маникюр и брови. Аккуратно и быстро.',
      services: [byName.get('Маникюр')!, byName.get('Брови')!],
      isActive: true
    }
  ]);

  // eslint-disable-next-line no-console
  console.log('[seed] done');
  await disconnectDb();
}

void seed().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error('[seed] error', err);
  await disconnectDb();
  process.exit(1);
});
