export type Speaker = 'Jon' | 'Sasha';

export interface ScriptLine {
  id: number;
  speaker: Speaker;
  text: string;
  start: number; // seconds
  end: number;
}

export const SCRIPT: ScriptLine[] = [
  {id: 0, speaker: 'Sasha', text: "Hey Jon! How are you?", start: 0, end: 1},
  {id: 1, speaker: 'Jon', text: "Hey Sasha! I'm great", start: 1, end: 4},
  {id: 2, speaker: 'Sasha', text: "How was the trip with your family to Florence last month?", start: 4, end: 8},
  {id: 3, speaker: 'Jon', text: "Florence was amazing! The only problem was that my toddler really struggled with the late dinners. Moving forward, can we make all dinner reservations for 8:00 when I'm traveling with my family?", start: 8, end: 21},
  {id: 4, speaker: 'Sasha', text: "No problem at all. I've updated your profile.", start: 21, end: 24},
  {id: 5, speaker: 'Jon', text: "Great. Thank you. Can you also provide me with a loyalty point summary of what I earned during this trip?", start: 24, end: 31},
  {id: 6, speaker: 'Sasha', text: "Sure thing! You earned 50,000 airline miles as well as 7,500 hotel points. Congratulations!", start: 31, end: 39},
  {id: 7, speaker: 'Sasha', text: "Anything else I can do today Jon? Are you interested in creating a new itinerary?", start: 39, end: 45},
  {id: 8, speaker: 'Jon', text: "Yes! I want to plan a romantic trip for just my wife and I — 5 days, 12th through 17th. Flights, hotels, dinner reservations for three nights. Croatia on the coast sounds fantastic. Could you help? Please include a boat excursion too!", start: 45, end: 69},
  {id: 9, speaker: 'Sasha', text: "Croatia sounds like a wonderful adventure! Have you heard of Dubrovnik? It's right on the water with a beautiful old town and easy access to the Adriatic.", start: 69, end: 81},
  {id: 10, speaker: 'Jon', text: "Yes, I've heard friends talk about it. Sounds like a perfect place.", start: 81, end: 86},
  {id: 11, speaker: 'Sasha', text: "Great. Let me pull something together. Shall we apply your normal budget preferences for travel with your wife?", start: 86, end: 92},
  {id: 12, speaker: 'Jon', text: "Absolutely. Business or First class seats for flights, and suites only for lodgings.", start: 92, end: 99},
  {id: 13, speaker: 'Sasha', text: "Got it. No problem at all.", start: 99, end: 101},
  {id: 14, speaker: 'Sasha', text: "I've booked the morning flight on the 12th — seats 3A and 3B. The hotel you loved from the Seychelles has a sister property in Dubrovnik: the Hotel Excelsior. I've also selected two other highly-ranked hotels for you to consider.", start: 101, end: 124},
  {id: 15, speaker: 'Jon', text: "Wow, great find Sasha! The Seychelles property was to die for. Let's go with The Excelsior.", start: 124, end: 131},
  {id: 16, speaker: 'Sasha', text: "My pleasure! The beautiful Presidential Suite is available. How does that look?", start: 131, end: 138},
  {id: 17, speaker: 'Jon', text: "Wow, I love it! My wife will go crazy. Let's do it.", start: 138, end: 144},
  {id: 18, speaker: 'Sasha', text: "Great, that's done. Now let's take a look at dinner reservations. Give me a second.", start: 144, end: 150},
  {id: 19, speaker: 'Sasha', text: "Within walking distance from the Excelsior: two Michelin starred restaurants — Trattoria Italia and Tokyo Sushi House — plus the highest rated local spot, Croatian Creations. How do those look?", start: 150, end: 168},
  {id: 20, speaker: 'Jon', text: "Great job Sasha! Those look delicious. Please book them.", start: 168, end: 173},
  {id: 21, speaker: 'Sasha', text: "Done! Reservations at 9:00 on the 12th, 14th and 16th. I've also advised all three restaurants of your spouse's gluten intolerance.", start: 173, end: 189},
  {id: 22, speaker: 'Jon', text: "Perfect. Any luck with the day cruise? My wife won't stop talking about getting out on the water.", start: 189, end: 197},
  {id: 23, speaker: 'Sasha', text: "I found a fantastic sailing ship — The Adriatic Adventurer. Rustic but with five-star amenities. I can book a private viewing deck on the 15th. How does that sound?", start: 197, end: 214},
  {id: 24, speaker: 'Jon', text: "That really looks exciting. Go for it Sasha!", start: 214, end: 218},
  {id: 25, speaker: 'Sasha', text: "You're all set! Flights, hotel, restaurants and the ocean excursion booked. Any changes before we finalize?", start: 218, end: 227},
  {id: 26, speaker: 'Jon', text: "Actually, please move the dinner reservation to 10:00 on the 14th. Thank you.", start: 227, end: 234},
  {id: 27, speaker: 'Sasha', text: "Done — dinner on the 14th changed to 10:00. Anything else?", start: 234, end: 238},
  {id: 28, speaker: 'Jon', text: "No, that should do it. Let's book it!", start: 238, end: 242},
  {id: 29, speaker: 'Sasha', text: "The final cost of your vacation is $28,031. Would you like to use your credit card on file or your Coinbase account?", start: 242, end: 251},
  {id: 30, speaker: 'Jon', text: "Please just use my credit card this time.", start: 251, end: 255},
  {id: 31, speaker: 'Sasha', text: "Got it! Here is your final itinerary. You'll find it at Luxurious Traveler, and a copy has been sent to your email.", start: 255, end: 265},
  {id: 32, speaker: 'Jon', text: "Great Sasha, this looks amazing. I can't wait!", start: 265, end: 276},
  // Session 2
  {id: 33, speaker: 'Jon', text: "Hello Sasha! How are you? It's been a few days since we spoke.", start: 276, end: 281},
  {id: 34, speaker: 'Sasha', text: "Hello Jon! Are you getting ready for your trip to Dubrovnik? I've brought up your hotel information for reference.", start: 281, end: 288},
  {id: 35, speaker: 'Jon', text: "Actually, some plans came up. We need to change our departure — can you get us on the afternoon flight instead of the morning one?", start: 288, end: 297},
  {id: 36, speaker: 'Sasha', text: "Let me see what I can do...", start: 297, end: 300},
  {id: 37, speaker: 'Sasha', text: "We're in luck! Preferred seats are available. There's a $60 service charge, but the afternoon flight is cheaper — we can refund $1,332 to your credit card.", start: 300, end: 320},
  {id: 38, speaker: 'Jon', text: "Wow Sasha, that's great! Thank you. Please do.", start: 320, end: 324},
  {id: 39, speaker: 'Sasha', text: "My pleasure.", start: 324, end: 327},
  {id: 40, speaker: 'Sasha', text: "All set! The updated itinerary has been sent to your email. You can always find me here, 24 hours a day. Looking forward to chatting soon. Thank you!", start: 327, end: 341},
  {id: 41, speaker: 'Jon', text: "OK Sasha. Thank you! Talk soon.", start: 341, end: 342},
];

export const MILESTONES: {time: number; icon: string; text: string}[] = [
  {time: 31, icon: '✈️', text: '50,000 Airline Miles + 7,500 Hotel Points!'},
  {time: 101, icon: '🛫', text: 'Morning Flight Booked — Seats 3A & 3B'},
  {time: 132, icon: '🏨', text: 'Hotel Excelsior, Dubrovnik — Presidential Suite!'},
  {time: 173, icon: '🍽️', text: '3 Michelin-Quality Restaurant Reservations'},
  {time: 197, icon: '⛵', text: 'The Adriatic Adventurer — Private Deck!'},
  {time: 255, icon: '✅', text: 'Itinerary Complete — Total: $28,031'},
  {time: 300, icon: '💳', text: 'Flight Changed — $1,332 Refunded!'},
];

export const TOTAL_SECONDS = 342;
