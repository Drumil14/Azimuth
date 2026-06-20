// Curated editorial journeys — pairs a real route with a vehicle from the fleet.

const u = (id: string, w = 1800) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=${w}&auto=format&fit=crop`;

export interface Journey {
  slug: string;
  title: string;
  region: string;
  from: string;
  to: string;
  distance: string;
  driveTime: string;
  bearing: string;
  vehicleSlug: string;
  vehicleName: string;
  image: string;
  blurb: string;
  notes: string[];
}

export const journeys: Journey[] = [
  {
    slug: "pacific-coast",
    title: "The slow coast",
    region: "California · Highway 1",
    from: "Monterey",
    to: "Big Sur",
    distance: "92 mi",
    driveTime: "2h 40m",
    bearing: "S 168°",
    vehicleSlug: "aston-martin-db12",
    vehicleName: "Aston Martin DB12",
    image: u("1580273916550-e323be2ae537"),
    blurb:
      "Leave Monterey before the fog burns off and let Highway 1 do what it does best — unspool one impossible headland after another. The DB12 was built for exactly this: long, fast, deliberate.",
    notes: [
      "Bixby Creek Bridge at golden hour",
      "Lunch at Nepenthe, windows down",
      "Turn back at Julia Pfeiffer Burns",
    ],
  },
  {
    slug: "red-rock-dawn",
    title: "Red rock at dawn",
    region: "Nevada → Utah",
    from: "Las Vegas",
    to: "Zion",
    distance: "162 mi",
    driveTime: "2h 35m",
    bearing: "NE 041°",
    vehicleSlug: "lamborghini-huracan-evo",
    vehicleName: "Lamborghini Huracán EVO",
    image: u("1542362567-b07e54358753"),
    blurb:
      "An empty interstate at first light, ten cylinders for company, and the Virgin River Gorge opening up around you. Arrive at Zion before the gates get busy and the day gets hot.",
    notes: [
      "Depart 05:30 to beat the heat",
      "Virgin River Gorge, sun behind you",
      "Coffee in Springdale on arrival",
    ],
  },
  {
    slug: "napa-quiet",
    title: "The quiet vines",
    region: "California · Wine Country",
    from: "San Francisco",
    to: "Napa Valley",
    distance: "58 mi",
    driveTime: "1h 20m",
    bearing: "NE 037°",
    vehicleSlug: "porsche-taycan-turbo-s",
    vehicleName: "Porsche Taycan Turbo S",
    image: u("1601929862217-f1bf94503333"),
    blurb:
      "Cross the bridge in silence, trade the city for the Silverado Trail, and let an electric drivetrain make the whole valley feel like it's holding its breath. Charge while you taste.",
    notes: [
      "Golden Gate northbound, early",
      "Silverado Trail over Highway 29",
      "Destination chargers at most estates",
    ],
  },
];

export const findJourney = (slug: string) =>
  journeys.find((j) => j.slug === slug);
