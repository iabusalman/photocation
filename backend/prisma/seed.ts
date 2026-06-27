import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Prices are in halalas (1 SAR = 100 halalas).
const packages = [
  {
    title: 'جلسة تصوير بورتريه احترافية',
    description:
      'جلسة تصوير شخصية في الاستوديو مع إضاءة احترافية وتعديل 10 صور بدقة عالية.',
    city: 'الرياض',
    location: 'استوديو فوتوكيشن - حي العليا',
    coverImage:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200',
    priceHalalas: 45000,
    durationMins: 90,
  },
  {
    title: 'تصوير زفاف كامل',
    description:
      'تغطية كاملة ليوم الزفاف من مصوّرَين محترفين مع ألبوم مطبوع وفيديو ملخّص.',
    city: 'جدة',
    location: 'حسب موقع المناسبة',
    coverImage:
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
    priceHalalas: 350000,
    durationMins: 480,
  },
  {
    title: 'جلسة تصوير منتجات تجارية',
    description:
      'تصوير حتى 15 منتجاً بخلفية بيضاء وزوايا متعددة، جاهزة للمتاجر الإلكترونية.',
    city: 'الرياض',
    location: 'استوديو فوتوكيشن - حي العليا',
    coverImage:
      'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200',
    priceHalalas: 60000,
    durationMins: 120,
  },
  {
    title: 'جلسة عائلية خارجية',
    description:
      'جلسة تصوير عائلية في الهواء الطلق وقت الغروب مع 20 صورة معدّلة.',
    city: 'الدمام',
    location: 'كورنيش الدمام',
    coverImage:
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200',
    priceHalalas: 55000,
    durationMins: 90,
  },
];

async function main() {
  for (const pkg of packages) {
    // Idempotent-ish seed: skip if a package with the same title exists.
    const existing = await prisma.package.findFirst({ where: { title: pkg.title } });
    if (existing) {
      await prisma.package.update({ where: { id: existing.id }, data: pkg });
    } else {
      await prisma.package.create({ data: pkg });
    }
  }
  // eslint-disable-next-line no-console
  console.log(`✅ Seeded ${packages.length} packages`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
