const EVENTS = [
{
    id: 1,
    title: 'INTERSTELLAR',
    date: 'Jul 12, 2025',
    time: '05:00 PM IST',
    location: 'Ceynor Restaurant - Colombo',
    price: '4,000 LKR',
    status: 'sold-out',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop',
    category: 'Concert'
},
{
    id: 2,
    title: 'INTERSTELLAR',
    date: 'Jul 12, 2025',
    time: '05:00 PM IST',
    location: 'Ceynor Restaurant - Colombo',
    price: '5,000 LKR',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop',
    category: 'Concert'
},
{
    id: 3,
    title: 'INTERSTELLAR',
    date: 'Jul 12, 2025',
    time: '05:00 PM IST',
    location: 'Ceynor Restaurant - Colombo',
    price: '6,000 LKR',
    status: 'coming-soon',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop',
    category: 'Concert'
},
{
    id: 4,
    title: 'Night Beats',
    date: 'Aug 01, 2025',
    time: '07:00 PM IST',
    location: 'Romantic Garden Hotel Negombo',
    price: '2,000 LKR',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    category: 'DJ'
},
{
    id: 5,
    title: 'Galle Face Vibes',
    date: 'Jul 20, 2025',
    time: '06:30 PM IST',
    location: 'Galle Face Green - Colombo',
    price: '3,500 LKR',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=600&fit=crop',
    category: 'Outdoor Concert'
},
{
    id: 6,
    title: 'Jazz & Blues Night',
    date: 'Jul 25, 2025',
    time: '08:00 PM IST',
    location: 'Hilton Colombo - Ballroom',
    price: '7,500 LKR',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    category: 'Jazz'
},
{
    id: 7,
    title: 'Electronic Dreams',
    date: 'Aug 05, 2025',
    time: '09:00 PM IST',
    location: 'Shangri-La Hotel - Pool Deck',
    price: '8,000 LKR',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=600&fit=crop',
    category: 'Electronic'
},
{
    id: 8,
    title: 'Acoustic Sessions',
    date: 'Jul 28, 2025',
    time: '07:30 PM IST',
    location: 'Cafe Kumbuk - Mount Lavinia',
    price: '1,500 LKR',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    category: 'Acoustic'
},
{
    id: 9,
    title: 'Sunset Reggae',
    date: 'Aug 12, 2025',
    time: '05:30 PM IST',
    location: 'Mount Lavinia Beach',
    price: '2,500 LKR',
    status: 'coming-soon',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    category: 'Reggae'
},
{
    id: 10,
    title: 'Rock Revolution',
    date: 'Aug 18, 2025',
    time: '07:00 PM IST',
    location: 'Independence Square',
    price: '4,500 LKR',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop',
    category: 'Rock'
},
{
    id: 11,
    title: 'Hip Hop Nights',
    date: 'Aug 22, 2025',
    time: '08:30 PM IST',
    location: 'Sky Lounge - Colombo City Centre',
    price: '3,000 LKR',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    category: 'Hip Hop'
},
{
    id: 12,
    title: 'Classical Symphony',
    date: 'Sep 02, 2025',
    time: '07:00 PM IST',
    location: 'Nelum Pokuna Theatre',
    price: '6,500 LKR',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    category: 'Classical'
},
{
    id: 13,
    title: 'Baila Fiesta',
    date: 'Aug 26, 2025',
    time: '06:00 PM IST',
    location: 'Galadari Hotel - Grand Ballroom',
    price: '5,500 LKR',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop',
    category: 'Baila'
},
{
    id: 14,
    title: 'Underground Beats',
    date: 'Sep 08, 2025',
    time: '10:00 PM IST',
    location: 'Club Aura - Kollupitiya',
    price: '2,800 LKR',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=600&fit=crop',
    category: 'Underground'
},
{
    id: 15,
    title: 'World Music Festival',
    date: 'Sep 15, 2025',
    time: '04:00 PM IST',
    location: 'Viharamahadevi Park',
    price: '4,000 LKR',
    status: 'coming-soon',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    category: 'World Music'
},
{
    id: 16,
    title: 'Techno Underground',
    date: 'Sep 20, 2025',
    time: '11:00 PM IST',
    location: 'Warehouse 23 - Ratmalana',
    price: '3,200 LKR',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=600&fit=crop',
    category: 'Techno'
},
{
    id: 17,
    title: 'Indie Showcase',
    date: 'Sep 25, 2025',
    time: '07:30 PM IST',
    location: 'Barefoot Gallery',
    price: '2,200 LKR',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    category: 'Indie'
},
{
    id: 18,
    title: 'Latin Nights',
    date: 'Oct 01, 2025',
    time: '08:00 PM IST',
    location: 'Cinnamon Grand - Atrium',
    price: '6,000 LKR',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop',
    category: 'Latin'
},
{
    id: 19,
    title: 'Sinhala Pop Concert',
    date: 'Oct 08, 2025',
    time: '06:30 PM IST',
    location: 'BMICH - Main Hall',
    price: '5,000 LKR',
    status: 'sold-out',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop',
    category: 'Sinhala Pop'
},
{
    id: 20,
    title: 'Fusion Fest',
    date: 'Oct 12, 2025',
    time: '05:00 PM IST',
    location: 'Waters Edge - Lawn',
    price: '7,200 LKR',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    category: 'Fusion'
},
{
    id: 21,
    title: 'Retro Revival',
    date: 'Oct 18, 2025',
    time: '07:00 PM IST',
    location: 'Race Course Ground',
    price: '3,800 LKR',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop',
    category: 'Retro'
},
{
    id: 22,
    title: 'Trance Territory',
    date: 'Oct 25, 2025',
    time: '09:30 PM IST',
    location: 'Jetwing Blue - Pool Area',
    price: '4,800 LKR',
    status: 'coming-soon',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=600&fit=crop',
    category: 'Trance'
},
{
    id: 23,
    title: 'Folk Tales',
    date: 'Nov 02, 2025',
    time: '06:00 PM IST',
    location: 'Lionel Wendt Theatre',
    price: '2,500 LKR',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    category: 'Folk'
},
{
    id: 24,
    title: 'Drum & Bass Night',
    date: 'Nov 08, 2025',
    time: '10:30 PM IST',
    location: 'Club 47 - Wellawatte',
    price: '2,000 LKR',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=600&fit=crop',
    category: 'Drum & Bass'
},
{
    id: 25,
    title: 'Christmas Carols',
    date: 'Dec 20, 2025',
    time: '07:30 PM IST',
    location: 'St. Lucia\'s Cathedral',
    price: '1,000 LKR',
    status: 'coming-soon',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    category: 'Christmas'
}
];

export default EVENTS;