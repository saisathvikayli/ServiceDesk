export const seedData = {
  departments: [
    { name: "IT Support", code: "IT" },
    { name: "HR", code: "HR" },
  ],
  categories: [
    { name: "Hardware", description: "Laptop, desktop, peripherals" },
    { name: "Software", description: "Application and access issues" },
  ],
};

export const seedDatabase = async () => {
  console.log("Seed placeholder: add initial records here when connected to MongoDB.");
};

export default seedDatabase;
