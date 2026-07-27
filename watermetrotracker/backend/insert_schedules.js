db.ferry_schedules.insertMany([
  // Vyttila ↔ Kakkanad
  { id: "WM-22", route: "Vyttila-Kakkanad", from: "Vyttila", to: "Kakkanad", departure_time: "08:00" },
  { id: "WM-17", route: "Vyttila-Kakkanad", from: "Vyttila", to: "Kakkanad", departure_time: "08:20" },
  { id: "WM-18", route: "Vyttila-Kakkanad", from: "Vyttila", to: "Kakkanad", departure_time: "08:40" },
  { id: "WM-08", route: "Kakkanad-Vyttila", from: "Kakkanad", to: "Vyttila", departure_time: "09:05" },
  { id: "WM-22", route: "Kakkanad-Vyttila", from: "Kakkanad", to: "Vyttila", departure_time: "09:25" },
  { id: "WM-17", route: "Kakkanad-Vyttila", from: "Kakkanad", to: "Vyttila", departure_time: "09:50" },

  // High Court ↔ Vypin ↔ Fort Kochi
  { id: "WM-21", route: "Highcourt-Vypin-FortKochi", from: "Highcourt", to: "Fort Kochi", departure_time: "08:00" },
  { id: "WM-03", route: "Highcourt-Vypin-FortKochi", from: "Highcourt", to: "Fort Kochi", departure_time: "08:20" },
  { id: "WM-11", route: "Highcourt-Vypin-FortKochi", from: "Highcourt", to: "Fort Kochi", departure_time: "08:40" },
  { id: "WM-13", route: "Highcourt-Vypin-FortKochi", from: "Highcourt", to: "Fort Kochi", departure_time: "09:00" },
  { id: "WM-07", route: "FortKochi-Highcourt", from: "Fort Kochi", to: "Highcourt", departure_time: "10:50" },
  { id: "WM-10", route: "FortKochi-Highcourt", from: "Fort Kochi", to: "Highcourt", departure_time: "11:35" },

  // High Court ↔ South Chittoor ↔ Cheranalloor
  { id: "WM-04", route: "Highcourt-Cheranalloor", from: "Highcourt", to: "Cheranalloor", departure_time: "07:30" },
  { id: "WM-04", route: "Cheranalloor-Highcourt", from: "Cheranalloor", to: "Highcourt", departure_time: "09:10" },
  { id: "WM-07", route: "Highcourt-Cheranalloor", from: "Highcourt", to: "Cheranalloor", departure_time: "07:30" },
  { id: "WM-07", route: "Cheranalloor-Highcourt", from: "Cheranalloor", to: "Highcourt", departure_time: "08:20" },
  { id: "WM-13", route: "Highcourt-Cheranalloor", from: "Highcourt", to: "Cheranalloor", departure_time: "18:00" },
  { id: "WM-13", route: "Cheranalloor-Highcourt", from: "Cheranalloor", to: "Highcourt", departure_time: "18:55" }
])
