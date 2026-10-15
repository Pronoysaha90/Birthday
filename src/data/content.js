import userBirthdaySong from '../img/I Wish U Happy Happy Birthday.mp3'

// EDIT EVERYTHING HERE. Drop files into /public and reference them with a leading "/".
export const content = {
  name: 'Devi',
  bannerText: 'Happy Birthday',
  bannerImage: '',              // e.g. '/banner.png' (optional custom banner)
  music: userBirthdaySong || '/audio/I Wish U Happy Happy Birthday.mp3',    // background music
  voice: '',                    // e.g. '/audio/voice.mp3' (optional voice message)
  photos: [                     // put images in /public/photos
    { src: '/photos/1.jpg', caption: 'Where it began', memory: 'The day I knew you were someone special.' },
    { src: '/photos/2.jpg', caption: 'Golden hour', memory: 'We laughed until the sun went down.' },
    { src: '/photos/3.jpg', caption: 'Little adventures', memory: 'My favourite place is wherever you are.' },
    { src: '/photos/4.jpg', caption: 'Just us', memory: 'Ordinary days, made magical.' },
  ],
  flowerMessages: [
    'You make every day brighter ✨',
    'Wishing you endless joy 🌸',
    'Another year of being wonderful 💜',
    'Today the whole garden blooms for you 🌹',
  ],
  letter: [
    'Dear {name},',
    'Every year with you feels like walking through a garden at night,',
    'full of small lights I never knew I was looking for.',
    'Thank you for your kindness, your laughter, and for being you.',
    'May this year bring you everything you wish for.',
    'With all my love ♥',
  ],
  finale: 'May every wish you make tonight come true.',
}
