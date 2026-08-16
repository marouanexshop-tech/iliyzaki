export type VoiceReview = {
  /** Also seeds the waveform pattern, so keep it stable once published. */
  id: string;
  name: string;
  photo: string;
  audio: string;
  /** 1–5. Omit until the customer's real rating is known — stars are hidden while it is unset. */
  rating?: number;
  /** Set only for customers whose purchase has actually been confirmed. */
  verified?: boolean;
  /** Short written excerpt shown above the player. Omitted when the customer only sent audio. */
  quote?: string;
};

/*
 * Real customer voice notes. Each entry pairs one photo with that same
 * customer's recording — see public/reviews/.
 *
 * NOTE: `rating` and `verified` were set to 5 / true on the owner's instruction.
 * Correct any customer whose real rating or purchase status differs.
 * `quote` is deliberately empty — add each customer's own words, never invented ones.
 *
 * To add another: drop `<slug>.jpg` and `<slug>.m4a` (or .mp3/.ogg) into
 * public/reviews/ and append one object here. The carousel takes any number
 * of reviews and any audio length; duration is read from the file itself.
 */
export const voiceReviews: VoiceReview[] = [
  {
    id: "amina",
    name: "أمينة",
    rating: 5,
    verified: true,
    photo: "/reviews/amina.webp",
    audio: "/reviews/amina.m4a",
  },
  {
    id: "fatimato",
    name: "فاطيماتو",
    rating: 5,
    verified: true,
    photo: "/reviews/fatimato.webp",
    audio: "/reviews/fatimato.m4a",
  },
  {
    id: "rachid",
    name: "رشيد آيت لحسن",
    rating: 5,
    verified: true,
    photo: "/reviews/rachid.webp",
    audio: "/reviews/rachid.m4a",
  },
  {
    id: "samira",
    name: "سميرة أديب",
    rating: 5,
    verified: true,
    photo: "/reviews/samira.webp",
    audio: "/reviews/samira.m4a",
  },
  {
    id: "achraf",
    name: "أشرف",
    rating: 5,
    verified: true,
    photo: "/reviews/achraf.webp",
    audio: "/reviews/achraf.m4a",
  },
  {
    id: "khalid",
    name: "خالد المحمدي",
    rating: 5,
    verified: true,
    photo: "/reviews/khalid.webp",
    audio: "/reviews/khalid.m4a",
  },
  {
    id: "silia",
    name: "سيليا",
    rating: 5,
    verified: true,
    photo: "/reviews/silia.webp",
    audio: "/reviews/silia.m4a",
  },
  {
    id: "yassmin",
    name: "ياسمين",
    rating: 5,
    verified: true,
    photo: "/reviews/yassmin.webp",
    audio: "/reviews/yassmin.m4a",
  },
];
