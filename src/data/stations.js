import kan88Logo from '@/assets/kan88.png'
import kanBetLogo from '@/assets/kan_bet.png'
import kanGimelLogo from '@/assets/kan_gimel.png'
import kanTarbutLogo from '@/assets/kan_tarbut.svg'
import kanMoreshetLogo from '@/assets/kan_moreshet.png'
import kanRekaLogo from '@/assets/kan_reka.png'
import kolHamusicaLogo from '@/assets/kol_hamusica.png'
import galatzLogo from '@/assets/galatz.png'
import glglzLogo from '@/assets/glglz.png'
import tlv102Logo from '@/assets/tlv102.jpg'
import eco99Logo from '@/assets/eco99.png'
import radius100Logo from '@/assets/radius100.png'
import fm103Logo from '@/assets/fm103.png'
import lev91Logo from '@/assets/lev91.png'
import haifaLogo from '@/assets/haifa.jpg'
import galeiIsraelLogo from '@/assets/galei_il.png'
import darom97Logo from '@/assets/darom97.png'
import kolchaiLogo from '@/assets/kolchai.png'
import ashamsLogo from '@/assets/ashams.png'
import mizrahitLogo from '@/assets/mizrahit.png'

// All URLs verified live & HTTPS — browsers block mixed-content audio when the
// page is served over HTTPS.
export const stations = [
  { name: 'כאן 88', logo: kan88Logo, src: 'https://29073.live.streamtheworld.com/KAN_88.mp3' },
  { name: 'כאן ב', logo: kanBetLogo, src: 'https://28563.live.streamtheworld.com/KAN_BET.mp3' },
  { name: 'כאן גימל', logo: kanGimelLogo, src: 'https://27873.live.streamtheworld.com/KAN_GIMMEL.mp3' },
  { name: 'כאן תרבות', logo: kanTarbutLogo, src: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KAN_TARBUT.mp3' },
  { name: 'כאן מורשת', logo: kanMoreshetLogo, src: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KAN_MORESHET.mp3' },
  { name: 'כאן קול המוסיקה', logo: kolHamusicaLogo, src: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KAN_KOL_HAMUSICA.mp3' },
  { name: 'כאן רק"ע', logo: kanRekaLogo, src: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KAN_REKA.mp3' },
  { name: 'גלי צה"ל', logo: galatzLogo, src: 'https://glzwizzlv.bynetcdn.com/glz_mp3' },
  { name: 'גלגל"צ', logo: glglzLogo, src: 'https://glzicylv01.bynetcdn.com/glglz_mp3' },
  { name: 'רדיו תל אביב 102', logo: tlv102Logo, src: 'https://102.livecdn.biz/102fm_mp3' },
  { name: 'אקו 99', logo: eco99Logo, src: 'https://eco-live.mediacast.co.il/99fm_aac' },
  { name: 'רדיוס 100FM', logo: radius100Logo, src: 'https://cdn.cybercdn.live/Radios_100FM/Audio/icecast.audio' },
  { name: 'רדיו ללא הפסקה 103FM', logo: fm103Logo, src: 'https://cdn.cybercdn.live/103FM/Live/icecast.audio' },
  { name: 'רדיו לב המדינה 91FM', logo: lev91Logo, src: 'https://cdn.cybercdn.live/Lev_Hamedina/Audio/icecast.audio' },
  { name: 'רדיו חיפה', logo: haifaLogo, src: 'https://1075.livecdn.biz/radiohaifa' },
  { name: 'גלי ישראל', logo: galeiIsraelLogo, src: 'https://cdn.cybercdn.live/Galei_Israel/Live/icecast.audio' },
  { name: 'רדיו דרום 97FM', logo: darom97Logo, src: 'https://cdn.cybercdn.live/Darom_97FM/Live/icecast.audio' },
  { name: 'קול חי 93FM', logo: kolchaiLogo, src: 'https://media2.93fm.co.il/live-new' },
  { name: 'רדיו מזרחית', logo: mizrahitLogo, src: 'https://mzr.mediacast.co.il/mzradio' },
  { name: 'א-שמס', logo: ashamsLogo, src: 'https://cdna.streamgates.net/Ashams/Live/icecast.audio' }
]
