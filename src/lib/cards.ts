export interface Card {
  id: string;
  festival: 'rakhi' | 'diwali' | 'dussehra';
  lang: 'en' | 'hi' | 'hinglish';
  src: string;
  alt: string;
  text: string;
}

interface RawCard {
  id: string;
  festival: 'rakhi' | 'diwali' | 'dussehra';
  lang: 'en' | 'hi' | 'hinglish';
  text: string;
}

const rawCards: RawCard[] = [
  // Rakhi
  { id: 'rakhi-en-1', festival: 'rakhi', lang: 'en', text: 'Happy Raksha Bandhan! May the bond of love and protection between us grow stronger with every thread.' },
  { id: 'rakhi-en-2', festival: 'rakhi', lang: 'en', text: 'To my dear brother, on this Rakhi I pray for your happiness, success and good health.' },
  { id: 'rakhi-en-3', festival: 'rakhi', lang: 'en', text: 'Wishing you a Raksha Bandhan full of love, laughter and sweet memories.' },
  { id: 'rakhi-hi-1', festival: 'rakhi', lang: 'hi', text: 'रक्षाबंधन की हार्दिक शुभकामनाएँ! भाई-बहन का प्यार और रक्षा का बंधन सदा बना रहे।' },
  { id: 'rakhi-hi-2', festival: 'rakhi', lang: 'hi', text: 'प्यारे भाई, इस राखी पर आपके सुख, सफलता और स्वास्थ्य की कामना करती हूँ।' },
  { id: 'rakhi-hi-3', festival: 'rakhi', lang: 'hi', text: 'राखी का पवित्र त्योहार आपके जीवन में खुशियाँ और समृद्धि लाए।' },
  { id: 'rakhi-hinglish-3', festival: 'rakhi', lang: 'hinglish', text: 'Rakhi mubarak bhai! Tu hamesha mera hero rahega, kitne bhi jhagde ho.' },
  { id: 'rakhi-hinglish-4', festival: 'rakhi', lang: 'hinglish', text: 'Behen teri Rakhi, aur teri khushi dono ke liye ready hoon. Rakhi mubarak!' },
  { id: 'rakhi-hinglish-5', festival: 'rakhi', lang: 'hinglish', text: 'Is Rakhi pe bas ek wish — tu khush rahe, aur hamesha meri side pe rahe.' },

  // Diwali
  { id: 'diwali-en-1', festival: 'diwali', lang: 'en', text: 'Happy Diwali! May your life shine bright with joy and prosperity.' },
  { id: 'diwali-en-2', festival: 'diwali', lang: 'en', text: 'Wishing you a Diwali full of light, laughter and sweetness.' },
  { id: 'diwali-en-3', festival: 'diwali', lang: 'en', text: 'May Lakshmi bless your home with peace, health and abundance.' },
  { id: 'diwali-hi-1', festival: 'diwali', lang: 'hi', text: 'दिवाली की हार्दिक शुभकामनाएँ! घर रोशनी से भरा रहे।' },
  { id: 'diwali-hi-2', festival: 'diwali', lang: 'hi', text: 'हर दीया लाए खुशियाँ और समृद्धि, दिवाली मुबारक हो।' },
  { id: 'diwali-hi-3', festival: 'diwali', lang: 'hi', text: 'लक्ष्मी माँ का आशीर्वाद सदा रहे, शुभ दीपावली।' },
  { id: 'diwali-hinglish-1', festival: 'diwali', lang: 'hinglish', text: 'Happy Diwali! Ghar roshni se bhara rahe, khushiyan bhi khoob.' },
  { id: 'diwali-hinglish-2', festival: 'diwali', lang: 'hinglish', text: 'Har diya laaye khushiyan aur samriddhi, Diwali mubarak!' },
  { id: 'diwali-hinglish-3', festival: 'diwali', lang: 'hinglish', text: 'Lakshmi maa ka aashirwad sada rahe, Shubh Deepawali.' },

  // Dussehra
  { id: 'dussehra-en-1', festival: 'dussehra', lang: 'en', text: 'Happy Dussehra! May goodness always win over evil in your life.' },
  { id: 'dussehra-en-2', festival: 'dussehra', lang: 'en', text: 'Good triumphs over evil today — Vijayadashami mubarak!' },
  { id: 'dussehra-en-3', festival: 'dussehra', lang: 'en', text: 'May Lord Rama’s victory inspire you to rise stronger.' },
  { id: 'dussehra-hi-1', festival: 'dussehra', lang: 'hi', text: 'दशहरे की हार्दिक शुभकामनाएँ! अच्छाई की जीत हो।' },
  { id: 'dussehra-hi-2', festival: 'dussehra', lang: 'hi', text: 'बुराई पर अच्छाई की जीत का पर्व, विजयादशमी मुबारक।' },
  { id: 'dussehra-hi-3', festival: 'dussehra', lang: 'hi', text: 'राम जी की विजय आपको शक्ति दे, शुभ दशहरा।' },
  { id: 'dussehra-hinglish-1', festival: 'dussehra', lang: 'hinglish', text: 'Happy Dussehra! May goodness always win, aaj aur hamesha.' },
  { id: 'dussehra-hinglish-2', festival: 'dussehra', lang: 'hinglish', text: 'Buraai par achhai ki jeet ka parv, Vijayadashami mubarak!' },
  { id: 'dussehra-hinglish-3', festival: 'dussehra', lang: 'hinglish', text: 'Ram ji ki vijay aapko shakti de, Shubh Dussehra.' },
];

export const cards: Card[] = rawCards.map((c) => ({
  ...c,
  src: `/images/${c.festival}/cards/${c.id}.webp`,
  alt: c.text,
}));
