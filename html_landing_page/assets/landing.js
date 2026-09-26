const feedItems = [
  '<b>Mumbai</b> — Heavy rainfall, waterlogging near Andheri #IMD',
  '<b>Jaipur</b> — Dust storm reducing visibility on NH-8 #IMD',
  '<b>Guwahati</b> — River levels rising, flood watch issued #IMD',
  '<b>Chennai</b> — Thunderstorm with lightning reported #IMD',
  '<b>Delhi</b> — Dense fog, flights delayed at IGI #IMD',
  '<b>Bhubaneswar</b> — Cyclonic depression tracked offshore #IMD',
  '<b>Jodhpur</b> — Heatwave conditions, 44°C recorded #IMD',
];

const track = document.getElementById('ticker-track');
if (track) {
  const html = feedItems.map(t => `<span>${t}</span>`).join('');
  track.innerHTML = html + html; // duplicate for seamless loop
}
