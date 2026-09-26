"""
Simulated ingestion connectors.

Live social-media firehoses (X/Twitter filtered stream, Facebook Graph API,
Instagram hashtag search) and IMD/AWS station APIs all require paid/allow-
listed credentials that a hackathon prototype cannot obtain. This module
generates *realistic* synthetic events that exercise the exact same
downstream pipeline (`/ingest/simulate` -> ML scoring -> DB) that the real
connectors would feed in production.

Swapping this for production is a drop-in replacement:
  - `TwitterStreamConnector` -> tweepy StreamingClient filtering `#IMD`,
    `#DelhiRains`, etc., yielding the same dict shape consumed here.
  - `PublicAPIConnector` -> scheduled polling of data.gov.in / IMD AWS feeds.
  - `CitizenAppConnector` -> already implemented for real via the
    `/reports/citizen` FastAPI endpoint (no simulation needed).
See production_artifacts/docs/DATA_FLOW.md for the full architecture.
"""
import random
from datetime import datetime, timedelta

CITIES = [
    ("Mumbai", "Maharashtra", 19.076, 72.877),
    ("Chennai", "Tamil Nadu", 13.083, 80.270),
    ("Delhi", "Delhi", 28.613, 77.209),
    ("Kolkata", "West Bengal", 22.572, 88.363),
    ("Bengaluru", "Karnataka", 12.971, 77.594),
    ("Hyderabad", "Telangana", 17.385, 78.486),
    ("Jaipur", "Rajasthan", 26.912, 75.787),
    ("Patna", "Bihar", 25.594, 85.137),
    ("Guwahati", "Assam", 26.144, 91.736),
    ("Bhopal", "Madhya Pradesh", 23.259, 77.412),
    ("Lucknow", "Uttar Pradesh", 26.847, 80.946),
    ("Ahmedabad", "Gujarat", 23.023, 72.571),
    ("Thiruvananthapuram", "Kerala", 8.524, 76.936),
    ("Chandigarh", "Chandigarh", 30.733, 76.779),
    ("Bhubaneswar", "Odisha", 20.296, 85.824),
]

TEMPLATES = {
    "Rainfall": [
        "Heavy rainfall reported in {city} since morning, streets getting wet #IMD #{city}Rains",
        "{city} witnessing continuous showers, monsoon in full swing #WeatherUpdate #IMD",
    ],
    "Thunderstorm": [
        "Thunderstorm with lightning over {city} right now, stay indoors #IMD #{city}Weather",
        "Loud thunder and lightning strikes reported across {city} this evening #IMD",
    ],
    "Flooding": [
        "Waterlogging reported near main market in {city}, traffic affected #IMD #{city}Floods",
        "Flood alert: low-lying areas of {city} inundated after heavy rain, evacuation underway #IMD",
    ],
    "Heatwave": [
        "Severe heatwave conditions in {city}, temperature crosses 44°C today #IMD #HeatAlert",
        "{city} sizzles under extreme heat, IMD issues orange alert #IMD",
    ],
    "Fog": [
        "Dense fog reduces visibility on {city} highways this morning #IMD #FogAlert",
        "Low visibility due to fog in {city}, flights delayed #IMD",
    ],
    "Dust Storm": [
        "Dust storm sweeps through {city}, visibility drops sharply #IMD #DustStorm",
        "Strong dust storm (andhi) hits {city}, residents advised to stay indoors #IMD",
    ],
    "Strong Wind": [
        "Gusty winds up to 60 kmph reported in {city}, trees uprooted #IMD #{city}Weather",
        "Strong winds damage temporary structures in {city} #IMD",
    ],
    "Cyclone": [
        "Cyclonic depression intensifying near {city} coast, fishermen warned #IMD #CycloneAlert",
    ],
    "Hail": [
        "Hailstorm reported in {city}, crops damaged in nearby villages #IMD #Hailstorm",
    ],
}

CLICKBAIT_INJECTIONS = [
    " SHARE FAST before it's deleted!!!",
    " Govt hiding real numbers, forward this to everyone!!!",
]

HANDLES = [
    "@WeatherWatcherIN", "@CityUpdatesIndia", "@MonsoonTracker", "@IMD_Alerts_Fan",
    "@LocalNewsToday", "@StormChaserIN", "@RegionalReporter", "@SkyWatchIndia",
]


def generate_synthetic_batch(count: int = 25):
    """Yields a list of raw ingestion dicts mimicking multi-source posts."""
    batch = []
    categories = list(TEMPLATES.keys())
    for _ in range(count):
        category = random.choice(categories)
        city, state, lat, lon = random.choice(CITIES)
        template = random.choice(TEMPLATES[category])
        text = template.format(city=city)

        # Occasionally inject clickbait/fake-style noise to exercise the
        # fake-detector in the demo.
        is_noisy = random.random() < 0.15
        if is_noisy:
            text += random.choice(CLICKBAIT_INJECTIONS)

        jitter_lat = lat + random.uniform(-0.15, 0.15)
        jitter_lon = lon + random.uniform(-0.15, 0.15)
        minutes_ago = random.randint(0, 720)

        batch.append({
            "raw_text": text,
            "hashtags": "#IMD," + category.replace(" ", ""),
            "city": city,
            "state": state,
            "latitude": round(jitter_lat, 4),
            "longitude": round(jitter_lon, 4),
            "reported_at": datetime.utcnow() - timedelta(minutes=minutes_ago),
            "source_handle": random.choice(HANDLES),
            "source_type": random.choice(["Twitter/X", "Other Social Media", "News Website"]),
            "has_media": random.random() < 0.4,
            "media_type": random.choice(["image", "video"]) if random.random() < 0.4 else "none",
            "simulated_low_trust": is_noisy,
        })
    return batch
