import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const IMAGE_UPDATES = {
  'Cilostazol 50 mg':
    'https://res-4.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1660986764_61b322f50e51d9066d3769ff.jpg',
  'Amlodipine 5 mg':
    'https://res-1.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1639231650_amlodipine_5_mg_10_tablet.jpg',
};

const REMOVE_NAMES = ['Warfarin 2 mg', 'Enoxaparin 40 mg', 'Enoxaparin', 'Warfarin'];

async function main() {
  // Delete deprecated meds first (cascade removes patient_medication_catalogs via schema)
  for (const name of REMOVE_NAMES) {
    const removed = await prisma.medication_catalogs.deleteMany({
      where: { medication_name: { contains: name, mode: 'insensitive' } },
    });
    if (removed.count > 0) {
      console.log(`Removed ${removed.count} catalog entries for ${name}`);
    }
  }

  // Update image URLs to match seed catalog
  for (const [name, url] of Object.entries(IMAGE_UPDATES)) {
    const updated = await prisma.medication_catalogs.updateMany({
      where: { medication_name: name },
      data: { image_url: url },
    });
    if (updated.count > 0) {
      console.log(`Updated image_url for ${name}`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
