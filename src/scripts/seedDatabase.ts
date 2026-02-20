// src/scripts/seedDatabase.ts
import { supabase } from '@/services/supabase';
import { mockAlerts, mockWomen, mockDeliveries, mockInventory } from '@/data/mockData';

async function seedDatabase() {
  console.log("🌱 Seeding database...");

  // Insert alerts
  const { error: alertsError } = await supabase
    .from('alerts')
    .insert(mockAlerts);
  
  if (alertsError) console.error("Error inserting alerts:", alertsError);
  else console.log("✅ Alerts inserted");

  // Insert women
  const { error: womenError } = await supabase
    .from('women')
    .insert(mockWomen);
  
  if (womenError) console.error("Error inserting women:", womenError);
  else console.log("✅ Women inserted");

  // Insert deliveries
  const { error: deliveriesError } = await supabase
    .from('deliveries')
    .insert(mockDeliveries);
  
  if (deliveriesError) console.error("Error inserting deliveries:", deliveriesError);
  else console.log("✅ Deliveries inserted");

  // Insert inventory
  const { error: inventoryError } = await supabase
    .from('inventory')
    .insert(mockInventory);
  
  if (inventoryError) console.error("Error inserting inventory:", inventoryError);
  else console.log("✅ Inventory inserted");

  console.log("🎉 Seeding complete!");
}

// Run this function
seedDatabase();