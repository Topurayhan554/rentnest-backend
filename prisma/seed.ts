import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { Category } from "../generated/prisma/client";

async function main() {
  console.log("Seeding Started...");

  const hashedPassword = await bcrypt.hash("admin123", 12);

  //   admin
  const admin = await prisma.user.upsert({
    where: {
      email: "admin@rentnest.com",
    },
    update: {},
    create: {
      name: "Admin",
      email: "admin@rentnest.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin created :", admin.email);

  const landlordPassword = await bcrypt.hash("landlord123", 12);
  const landlord = await prisma.user.upsert({
    where: {
      email: "landlord@rentnest.com",
    },
    update: {},
    create: {
      name: "Karim Landlord",
      email: "landlord@rentnest.com",
      password: landlordPassword,
      role: "LANDLORD",
    },
  });
  console.log("Landlord created :", landlord.email);

  //   tenant
  const tenantPassword = await bcrypt.hash("tenant123", 12);
  const tenant = await prisma.user.upsert({
    where: { email: "tenant@rentnest.com" },
    update: {},
    create: {
      name: "Rahim Tenant",
      email: "tenant@rentnest.com",
      password: tenantPassword,
      role: "TENANT",
    },
  });
  console.log("Tenant created:", tenant.email);

  //   categories

  const categoryNames = ["Apartment", "House", "Studio", "Room", "Villa"];
  const categories: Category[] = [];
  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: {
        name,
      },
      update: {},
      create: {
        name,
      },
    });
    categories.push(category);
  }
  console.log("Categories Created :", categories.length);

  //   properties

  const apartmentCategory = categories.find((c) => c.name === "Apartment")!;
  const studioCategory = categories.find((c) => c.name === "Studio")!;

  const existingProperties = await prisma.property.findMany({
    where: { landlordId: landlord.id },
  });

  if (existingProperties.length === 0) {
    await prisma.property.createMany({
      data: [
        {
          title: "Cozy 2-Bed Apartment in Dhanmondi",
          description: "A well-lit, family-friendly apartment near main road.",
          location: "Dhanmondi, Dhaka",
          price: 25000,
          type: "APARTMENT",
          amenities: ["WiFi", "Parking", "Lift", "Generator"],
          images: [],
          landlordId: landlord.id,
          categoryId: apartmentCategory.id,
        },
        {
          title: "Modern Studio near Gulshan",
          description: "Perfect for singles or students, fully furnished.",
          location: "Gulshan, Dhaka",
          price: 15000,
          type: "STUDIO",
          amenities: ["WiFi", "AC"],
          images: [],
          landlordId: landlord.id,
          categoryId: studioCategory.id,
        },
      ],
    });
    console.log("Sample properties created");
  } else {
    console.log("Properties already exist, skipping");
  }
  console.log("Seeding finished");
}

main()
  .catch((e) => {
    console.log("Seeding failed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
