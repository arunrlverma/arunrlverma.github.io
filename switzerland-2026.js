const homeAddress = "Maihofstrasse 39, 6004 Luzern, Switzerland";
const zurichAirport = "Zurich Airport, 8058 Zurich-Flughafen, Switzerland";
const baselAirport = "EuroAirport Basel Mulhouse Freiburg";

const days = [
  {
    id: "jun15",
    tab: "Mon",
    date: "Jun 15",
    heading: "Arrival, Bern stop, Lucerne check-in",
    route: "Zurich Airport -> Bern -> Lucerne",
    routePlaces: [zurichAirport, "Restaurant Rosengarten Bern", "Coop City Bern", homeAddress],
  },
  {
    id: "jun16",
    tab: "Tue",
    date: "Jun 16",
    heading: "Grindelwald First, village walk, Old Town dinner",
    route: "Lucerne -> Grindelwald -> Lucerne",
    routePlaces: [homeAddress, "Grindelwald Terminal", "Bergrestaurant First Grindelwald", "Restaurant Balances Luzern", homeAddress],
  },
  {
    id: "jun17",
    tab: "Wed",
    date: "Jun 17",
    heading: "Lake Lucerne, Rigi, Weggis, museum, final dinner",
    route: "Lucerne lake loop + Rigi",
    routePlaces: [homeAddress, "Luzern Bahnhofquai", "Vitznau Rigi Bahn", "Rigi Kulm", "Rigi Kaltbad", "Weggis", "Swiss Museum of Transport", "Wirtshaus Galliker"],
  },
  {
    id: "jun18",
    tab: "Thu",
    date: "Jun 18",
    heading: "Checkout and drive to Basel",
    route: "Lucerne -> EuroAirport Basel",
    routePlaces: [homeAddress, baselAirport],
  },
];

const stops = [
  {
    day: "jun15",
    time: "06:00",
    duration: "2h 10m",
    title: "Fly Valencia to Zurich",
    venue: "Swiss direct flight",
    location: "VLC -> ZRH",
    kind: "AIR",
    image: "assets/trip/euroairport.jpg",
    query: zurichAirport,
    note: "Arrive Zurich at 08:10. Collect luggage, pick up the Smart #1 rental, and start the drive day with a calm buffer.",
    parking: "Rental car is booked Jun 15-18. Keep license, booking voucher, and card ready at pickup.",
    action: "ZRH map",
  },
  {
    day: "jun15",
    time: "12:30",
    duration: "75m",
    title: "Lunch with Bern panorama",
    venue: "Restaurant Rosengarten",
    location: "Bern",
    kind: "EAT",
    image: "assets/trip/bern.jpg",
    query: "Restaurant Rosengarten, Alter Aargauerstalden 31b, Bern",
    origin: zurichAirport,
    note: "First relaxed stop after the Zurich drive. Sit outside if weather allows and use this as the trip reset.",
    parking: "Park at Casino Parking Bern or Rathaus Parking, then walk or taxi up if needed.",
    action: "Navigate",
  },
  {
    day: "jun15",
    time: "14:00",
    duration: "35m",
    title: "Groceries for the apartment",
    venue: "Coop City Bern",
    location: "Bern",
    kind: "SHOP",
    image: "assets/trip/bern.jpg",
    query: "Coop City Bern",
    origin: "Restaurant Rosengarten Bern",
    note: "Keep it efficient: water, breakfast basics, snacks, and anything needed for the mountain days.",
    parking: "Use the same Bern garage so the car does not move twice in Old Town traffic.",
    action: "Shop stop",
  },
  {
    day: "jun15",
    time: "17:00",
    duration: "30m",
    title: "Check in and settle",
    venue: "Home in Luzern",
    location: "Maihofstrasse 39",
    kind: "HOME",
    image: "assets/trip/luzern-airbnb.png",
    query: homeAddress,
    origin: "Coop City Bern",
    note: "Hosted by Nico. Check-in is listed for 15:00, so arriving around 17:00 should be comfortable.",
    parking: "Confirm Airbnb parking in advance. If unclear, identify nearby paid parking before unloading.",
    action: "Go home",
  },
  {
    day: "jun16",
    time: "12:30",
    duration: "75m",
    title: "Lunch above Grindelwald",
    venue: "Bergrestaurant First",
    location: "First",
    kind: "ALP",
    image: "assets/trip/grindelwald.jpg",
    query: "Bergrestaurant First Grindelwald",
    origin: homeAddress,
    note: "Park at Grindelwald Terminal, then take the mountain transport up. Keep weather layers and sunglasses accessible.",
    parking: "Park at Grindelwald Terminal. Do not try to drive to First.",
    action: "Terminal",
  },
  {
    day: "jun16",
    time: "14:00",
    duration: "2h",
    title: "Village promenade",
    venue: "Grindelwald village",
    location: "Grindelwald",
    kind: "WALK",
    image: "assets/trip/grindelwald.jpg",
    query: "Grindelwald Dorfstrasse",
    origin: "Grindelwald Terminal",
    note: "Flexible window for First Cliff Walk, village stroll, coffee, photos, and not rushing the return.",
    parking: "Leave the car at Grindelwald Terminal and avoid re-parking in the village core.",
    action: "Village",
  },
  {
    day: "jun16",
    time: "19:00",
    duration: "90m",
    title: "Dinner on the Reuss",
    venue: "Restaurant Balances",
    location: "Lucerne Old Town",
    kind: "EAT",
    image: "assets/trip/lucerne.jpg",
    query: "Restaurant Balances Luzern",
    origin: "Grindelwald Terminal",
    note: "Return from Grindelwald with enough buffer for parking and a short Old Town walk.",
    parking: "Use Parkhaus Altstadt or Bahnhof Parking Lucerne.",
    action: "Dinner",
  },
  {
    day: "jun17",
    time: "09:00",
    duration: "75m",
    title: "Boat to Vitznau",
    venue: "SGV Lake Lucerne boat",
    location: "Lucerne pier",
    kind: "BOAT",
    image: "assets/trip/lucerne.jpg",
    query: "Luzern Bahnhofquai",
    origin: homeAddress,
    note: "This is the punctuality day. Aim to be parked and at the pier before 08:45.",
    parking: "Park at Bahnhof Parking Lucerne and walk to the pier.",
    action: "Pier",
  },
  {
    day: "jun17",
    time: "10:15",
    duration: "45m",
    title: "Railway to Rigi Kulm",
    venue: "Rigi Bahn",
    location: "Vitznau",
    kind: "RAIL",
    image: "assets/trip/rigi-rail.jpg",
    query: "Vitznau Rigi Bahn",
    origin: "Luzern Bahnhofquai",
    note: "Transfer from the boat to the cogwheel railway. Keep tickets and phone battery ready.",
    parking: "Included in the Rigi excursion route. No car movement here.",
    action: "Station",
  },
  {
    day: "jun17",
    time: "11:00",
    duration: "90m",
    title: "Summit sightseeing",
    venue: "Rigi Kulm Summit",
    location: "Rigi Kulm",
    kind: "VIEW",
    image: "assets/trip/rigi.jpg",
    query: "Rigi Kulm",
    origin: "Vitznau Rigi Bahn",
    note: "Top priority is the summit view. If weather is poor, shorten this and spend more time lakeside.",
    parking: "No parking required.",
    action: "Summit",
  },
  {
    day: "jun17",
    time: "13:15",
    duration: "35m",
    title: "Coffee stop",
    venue: "Hotel Rigi Kaltbad Cafe",
    location: "Rigi Kaltbad",
    kind: "CAFE",
    image: "assets/trip/rigi.jpg",
    query: "Hotel Rigi Kaltbad",
    origin: "Rigi Kulm",
    note: "Reset stop between summit and descent. Quick coffee, restroom, lake view.",
    parking: "No parking required.",
    action: "Cafe",
  },
  {
    day: "jun17",
    time: "14:30",
    duration: "75m",
    title: "Lakeside lunch",
    venue: "Restaurant Oliv or Hotel Beau Rivage",
    location: "Weggis",
    kind: "EAT",
    image: "assets/trip/lucerne.jpg",
    query: "Hotel Beau Rivage Weggis Restaurant",
    origin: "Rigi Kaltbad",
    note: "Choose the easiest available table. Weggis is the flex point if Rigi timing runs long.",
    parking: "Parkhaus Zentrum Weggis or lakeside public parking.",
    action: "Lunch",
  },
  {
    day: "jun17",
    time: "16:00",
    duration: "90m",
    title: "Museum visit",
    venue: "Swiss Museum of Transport",
    location: "Lucerne",
    kind: "MUSE",
    image: "assets/trip/museum.jpg",
    query: "Swiss Museum of Transport, Lidostrasse 5, Luzern",
    origin: "Weggis",
    note: "High-yield stop if weather turns or the mountain day finishes early.",
    parking: "Museum parking is available onsite.",
    action: "Museum",
  },
  {
    day: "jun17",
    time: "19:00",
    duration: "90m",
    title: "Final dinner",
    venue: "Wirtshaus Galliker",
    location: "Lucerne",
    kind: "EAT",
    image: "assets/trip/lucerne.jpg",
    query: "Wirtshaus Galliker Luzern",
    origin: "Swiss Museum of Transport",
    note: "Classic Lucerne closing dinner. Consider taxi from the apartment if parking feels annoying.",
    parking: "Parkhaus Altstadt or taxi from Airbnb.",
    action: "Dinner",
  },
  {
    day: "jun18",
    time: "10:00",
    duration: "Drive",
    title: "Checkout and drive to Basel",
    venue: "EuroAirport Basel",
    location: "Basel airport",
    kind: "AIR",
    image: "assets/trip/euroairport.jpg",
    query: baselAirport,
    origin: homeAddress,
    note: "Leave buffer for rental return and cross-border airport signs. The airport is binational, so follow the rental company's return instructions exactly.",
    parking: "Airport parking/drop-off. Confirm rental return location before departure.",
    action: "Basel",
  },
];

function mapsSearch(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function mapsDirections(destination, origin) {
  const params = new URLSearchParams({ api: "1", destination });
  if (origin) params.set("origin", origin);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function routeLink(places) {
  const params = new URLSearchParams({
    api: "1",
    origin: places[0],
    destination: places[places.length - 1],
  });
  const waypoints = places.slice(1, -1).join("|");
  if (waypoints) params.set("waypoints", waypoints);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function tripDateTime(stop) {
  const date = {
    jun15: "2026-06-15",
    jun16: "2026-06-16",
    jun17: "2026-06-17",
    jun18: "2026-06-18",
  }[stop.day];
  return new Date(`${date}T${stop.time}:00+02:00`);
}

function findNextStop() {
  const now = new Date();
  return stops.find((stop) => tripDateTime(stop) >= now) || stops[stops.length - 1];
}

function renderNext() {
  const stop = findNextStop();
  document.getElementById("next-title").textContent = `${stop.time} ${stop.title}`;
  document.getElementById("next-detail").textContent = `${stop.venue}. ${stop.note}`;
  document.getElementById("next-map").href = mapsDirections(stop.query, stop.origin);
}

function renderTabs() {
  const tabs = document.getElementById("day-tabs");
  tabs.innerHTML = days.map((day) => `
    <a href="#${day.id}">
      <span>${day.tab}</span>
      <strong>${day.date}</strong>
    </a>
  `).join("");
}

function renderDays() {
  const list = document.getElementById("day-list");
  list.innerHTML = days.map((day) => {
    const dayStops = stops.filter((stop) => stop.day === day.id);
    return `
      <section class="day-section" id="${day.id}">
        <div class="day-heading">
          <div>
            <span class="trip-kicker">${day.date}</span>
            <h2>${day.heading}</h2>
            <p>${day.route}</p>
          </div>
          <a href="${routeLink(day.routePlaces)}" target="_blank" rel="noreferrer">Route</a>
        </div>
        <div class="timeline">
          ${dayStops.map(renderStop).join("")}
        </div>
      </section>
    `;
  }).join("");
}

function renderStop(stop) {
  return `
    <article class="stop">
      <div class="stop-time">
        <strong>${stop.time}</strong>
        <span>${stop.duration}</span>
      </div>
      <div class="stop-card">
        <div class="stop-image" style="background-image: linear-gradient(180deg, rgba(7,18,18,.08), rgba(7,18,18,.58)), url('${stop.image}')">
          <span>${stop.location}</span>
        </div>
        <div class="stop-body">
          <div class="stop-title">
            <div>
              <h3>${stop.title}</h3>
              <p>${stop.venue}</p>
            </div>
            <span class="stop-kind">${stop.kind}</span>
          </div>
          <p class="stop-note">${stop.note}</p>
          <div class="stop-meta">
            <span><b>Parking / transport:</b> ${stop.parking}</span>
          </div>
          <div class="stop-actions">
            <a class="primary" href="${mapsDirections(stop.query, stop.origin)}" target="_blank" rel="noreferrer">${stop.action}</a>
            <a href="${mapsSearch(stop.query)}" target="_blank" rel="noreferrer">Place</a>
            <a href="https://www.google.com/search?q=${encodeURIComponent(stop.venue + ' ' + stop.location)}" target="_blank" rel="noreferrer">Web</a>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderTrip() {
  renderNext();
  renderTabs();
  renderDays();
  document.getElementById("full-route").href = routeLink(days[0].routePlaces);
}

renderTrip();
