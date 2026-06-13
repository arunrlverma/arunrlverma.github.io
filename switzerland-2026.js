const timeZone = "Europe/Zurich";
const homeAddress = "Maihofstrasse 39, 6004 Luzern, Switzerland";
const valenciaAirport = "Valencia Airport, Valencia, Spain";
const zurichAirport = "Zurich Airport, 8058 Zurich-Flughafen, Switzerland";
const baselAirport = "EuroAirport Basel Mulhouse Freiburg";
const casinoParkingBern = "Casino Parking Bern, Kochergasse 1, 3011 Bern, Switzerland";
const coopBern = "Coop City Bern, Ryfflihof, Bern, Switzerland";
const coopThun = "Coop City Thun, Baelliz 60, 3600 Thun, Switzerland";
const schadauPark = "Schadaupark, Seestrasse 45, 3600 Thun, Switzerland";
const thunParking = "Parking Schadau, 3600 Thun, Switzerland";
const grindelwaldTerminal = "Grindelwald Terminal, Grundstrasse 54, 3818 Grindelwald, Switzerland";
const lucerneRailParking = "Bahnhofparking P1, Bahnhofpl. 1, 6003 Luzern, Switzerland";
const lucerneAltstadtParking = "Parkhaus Altstadt, Zurichstrasse 35, 6004 Luzern, Switzerland";

const links = {
  firstTickets: "https://top-of-travel.jungfrau.ch/en/booking/first/start",
  firstRestaurant: "https://www.jungfrau.ch/en-gb/grindelwaldfirst/first-mountain-restaurant/",
  firstParking: "https://www.jungfrau.ch/en-gb/arrival-at-station-car-parks/parking/car-park-grindelwald-terminal/",
  lakeTickets: "https://webshop.lakelucerne.ch/en/pages/tickets-options",
  lakeTimetable: "https://webshop.lakelucerne.ch/en/routing",
  lakePierMap: "https://www.lakelucerne.ch/fileadmin/user_upload/PDF/Ihr_Schifffahrts-Erlebnis/Entdecken/Der_Vierwaldst%C3%A4ttersee/Situation_map_departure_piers_in_Lucerne_en.pdf",
  rigiTickets: "https://shop.rigi.ch/en/pages/tickets",
  rigiTimetable: "https://www.rigi.ch/en/inform/timetables",
  museumTickets: "https://www.verkehrshaus.ch/en/your-visit/besuch-planen/prices-and-tickets",
  balancesMenu: "https://www.balances.ch/en/restaurants-bar/restaurant",
  gallikerSite: "https://wirtshaus-galliker.ch/restaurant-galliker",
  rosengartenInfo: "https://restaurantbern.ch/restaurants/bern-schosshalde/restaurant-rosengarten/",
  schadauPark: "https://www.myswitzerland.com/en-us/experiences/schadau-park/",
};

const dayDates = {
  jun15: "2026-06-15",
  jun16: "2026-06-16",
  jun17: "2026-06-17",
  jun18: "2026-06-18",
};

const days = [
  {
    id: "jun15",
    tab: "Mon",
    date: "Jun 15",
    heading: "Arrival, Basel pickup, Bern lunch, optional Thun, work calls",
    route: "Zurich Airport -> Basel pickup -> Bern -> Thun option -> Luzern",
    routePlaces: [zurichAirport, baselAirport, casinoParkingBern, "Restaurant Rosengarten Bern", schadauPark, coopThun, homeAddress],
  },
  {
    id: "jun16",
    tab: "Tue",
    date: "Jun 16",
    heading: "Grocery breakfast, Grindelwald First, Old Town dinner, work calls",
    route: "Luzern -> Grindelwald First -> Luzern Old Town",
    routePlaces: [homeAddress, grindelwaldTerminal, lucerneAltstadtParking, "Restaurant Balances Luzern"],
  },
  {
    id: "jun17",
    tab: "Wed",
    date: "Jun 17",
    heading: "Lake Lucerne, Rigi Kulm, Weggis, museum, work calls",
    route: "Luzern pier -> Vitznau -> Rigi Kulm -> Weggis -> Luzern",
    routePlaces: [homeAddress, lucerneRailParking, "Luzern Bahnhofquai Pier 1", "Vitznau Rigi Bahn", "Rigi Kulm", "Rigi Kaltbad", "Weggis Schiffstation", "Swiss Museum of Transport", "Wirtshaus Galliker Luzern"],
    routeUrl: links.lakeTimetable,
    routeAction: "Timetable",
  },
  {
    id: "jun18",
    tab: "Thu",
    date: "Jun 18",
    heading: "Checkout, Basel drop-off, Zurich return, work calls",
    route: "Luzern -> Basel drop-off -> Zurich Airport",
    routePlaces: [homeAddress, baselAirport, zurichAirport],
  },
];

function workBlock({ id, day, time, duration, durationMinutes, title, venue, brief, note }) {
  return {
    id,
    day,
    time,
    duration,
    durationMinutes,
    title,
    venue,
    location: "CEST",
    kind: "WORK",
    compact: true,
    work: true,
    noActions: true,
    image: "",
    brief,
    note,
    parking: "Mainland Spain and Switzerland are both CEST in June.",
    action: "Work",
  };
}

const stops = [
  {
    id: "jun15-flight",
    day: "jun15",
    time: "06:00",
    duration: "2h 10m",
    durationMinutes: 130,
    title: "Fly Valencia to Zurich",
    venue: "Swiss direct flight",
    location: "VLC -> ZRH",
    kind: "AIR",
    compact: true,
    image: "assets/trip/euroairport.jpg",
    query: zurichAirport,
    origin: valenciaAirport,
    brief: "Land 08:10. Keep passports, rental voucher, license, and card together.",
    note: "Land in Zurich at 08:10. Keep passport, car voucher, license, and card together so rental pickup is quick.",
    parking: "No car yet. After baggage, go straight to the rental counter.",
    action: "ZRH map",
  },
  {
    id: "jun15-rental",
    day: "jun15",
    time: "08:35",
    duration: "40m",
    durationMinutes: 40,
    title: "Collect rental car",
    venue: "Smart #1 reservation",
    location: "Zurich Airport",
    kind: "CAR",
    compact: true,
    image: "assets/trip/euroairport.jpg",
    query: "Zurich Airport Car Rental Center",
    origin: "Zurich Airport arrivals",
    brief: "Photo walkaround, pair phone, set destination to Basel before leaving.",
    note: "Do a quick photo walkaround, pair phone navigation, and set the first drive to Basel before leaving the garage.",
    parking: "Follow rental return signs later on Jun 18. Confirm whether the contract expects return at Zurich Airport.",
    action: "Rental",
  },
  {
    id: "jun15-drive-basel",
    day: "jun15",
    time: "09:15",
    duration: "1h 20m",
    durationMinutes: 80,
    title: "Drive Zurich to Basel",
    venue: "Pickup run",
    location: "Zurich -> Basel",
    kind: "DRIVE",
    compact: true,
    image: "assets/trip/euroairport.jpg",
    query: baselAirport,
    origin: zurichAirport,
    brief: "Corrected route: Basel pickup before Bern, not Zurich straight to Bern.",
    note: "This is the important correction: go to Basel first to pick up your wife and her mom before heading south to Bern.",
    parking: "Use short-term arrivals/drop-off at EuroAirport unless their exact pickup point is Basel city or Basel SBB.",
    action: "Drive",
  },
  workBlock({
    id: "jun15-teddy",
    day: "jun15",
    time: "10:00",
    duration: "30m",
    durationMinutes: 30,
    title: "Teddy Himmler meeting",
    venue: "Work call",
    brief: "Spain time = Switzerland time. This overlaps the Zurich-to-Basel drive.",
    note: "Teddy Himmler meeting. Mainland Spain and Switzerland are both on CEST in June, so 10:00 Spain time is 10:00 in Switzerland. This lands during the Zurich-to-Basel drive.",
  }),
  {
    id: "jun15-basel-pickup",
    day: "jun15",
    time: "10:45",
    duration: "25m",
    durationMinutes: 25,
    title: "Pick up family",
    venue: "Wife and mom pickup",
    location: "Basel",
    kind: "PICK",
    compact: true,
    image: "assets/trip/euroairport.jpg",
    query: baselAirport,
    origin: zurichAirport,
    brief: "Assumes EuroAirport. Swap to Basel SBB or hotel if that is the real point.",
    note: "Assuming EuroAirport Basel. If their pickup point is Basel SBB or a hotel, swap the Maps destination before you start the drive.",
    parking: "Stay in short-term parking/drop-off and avoid unpacking anything except what they need in the cabin.",
    action: "Pickup",
  },
  {
    id: "jun15-drive-bern",
    day: "jun15",
    time: "11:15",
    duration: "1h 20m",
    durationMinutes: 80,
    title: "Drive Basel to Bern",
    venue: "Casino Parking target",
    location: "Basel -> Bern",
    kind: "DRIVE",
    compact: true,
    image: "assets/trip/bern.jpg",
    query: casinoParkingBern,
    origin: baselAirport,
    brief: "Navigate to Casino Parking first; lunch is easier from the garage.",
    note: "Set the destination to Casino Parking, not the restaurant. Lunch is easier if the car is already in the Old Town garage.",
    parking: "Primary: Casino Parking Bern. Backup: Rathaus Parking Bern.",
    action: "Park",
  },
  {
    id: "jun15-rosengarten",
    day: "jun15",
    time: "12:45",
    duration: "75m",
    durationMinutes: 75,
    title: "Lunch with Bern panorama",
    venue: "Restaurant Rosengarten",
    location: "Bern",
    kind: "EAT",
    image: "assets/trip/rosengarten.jpg",
    query: "Restaurant Rosengarten, Alter Aargauerstalden 31b, Bern",
    origin: casinoParkingBern,
    note: "First relaxed meal with the full group. If the weather is good, ask for terrace seating and use this as the trip reset.",
    parking: "Leave the car at Casino Parking. Walk, taxi, or take the short hop up depending on energy.",
    action: "Lunch",
    links: [
      { label: "Menu/info", url: links.rosengartenInfo },
    ],
  },
  {
    id: "jun15-drive-thun",
    day: "jun15",
    time: "14:15",
    duration: "35m",
    durationMinutes: 35,
    title: "Drive Bern to Thun Park",
    venue: "Schadau Park detour",
    location: "Bern -> Thun",
    kind: "DRIVE",
    compact: true,
    optional: true,
    image: "assets/trip/thun-schadau.jpg",
    query: thunParking,
    origin: "Restaurant Rosengarten Bern",
    brief: "Optional scenic detour: choose this only if flight, pickup, and lunch are running smoothly.",
    note: "Optional scenic detour after Bern. This adds time but gives you Lake Thun, Schloss Schadau, and a more memorable arrival drive.",
    parking: "Target Parking Schadau or nearby public parking, then walk into Schadau Park.",
    action: "Thun park",
  },
  {
    id: "jun15-schadau",
    day: "jun15",
    time: "14:55",
    duration: "45m",
    durationMinutes: 45,
    title: "Lake Thun stretch",
    venue: "Schadau Park",
    location: "Thun",
    kind: "VIEW",
    optional: true,
    image: "assets/trip/thun-schadau.jpg",
    query: schadauPark,
    origin: thunParking,
    note: "Worth it if everyone has energy: a calm lakefront walk, castle exterior, benches by the water, and the Thun Panorama nearby.",
    parking: "Keep this to 30-45 minutes. The value is the lakeside reset, not a full Thun visit.",
    action: "Park",
    itemsTitle: "Notice here",
    items: [
      "Schloss Schadau and the lawn opening toward Lake Thun.",
      "The lake wall and mountain view toward the Bernese Alps.",
      "Thun Panorama if you want one quick culture hit.",
    ],
    links: [
      { label: "Info", url: links.schadauPark },
    ],
  },
  {
    id: "jun15-groceries",
    day: "jun15",
    time: "15:50",
    duration: "35m",
    durationMinutes: 35,
    title: "Groceries for the stay",
    venue: "Coop City Thun",
    location: "Thun",
    kind: "SHOP",
    image: "assets/trip/thun-schadau.jpg",
    query: coopThun,
    origin: schadauPark,
    note: "Keep this surgical: breakfast supplies, water, and mountain snacks. If you skip Thun, buy the same list at Coop City Bern or near Lucerne.",
    parking: "Avoid a long city search. One person can shop while the others reset, or defer perishables to Lucerne.",
    action: "Shop",
    itemsTitle: "Swiss grocery picks",
    items: [
      "Zopf bread, butter, local jam, and honey for breakfast.",
      "Birchermuesli, Swiss yogurt, berries, and bananas.",
      "Gruyere or Appenzeller, dried meat, pickles, and crackers.",
      "Rosti, Rivella, sparkling water, chocolate, and trail snacks.",
    ],
  },
  {
    id: "jun15-drive-luzern",
    day: "jun15",
    time: "16:30",
    duration: "2h",
    durationMinutes: 120,
    title: "Drive Thun to Luzern",
    venue: "Apartment approach",
    location: "Thun -> Luzern",
    kind: "DRIVE",
    compact: true,
    image: "assets/trip/lucerne.jpg",
    query: homeAddress,
    origin: coopThun,
    brief: "Longer scenic arrival if you keep Thun. If tired, skip Thun and drive Bern -> Luzern direct.",
    note: "The scenic route via the Bernese Oberland is prettier but makes arrival day longer. If the day is slipping, skip Thun and route straight to Luzern.",
    parking: "Navigate to the apartment first for unloading. If there is no host parking, use Parkhaus Altstadt or Bahnhofparking.",
    action: "Drive",
  },
  workBlock({
    id: "jun15-evening-work",
    day: "jun15",
    time: "18:00",
    duration: "1h 30m",
    durationMinutes: 90,
    title: "Work meetings",
    venue: "Evening block",
    brief: "18:00-19:30 CEST. This competes with Lucerne arrival if the Thun detour stays in.",
    note: "Work meetings from 18:00 to 19:30 CEST. If the Thun detour stays in, plan for this to collide with the arrival and check-in window.",
  }),
  {
    id: "jun15-checkin",
    day: "jun15",
    time: "18:35",
    duration: "45m",
    durationMinutes: 45,
    title: "Check in and park",
    venue: "Home in Luzern",
    location: "Maihofstrasse 39",
    kind: "HOME",
    image: "assets/trip/luzern-airbnb.png",
    query: homeAddress,
    origin: coopThun,
    note: "Hosted by Nico. Official check-in is 15:00. With the Thun detour, treat this as an early evening arrival and message Nico if timing slips.",
    parking: "Ask host about building parking. Backup searches: Parkhaus Altstadt, Bahnhofparking P1, or Parkhaus National.",
    action: "Home",
    links: [
      { label: "Altstadt P", url: mapsSearch(lucerneAltstadtParking) },
      { label: "Bahnhof P", url: mapsSearch(lucerneRailParking) },
    ],
  },
  workBlock({
    id: "jun15-vc",
    day: "jun15",
    time: "21:30",
    duration: "60m",
    durationMinutes: 60,
    title: "VC meeting",
    venue: "Late work call",
    brief: "21:30 CEST hold. Best taken from the apartment after dinner/reset.",
    note: "VC meeting at 21:30 CEST. This should be protected as an apartment call after arrival and dinner/reset.",
  }),
  {
    id: "jun16-breakfast",
    day: "jun16",
    time: "08:00",
    duration: "45m",
    durationMinutes: 45,
    title: "Breakfast at the apartment",
    venue: "Use the Coop haul",
    location: "Home in Luzern",
    kind: "HOME",
    image: "assets/trip/luzern-airbnb.png",
    query: homeAddress,
    origin: homeAddress,
    note: "Low-friction morning: coffee, Zopf, yogurt, Birchermuesli, fruit, cheese, and water bottles filled before the mountain drive.",
    parking: "No movement yet. Pack sunglasses, layers, water, and a small bag for the gondola.",
    action: "Address",
    itemsTitle: "Before leaving",
    items: [
      "Download or screenshot First tickets once purchased.",
      "Check Grindelwald First weather and live parking before driving.",
      "Put snacks and water where passengers can reach them.",
    ],
    links: [
      { label: "First weather", url: "https://www.jungfrau.ch/en-gb/live/weather/" },
    ],
  },
  {
    id: "jun16-drive-grindelwald",
    day: "jun16",
    time: "09:15",
    duration: "2h",
    durationMinutes: 120,
    title: "Drive to Grindelwald Terminal",
    venue: "Mountain day parking",
    location: "Luzern -> Grindelwald",
    kind: "DRIVE",
    compact: true,
    image: "assets/trip/grindelwald.jpg",
    query: grindelwaldTerminal,
    origin: homeAddress,
    brief: "Scenic drive via lake country. Park once at the Terminal and do not re-park in the village.",
    note: "Use the Terminal as the car target. The official First page recommends this for visitors arriving by car, with shuttle connection to the First cable car.",
    parking: "Park at Grindelwald Terminal. Do not try to park near the First valley station unless live guidance says otherwise.",
    action: "Terminal",
    links: [
      { label: "Parking", url: links.firstParking },
    ],
  },
  {
    id: "jun16-firstbahn",
    day: "jun16",
    time: "11:30",
    duration: "50m",
    durationMinutes: 50,
    title: "Take First cable car",
    venue: "Firstbahn Grindelwald",
    location: "Grindelwald -> First",
    kind: "LIFT",
    image: "assets/trip/grindelwald-first.jpg",
    query: "Firstbahn Grindelwald",
    origin: grindelwaldTerminal,
    brief: "Buy/check tickets first. Watch the Eiger/Wetterhorn views as you climb.",
    note: "Buy/check First cable car tickets before the trip. The official page lists the First Cable Car ticket from CHF 38.",
    parking: "Car stays at Grindelwald Terminal. Take the shuttle or walk into the village for the First valley station.",
    action: "Cable car",
    itemsTitle: "Watch for",
    items: [
      "Bort and Schreckfeld intermediate stations on the way up.",
      "The Eiger-facing view opening as the gondola climbs.",
    ],
    links: [
      { label: "Tickets", url: links.firstTickets },
      { label: "First info", url: "https://www.jungfrau.ch/en-gb/grindelwaldfirst/" },
    ],
  },
  {
    id: "jun16-first-lunch",
    day: "jun16",
    time: "12:30",
    duration: "75m",
    durationMinutes: 75,
    title: "Lunch above Grindelwald",
    venue: "First Mountain Restaurant",
    location: "First",
    kind: "EAT",
    image: "assets/trip/first-restaurant.jpg",
    query: "Berggasthaus First Grindelwald",
    origin: "Firstbahn Grindelwald",
    note: "This is the actual lunch-above-Grindelwald stop. The official page describes Swiss classics and panoramic views at 2167 m.",
    parking: "No car movement; you are on the mountain.",
    action: "Lunch",
    itemsTitle: "Best use of this stop",
    items: [
      "Terrace if weather is clear.",
      "Treat Bachalpsee as a separate hike, not a casual add-on; it can add roughly two hours round-trip.",
      "If clouds roll in, eat and descend earlier for village time.",
    ],
    links: [
      { label: "Restaurant", url: links.firstRestaurant },
      { label: "Tickets", url: links.firstTickets },
    ],
  },
  {
    id: "jun16-first-walk",
    day: "jun16",
    time: "14:00",
    duration: "65m",
    durationMinutes: 65,
    title: "First Cliff Walk and view",
    venue: "First Cliff Walk",
    location: "Grindelwald-First",
    kind: "VIEW",
    image: "assets/trip/grindelwald-first.jpg",
    query: "First Cliff Walk by Tissot",
    origin: "Berggasthaus First Grindelwald",
    note: "If skies are clear, prioritize the Cliff Walk and First View platform before descending to the village.",
    parking: "No parking required.",
    action: "Cliff Walk",
    itemsTitle: "Do not miss",
    items: [
      "The suspended cliff path sections built into the rock.",
      "The final viewing platform for the Eiger, Monch, Jungfrau, and valley sweep.",
      "A quick weather call: this stop is much better before clouds build.",
    ],
    links: [
      { label: "First info", url: "https://www.jungfrau.ch/en-gb/grindelwaldfirst/" },
    ],
  },
  {
    id: "jun16-village",
    day: "jun16",
    time: "15:30",
    duration: "70m",
    durationMinutes: 70,
    title: "Village promenade",
    venue: "Grindelwald Dorfstrasse",
    location: "Grindelwald",
    kind: "WALK",
    image: "assets/trip/grindelwald.jpg",
    query: "Grindelwald Dorfstrasse",
    origin: "Firstbahn Grindelwald",
    note: "Flexible village window for coffee, photos, shopping, and an unrushed return to the car.",
    parking: "Leave the car at Grindelwald Terminal and avoid re-parking in the village core.",
    action: "Village",
    itemsTitle: "What to see",
    items: [
      "Dorfstrasse for cafes, souvenirs, and the classic village look.",
      "Views toward the Eiger north face and Wetterhorn from the open stretches.",
      "A short coffee stop rather than another big meal before Lucerne dinner.",
    ],
  },
  {
    id: "jun16-drive-luzern",
    day: "jun16",
    time: "16:45",
    duration: "2h",
    durationMinutes: 120,
    title: "Drive back to Lucerne Old Town",
    venue: "Dinner approach",
    location: "Grindelwald -> Luzern",
    kind: "DRIVE",
    compact: true,
    image: "assets/trip/lucerne.jpg",
    query: lucerneAltstadtParking,
    origin: grindelwaldTerminal,
    brief: "Route to parking first, not the restaurant. Protect dinner timing.",
    note: "Route to parking first, not the restaurant. This protects dinner timing if Old Town traffic is tight.",
    parking: "Primary: Parkhaus Altstadt. Backup: Bahnhofparking P1.",
    action: "Park",
  },
  workBlock({
    id: "jun16-evening-work",
    day: "jun16",
    time: "18:00",
    duration: "60m",
    durationMinutes: 60,
    title: "Work meetings",
    venue: "Evening block",
    brief: "18:00-19:00 CEST. This may need to happen from the car if Grindelwald runs long.",
    note: "Work meetings from 18:00 to 19:00 CEST. This overlaps the Grindelwald-to-Lucerne return buffer if the mountain day slips.",
  }),
  {
    id: "jun16-balances",
    day: "jun16",
    time: "19:00",
    duration: "90m",
    durationMinutes: 90,
    title: "Dinner on the Reuss",
    venue: "Restaurant Balances",
    location: "Lucerne Old Town",
    kind: "EAT",
    image: "assets/trip/balances.jpg",
    query: "Restaurant Balances Luzern",
    origin: lucerneAltstadtParking,
    note: "Official restaurant page includes menu and table booking. Arrive with a short walk buffer from the garage.",
    parking: "Parkhaus Altstadt or Bahnhofparking P1, then walk through Old Town.",
    action: "Dinner",
    links: [
      { label: "Menu", url: links.balancesMenu },
      { label: "Reserve", url: "https://mytools.aleno.me/reservations/v2.0/reservations.html?k=eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJIT0RFIiwibG9jYWxlIjoiZW4ifQ.G0ibcAiWTr9tKb0ZW4FQsxF6XYnWBymADYoJqBNVTu9oXqvDcIs60tP8ABi1zNNgGQ6YrDz74OGoD89rZDLF3g" },
    ],
  },
  workBlock({
    id: "jun16-vc",
    day: "jun16",
    time: "19:30",
    duration: "60m",
    durationMinutes: 60,
    title: "VC meeting",
    venue: "Dinner conflict",
    brief: "19:30-20:30 CEST. This overlaps Restaurant Balances unless dinner moves.",
    note: "VC meeting from 19:30 to 20:30 CEST. This overlaps the current Restaurant Balances dinner plan unless dinner is moved later or the call is taken away from the table.",
  }),
  {
    id: "jun17-park-pier",
    day: "jun17",
    time: "08:20",
    duration: "30m",
    durationMinutes: 30,
    title: "Park for boat day",
    venue: "Bahnhofparking P1",
    location: "Lucerne station",
    kind: "PARK",
    compact: true,
    image: "assets/trip/lucerne.jpg",
    query: lucerneRailParking,
    origin: homeAddress,
    brief: "Punctuality day: park by 08:20 and walk to Pier 1.",
    note: "This is the punctuality day. Park by 08:20, walk to Bahnhofquai, and find the correct pier before boarding.",
    parking: "Use Bahnhofparking P1 for the full lake/Rigi loop.",
    action: "Parking",
    links: [
      { label: "Pier map", url: links.lakePierMap },
      { label: "Timetable", url: links.lakeTimetable },
    ],
  },
  {
    id: "jun17-boat-vitznau",
    day: "jun17",
    time: "09:00",
    duration: "75m",
    durationMinutes: 75,
    title: "Boat to Vitznau",
    venue: "Lake Lucerne Navigation",
    location: "Luzern Bahnhofquai",
    kind: "BOAT",
    compact: true,
    image: "assets/trip/lake-lucerne-boat.jpg",
    query: "Luzern Bahnhofquai Pier 1",
    origin: lucerneRailParking,
    travelMode: "walking",
    brief: "Pier 1 for Vitznau/Weggis routes. Check the timetable the night before.",
    note: "Official pier guidance says departures to Weggis and Vitznau for Rigi use Pier 1. Check the live routing link the night before.",
    parking: "Car remains at Bahnhofparking P1.",
    action: "Pier",
    links: [
      { label: "Boat tickets", url: links.lakeTickets },
      { label: "Timetable", url: links.lakeTimetable },
      { label: "Pier map", url: links.lakePierMap },
    ],
  },
  {
    id: "jun17-rigi-bahn",
    day: "jun17",
    time: "10:15",
    duration: "45m",
    durationMinutes: 45,
    title: "Railway to Rigi Kulm",
    venue: "Vitznau-Rigi-Bahn",
    location: "Vitznau",
    kind: "RAIL",
    compact: true,
    image: "assets/trip/rigi-rail.jpg",
    query: "Vitznau Rigi Bahn",
    origin: "Luzern Bahnhofquai Pier 1",
    brief: "Boat-to-cogwheel transfer. Keep tickets and phone battery ready.",
    note: "Transfer from boat to cogwheel railway. The Rigi ticket page is the right place to buy/check rail, cable car, and combined options.",
    parking: "No car movement. Keep tickets and phone battery ready.",
    action: "Station",
    links: [
      { label: "Rigi tickets", url: links.rigiTickets },
      { label: "Timetable", url: links.rigiTimetable },
    ],
  },
  {
    id: "jun17-rigi-kulm",
    day: "jun17",
    time: "11:00",
    duration: "90m",
    durationMinutes: 90,
    title: "Summit sightseeing",
    venue: "Rigi Kulm",
    location: "Rigi Kulm",
    kind: "VIEW",
    image: "assets/trip/rigi.jpg",
    query: "Rigi Kulm",
    origin: "Vitznau Rigi Bahn",
    note: "Top priority is the summit view. If weather is poor, shorten this and spend more time in Kaltbad or lakeside.",
    parking: "No parking required.",
    action: "Summit",
    links: [
      { label: "Timetable", url: links.rigiTimetable },
    ],
  },
  {
    id: "jun17-kaltbad",
    day: "jun17",
    time: "13:15",
    duration: "35m",
    durationMinutes: 35,
    title: "Coffee stop",
    venue: "Rigi Kaltbad",
    location: "Rigi Kaltbad",
    kind: "CAFE",
    image: "assets/trip/rigi.jpg",
    query: "Rigi Kaltbad",
    origin: "Rigi Kulm",
    note: "Reset stop between summit and descent. Good place for restroom, coffee, and checking the Weggis cable car timing.",
    parking: "No parking required.",
    action: "Cafe",
    links: [
      { label: "Rigi map", url: "https://www.siscontrol.ch/v007/sismap/rigi/0?season=1&seasonFilter=hide" },
    ],
  },
  {
    id: "jun17-weggis-lunch",
    day: "jun17",
    time: "14:30",
    duration: "60m",
    durationMinutes: 60,
    title: "Lakeside lunch",
    venue: "Weggis flex table",
    location: "Weggis",
    kind: "EAT",
    image: "assets/trip/lucerne.jpg",
    query: "Hotel Beau Rivage Weggis Restaurant",
    origin: "Rigi Kaltbad",
    note: "Use Weggis as the flex point if Rigi timing runs long. Restaurant Oliv domain did not resolve reliably, so Beau Rivage is the safer mapped fallback.",
    parking: "No car if descending via Weggis. Return to Lucerne by boat after lunch.",
    action: "Lunch",
  },
  {
    id: "jun17-return-boat",
    day: "jun17",
    time: "15:45",
    duration: "45m",
    durationMinutes: 45,
    title: "Return boat to Lucerne",
    venue: "Weggis -> Luzern",
    location: "Weggis pier",
    kind: "BOAT",
    compact: true,
    image: "assets/trip/lake-lucerne-boat.jpg",
    query: "Weggis Schiffstation",
    origin: "Hotel Beau Rivage Weggis Restaurant",
    travelMode: "walking",
    brief: "Check the return boat before lunch; protect the museum/dinner window.",
    note: "Check live boat timing before lunch. If the boat timing misses, use bus/taxi logic and protect the museum/dinner window.",
    parking: "Car is waiting at Bahnhofparking P1.",
    action: "Pier",
    links: [
      { label: "Timetable", url: links.lakeTimetable },
      { label: "Boat tickets", url: links.lakeTickets },
    ],
  },
  {
    id: "jun17-museum",
    day: "jun17",
    time: "16:45",
    duration: "85m",
    durationMinutes: 85,
    title: "Museum visit",
    venue: "Swiss Museum of Transport",
    location: "Lucerne",
    kind: "MUSE",
    image: "assets/trip/museum.jpg",
    query: "Swiss Museum of Transport, Lidostrasse 5, Luzern",
    origin: lucerneRailParking,
    note: "Buy/check tickets if you want to guarantee the museum, Filmtheatre, Planetarium, or Chocolate Adventure options.",
    parking: "Either move the car to museum parking or take a short taxi from the station area.",
    action: "Museum",
    links: [
      { label: "Tickets", url: links.museumTickets },
    ],
  },
  workBlock({
    id: "jun17-evening-work",
    day: "jun17",
    time: "18:00",
    duration: "60m",
    durationMinutes: 60,
    title: "Work meetings",
    venue: "Evening block",
    brief: "18:00-19:00 CEST. Keep the museum visit flexible so this does not get squeezed.",
    note: "Work meetings from 18:00 to 19:00 CEST. This starts right after the museum window, so keep the museum visit flexible.",
  }),
  {
    id: "jun17-galliker",
    day: "jun17",
    time: "19:00",
    duration: "90m",
    durationMinutes: 90,
    title: "Final dinner",
    venue: "Wirtshaus Galliker",
    location: "Lucerne",
    kind: "EAT",
    image: "assets/trip/galliker.jpg",
    query: "Wirtshaus Galliker Luzern",
    origin: "Swiss Museum of Transport",
    note: "Classic Lucerne closing dinner. The official site emphasizes traditional Swiss dishes like cordon bleu, bratwurst with rosti, and Luzerner Chuegelipastetli.",
    parking: "Parkhaus Altstadt or taxi from the apartment if everyone is tired.",
    action: "Dinner",
    links: [
      { label: "Website", url: links.gallikerSite },
    ],
  },
  workBlock({
    id: "jun17-vc",
    day: "jun17",
    time: "21:30",
    duration: "60m",
    durationMinutes: 60,
    title: "VC meeting",
    venue: "Late work call",
    brief: "21:30 CEST hold after final dinner.",
    note: "VC or late work meeting at 21:30 CEST. Best protected after Wirtshaus Galliker rather than during the restaurant window.",
  }),
  {
    id: "jun18-checkout",
    day: "jun18",
    time: "08:45",
    duration: "30m",
    durationMinutes: 30,
    title: "Checkout and load car",
    venue: "Home in Luzern",
    location: "Maihofstrasse 39",
    kind: "HOME",
    compact: true,
    image: "assets/trip/luzern-airbnb.png",
    query: homeAddress,
    origin: homeAddress,
    brief: "Leave early despite 11:00 checkout; Basel drop-off comes before ZRH.",
    note: "Checkout is listed for 11:00, but leave early enough to drop the family in Basel and still reach Zurich Airport comfortably.",
    parking: "Do a final apartment sweep before moving the car.",
    action: "Address",
  },
  {
    id: "jun18-drive-basel",
    day: "jun18",
    time: "09:15",
    duration: "1h 30m",
    durationMinutes: 90,
    title: "Drive Lucerne to Basel",
    venue: "Family drop-off",
    location: "Luzern -> Basel",
    kind: "DRIVE",
    compact: true,
    image: "assets/trip/euroairport.jpg",
    query: baselAirport,
    origin: homeAddress,
    brief: "Drop family in Basel first. Confirm exact EuroAirport/SBB/hotel point.",
    note: "Drop your wife and her mom in Basel first. This stop assumes EuroAirport Basel; change the map if the actual drop point is Basel SBB or a hotel.",
    parking: "Use airport short-term drop-off and keep your Zurich airport bags accessible.",
    action: "Basel",
  },
  {
    id: "jun18-drive-zurich",
    day: "jun18",
    time: "11:15",
    duration: "1h 25m",
    durationMinutes: 85,
    title: "Drive Basel to Zurich Airport",
    venue: "Return car buffer",
    location: "Basel -> ZRH",
    kind: "DRIVE",
    compact: true,
    image: "assets/trip/euroairport.jpg",
    query: zurichAirport,
    origin: baselAirport,
    brief: "After Basel, return to ZRH for car return and the 16:55 flight.",
    note: "After Basel drop-off, drive to Zurich for rental return and the 16:55 Swiss flight back to Valencia.",
    parking: "Follow Zurich Airport rental return signs and keep fuel/charging expectations from the rental contract in mind.",
    action: "ZRH",
  },
  {
    id: "jun18-return-flight",
    day: "jun18",
    time: "16:55",
    duration: "2h 10m",
    durationMinutes: 130,
    title: "Fly Zurich to Valencia",
    venue: "Swiss direct flight",
    location: "ZRH -> VLC",
    kind: "AIR",
    compact: true,
    image: "assets/trip/euroairport.jpg",
    query: zurichAirport,
    origin: "Zurich Airport car rental return",
    brief: "Depart 16:55, arrive Valencia 19:05. Build buffer for car return.",
    note: "Scheduled arrival in Valencia is 19:05. Build the airport buffer around car return, security, and a relaxed final meal/snack.",
    parking: "Rental returned before this point.",
    action: "Depart",
  },
  workBlock({
    id: "jun18-evening-work",
    day: "jun18",
    time: "18:00",
    duration: "60m",
    durationMinutes: 60,
    title: "Work meetings",
    venue: "Flight conflict",
    brief: "18:00-19:00 CEST overlaps the ZRH-to-Valencia flight.",
    note: "Work meetings from 18:00 to 19:00 CEST. This overlaps the return flight, so treat it as a real conflict unless airplane Wi-Fi and call conditions are acceptable.",
  }),
  workBlock({
    id: "jun18-vc",
    day: "jun18",
    time: "21:30",
    duration: "60m",
    durationMinutes: 60,
    title: "VC meeting",
    venue: "Late work call",
    brief: "21:30 CEST hold after landing in Valencia.",
    note: "VC or late work meeting at 21:30 CEST after landing back in Valencia.",
  }),
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

function mapsSearch(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function mapsDirections(destination, origin, travelmode) {
  const params = new URLSearchParams({ api: "1", destination });
  if (origin) params.set("origin", origin);
  if (travelmode) params.set("travelmode", travelmode);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function routeLink(places) {
  const params = new URLSearchParams({
    api: "1",
    origin: places[0],
    destination: places[places.length - 1],
    travelmode: "driving",
  });
  const waypoints = places.slice(1, -1).join("|");
  if (waypoints) params.set("waypoints", waypoints);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function travelModeForStop(stop) {
  if (stop.travelMode) return stop.travelMode;
  if (["CAR", "DRIVE", "PARK"].includes(stop.kind)) return "driving";
  if (["WALK", "HOME"].includes(stop.kind)) return "walking";
  if (["BOAT", "RAIL", "LIFT"].includes(stop.kind)) return "transit";
  return undefined;
}

function tripDateTime(stop) {
  return new Date(`${dayDates[stop.day]}T${stop.time}:00+02:00`);
}

function stopEndTime(stop, index) {
  const start = tripDateTime(stop);
  if (stop.durationMinutes) {
    return new Date(start.getTime() + stop.durationMinutes * 60000);
  }
  const next = stops[index + 1];
  return next ? tripDateTime(next) : new Date(start.getTime() + 60 * 60000);
}

function formatSwissTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatSwissDateTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function timelineState(now = new Date()) {
  const entries = stops.map((stop, index) => ({
    stop,
    index,
    start: tripDateTime(stop),
    end: stopEndTime(stop, index),
  }));
  const first = entries[0];
  const last = entries[entries.length - 1];
  const next = entries.find((entry) => entry.start > now) || null;
  const current = entries.filter((entry) => entry.start <= now).at(-1) || null;
  const phase = now < first.start ? "pretrip" : now > last.end ? "complete" : "active";
  return { now, entries, first, last, current, next, phase };
}

function statusForStop(stop, state) {
  if (state.phase === "pretrip" && state.next?.stop.id === stop.id) return "next";
  if (state.phase === "complete") return "past";
  if (state.current?.stop.id === stop.id) return "current";
  if (state.next?.stop.id === stop.id) return "next";
  if (tripDateTime(stop) < state.now) return "past";
  return "upcoming";
}

function tripProgress(state) {
  if (state.phase === "pretrip") return 0;
  if (state.phase === "complete") return 100;
  const total = state.last.end.getTime() - state.first.start.getTime();
  const done = state.now.getTime() - state.first.start.getTime();
  return Math.max(0, Math.min(100, (done / total) * 100));
}

function renderNext() {
  const state = timelineState();
  const current = state.current?.stop || null;
  const next = state.next?.stop || null;
  const focus = state.phase === "active" ? (next || current) : (next || current || stops[stops.length - 1]);
  const title = state.phase === "pretrip"
    ? `Next: ${next.time} ${next.title}`
    : state.phase === "complete"
      ? "Trip complete"
      : `Now: ${current.time} ${current.title}`;
  const detail = state.phase === "active" && next
    ? `${formatSwissDateTime(state.now)} CEST. Next move: ${next.time} ${next.title}. ${next.note}`
    : `${formatSwissDateTime(state.now)} CEST. ${focus.note}`;
  const hasFocusMap = focus && !focus.noActions && focus.query;
  const nextMap = document.getElementById("next-map");

  document.getElementById("next-title").textContent = title;
  document.getElementById("next-detail").textContent = detail;
  nextMap.textContent = state.phase === "active" && next ? "Next map" : "Open map";
  nextMap.style.display = hasFocusMap ? "" : "none";
  if (hasFocusMap) {
    nextMap.href = mapsDirections(focus.query, focus.origin, travelModeForStop(focus));
  } else {
    nextMap.removeAttribute("href");
  }
  document.getElementById("live-clock").textContent = `Swiss time ${formatSwissTime(state.now)}`;
  document.getElementById("trip-progress").style.width = `${tripProgress(state).toFixed(1)}%`;
}

function renderTabs() {
  const state = timelineState();
  const activeDay = state.current?.stop.day || state.next?.stop.day || days[days.length - 1].id;
  const tabs = document.getElementById("day-tabs");
  tabs.innerHTML = days.map((day) => `
    <a class="${activeDay === day.id ? "is-active" : ""}" href="#${day.id}" ${activeDay === day.id ? 'aria-current="true"' : ""}>
      <span>${day.tab}</span>
      <strong>${day.date}</strong>
    </a>
  `).join("");
}

function renderDays() {
  const state = timelineState();
  const list = document.getElementById("day-list");
  list.innerHTML = days.map((day) => {
    const dayStops = stops.filter((stop) => stop.day === day.id);
    return `
      <section class="day-section" id="${day.id}">
        <div class="day-heading">
          <div>
            <span class="trip-kicker">${day.date}</span>
            <h2>${escapeHtml(day.heading)}</h2>
            <p>${escapeHtml(day.route)}</p>
          </div>
          <a href="${day.routeUrl || routeLink(day.routePlaces)}" target="_blank" rel="noreferrer">${escapeHtml(day.routeAction || "Route")}</a>
        </div>
        <div class="timeline">
          ${dayStops.map((stop) => renderStop(stop, statusForStop(stop, state), state)).join("")}
        </div>
      </section>
    `;
  }).join("");
}

function renderStop(stop, status, state) {
  const statusLabel = status === "current" ? "NOW" : status === "next" ? "NEXT" : status === "past" ? "DONE" : "";
  const articleClasses = ["stop", `is-${status}`];
  if (stop.compact) articleClasses.push("is-compact");
  if (stop.optional) articleClasses.push("is-optional");
  if (stop.work) articleClasses.push("is-work");
  const imageStyle = stop.work ? "" : ` style="background-image: linear-gradient(180deg, rgba(7,18,18,.08), rgba(7,18,18,.58)), url('${escapeHtml(stop.image)}')"`;
  const stopLinks = stop.noActions
    ? []
    : [
      { label: stop.action || "Directions", url: mapsDirections(stop.query, stop.origin, travelModeForStop(stop)), primary: true },
      { label: "Place", url: mapsSearch(stop.query) },
      ...(stop.links || []),
    ];

  return `
    <article class="${articleClasses.join(" ")}" data-stop-id="${escapeHtml(stop.id)}">
      <div class="stop-time">
        <strong>${escapeHtml(stop.time)}</strong>
        <span>${escapeHtml(stop.duration)}</span>
        ${statusLabel ? `<em>${statusLabel}</em>` : ""}
      </div>
      <div class="stop-card">
        ${status === "current" ? `<div class="now-marker"><span>Current time</span><strong>${formatSwissTime(state.now)} CEST</strong></div>` : ""}
        <div class="stop-image"${imageStyle}>
          <span>${escapeHtml(stop.location)}</span>
        </div>
        <div class="stop-body">
          <div class="stop-title">
            <div>
              ${stop.optional ? `<span class="stop-flag">Optional</span>` : ""}
              <h3>${escapeHtml(stop.title)}</h3>
              <p>${escapeHtml(stop.venue)}</p>
            </div>
            <span class="stop-kind">${escapeHtml(stop.kind)}</span>
          </div>
          <p class="stop-note">${escapeHtml(stop.compact && stop.brief ? stop.brief : stop.note)}</p>
          ${stop.work ? `<div class="work-chip">Spain time = Switzerland time (CEST)</div>` : ""}
          ${stop.compact ? "" : renderStopItems(stop)}
          <div class="stop-meta">
            <span><b>Parking / transport:</b> ${escapeHtml(stop.parking)}</span>
          </div>
          ${stopLinks.length ? `
            <div class="stop-actions">
              ${stopLinks.map((link) => `
                <a class="${link.primary ? "primary" : ""}" href="${link.url}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>
              `).join("")}
            </div>
          ` : ""}
        </div>
      </div>
    </article>
  `;
}

function renderStopItems(stop) {
  if (!stop.items?.length) return "";
  return `
    <div class="stop-checklist">
      <b>${escapeHtml(stop.itemsTitle || "Checklist")}</b>
      <ul>
        ${stop.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </div>
  `;
}

function renderTrip() {
  renderNext();
  renderTabs();
  renderDays();
  document.getElementById("full-route").href = routeLink(days[0].routePlaces);
}

renderTrip();
window.setInterval(renderTrip, 60000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) renderTrip();
});
