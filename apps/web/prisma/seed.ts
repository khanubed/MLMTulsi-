import { PrismaClient, UserRole, AccountStatus, ProductStatus, NetworkIdStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Tulsi Swarojgar testing seed script...');

  // 1. Seed Flagship Product: Tulsi Meta Ved Herbal Mix (₹500 = 50,000 paise)
  const product = await prisma.product.upsert({
    where: { slug: 'tulsi-meta-ved-herbal-mix' },
    update: {
      name: 'Tulsi Meta Ved — Herbal Mix',
      sku: 'META-VED-001',
      pricePaise: BigInt(50000),
      currency: 'INR',
      isActive: true,
      status: ProductStatus.PUBLISHED,
    },
    create: {
      name: 'Tulsi Meta Ved — Herbal Mix',
      slug: 'tulsi-meta-ved-herbal-mix',
      sku: 'META-VED-001',
      description:
        'Vedic metabolic herbal blend crafted with Holy Tulsi, Fenugreek, Wild Herbs, Native Lahsun, and Cumin for complete digestive and cellular harmony.',
      pricePaise: BigInt(50000),
      currency: 'INR',
      isActive: true,
      status: ProductStatus.PUBLISHED,
      images: {
        create: [
          { url: '/images/containerTop.png', altText: 'Tulsi Meta Ved Cap', sortOrder: 0 },
          { url: '/images/containerBottom.png', altText: 'Tulsi Meta Ved Jar', sortOrder: 1 },
          { url: '/images/product_back.png', altText: 'Nutritional Information', sortOrder: 2 },
        ],
      },
    },
  });
  console.log(`✓ Product seeded: ${product.name} (SKU: ${product.sku}, Price: ₹500)`);

  // 2. Seed Official Commission Rule Set (v1) with 10 Levels
  const commissionSchedule = [
    { level: 1, amountPaise: 50000 },
    { level: 2, amountPaise: 10000 },
    { level: 3, amountPaise: 7500 },
    { level: 4, amountPaise: 5000 },
    { level: 5, amountPaise: 2500 },
    { level: 6, amountPaise: 1500 },
    { level: 7, amountPaise: 1000 },
    { level: 8, amountPaise: 500 },
    { level: 9, amountPaise: 300 },
    { level: 10, amountPaise: 100 },
  ];

  let ruleSet = await prisma.commissionRuleSet.findUnique({
    where: { version: 1 },
  });

  if (!ruleSet) {
    ruleSet = await prisma.commissionRuleSet.create({
      data: {
        version: 1,
        name: 'Official Tulsi Swarojgar Schedule v1',
        isActive: true,
        rules: {
          create: commissionSchedule.map((s) => ({
            levelNumber: s.level,
            rewardAmountPaise: BigInt(s.amountPaise),
            requiredDirectSales: 0,
          })),
        },
      },
    });
    console.log('✓ Commission Rule Set v1 created with 10 official levels');
  } else {
    console.log('✓ Commission Rule Set v1 already present');
  }

  // 3. Seed Super Admin User
  const admin = await prisma.user.upsert({
    where: { phoneE164: '+919999999999' },
    update: {
      role: UserRole.SUPER_ADMIN,
      status: AccountStatus.ACTIVE,
    },
    create: {
      fullName: 'System Administrator',
      phoneE164: '+919999999999',
      phoneVerifiedAt: new Date(),
      email: 'admin@tulsiswaraj.com',
      role: UserRole.SUPER_ADMIN,
      status: AccountStatus.ACTIVE,
    },
  });
  console.log(`✓ Admin user seeded: ${admin.fullName} (${admin.phoneE164})`);

  // 4. Seed Company Root Network Node (TULSI01)
  const rootNode = await prisma.networkId.upsert({
    where: { referralCode: 'TULSI01' },
    update: {
      ownerUserId: admin.id,
      status: NetworkIdStatus.ACTIVE,
    },
    create: {
      publicId: 'TULSI-ROOT-001',
      referralCode: 'TULSI01',
      ownerUserId: admin.id,
      parentNetworkId: null,
      placementDepth: 0,
      status: NetworkIdStatus.ACTIVE,
    },
  });
  console.log(`✓ Company Root Node seeded: ${rootNode.publicId} (Referral: ${rootNode.referralCode})`);

  // 5. Seed Example Test Distributor Member (Rajesh Sharma) under Root Slot 1
  const member = await prisma.user.upsert({
    where: { phoneE164: '+919876543210' },
    update: {},
    create: {
      fullName: 'Rajesh Sharma',
      phoneE164: '+919876543210',
      phoneVerifiedAt: new Date(),
      email: 'rajesh@example.com',
      role: UserRole.MEMBER,
      status: AccountStatus.ACTIVE,
    },
  });

  const memberNode = await prisma.networkId.upsert({
    where: { referralCode: 'TULSI101' },
    update: {},
    create: {
      publicId: 'TS10001',
      referralCode: 'TULSI101',
      ownerUserId: member.id,
      parentNetworkId: rootNode.id,
      placementDepth: 1,
      status: NetworkIdStatus.ACTIVE,
    },
  });

  // Ensure placement slot 1 under root
  await prisma.networkPlacement.upsert({
    where: {
      parentNetworkId_slotNumber: {
        parentNetworkId: rootNode.id,
        slotNumber: 1,
      },
    },
    update: {},
    create: {
      parentNetworkId: rootNode.id,
      slotNumber: 1,
      childNetworkId: memberNode.id,
    },
  });

  // 6. Pre-initialize NetworkLevelSummary rows for all 10 levels for seeded nodes
  for (const nodeId of [rootNode.id, memberNode.id]) {
    for (let l = 1; l <= 10; l++) {
      await prisma.networkLevelSummary.upsert({
        where: {
          networkId_levelNumber: {
            networkId: nodeId,
            levelNumber: l,
          },
        },
        update: {},
        create: {
          networkId: nodeId,
          levelNumber: l,
          earnedAmountPaise: BigInt(0),
          heldAmountPaise: BigInt(0),
          availableAmountPaise: BigInt(0),
          paidAmountPaise: BigInt(0),
          reversedAmountPaise: BigInt(0),
        },
      });
    }
  }
  console.log('✓ Precomputed NetworkLevelSummary rows (Levels 1–10) initialized for seeded nodes');

  console.log('🎉 Tulsi Swarojgar testing seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
