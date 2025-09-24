import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

// Sample menu items to seed the database
const sampleMenuItems = [
  {
    name: "Chicken Wings",
    description: "Spicy buffalo wings with ranch dressing",
    price: 12.99,
    category: "Appetizers",
    image: "https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=400",
    available: true,
    prepTime: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Caesar Salad",
    description: "Fresh romaine lettuce with parmesan and croutons",
    price: 9.99,
    category: "Appetizers",
    image: "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=400",
    available: true,
    prepTime: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Grilled Salmon",
    description: "Fresh Atlantic salmon with seasonal vegetables",
    price: 24.99,
    category: "Main Course",
    image: "https://images.pexels.com/photos/725992/pexels-photo-725992.jpeg?auto=compress&cs=tinysrgb&w=400",
    available: true,
    prepTime: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Beef Steak",
    description: "Premium ribeye steak cooked to perfection",
    price: 32.99,
    category: "Main Course",
    image: "https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?auto=compress&cs=tinysrgb&w=400",
    available: true,
    prepTime: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Chocolate Cake",
    description: "Rich chocolate cake with vanilla ice cream",
    price: 7.99,
    category: "Desserts",
    image: "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400",
    available: true,
    prepTime: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Fresh Juice",
    description: "Freshly squeezed orange juice",
    price: 4.99,
    category: "Beverages",
    image: "https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400",
    available: true,
    prepTime: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const seedMenuItems = async () => {
  try {
    console.log("Starting to seed menu items...");
    
    for (const item of sampleMenuItems) {
      await addDoc(collection(db, "menuItems"), item);
      console.log(`Added menu item: ${item.name}`);
    }
    
    console.log("All menu items seeded successfully!");
  } catch (error) {
    console.error("Error seeding menu items:", error);
  }
};